import {
  type Recipe,
  type InsertRecipe,
  type BasketItem,
  type InsertBasketItem,
  type GroceryItem,
  type InsertGroceryItem,
  type InventoryItem,
  type InsertInventoryItem,
} from "@shared/schema";
import { randomUUID } from "crypto";

// put this helper near the top of the file (inside the module, outside the class) or inside the class as a private method
function toDateOrNull(value: string | Date | undefined | null): Date | null {
  if (value == null) return null;
  const d = typeof value === "string" ? new Date(value) : value;
  return isNaN(d.getTime()) ? null : d;
}

export interface IStorage {
  // Recipes
  getAllRecipes(): Promise<Recipe[]>;
  getRecipeById(id: string): Promise<Recipe | undefined>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  updateRecipe(id: string, recipe: Partial<InsertRecipe>): Promise<Recipe | undefined>;
  deleteRecipe(id: string): Promise<boolean>;

  // Basket
  getAllBasketItems(): Promise<BasketItem[]>;
  createBasketItem(item: InsertBasketItem): Promise<BasketItem>;
  clearBasket(): Promise<void>;

  // Grocery List
  getAllGroceryItems(): Promise<GroceryItem[]>;
  createGroceryItem(item: InsertGroceryItem): Promise<GroceryItem>;
  toggleGroceryItem(id: string): Promise<GroceryItem | undefined>;
  deleteCheckedGroceryItems(): Promise<void>;
  clearGroceryList(): Promise<void>;

  // Inventory
  getAllInventoryItems(): Promise<InventoryItem[]>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  deleteInventoryItem(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private recipes: Map<string, Recipe>;
  private basketItems: Map<string, BasketItem>;
  private groceryItems: Map<string, GroceryItem>;
  private inventoryItems: Map<string, InventoryItem>;

  constructor() {
    this.recipes = new Map();
    this.basketItems = new Map();
    this.groceryItems = new Map();
    this.inventoryItems = new Map();
    this.seedRecipes();
  }

  private seedRecipes() {
    const sampleRecipes: InsertRecipe[] = [
      // Breakfast
      {
        name: "Garlic Fried Rice + Egg + Hotdog",
        category: "breakfast",
        description: "A hearty Filipino breakfast favorite combining savory fried rice with a sunnyside-up egg and sliced hotdogs. Quick, filling, and perfect for busy mornings.",
        difficulty: 2,
        prepTime: 15,
        servings: 2,
        imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=800&fit=crop",
        ingredients: ["2 cups cooked rice", "2 eggs", "2 hotdogs", "2 tbsp soy sauce", "1 tbsp vegetable oil", "1/2 cup mixed vegetables", "2 cloves garlic, minced", "Salt and pepper to taste"],
      },
      {
        name: "Tapsilog",
        category: "breakfast",
        description: "Traditional Filipino breakfast with marinated beef tapa, garlic fried rice, and sunny-side up eggs. A protein-packed way to start your day.",
        difficulty: 3,
        prepTime: 25,
        servings: 2,
        imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&h=800&fit=crop",
        ingredients: ["300g beef sirloin, thinly sliced", "3 tbsp soy sauce", "2 tbsp vinegar", "3 cloves garlic, minced", "2 cups cooked rice", "2 eggs", "2 tbsp cooking oil", "Black pepper to taste"],
      },
      {
        name: "Longsilog",
        category: "breakfast",
        description: "Sweet Filipino sausage (longganisa) served with garlic rice and fried eggs. A sweet and savory breakfast combo that's always satisfying.",
        difficulty: 2,
        prepTime: 20,
        servings: 2,
        imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=800&fit=crop",
        ingredients: ["6 pieces longganisa (Filipino sausage)", "2 cups cooked rice", "4 cloves garlic, minced", "2 eggs", "2 tbsp cooking oil", "Vinegar for dipping"],
      },

      // Lunch
      {
        name: "Adobong Sitaw",
        category: "lunch",
        description: "String beans cooked adobo-style with pork, soy sauce, and vinegar. A healthier take on the classic Filipino adobo with added vegetables.",
        difficulty: 2,
        prepTime: 30,
        servings: 4,
        imageUrl: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=800&h=800&fit=crop",
        ingredients: ["500g string beans, cut into 2-inch pieces", "300g pork belly, cubed", "1/4 cup soy sauce", "1/4 cup vinegar", "4 cloves garlic, minced", "1 onion, sliced", "2 bay leaves", "1 cup water", "Salt and pepper to taste"],
      },
      {
        name: "Canned Tuna Fried Rice",
        category: "lunch",
        description: "Budget-friendly fried rice made with canned tuna, vegetables, and scrambled eggs. Perfect for using up leftover rice.",
        difficulty: 1,
        prepTime: 15,
        servings: 2,
        imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=800&fit=crop",
        ingredients: ["2 cups cooked rice", "1 can tuna in oil, drained", "2 eggs", "1/2 cup mixed vegetables", "3 cloves garlic, minced", "2 tbsp soy sauce", "2 tbsp cooking oil", "Green onions for garnish"],
      },
      {
        name: "Tortang Talong",
        category: "lunch",
        description: "Filipino eggplant omelet that's crispy on the outside and tender inside. Simple, delicious, and vegetarian-friendly.",
        difficulty: 2,
        prepTime: 25,
        servings: 2,
        imageUrl: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&h=800&fit=crop",
        ingredients: ["2 large eggplants", "3 eggs", "1/4 cup flour", "Salt and pepper to taste", "Cooking oil for frying", "Ketchup for serving"],
      },

      // Dinner
      {
        name: "Ginisang Sardinas with Pechay",
        category: "dinner",
        description: "Sautéed canned sardines with fresh pechay (bok choy) in a savory tomato sauce. Quick, nutritious, and budget-friendly.",
        difficulty: 1,
        prepTime: 15,
        servings: 2,
        imageUrl: "https://images.unsplash.com/photo-1700760933848-194ad3408fc4?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1480",
        ingredients: ["2 cans sardines in tomato sauce", "1 bunch pechay, chopped", "1 onion, diced", "3 cloves garlic, minced", "2 tomatoes, diced", "1 tbsp cooking oil", "Salt and pepper to taste"],
      },
      {
        name: "Chicken Tinola",
        category: "dinner",
        description: "Filipino chicken ginger soup with green papaya and chili leaves. Comforting, healthy, and perfect for cold evenings.",
        difficulty: 2,
        prepTime: 40,
        servings: 4,
        imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=800&fit=crop",
        ingredients: ["500g chicken, cut into pieces", "1 medium green papaya, cubed", "2 cups spinach or malunggay leaves", "1 onion, sliced", "3 cloves garlic, crushed", "1 thumb-sized ginger, sliced", "6 cups water", "2 tbsp fish sauce", "Salt and pepper to taste"],
      },
      {
        name: "Pork Caldereta",
        category: "dinner",
        description: "Rich and savory Filipino tomato-based stew with tender pork, potatoes, and bell peppers. A hearty meal perfect for family dinners.",
        difficulty: 3,
        prepTime: 60,
        servings: 6,
        imageUrl: "https://images.unsplash.com/photo-1564834744159-ff0ea41ba4b9?w=800&h=800&fit=crop",
        ingredients: ["1kg pork shoulder, cubed", "2 cups tomato sauce", "1 cup liver spread", "3 potatoes, cubed", "2 carrots, cubed", "1 red bell pepper, cubed", "1 green bell pepper, cubed", "1 onion, diced", "4 cloves garlic, minced", "2 bay leaves", "1 cup water", "3 tbsp cooking oil", "Salt and pepper to taste"],
      },
    ];

    sampleRecipes.forEach((recipe) => {
      const id = randomUUID();
      this.recipes.set(id, { ...recipe, id });
    });
  }

  // Recipes
  async getAllRecipes(): Promise<Recipe[]> {
    return Array.from(this.recipes.values());
  }

  async getRecipeById(id: string): Promise<Recipe | undefined> {
    return this.recipes.get(id);
  }

  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const id = randomUUID();
    const recipe: Recipe = { ...insertRecipe, id };
    this.recipes.set(id, recipe);
    return recipe;
  }

  async updateRecipe(id: string, updates: Partial<InsertRecipe>): Promise<Recipe | undefined> {
    const recipe = this.recipes.get(id);
    if (!recipe) return undefined;
    
    const updated = { ...recipe, ...updates };
    this.recipes.set(id, updated);
    return updated;
  }

  async deleteRecipe(id: string): Promise<boolean> {
    return this.recipes.delete(id);
  }

  // Basket
  async getAllBasketItems(): Promise<BasketItem[]> {
    return Array.from(this.basketItems.values());
  }

  async createBasketItem(insertItem: InsertBasketItem): Promise<BasketItem> {
    const id = randomUUID();
    const item: BasketItem = { ...insertItem, id };
    this.basketItems.set(id, item);
    return item;
  }

  async clearBasket(): Promise<void> {
    this.basketItems.clear();
  }

  // Grocery List
  async getAllGroceryItems(): Promise<GroceryItem[]> {
    return Array.from(this.groceryItems.values());
  }

async createGroceryItem(insertItem: InsertGroceryItem): Promise<GroceryItem> {
  const id = randomUUID();
  const item: GroceryItem = {
    ...insertItem,
    id,
    // ensure checked is always a number (default to 0 if undefined)
    checked: typeof insertItem.checked === "number" ? insertItem.checked : 0,
  };
  this.groceryItems.set(id, item);
  return item;
}


  async toggleGroceryItem(id: string): Promise<GroceryItem | undefined> {
    const item = this.groceryItems.get(id);
    if (item) {
      const updated = { ...item, checked: item.checked ? 0 : 1 };
      this.groceryItems.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deleteCheckedGroceryItems(): Promise<void> {
    const uncheckedItems = Array.from(this.groceryItems.values()).filter(
      (item) => !item.checked
    );
    this.groceryItems.clear();
    uncheckedItems.forEach((item) => this.groceryItems.set(item.id, item));
  }

  async clearGroceryList(): Promise<void> {
    this.groceryItems.clear();
  }

  // Inventory
  async getAllInventoryItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values());
  }


async createInventoryItem(
  insertItem: InsertInventoryItem
): Promise<InventoryItem> {
  const id = randomUUID();

  // normalize purchaseDate: must be a Date. If missing or invalid, throw or set to current date (choose one)
  const purchaseDate = (() => {
    if (!insertItem.purchaseDate) {
      // choose behavior: throw or default to new Date()
      // throw new Error("purchaseDate is required"); // <-- stricter option
      return new Date(); // <-- permissive default
    }
    const d = typeof insertItem.purchaseDate === "string"
      ? new Date(insertItem.purchaseDate)
      : insertItem.purchaseDate;
    if (isNaN(d.getTime())) {
      // invalid date -- choose throw or fallback
      // throw new Error("Invalid purchaseDate");
      return new Date();
    }
    return d;
  })();

  // expiryDate may be optional: normalize to Date | null
  const expiryDate = toDateOrNull(insertItem.expiryDate);

  const item: InventoryItem = {
    ...insertItem,
    id,
    purchaseDate,
    expiryDate,
  };

  this.inventoryItems.set(id, item);
  return item;
}


  async deleteInventoryItem(id: string): Promise<boolean> {
    return this.inventoryItems.delete(id);
  }
}

export const storage = new MemStorage();
