import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const recipesTable = pgTable("recipes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ingredientsJson: text("ingredients_json").notNull().default("[]"),
  instructionsJson: text("instructions_json").notNull().default("[]"),
  cookingTime: integer("cooking_time").notNull(),
  servings: integer("servings").notNull(),
  difficulty: text("difficulty").notNull().default("easy"),
  dietaryTagsJson: text("dietary_tags_json").notNull().default("[]"),
  videoUrl: text("video_url"),
  savedAt: timestamp("saved_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRecipeSchema = createInsertSchema(recipesTable).omit({ id: true, savedAt: true });
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipesTable.$inferSelect;
