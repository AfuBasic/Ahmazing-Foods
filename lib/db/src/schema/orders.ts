import { pgTable, serial, text, integer, timestamp, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { menuItemsTable } from "./menu-items";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  menuItemId: integer("menu_item_id")
    .notNull()
    .references(() => menuItemsTable.id),
  menuItemName: text("menu_item_name").notNull(),
  category: text("category").notNull(),
  selectedSize: text("selected_size").notNull(),
  selectedProtein: text("selected_protein"),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  deliveryAddress: text("delivery_address"),
  deliveryDate: date("delivery_date", { mode: "string" }).notNull(),
  deliverySlot: text("delivery_slot").notNull(),
  itemPrice: integer("item_price").notNull(),
  rushFee: integer("rush_fee").notNull().default(0),
  total: integer("total").notNull(),
  status: text("status").notNull().default("pending"), // pending | confirmed | cooking | delivered | cancelled
  paystackRef: text("paystack_ref"),
  pepperLevel: text("pepper_level"),
  cartItems: jsonb("cart_items"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({
  id: true,
  createdAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
