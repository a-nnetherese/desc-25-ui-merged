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
  deleteGroceryItem(id: string): Promise<boolean>;
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
      // Breakfast (10 recipes)
      {
        name: "Garlic Fried Ice + Egg + Hotdog",
        category: "breakfast",
        description: "A hearty Filipino breakfast favorite combining savory fried rice with a sunnyside-up egg and sliced hotdogs. Quick, filling, and perfect for busy mornings.",
        difficulty: 2,
        prepTime: 15,
        servings: 2,
        imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=800&fit=crop",
        ingredients: ["2 cups cooked rice", "2 eggs", "2 hotdogs", "2 tbsp soy sauce", "1 tbsp vegetable oil", "1/2 cup mixed vegetables", "2 cloves garlic, minced", "Salt and pepper to taste"],
        instructions: ["Heat oil in a pan over medium heat", "Add minced garlic and sauté until golden", "Slice hotdogs and add to pan, cook until slightly browned", "Add mixed vegetables and stir-fry for 2 minutes", "Add cooked rice and soy sauce, mix well and break up clumps", "Push rice to the side and crack eggs into the pan", "Fry eggs sunnyside-up until whites are set", "Season with salt and pepper, serve hot"],
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
        instructions: ["Marinate beef in soy sauce, vinegar, garlic, and black pepper for at least 15 minutes", "Heat 1 tbsp oil in a pan and fry marinated beef until cooked through, set aside", "In the same pan, add remaining oil and minced garlic", "Add rice and stir-fry until heated and slightly crispy", "In a separate pan, fry eggs sunnyside-up", "Serve beef tapa with garlic rice and eggs"],
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
        instructions: ["Cook longganisa in a pan with a little water until water evaporates", "Continue cooking until sausages are browned and cooked through, set aside", "In the same pan, add oil and minced garlic", "Sauté garlic until golden, then add rice", "Stir-fry rice until heated through and fragrant", "Fry eggs in a separate pan", "Serve longganisa with garlic rice, eggs, and vinegar for dipping"],
      },
      {
        name: "Pancakes with Maple Syrup",
        category: "breakfast",
        description: "Fluffy American-style pancakes perfect for a weekend breakfast. Top with butter and maple syrup for a classic treat.",
        difficulty: 1,
        prepTime: 20,
        servings: 4,
        imageUrl: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&h=800&fit=crop",
        ingredients: ["2 cups all-purpose flour", "2 tbsp sugar", "2 tsp baking powder", "1/2 tsp salt", "2 eggs", "1 1/2 cups milk", "1/4 cup melted butter", "Butter and maple syrup for serving"],
        instructions: ["Mix flour, sugar, baking powder, and salt in a large bowl", "In another bowl, whisk eggs, milk, and melted butter", "Pour wet ingredients into dry ingredients and mix until just combined (batter should be lumpy)", "Heat a non-stick pan over medium heat and lightly grease", "Pour 1/4 cup batter for each pancake", "Cook until bubbles form on surface, then flip", "Cook until golden brown on both sides", "Serve with butter and maple syrup"],
      },
      {
        name: "Oatmeal with Banana",
        category: "breakfast",
        description: "Healthy and hearty oatmeal topped with fresh banana slices. A nutritious start to your day.",
        difficulty: 1,
        prepTime: 10,
        servings: 2,
        imageUrl: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&h=800&fit=crop",
        ingredients: ["1 cup rolled oats", "2 cups water or milk", "2 ripe bananas", "2 tbsp honey", "1/2 tsp cinnamon", "Pinch of salt"],
        instructions: ["Bring water or milk to a boil in a pot", "Add oats and salt, reduce heat to low", "Simmer for 5-7 minutes, stirring occasionally", "Remove from heat when oats are soft and creamy", "Slice bananas and top oatmeal", "Drizzle with honey and sprinkle cinnamon", "Serve hot"],
      },
      {
        name: "Scrambled Eggs with Toast",
        category: "breakfast",
        description: "Classic scrambled eggs served with buttered toast. Simple, quick, and always satisfying.",
        difficulty: 1,
        prepTime: 10,
        servings: 2,
        imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&h=800&fit=crop",
        ingredients: ["4 eggs", "2 tbsp milk", "2 tbsp butter", "4 slices bread", "Salt and pepper to taste"],
        instructions: ["Toast bread slices until golden", "Crack eggs into a bowl and whisk with milk, salt, and pepper", "Melt butter in a non-stick pan over medium-low heat", "Pour in egg mixture and let sit for a few seconds", "Gently stir with a spatula, pushing eggs from edges to center", "Continue cooking until eggs are just set but still creamy", "Butter the toast and serve with scrambled eggs"],
      },
      {
        name: "Corned Beef Hash",
        category: "breakfast",
        description: "Savory corned beef with potatoes and onions. A filling breakfast that uses pantry staples.",
        difficulty: 2,
        prepTime: 20,
        servings: 3,
        imageUrl: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800&h=800&fit=crop",
        ingredients: ["1 can corned beef", "2 medium potatoes, diced", "1 onion, chopped", "2 cloves garlic, minced", "2 tbsp cooking oil", "Salt and pepper to taste", "Green onions for garnish"],
        instructions: ["Boil diced potatoes until tender, drain and set aside", "Heat oil in a pan over medium heat", "Sauté garlic and onions until softened", "Add corned beef and break it apart with a spatula", "Add cooked potatoes and mix well", "Cook until potatoes are slightly crispy", "Season with salt and pepper", "Garnish with green onions before serving"],
      },
      {
        name: "French Toast",
        category: "breakfast",
        description: "Crispy on the outside, soft on the inside French toast. Perfect with syrup or fresh fruit.",
        difficulty: 1,
        prepTime: 15,
        servings: 2,
        imageUrl: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&h=800&fit=crop",
        ingredients: ["4 slices thick bread", "2 eggs", "1/2 cup milk", "1 tsp vanilla extract", "1/2 tsp cinnamon", "2 tbsp butter", "Maple syrup for serving"],
        instructions: ["Whisk together eggs, milk, vanilla, and cinnamon in a shallow dish", "Heat butter in a pan over medium heat", "Dip bread slices in egg mixture, coating both sides", "Place in hot pan and cook until golden brown (about 2-3 minutes per side)", "Serve hot with maple syrup"],
      },
      {
        name: "Tocilog",
        category: "breakfast",
        description: "Sweet cured pork (tocino) with garlic rice and eggs. A beloved Filipino breakfast combination.",
        difficulty: 2,
        prepTime: 25,
        servings: 2,
        imageUrl: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=800&fit=crop",
        ingredients: ["300g tocino (sweet cured pork)", "2 cups cooked rice", "4 cloves garlic, minced", "2 eggs", "2 tbsp cooking oil", "1/4 cup water"],
        instructions: ["In a pan, add tocino and water, cook over medium heat", "Once water evaporates, add a little oil and continue cooking until caramelized", "Remove tocino and set aside", "In the same pan, add oil and minced garlic", "Sauté until golden, then add rice and stir-fry", "Fry eggs in a separate pan", "Serve tocino with garlic rice and eggs"],
      },
      {
        name: "Breakfast Burrito",
        category: "breakfast",
        description: "Wrapped tortilla filled with scrambled eggs, cheese, and your choice of toppings. Portable and filling.",
        difficulty: 2,
        prepTime: 15,
        servings: 2,
        imageUrl: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&h=800&fit=crop",
        ingredients: ["2 large flour tortillas", "4 eggs", "1/2 cup shredded cheese", "2 sausages, cooked and sliced", "1/4 cup salsa", "2 tbsp butter", "Salt and pepper to taste"],
        instructions: ["Scramble eggs with butter, salt, and pepper in a pan", "Warm tortillas in a dry pan or microwave", "Place scrambled eggs in center of each tortilla", "Add cooked sausage slices and cheese", "Top with salsa", "Fold in sides and roll up tightly", "Serve immediately or wrap in foil"],
      },

      // Lunch (10 recipes)
      {
        name: "Adobong Sitaw",
        category: "lunch",
        description: "String beans cooked adobo-style with pork, soy sauce, and vinegar. A healthier take on the classic Filipino adobo with added vegetables.",
        difficulty: 2,
        prepTime: 30,
        servings: 4,
        imageUrl: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=800&h=800&fit=crop",
        ingredients: ["500g string beans, cut into 2-inch pieces", "300g pork belly, cubed", "1/4 cup soy sauce", "1/4 cup vinegar", "4 cloves garlic, minced", "1 onion, sliced", "2 bay leaves", "1 cup water", "Salt and pepper to taste"],
        instructions: ["In a pot, sauté garlic and onion until softened", "Add pork and cook until lightly browned", "Pour in soy sauce and vinegar, do not stir", "Add bay leaves and water, bring to a boil", "Reduce heat and simmer for 20 minutes", "Add string beans and cook until tender but still crisp", "Season with salt and pepper", "Serve hot with rice"],
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
        instructions: ["Heat oil in a wok or large pan over high heat", "Add minced garlic and sauté until fragrant", "Push garlic to the side and crack eggs into the pan", "Scramble the eggs until just cooked", "Add rice and break up any clumps", "Add mixed vegetables and tuna, stir-fry for 2 minutes", "Season with soy sauce and mix well", "Garnish with green onions and serve"],
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
        instructions: ["Roast eggplants over open flame or under broiler until skin is charred", "Let cool, then peel off skin", "Flatten eggplants with a fork, keeping stem intact", "Beat eggs with salt, pepper, and flour", "Heat oil in a pan over medium heat", "Dip each eggplant in egg mixture, coating well", "Fry until golden brown on both sides", "Serve hot with ketchup or your choice of dipping sauce"],
      },
      {
        name: "Chicken Pasta Alfredo",
        category: "lunch",
        description: "Creamy pasta with grilled chicken in a rich Alfredo sauce. Comfort food at its best.",
        difficulty: 3,
        prepTime: 30,
        servings: 4,
        imageUrl: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800&h=800&fit=crop",
        ingredients: ["400g fettuccine pasta", "2 chicken breasts", "1 cup heavy cream", "1/2 cup grated Parmesan", "3 cloves garlic, minced", "2 tbsp butter", "Salt and pepper to taste", "Parsley for garnish"],
        instructions: ["Cook pasta according to package directions, drain and set aside", "Season chicken with salt and pepper, grill or pan-fry until cooked through", "Slice chicken into strips", "In a large pan, melt butter and sauté garlic until fragrant", "Add heavy cream and bring to a simmer", "Stir in Parmesan cheese until melted and smooth", "Add cooked pasta and toss to coat", "Top with sliced chicken and garnish with parsley", "Serve immediately"],
      },
      {
        name: "Vegetable Stir-Fry",
        category: "lunch",
        description: "Quick and healthy stir-fried vegetables with a savory sauce. Perfect for a light lunch.",
        difficulty: 1,
        prepTime: 15,
        servings: 3,
        imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=800&fit=crop",
        ingredients: ["2 cups mixed vegetables (broccoli, carrots, bell peppers)", "2 tbsp soy sauce", "1 tbsp oyster sauce", "2 cloves garlic, minced", "1 tsp ginger, minced", "2 tbsp cooking oil", "1 tsp sesame oil"],
        instructions: ["Heat cooking oil in a wok over high heat", "Add garlic and ginger, stir-fry for 30 seconds", "Add vegetables and stir-fry for 3-4 minutes", "Mix soy sauce and oyster sauce together", "Pour sauce over vegetables and toss well", "Drizzle with sesame oil", "Serve hot with rice"],
      },
      {
        name: "Grilled Cheese Sandwich",
        category: "lunch",
        description: "Classic grilled cheese sandwich with gooey melted cheese. Simple and satisfying.",
        difficulty: 1,
        prepTime: 10,
        servings: 2,
        imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&h=800&fit=crop",
        ingredients: ["4 slices bread", "4 slices cheddar cheese", "2 tbsp butter", "Salt to taste"],
        instructions: ["Butter one side of each bread slice", "Place cheese between two slices, buttered sides out", "Heat a pan over medium heat", "Place sandwich in pan and cook until golden brown (about 2-3 minutes)", "Flip and cook other side until cheese is melted", "Remove from heat and let cool slightly before cutting", "Serve warm"],
      },
      {
        name: "Beef Tacos",
        category: "lunch",
        description: "Seasoned ground beef in crispy taco shells with fresh toppings. Fun and flavorful.",
        difficulty: 2,
        prepTime: 20,
        servings: 4,
        imageUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&h=800&fit=crop",
        ingredients: ["500g ground beef", "8 taco shells", "1 packet taco seasoning", "1 cup shredded lettuce", "1 cup diced tomatoes", "1 cup shredded cheese", "1/2 cup sour cream", "1/4 cup water"],
        instructions: ["Brown ground beef in a pan over medium-high heat", "Drain excess fat", "Add taco seasoning and water, stir well", "Simmer for 5 minutes until sauce thickens", "Warm taco shells according to package directions", "Fill each shell with seasoned beef", "Top with lettuce, tomatoes, cheese, and sour cream", "Serve immediately"],
      },
      {
        name: "Chicken Quesadilla",
        category: "lunch",
        description: "Grilled tortilla filled with chicken and melted cheese. Quick and delicious.",
        difficulty: 2,
        prepTime: 15,
        servings: 2,
        imageUrl: "https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=800&h=800&fit=crop",
        ingredients: ["2 large flour tortillas", "1 cup cooked chicken, shredded", "1 cup shredded cheese", "1/4 cup salsa", "2 tbsp butter", "Sour cream for serving"],
        instructions: ["Place one tortilla in a hot pan", "Sprinkle half the cheese on one half of the tortilla", "Add chicken and salsa on top of cheese", "Add remaining cheese", "Fold tortilla in half", "Cook until golden and cheese melts (about 2 minutes per side)", "Remove from heat and cut into wedges", "Serve with sour cream"],
      },
      {
        name: "Spam Musubi",
        category: "lunch",
        description: "Hawaiian-style rice and Spam wrapped in nori seaweed. A popular grab-and-go lunch.",
        difficulty: 2,
        prepTime: 20,
        servings: 4,
        imageUrl: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=800&fit=crop",
        ingredients: ["1 can Spam", "3 cups cooked rice", "4 sheets nori seaweed", "2 tbsp soy sauce", "2 tbsp sugar", "1 tbsp cooking oil"],
        instructions: ["Slice Spam into 8 pieces", "Mix soy sauce and sugar in a bowl", "Heat oil in a pan and fry Spam slices until browned", "Pour soy-sugar mixture over Spam and cook until caramelized", "Cut nori sheets in half to make 8 strips", "Place a strip of nori on a cutting board", "Add a layer of rice (about 1/2 inch thick)", "Top with a slice of glazed Spam", "Wrap nori around rice and Spam", "Serve at room temperature"],
      },
      {
        name: "Caesar Salad with Chicken",
        category: "lunch",
        description: "Crisp romaine lettuce with grilled chicken, Parmesan, and creamy Caesar dressing.",
        difficulty: 2,
        prepTime: 20,
        servings: 2,
        imageUrl: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&h=800&fit=crop",
        ingredients: ["2 chicken breasts", "4 cups romaine lettuce, chopped", "1/2 cup Caesar dressing", "1/4 cup Parmesan cheese, shaved", "1 cup croutons", "Salt and pepper to taste"],
        instructions: ["Season chicken with salt and pepper", "Grill or pan-fry chicken until cooked through", "Let chicken rest for 5 minutes, then slice", "In a large bowl, toss lettuce with Caesar dressing", "Add croutons and Parmesan", "Top with sliced chicken", "Serve immediately"],
      },

      // Dinner (10 recipes)
      {
        name: "Ginisang Sardinas with Pechay",
        category: "dinner",
        description: "Sautéed canned sardines with fresh pechay (bok choy) in a savory tomato sauce. Quick, nutritious, and budget-friendly.",
        difficulty: 1,
        prepTime: 15,
        servings: 2,
        imageUrl: "https://images.unsplash.com/photo-1700760933848-194ad3408fc4?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1480",
        ingredients: ["2 cans sardines in tomato sauce", "1 bunch pechay, chopped", "1 onion, diced", "3 cloves garlic, minced", "2 tomatoes, diced", "1 tbsp cooking oil", "Salt and pepper to taste"],
        instructions: ["Heat oil in a pan over medium heat", "Sauté garlic, onion, and tomatoes until softened", "Add sardines with sauce and break up gently", "Add pechay and cook until wilted (about 2 minutes)", "Season with salt and pepper", "Serve hot with rice"],
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
        instructions: ["In a pot, sauté garlic, onion, and ginger until fragrant", "Add chicken pieces and cook until lightly browned", "Pour in water and fish sauce, bring to a boil", "Reduce heat and simmer for 20 minutes until chicken is tender", "Add green papaya and cook for 10 more minutes", "Add spinach or malunggay leaves and cook for 2 minutes", "Season with salt and pepper", "Serve hot"],
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
        instructions: ["Heat oil in a large pot and brown pork pieces", "Remove pork and sauté garlic and onion in the same pot", "Return pork to pot, add tomato sauce and water", "Add bay leaves, bring to a boil then simmer for 30 minutes", "Add potatoes and carrots, cook for 15 minutes", "Stir in liver spread until well combined", "Add bell peppers and cook for 5 more minutes", "Season with salt and pepper", "Serve hot with rice"],
      },
      {
        name: "Spaghetti Bolognese",
        category: "dinner",
        description: "Classic Italian pasta with rich meat sauce. Hearty and satisfying.",
        difficulty: 2,
        prepTime: 45,
        servings: 4,
        imageUrl: "https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=800&h=800&fit=crop",
        ingredients: ["400g spaghetti", "500g ground beef", "1 can crushed tomatoes", "1 onion, diced", "3 cloves garlic, minced", "2 tbsp tomato paste", "1 tsp dried oregano", "1 tsp dried basil", "3 tbsp olive oil", "Parmesan cheese for serving", "Salt and pepper to taste"],
        instructions: ["Cook spaghetti according to package directions", "Heat olive oil in a large pan, sauté garlic and onion", "Add ground beef and cook until browned", "Stir in tomato paste, crushed tomatoes, oregano, and basil", "Season with salt and pepper, simmer for 30 minutes", "Drain pasta and add to sauce, toss well", "Serve with grated Parmesan"],
      },
      {
        name: "Baked Salmon with Vegetables",
        category: "dinner",
        description: "Healthy baked salmon with roasted vegetables. Simple and nutritious.",
        difficulty: 2,
        prepTime: 30,
        servings: 2,
        imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=800&fit=crop",
        ingredients: ["2 salmon fillets", "2 cups mixed vegetables (broccoli, carrots, bell peppers)", "2 tbsp olive oil", "1 lemon", "2 cloves garlic, minced", "Salt and pepper to taste", "Fresh dill for garnish"],
        instructions: ["Preheat oven to 200°C (400°F)", "Place salmon and vegetables on a baking sheet", "Drizzle with olive oil and season with salt, pepper, and garlic", "Squeeze lemon juice over salmon", "Bake for 20-25 minutes until salmon is cooked through", "Garnish with fresh dill and serve"],
      },
      {
        name: "Beef Stir-Fry",
        category: "dinner",
        description: "Quick and flavorful beef with vegetables in a savory sauce. Perfect for busy weeknights.",
        difficulty: 2,
        prepTime: 20,
        servings: 3,
        imageUrl: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800&h=800&fit=crop",
        ingredients: ["400g beef sirloin, sliced thin", "2 cups mixed vegetables", "3 tbsp soy sauce", "1 tbsp oyster sauce", "2 cloves garlic, minced", "1 tsp cornstarch", "2 tbsp cooking oil", "Sesame seeds for garnish"],
        instructions: ["Mix beef with 1 tbsp soy sauce and cornstarch, let marinate for 10 minutes", "Heat oil in a wok over high heat", "Stir-fry beef until browned, remove and set aside", "In the same wok, add garlic and vegetables", "Stir-fry for 3-4 minutes", "Return beef to wok, add remaining soy sauce and oyster sauce", "Toss everything together for 1 minute", "Garnish with sesame seeds and serve with rice"],
      },
      {
        name: "Chicken Curry",
        category: "dinner",
        description: "Aromatic chicken curry with coconut milk and vegetables. Warm and comforting.",
        difficulty: 3,
        prepTime: 45,
        servings: 4,
        imageUrl: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&h=800&fit=crop",
        ingredients: ["500g chicken thighs, cubed", "1 can coconut milk", "2 potatoes, cubed", "1 onion, sliced", "3 cloves garlic, minced", "2 tbsp curry powder", "1 cup water", "2 tbsp cooking oil", "Salt and pepper to taste"],
        instructions: ["Heat oil in a pot and sauté garlic and onion", "Add chicken and cook until lightly browned", "Stir in curry powder and cook for 1 minute", "Pour in coconut milk and water", "Add potatoes and bring to a boil", "Reduce heat and simmer for 30 minutes until chicken is tender", "Season with salt and pepper", "Serve hot with rice"],
      },
      {
        name: "Pork Adobo",
        category: "dinner",
        description: "Classic Filipino dish with pork braised in soy sauce and vinegar. Simple yet incredibly flavorful.",
        difficulty: 2,
        prepTime: 50,
        servings: 4,
        imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=800&fit=crop",
        ingredients: ["1kg pork belly, cubed", "1/2 cup soy sauce", "1/4 cup vinegar", "6 cloves garlic, crushed", "1 onion, sliced", "3 bay leaves", "1 tsp whole peppercorns", "1 cup water", "2 tbsp cooking oil"],
        instructions: ["In a pot, combine pork, soy sauce, vinegar, garlic, onion, bay leaves, and peppercorns", "Marinate for at least 30 minutes", "Add water and bring to a boil", "Reduce heat and simmer for 40 minutes until pork is tender", "Remove pork pieces and set aside", "In a separate pan, heat oil and fry pork until browned", "Pour remaining sauce over pork and simmer for 5 minutes", "Serve with rice"],
      },
      {
        name: "Fish and Chips",
        category: "dinner",
        description: "Crispy battered fish with golden fries. A British classic.",
        difficulty: 3,
        prepTime: 35,
        servings: 2,
        imageUrl: "https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=800&h=800&fit=crop",
        ingredients: ["2 white fish fillets", "2 large potatoes", "1 cup flour", "1 cup beer or sparkling water", "1 tsp baking powder", "Salt and pepper to taste", "Oil for deep frying", "Lemon wedges for serving"],
        instructions: ["Cut potatoes into fries and soak in cold water for 30 minutes", "Heat oil to 180°C (350°F)", "Fry potato chips until golden, drain and set aside", "Mix flour, baking powder, salt, and pepper", "Add beer or sparkling water to make a smooth batter", "Dip fish in batter and carefully place in hot oil", "Fry until golden and crispy (about 4-5 minutes)", "Drain on paper towels and serve with fries and lemon wedges"],
      },
      {
        name: "Lasagna",
        category: "dinner",
        description: "Layered pasta with meat sauce, béchamel, and cheese. A crowd-pleasing Italian favorite.",
        difficulty: 4,
        prepTime: 90,
        servings: 8,
        imageUrl: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&h=800&fit=crop",
        ingredients: ["12 lasagna noodles", "500g ground beef", "1 jar marinara sauce", "2 cups ricotta cheese", "2 cups shredded mozzarella", "1 cup Parmesan cheese", "1 onion, diced", "3 cloves garlic, minced", "2 tbsp olive oil", "Salt and pepper to taste", "Fresh basil for garnish"],
        instructions: ["Preheat oven to 180°C (350°F)", "Cook lasagna noodles according to package directions", "Heat olive oil and sauté garlic and onion", "Add ground beef and cook until browned", "Stir in marinara sauce and simmer for 10 minutes", "In a baking dish, layer sauce, noodles, ricotta, and mozzarella", "Repeat layers, ending with mozzarella and Parmesan on top", "Cover with foil and bake for 45 minutes", "Remove foil and bake for 15 more minutes until golden", "Let rest for 10 minutes before serving"],
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

  async deleteGroceryItem(id: string): Promise<boolean> {
    return this.groceryItems.delete(id);
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
