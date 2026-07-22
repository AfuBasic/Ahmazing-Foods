import { Router, type IRouter } from "express";
import { eq, desc, gte } from "drizzle-orm";
import { db, ordersTable, menuItemsTable } from "@workspace/db";
import { sendBookingNotification } from "../lib/email";
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

const RUSH_FEE = 20000; // ₦20,000 rush fee for < 24h bookings

function isRushOrder(deliveryDate: string | Date): boolean {
  const delivery = typeof deliveryDate === "string" ? new Date(deliveryDate) : deliveryDate;
  const now = new Date();
  const diffMs = delivery.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours < 24;
}

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

  // Look up the menu item
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

  // Find the price for the selected size
  const sizes = item.sizes as Array<{ label: string; price: number }>;
  const sizeOption = sizes.find((s) => s.label === data.selectedSize);
  if (!sizeOption) {
    res.status(400).json({ error: "Invalid size selected" });
    return;
  }

  // Find the protein extra cost if selected
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

  const itemPrice = sizeOption.price + proteinCost;
  const rushFee = isRushOrder(data.deliveryDate) ? RUSH_FEE : 0;
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
    confirmedOrders: countByStatus("confirmed"),
    cookingOrders: countByStatus("cooking"),
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
});

export default router;
