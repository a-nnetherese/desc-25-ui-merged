import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertRecipeSchema,
  insertBasketItemSchema,
  insertGroceryItemSchema,
  insertInventoryItemSchema,
  type GroceryCategory,
} from "@shared/schema";

function categorizeIngredient(name: string): GroceryCategory {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes("chicken") || lowerName.includes("pork") || lowerName.includes("beef") || lowerName.includes("sausage") || lowerName.includes("hotdog") || lowerName.includes("tocino") || lowerName.includes("longganisa") || lowerName.includes("tapa")) {
    return "Meat";
  } else if (lowerName.includes("fish") || lowerName.includes("sardines") || lowerName.includes("tuna") || lowerName.includes("salmon")) {
    return "Seafood";
  } else if (lowerName.includes("milk") || lowerName.includes("cheese") || lowerName.includes("egg") || lowerName.includes("butter") || lowerName.includes("cream") || lowerName.includes("yogurt")) {
    return "Dairy";
  } else if (lowerName.includes("rice") || lowerName.includes("bread") || lowerName.includes("flour") || lowerName.includes("oat") || lowerName.includes("pasta") || lowerName.includes("noodle")) {
    return "Grain";
  } else if (lowerName.includes("banana") || lowerName.includes("apple") || lowerName.includes("orange") || lowerName.includes("lemon") || lowerName.includes("mango")) {
    return "Fruit";
  } else if (lowerName.includes("beans") || lowerName.includes("vegetable") || lowerName.includes("pechay") || lowerName.includes("spinach") || lowerName.includes("eggplant") || lowerName.includes("tomato") || lowerName.includes("onion") || lowerName.includes("garlic") || lowerName.includes("pepper") || lowerName.includes("carrot") || lowerName.includes("potato") || lowerName.includes("lettuce") || lowerName.includes("papaya")) {
    return "Vegetable";
  } else if (lowerName.includes("sauce") || lowerName.includes("oil") || lowerName.includes("vinegar") || lowerName.includes("soy") || lowerName.includes("ketchup") || lowerName.includes("sugar") || lowerName.includes("salt")) {
    return "Processed";
  }
  
  return "Processed";
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Recipes
  app.get("/api/recipes", async (_req, res) => {
    const recipes = await storage.getAllRecipes();
    res.json(recipes);
  });

  app.get("/api/recipes/:id", async (req, res) => {
    const recipe = await storage.getRecipeById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.json(recipe);
  });

  app.post("/api/recipes", async (req, res) => {
    try {
      const data = insertRecipeSchema.parse(req.body);
      const recipe = await storage.createRecipe(data);
      res.json(recipe);
    } catch (error) {
      res.status(400).json({ error: "Invalid recipe data" });
    }
  });

  app.patch("/api/recipes/:id", async (req, res) => {
    try {
      const updates = req.body;
      const recipe = await storage.updateRecipe(req.params.id, updates);
      if (!recipe) {
        return res.status(404).json({ error: "Recipe not found" });
      }
      res.json(recipe);
    } catch (error) {
      res.status(400).json({ error: "Invalid recipe data" });
    }
  });

  app.delete("/api/recipes/:id", async (req, res) => {
    const deleted = await storage.deleteRecipe(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.json({ success: true });
  });

  // Basket
  app.get("/api/basket", async (_req, res) => {
    const items = await storage.getAllBasketItems();
    res.json(items);
  });

  app.post("/api/basket", async (req, res) => {
    try {
      const data = insertBasketItemSchema.parse(req.body);
      const item = await storage.createBasketItem(data);

      // Auto-sync to grocery list
      const ingredientMap = new Map<string, { quantity: string; unit: string }>();
      
      for (const ingredient of data.ingredients) {
        // Simple ingredient parsing
        const match = ingredient.match(/^([\d.\/]+)\s*(\w+)?\s+(.+)$/);
        if (match) {
          const [, quantity, unit, name] = match;
          const cleanName = name.trim().toLowerCase();
          const key = cleanName;
          
          if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key)!;
            // Simple quantity addition (works for whole numbers)
            const existingQty = parseFloat(existing.quantity) || 0;
            const newQty = parseFloat(quantity) || 0;
            ingredientMap.set(key, {
              quantity: (existingQty + newQty).toString(),
              unit: unit || existing.unit,
            });
          } else {
            ingredientMap.set(key, { quantity, unit: unit || "" });
          }
        } else {
          // If parsing fails, just add the whole string
          const key = ingredient.toLowerCase();
          ingredientMap.set(key, { quantity: "", unit: "" });
        }
      }

      // Clear existing grocery list and repopulate from all basket items
      await storage.clearGroceryList();
      const allBasketItems = await storage.getAllBasketItems();
      const consolidatedIngredients = new Map<string, { quantity: string; unit: string }>();

      for (const basketItem of allBasketItems) {
        for (const ingredient of basketItem.ingredients) {
          const match = ingredient.match(/^([\d.\/]+)\s*(\w+)?\s+(.+)$/);
          if (match) {
            const [, quantity, unit, name] = match;
            const cleanName = name.trim().toLowerCase();
            const key = cleanName;
            
            if (consolidatedIngredients.has(key)) {
              const existing = consolidatedIngredients.get(key)!;
              const existingQty = parseFloat(existing.quantity) || 0;
              const newQty = parseFloat(quantity) || 0;
              consolidatedIngredients.set(key, {
                quantity: (existingQty + newQty).toString(),
                unit: unit || existing.unit,
              });
            } else {
              consolidatedIngredients.set(key, { quantity, unit: unit || "" });
            }
          } else {
            const key = ingredient.toLowerCase();
            consolidatedIngredients.set(key, { quantity: "", unit: "" });
          }
        }
      }

      // Create grocery items
      for (const [name, { quantity, unit }] of consolidatedIngredients) {
        const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
        await storage.createGroceryItem({
          name: capitalizedName,
          category: categorizeIngredient(capitalizedName),
          quantity: unit ? `${quantity} ${unit}` : (quantity || "1"),
          checked: 0,
        });
      }

      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid basket item data" });
    }
  });

  app.delete("/api/basket", async (_req, res) => {
    await storage.clearBasket();
    await storage.clearGroceryList();
    res.json({ success: true });
  });

  // Grocery List
  app.get("/api/grocery-list", async (_req, res) => {
    const items = await storage.getAllGroceryItems();
    res.json(items);
  });

  app.patch("/api/grocery-list/:id/toggle", async (req, res) => {
    const item = await storage.toggleGroceryItem(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(item);
  });

  app.delete("/api/grocery-list/checked", async (_req, res) => {
    await storage.deleteCheckedGroceryItems();
    res.json({ success: true });
  });

  // Inventory
  app.get("/api/inventory", async (_req, res) => {
    const items = await storage.getAllInventoryItems();
    res.json(items);
  });

  app.post("/api/inventory", async (req, res) => {
    try {
      const data = insertInventoryItemSchema.parse(req.body);
      const item = await storage.createInventoryItem(data);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid inventory item data" });
    }
  });

  app.delete("/api/inventory/:id", async (req, res) => {
    const deleted = await storage.deleteInventoryItem(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
