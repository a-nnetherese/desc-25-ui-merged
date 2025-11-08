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
        name: "Hotsilog",
        category: "breakfast",
        description: "A hearty Filipino breakfast favorite combining savory fried rice with a sunnyside-up egg and sliced hotdogs. Quick, filling, and perfect for busy mornings.",
        difficulty: 2,
        prepTime: 15,
        servings: 2,
        imageUrl: "https://scontent.fcrk3-1.fna.fbcdn.net/v/t39.30808-6/477449905_1060733536099101_5259720973362463121_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=833d8c&_nc_ohc=H8KX1Aug22oQ7kNvwEGWZHc&_nc_oc=Adlo0ueXikllLrkpKd4tbO8TZMPG608YBLCjsoNaXgimesplEnaCWKyvgNgWOW7fYvJR9wYFu0zxs3O5RM8y3az1&_nc_zt=23&_nc_ht=scontent.fcrk3-1.fna&_nc_gid=i_Uvdz2lCDW7YW1plTUv5g&oh=00_Afh6fz_DM677IZyyVUuLmI2Ry5qN3cJSrnlEwhWFyT34hQ&oe=69153B45",
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
        imageUrl: "https://www.recipeshare.app/imagesFood/chef-rv-beef-tapa-tapsilog.jpg",
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
        imageUrl: "https://kusinasecrets.com/wp-content/uploads/2025/06/u3317447599_Longsilog_on_white_ceramic_plate_golden_crispy_lo_8944ae52-3a4c-4587-916e-1d0d11aa2d64_0.jpg",
        ingredients: ["6 pieces longganisa (Filipino sausage)", "2 cups cooked rice", "4 cloves garlic, minced", "2 eggs", "2 tbsp cooking oil", "Vinegar for dipping"],
        instructions: ["Cook longganisa in a pan with a little water until water evaporates", "Continue cooking until sausages are browned and cooked through, set aside", "In the same pan, add oil and minced garlic", "Sauté garlic until golden, then add rice", "Stir-fry rice until heated through and fragrant", "Fry eggs in a separate pan", "Serve longganisa with garlic rice, eggs, and vinegar for dipping"],
      },
      {
        name: "Tortang Talong + Rice",
        category: "breakfast",
        description: "Smoky grilled eggplant turned into a crispy, golden omelet.",
        difficulty: 1,
        prepTime: 20,
        servings: 4,
        imageUrl: "https://maeservesyoufood.com/wp-content/uploads/2023/03/tortang-talong-recipe.jpeg",
        ingredients: ["1 medium eggplant", "1 egg", "Salt & oil"],
        instructions: ["Grill or microwave eggplant until soft, peel off skin.", "Flatten with fork and dip in beaten egg.", "Fry both sides in pan until golden.", "Serve with rice and ketchup."],
      },
      {
        name: "Banana Pancakes",
        category: "breakfast",
        description: "Healthy and hearty oatmeal topped with fresh banana slices. A nutritious start to your day.",
        difficulty: 1,
        prepTime: 10,
        servings: 2,
        imageUrl: "https://www.allthingsmamma.com/wp-content/uploads/2022/05/Banana-Pancakes-Hero-15-scaled.jpg",
        ingredients: ["1 ripe banana", "1 egg", "2 tbsp flour", "1 tsp sugar (optional)", "1 tsp oil"],
        instructions: ["Mash banana and mix with egg and flour until smooth.", "Heat lightly oiled pan or rice cooker surface.", "Pour spoonfuls and cook each side until golden."],
      },
      {
        name: "Cheesy Egg Sandwich",
        category: "breakfast",
        description: "Soft scrambled eggs and melty cheese tucked between toasted bread.",
        difficulty: 1,
        prepTime: 10,
        servings: 2,
        imageUrl: "https://insanelygoodrecipes.com/wp-content/uploads/2023/06/Fried_Egg_Sandwich_with_Cheese_and_Bacon.jpg",
        ingredients: ["2 slices bread", "1 egg", "1 cheese slice or 2 tbsp grated cheese", "1 tsp butter or oil"],
        instructions: ["Scramble egg in a small pan or rice cooker.", "Place between toasted bread with cheese.", "Microwave 15 seconds for extra gooeyness (optional)."],
      },
      {
        name: "Pandesal + Ham + Cheese",
        category: "breakfast",
        description: "A warm, cheesy ham sandwich on toasted pandesal buns.",
        difficulty: 2,
        prepTime: 20,
        servings: 3,
        imageUrl: "https://cdn.sanity.io/images/f3knbc2s/production/d3a17a7e9215ef48cf89dd9b1e0356675d2c9186-2500x1500.jpg?auto=format",
        ingredients: ["2 pandesal", "1 slice ham", "1 cheese slice"],
        instructions: ["Toast pandesal slightly.", "Layer ham and cheese inside.", "Toast or microwave until cheese melts."],
      },
      {
        name: "Tuna Spread Sandwich",
        category: "breakfast",
        description: "Creamy, zesty tuna spread packed in soft or toasted bread.",
        difficulty: 1,
        prepTime: 15,
        servings: 2,
        imageUrl: "https://thebaikery.com/cdn/shop/products/IMG_4772_1296x.jpg?v=1625035386",
        ingredients: ["1 small canned tuna (in oil or water)", "1 tbsp mayonnaise", "A few drops calamansi or lemon", "Salt & pepper", "2 slices bread"],
        instructions: ["Drain tuna and mix with mayo, calamansi, salt, and pepper.", "Spread between bread slices or on toasted bread."],
      },
      {
        name: "Lugaw + Boiled Egg",
        category: "breakfast",
        description: "Comforting, budget-friendly rice porridge topped with a simple egg.",
        difficulty: 2,
        prepTime: 25,
        servings: 2,
        imageUrl: "https://www.foxyfolksy.com/wp-content/uploads/2024/09/lugaw-recipe-1200t.jpg",
        ingredients: ["½ cup uncooked rice", "2½ cups water", "1 boiled egg", "Salt and pepper", "Optional: ginger, garlic, patis"],
        instructions: ["Combine rice, water, salt, and optional seasonings in rice cooker.", "Cook until rice breaks down and thickens (20–30 mins).", "Serve with sliced boiled egg."],
      },
      {
        name: "Egg & Tomato Rice Bowl",
        category: "breakfast",
        description: "A quick, savory stir of eggs and tomatoes over hot rice.",
        difficulty: 2,
        prepTime: 15,
        servings: 2,
        imageUrl: "https://tiffycooks.com/wp-content/uploads/2023/10/6BA1AFB2-DA47-4E61-8E78-5199CF0EBA76-768x1024.jpg",
        ingredients: ["1 tomato, chopped", "1 egg", "1 tsp oil", "1 cup rice", "Salt & pepper"],
        instructions: ["Heat oil in a pan or rice cooker and sauté tomato until soft.", "Add beaten egg and scramble with tomato.", "Pour over rice and season to taste."]
      },

      // Lunch (10 recipes)
      {
        name: "Chicken Adobo (Easy Version)",
        category: "lunch",
        description: "Classic Filipino adobo made quick and simple with soy, vinegar, and garlic — savory, tender, and saucy.",
        difficulty: 2,
        prepTime: 30,
        servings: 4,
        imageUrl: "https://food.fnr.sndimg.com/content/dam/images/food/fullset/2023/1/03/fn_new_filipino_chicken_adobo_s4x3.jpg.rend.hgtvcom.1280.1280.suffix/1672867315356.webp",
        ingredients: ["150g chicken (any cut)", "1 tbsp soy sauce", "1 tbsp vinegar", "2 cloves garlic, minced", "¼ cup water", "Salt, pepper, and oil"],
        instructions: ["Sauté garlic in oil until golden.", "Add chicken, soy sauce, vinegar, water, and pepper.", "Simmer covered for 15–20 mins until chicken is cooked and sauce thickens.", "Serve with rice."],
      },
      {
        name: "Chicken Adobo (Easy Version)",
        category: "lunch",
        description: "A simple and flavorful Filipino classic simmered in soy sauce, vinegar, and garlic.",
        difficulty: 1,
        prepTime: 15,
        servings: 2,
        imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=800&fit=crop",
        ingredients: ["150g chicken (any cut)", "1 tbsp soy sauce", "1 tbsp vinegar", "2 cloves garlic, minced", "¼ cup water", "Salt, pepper, and oil"],
        instructions: ["Sauté garlic in oil until golden.", "Add chicken, soy sauce, vinegar, water, pepper.", "Simmer covered for 15–20 mins until chicken is cooked and sauce thickens.", "Serve with rice."]
  },
      {
        name: "Garlic Butter Chicken + Rice",
        category: "lunch",
        description: "Tender chicken cooked in rich garlic butter sauce, perfect over rice.",
        difficulty: 2,
        prepTime: 25,
        servings: 2,
        imageUrl: "https://i1.wp.com/mariasmixingbowl.com/wp-content/uploads/2025/04/garlic-butter-chicken-and-rice-1.jpg",
        ingredients: ["150g chicken breast or thigh, cut small", "1 tbsp butter", "2 cloves garlic, minced", "Salt and pepper"],
        instructions: ["Melt butter, sauté garlic until fragrant.", "Add chicken, season with salt and pepper, and cook until brown.", "Serve over rice with extra butter drizzle."]
  },
      {
        name: "Porkchop + Rice + Toyo-Mansi Dip",
        category: "lunch",
        description: "Crispy porkchop served with rice and a simple soy-calamansi dip.",
        difficulty: 3,
        prepTime: 30,
        servings: 4,
        imageUrl: "https://www.kawalingpinoy.com/wp-content/uploads/2019/05/filipino-toyomansi-pork-chops-2.jpg",
        ingredients: ["1 porkchop", "Salt and pepper", "1 tsp soy sauce + ½ tsp calamansi juice for dip"],
        instructions: ["Season porkchop with salt and pepper.", "Fry or pan-cook until golden and cooked through.", "Serve with rice and toyo-mansi dip."]
          },
      {
        name: "Chicken Tinola (Easy Broth)",
        category: "lunch",
        description: "A warm, comforting chicken soup with sayote and malunggay.",
        difficulty: 1,
        prepTime: 15,
        servings: 3,
        imageUrl: "https://cdn.shortpixel.ai/spai2/q_glossy+ret_img+to_auto/www.hungryhuy.com/wp-content/uploads/chicken-tinola-sq.jpg",
        ingredients: ["150g chicken", "1 cup water", "1 small sayote (or green papaya), sliced", "A few malunggay leaves", "1 slice ginger, 1 clove garlic, ¼ onion"],
        instructions: ["Sauté garlic, onion, and ginger.", "Add chicken, water, and simmer 15–20 mins.", "Add sayote and cook until soft; add malunggay last.", "Season with salt or fish sauce."]
        },
      {
        name: "Stir-Fried Vegetables + Rice",
        category: "lunch",
        description: "A healthy vegetable stir-fry with simple soy seasoning.",
        difficulty: 1,
        prepTime: 10,
        servings: 2,
        imageUrl: "https://simpleveganblog.com/wp-content/uploads/2015/11/Brown-rice-stir-fry-with-vegetables.jpg",
        ingredients: ["½ cup chopped cabbage", "¼ cup carrots, sliced", "¼ cup togue (bean sprouts)", "1 tsp soy sauce", "1 clove garlic", "Oil"],
        instructions: ["Sauté garlic in oil.", "Add all vegetables, stir-fry for 3–4 mins.", "Add soy sauce and toss. Serve with rice."]
        },
      {
        name: "Sweet & Sour Meatballs (Frozen)",
        category: "lunch",
        description: "Quick and easy sweet and sour meatballs using store-bought or frozen ones.",
        difficulty: 2,
        prepTime: 20,
        servings: 4,
        imageUrl: "https://thefoodietakesflight.com/wp-content/uploads/2021/08/Vegan-Bola-Bola-Filipino-Meatballs-Recipe-11-of-20.jpg",
        ingredients: ["4–5 frozen meatballs", "2 tbsp ketchup", "1 tsp vinegar", "1 tsp sugar", "¼ cup water"],
        instructions: ["Heat meatballs until cooked.", "Mix sauce ingredients in pan, simmer until thick.", "Coat meatballs in sauce and serve with rice."]
        },
      {
        name: "Beef Giniling",
        category: "lunch",
        description: "Ground beef cooked in tomato sauce with potatoes and carrots.",
        difficulty: 2,
        prepTime: 15,
        servings: 2,
        imageUrl: "https://www.allrecipes.com/thmb/VEO6KuVL7sO4TY91yYkomH_rGxo=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/265040-Filipino-Beef-Giniling-ddmfs-4x3-251-1-ab56932dcb8b4fb78bf6c1b56217962b.jpg",
        ingredients: ["100g ground beef", "¼ cup diced carrots", "¼ cup diced potatoes", "2 tbsp tomato sauce", "1 clove garlic", "¼ onion", "Salt & pepper"],
        instructions: ["Sauté garlic and onion, add beef until browned.", "Add carrots, potatoes, and tomato sauce.", "Simmer 10–15 mins until veggies are soft and sauce thickens."]
        },
      {
        name: "Chicken Teriyaki Rice Bowl",
        category: "lunch",
        description: "Japanese-inspired chicken glazed in sweet-salty teriyaki sauce.",
        difficulty: 2,
        prepTime: 20,
        servings: 4,
        imageUrl: "https://wholesomemadeeasy.com/wp-content/uploads/2025/05/chicken-teriyaki-rice-bowls-15.jpg",
        ingredients: ["150g chicken breast, sliced", "1 tbsp soy sauce", "1 tsp sugar", "½ tsp sesame oil (optional)", "½ tsp cornstarch (optional, for glaze)"],
        instructions: ["Mix soy sauce, sugar, sesame oil (and cornstarch if using).", "Cook chicken in pan, then pour in sauce.", "Simmer until thick and glossy. Serve over rice."]
        },
      {
        name: "Sautéed Tofu & Veggies",
        category: "lunch",
        description: "A protein-rich tofu and veggie sauté with soy seasoning.",
        difficulty: 2,
        prepTime: 20,
        servings: 2,
        imageUrl: "https://www.funfoodfrolic.com/wp-content/uploads/2020/03/Tofu-Stir-Fry-Thumbnail.jpg",
        ingredients: ["3 pcs tofu cubes", "½ cup mixed veggies", "1 tbsp soy sauce", "Garlic & onion"],
        instructions: ["Fry tofu until golden, set aside.", "Sauté garlic and onion, add veggies, then tofu.", "Season with soy sauce and pepper."]
        },
      
      {
        name: "Pork BBQ (Pan-Grilled Version)",
        category: "lunch",
        description: "Marinated pork grilled or pan-fried for a classic Filipino BBQ flavor.",
        difficulty: 3,
        prepTime: 15,
        servings: 2,
        imageUrl: "https://www.unileverfoodsolutions.com.ph/dam/global-ufs/mcos/SEA/calcmenu/recipes/PH-recipes/red-meats-&-red-meat-dishes/pan-grilled-liempo/pan-grilled-liempo-main-header.jpg",
        ingredients: ["100g pork, sliced thin", "1 tbsp soy sauce", "1 tsp banana ketchup", "½ tsp sugar", "1 tsp oil"],
        instructions: ["Mix all as marinade, rest 10 mins.", "Pan-grill or fry until caramelized.", "Optional: skewer for BBQ look."]
        },
      
      // Dinner (10 recipes)
      {
        name: "Pork BBQ (Pan-Grilled Version)",
        category: "lunch",
        description: "Marinated pork grilled or pan-fried for a classic Filipino BBQ flavor.",
        difficulty: 3,
        prepTime: 15,
        servings: 2,
        imageUrl: "https://www.unileverfoodsolutions.com.ph/dam/global-ufs/mcos/SEA/calcmenu/recipes/PH-recipes/red-meats-&-red-meat-dishes/pan-grilled-liempo/pan-grilled-liempo-main-header.jpg",
        ingredients: ["100g pork, sliced thin", "1 tbsp soy sauce", "1 tsp banana ketchup", "½ tsp sugar", "1 tsp oil"],
        instructions: ["Mix all as marinade, rest 10 mins.", "Pan-grill or fry until caramelized.", "Optional: skewer for BBQ look."]
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
