import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profileTable = pgTable("user_profile", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("My Household"),
  dietaryPreference: text("dietary_preference").notNull().default("none"),
  allergiesJson: text("allergies_json").notNull().default("[]"),
  cookingSkillLevel: text("cooking_skill_level").notNull().default("beginner"),
  availableCookingTime: integer("available_cooking_time").notNull().default(30),
  householdSize: integer("household_size").notNull().default(1),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProfileSchema = createInsertSchema(profileTable).omit({ id: true, updatedAt: true });
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type UserProfile = typeof profileTable.$inferSelect;
