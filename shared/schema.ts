import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const recipes = pgTable("recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(), // breakfast, lunch, dinner
  description: text("description").notNull(),
  difficulty: integer("difficulty").notNull(), // 1-5
  prepTime: integer("prep_time").notNull(), // in minutes
  servings: integer("servings").notNull(),
  imageUrl: text("image_url").notNull(),
  ingredients: text("ingredients").array().notNull(),
  instructions: text("instructions").array().notNull(),
});

export const basketItems = pgTable("basket_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recipeId: varchar("recipe_id").notNull(),
  recipeName: text("recipe_name").notNull(),
  servings: integer("servings").notNull(),
  ingredients: text("ingredients").array().notNull(),
});


export const inventoryItems = pgTable("inventory_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  quantity: text("quantity").notNull(),
  purchaseDate: timestamp("purchase_date").notNull(),
  expiryDate: timestamp("expiry_date"),
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
});

export const insertBasketItemSchema = createInsertSchema(basketItems).omit({
  id: true,
});


export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
}).extend({
  purchaseDate: z.string().or(z.date()),
  expiryDate: z.string().or(z.date()).nullable().optional(),
});

export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;

export type BasketItem = typeof basketItems.$inferSelect;
export type InsertBasketItem = z.infer<typeof insertBasketItemSchema>;

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;

export const groceryCategories = [
  "Fruit",
  "Vegetable",
  "Meat",
  "Seafood",
  "Dairy",
  "Processed",
  "Grain"
] as const;

export type GroceryCategory = typeof groceryCategories[number];

export const groceryItems = pgTable("grocery_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  quantity: text("quantity").notNull(),
  checked: integer("checked").notNull().default(0),
});

export const insertGroceryItemSchema = createInsertSchema(groceryItems).omit({
  id: true,
}).extend({
  category: z.enum(groceryCategories),
  quantity: z.string().default("1"),
  checked: z.number().int().default(0),
});

export type InsertGroceryItem = z.infer<typeof insertGroceryItemSchema>;
export type GroceryItem = typeof groceryItems.$inferSelect;

export const suggestedItems = [
  { name: "Banana", category: "Fruit" as GroceryCategory },
  { name: "Eggs", category: "Dairy" as GroceryCategory },
  { name: "Cowhead Milk", category: "Dairy" as GroceryCategory },
  { name: "Spinach", category: "Vegetable" as GroceryCategory },
  { name: "Yakult", category: "Dairy" as GroceryCategory },
  { name: "Yakult", category: "Dairy" as GroceryCategory },
  { name: "Chicken Breast", category: "Meat" as GroceryCategory },
  { name: "Rice", category: "Grain" as GroceryCategory },
] as const;
