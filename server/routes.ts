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
import { mergeIngredients, normalizeIngredient } from "./ingredientDeduplication";
import { analyzeGroceryImage, analyzeRecipeImage } from "./lib/tesseract";

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

      // Clear existing grocery list and repopulate from all basket items with deduplication
      await storage.clearGroceryList();
      const allBasketItems = await storage.getAllBasketItems();
      
      // Collect all ingredients from all basket items
      const allIngredients: string[] = [];
      for (const basketItem of allBasketItems) {
        allIngredients.push(...basketItem.ingredients);
      }

      // Merge duplicate ingredients using deduplication logic
      const merged = mergeIngredients(allIngredients);

      // Create grocery items from merged ingredients
      for (const [key, { quantity, unit, name }] of merged) {
        const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
        const quantityStr = unit ? `${quantity} ${unit}` : quantity.toString();
        
        await storage.createGroceryItem({
          name: capitalizedName,
          category: categorizeIngredient(capitalizedName),
          quantity: quantityStr,
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

  app.post("/api/grocery-list", async (req, res) => {
    try {
      const data = insertGroceryItemSchema.parse(req.body);
      const item = await storage.createGroceryItem(data);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid grocery item data" });
    }
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

  app.delete("/api/grocery-list/:id", async (req, res) => {
    const id = req.params.id;
    if (!id || id.trim() === "") {
      return res.status(400).json({ error: "Invalid item ID" });
    }
    const deleted = await storage.deleteGroceryItem(id);
    if (!deleted) {
      return res.status(404).json({ error: "Item not found" });
    }
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

  // Vision API endpoints
  app.post("/api/analyze-grocery-image", async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "No image provided" });
      }

      // Remove data URL prefix if present
      const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, "");
      
      const items = await analyzeGroceryImage(base64Image);
      res.json({ items });
    } catch (error) {
      console.error("Error analyzing grocery image:", error);
      res.status(500).json({ error: "Failed to analyze image" });
    }
  });

  app.post("/api/analyze-recipe-image", async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "No image provided" });
      }

      // Remove data URL prefix if present
      const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, "");
      
      const recipe = await analyzeRecipeImage(base64Image);
      res.json(recipe);
    } catch (error) {
      console.error("Error analyzing recipe image:", error);
      res.status(500).json({ error: "Failed to analyze image" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
