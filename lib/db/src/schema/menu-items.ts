import { pgTable, serial, text, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const menuItemsTable = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // soups | stews | breakfast
  name: text("name").notNull(),
  description: text("description").notNull(),
  sizes: jsonb("sizes").notNull().default([]), // SizeOption[]
  proteins: jsonb("proteins").notNull().default([]), // ProteinOption[]
  available: boolean("available").notNull().default(true),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMenuItemSchema = createInsertSchema(menuItemsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItem = typeof menuItemsTable.$inferSelect;
