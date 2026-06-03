import { pgTable, text, serial, timestamp, real, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const wasteLogTable = pgTable("waste_log", {
  id: serial("id").primaryKey(),
  itemName: text("item_name").notNull(),
  category: text("category").notNull(),
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull(),
  estimatedCost: real("estimated_cost").notNull().default(0),
  wastedAt: timestamp("wasted_at", { withTimezone: true }).notNull().defaultNow(),
  expiryDate: date("expiry_date"),
  reason: text("reason"),
});

export const insertWasteLogSchema = createInsertSchema(wasteLogTable).omit({ id: true, wastedAt: true });
export type InsertWasteLog = z.infer<typeof insertWasteLogSchema>;
export type WasteLog = typeof wasteLogTable.$inferSelect;
