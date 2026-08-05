import { Router, type IRouter } from "express";
import { eq, desc, gte } from "drizzle-orm";
import { db, ordersTable, menuItemsTable } from "@workspace/db";
import { sendBookingNotification, sendCustomerStatusEmail } from "../lib/email";
import { createDeliveryCalendarEvent } from "../lib/calendar";
import {
  ListOrdersQueryParams,
  CreateOrderBody,
  GetOrderParams,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
  ListOrdersResponse,
  CreateOrderResponse,
  GetOrderResponse,
  GetOrderSummaryResponse,
  UpdateOrderStatusResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// ── TIERED RUSH FEE ────────────────────────────────────────────────────────
// Each distinct meal costs: 1→₦20k, 2→₦15k each, 3→₦13k each, 4→₦12k each, 5→₦10k each
const RUSH_FEE_RATES: Record<number, number> = {
  1: 20000,
  2: 15000,
  3: 13000,
  4: 12000,
  5: 10000,
};

function calcRushFee(isRush: boolean, distinctMealCount: number): number {
  if (!isRush) return 0;
  const count = Math.min(Math.max(distinctMealCount, 1), 5);
  const rate = RUSH_FEE_RATES[count] ?? 10000;
  return rate * count;
}

function isRushOrder(deliveryDate: string | Date): boolean {
  const delivery = typeof deliveryDate === "string" ? new Date(deliveryDate) : deliveryDate;
  const now = new Date();
  const diffMs = delivery.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours < 24;
}

// ── CART ITEM TYPE ────────────────────────────────────────────────────────
interface CartItemPayload {
  id?: string;
  menuItemId: number;
  menuItemName: string;
  category: string;
  selectedSize: string;
  selectedProtein?: string | null;
  price: number;
}

function parseCartItems(raw: unknown): CartItemPayload[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  return raw.filter(
    (item): item is CartItemPayload =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as CartItemPayload).menuItemId === "number" &&
      typeof (item as CartItemPayload).price === "number"
  );
}

// ── ROUTES ────────────────────────────────────────────────────────────────

router.get("/orders", async (req, res): Promise<void> => {
  const params = ListOrdersQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const orders = params.data.status
    ? await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.status, params.data.status))
        .orderBy(desc(ordersTable.createdAt))
    : await db
        .select()
        .from(ordersTable)
        .orderBy(desc(ordersTable.createdAt));

  res.json(ListOrdersResponse.parse(orders));
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;

  // Extended optional fields not in the generated schema
  const cartItems = parseCartItems(req.body.cartItems);
  const pepperLevel = typeof req.body.pepperLevel === "string" ? req.body.pepperLevel : undefined;

  // Look up the primary menu item (first in cart / single item)
  const [item] = await db
    .select()
    .from(menuItemsTable)
    .where(eq(menuItemsTable.id, data.menuItemId));

  if (!item) {
    res.status(400).json({ error: "Menu item not found" });
    return;
  }

  if (!item.available) {
    res.status(400).json({ error: "This item is currently unavailable" });
    return;
  }

  // ── Determine item price ──────────────────────────────────────────────
  let itemPrice: number;

  if (cartItems && cartItems.length > 0) {
    // Cart order: trust client-computed prices (all items)
    itemPrice = cartItems.reduce((sum, ci) => sum + ci.price, 0);
  } else {
    // Single-item order: compute from DB
    const sizes = item.sizes as Array<{ label: string; price: number }>;
    const sizeOption = sizes.find((s) => s.label === data.selectedSize);
    if (!sizeOption) {
      res.status(400).json({ error: "Invalid size selected" });
      return;
    }

    let proteinCost = 0;
    if (data.selectedProtein) {
      const proteins = item.proteins as Array<{ name: string; extraCost: number }>;
      const proteinOption = proteins.find((p) => p.name === data.selectedProtein);
      if (!proteinOption) {
        res.status(400).json({ error: "Invalid protein selected" });
        return;
      }
      proteinCost = proteinOption.extraCost;
    }

    itemPrice = sizeOption.price + proteinCost;
  }

  // ── Compute tiered rush fee ───────────────────────────────────────────
  const rush = isRushOrder(data.deliveryDate);
  const distinctMealCount = cartItems && cartItems.length > 0
    ? new Set(cartItems.map((ci) => ci.menuItemId)).size
    : 1;
  const rushFee = calcRushFee(rush, distinctMealCount);
  const total = itemPrice + rushFee;

  // Zod coerces deliveryDate to a Date object; Drizzle date column expects YYYY-MM-DD string
  const deliveryDateStr = data.deliveryDate instanceof Date
    ? data.deliveryDate.toISOString().slice(0, 10)
    : String(data.deliveryDate);

  const [order] = await db
    .insert(ordersTable)
    .values({
      menuItemId: item.id,
      menuItemName: item.name,
      category: item.category,
      selectedSize: data.selectedSize,
      selectedProtein: data.selectedProtein ?? null,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail ?? null,
      deliveryAddress: data.deliveryAddress ?? null,
      deliveryDate: deliveryDateStr,
      deliverySlot: data.deliverySlot,
      itemPrice,
      rushFee,
      total,
      status: "pending",
      paystackRef: data.paystackRef ?? null,
      pepperLevel: pepperLevel ?? null,
      cartItems: cartItems ?? null,
      notes: data.notes ?? null,
    })
    .returning();

  // Fire email notification — don't await so it doesn't block the response
  sendBookingNotification({
    orderId: order.id,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail ?? null,
    deliveryAddress: order.deliveryAddress ?? null,
    menuItemName: order.menuItemName,
    category: order.category,
    selectedSize: order.selectedSize,
    selectedProtein: order.selectedProtein ?? null,
    deliveryDate: order.deliveryDate,
    deliverySlot: order.deliverySlot,
    itemPrice: order.itemPrice,
    rushFee: order.rushFee,
    total: order.total,
    notes: order.notes ?? null,
  }).catch(() => {}); // errors are already logged inside sendBookingNotification

  // Create Google Calendar delivery event — fire-and-forget, never blocks the response
  createDeliveryCalendarEvent({
    orderId:         order.id,
    customerName:    order.customerName,
    customerEmail:   order.customerEmail ?? null,
    customerPhone:   order.customerPhone ?? null,
    deliveryAddress: order.deliveryAddress ?? null,
    deliveryDate:    deliveryDateStr,
    deliverySlot:    order.deliverySlot,
    menuItemName:    order.menuItemName,
    total:           order.total,
    notes:           order.notes ?? null,
  }).catch(() => {}); // errors are already logged inside createDeliveryCalendarEvent

  res.status(201).json(CreateOrderResponse.parse(order));
});

router.get("/orders/summary", async (_req, res): Promise<void> => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [allOrders, todayOrders] = await Promise.all([
    db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)),
    db
      .select()
      .from(ordersTable)
      .where(gte(ordersTable.createdAt, todayStart))
      .orderBy(desc(ordersTable.createdAt)),
  ]);

  const countByStatus = (status: string) =>
    allOrders.filter((o) => o.status === status).length;

  const totalRevenue = allOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const todayRevenue = todayOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const summary = {
    totalOrders: allOrders.length,
    pendingOrders: countByStatus("pending"),
    confirmedOrders: countByStatus("payment_confirmed"),
    cookingOrders: countByStatus("cooking_in_progress"),
    deliveredOrders: countByStatus("delivered"),
    cancelledOrders: countByStatus("cancelled"),
    totalRevenue,
    todayOrders: todayOrders.length,
    todayRevenue,
    recentOrders: allOrders.slice(0, 10),
  };

  res.json(GetOrderSummaryResponse.parse(summary));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, params.data.id));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(GetOrderResponse.parse(order));
});

router.patch("/orders/:id/status", async (req, res): Promise<void> => {
  const params = UpdateOrderStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [order] = await db
    .update(ordersTable)
    .set({ status: parsed.data.status })
    .where(eq(ordersTable.id, params.data.id))
    .returning();

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(UpdateOrderStatusResponse.parse(order));

  // Fire-and-forget customer notification on key status changes
  if (parsed.data.status === "payment_confirmed" || parsed.data.status === "cooking_in_progress") {
    sendCustomerStatusEmail({
      orderId: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      menuItemName: order.menuItemName,
      selectedSize: order.selectedSize,
      deliveryDate: String(order.deliveryDate).slice(0, 10),
      deliverySlot: order.deliverySlot,
      total: order.total,
      status: parsed.data.status as "payment_confirmed" | "cooking_in_progress",
    }).catch(() => {});
  }
});

export default router;
