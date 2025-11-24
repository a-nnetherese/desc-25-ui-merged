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
        imageUrl: "https://panlasangpinoy.com/wp-content/uploads/2017/07/hotsilog-recipe.jpg",
        ingredients: ["2 cups cooked rice", "2 eggs", "2 hotdogs", "2 tbsp soy sauce", "1 tbsp vegetable oil", "1/2 cup mixed vegetables", "2 cloves garlic, minced", "Salt", "Pepper"],
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
        ingredients: ["300g beef sirloin, thinly sliced", "3 tbsp soy sauce", "2 tbsp vinegar", "3 cloves garlic, minced", "2 cups cooked rice", "2 eggs", "2 tbsp cooking oil", "Pepper"],
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
        ingredients: ["1 medium eggplant", "1 egg", "Salt", "Oil"],
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
        ingredients: ["1 small canned tuna (in oil or water)", "1 tbsp mayonnaise", "A few drops calamansi or lemon", "Salt", "Pepper", "2 slices bread"],
        instructions: ["Drain tuna and mix with mayo, calamansi, salt, and pepper.", "Spread between bread slices or on toasted bread."],
      },
      {
        name: "Egg & Tomato Rice Bowl",
        category: "breakfast",
        description: "A quick, savory stir of eggs and tomatoes over hot rice.",
        difficulty: 2,
        prepTime: 15,
        servings: 2,
        imageUrl: "https://tiffycooks.com/wp-content/uploads/2023/10/6BA1AFB2-DA47-4E61-8E78-5199CF0EBA76-768x1024.jpg",
        ingredients: ["1 tomato, chopped", "1 egg", "1 tsp oil", "1 cup rice", "Salt", "Pepper"],
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
        ingredients: ["150g chicken (any cut)", "1 Soy sauce", "1 Vinegar", "2 cloves garlic, minced", "¼ cup water", "Salt", "Pepper", "Oil"],
        instructions: ["Sauté garlic in oil until golden.", "Add chicken, soy sauce, vinegar, water, and pepper.", "Simmer covered for 15–20 mins until chicken is cooked and sauce thickens.", "Serve with rice."],
      },
      {
        name: "Garlic Butter Chicken + Rice",
        category: "lunch",
        description: "Tender chicken cooked in rich garlic butter sauce, perfect over rice.",
        difficulty: 2,
        prepTime: 25,
        servings: 2,
        imageUrl: "https://i1.wp.com/mariasmixingbowl.com/wp-content/uploads/2025/04/garlic-butter-chicken-and-rice-1.jpg",
        ingredients: ["150g chicken breast or thigh, cut small", "1 tbsp butter", "2 cloves garlic, minced", "Salt", "Pepper"],
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
        ingredients: ["1 porkchop", "Salt", "Pepper", "1 tsp soy sauce + ½ tsp calamansi juice for dip"],
        instructions: ["Season porkchop with salt and pepper.", "Fry or pan-cook until golden and cooked through.", "Serve with rice and toyo-mansi dip."]
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
        ingredients: ["100g ground beef", "¼ cup diced carrots", "¼ cup diced potatoes", "2 tbsp tomato sauce", "1 clove garlic", "¼ onion", "Salt", "Pepper"],
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
        ingredients: ["3 pcs tofu cubes", "½ cup mixed veggies", "1 tbsp soy sauce", "Garlic", "onion"],
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

          {
        name: "Fried Chicken",
        category: "lunch",
        description: "Crispy, golden fried chicken seasoned simply with salt and pepper.",
        difficulty: 3,
        prepTime: 25,
        servings: 2,
        imageUrl: "https://www.nestlegoodnes.com/ph/sites/default/files/styles/1_1_768px_width/public/srh_recipes/daf62ae8e9c2ffd5a32165d769f46628.jpg.webp?itok=OnON5UWk",
        ingredients: ["1 chicken leg or breast", "2 tbsp flour", "Salt", "Pepper", "Oil for frying"],
        instructions: ["Coat chicken in flour, salt, and pepper.", "Fry until golden and crisp.", "Drain excess oil and serve with rice."]
      },
      {
        name: "Tuna Rice Bowl",
        category: "lunch",
        description: "Simple and quick tuna rice bowl topped with egg.",
        difficulty: 2,
        prepTime: 10,
        servings: 1,
        imageUrl: "https://static01.nyt.com/images/2022/06/22/dining/21beginner-rex2/merlin_208168452_ef0bfb9e-7026-4e48-ad70-b64d84205197-mediumSquareAt3X.jpg",
        ingredients: ["1 small can tuna (flakes in oil)", "1 egg", "1 tsp soy sauce", "Rice"],
        instructions: ["Heat tuna slightly in its oil.", "Scramble an egg and mix it in.", "Add soy sauce and serve over rice."]
      },
      {
        name: "Chicken Afritada",
        category: "lunch",
        description: "Tomato-based chicken stew with potatoes and bell peppers.",
        difficulty: 3,
        prepTime: 20,
        servings: 2,
        imageUrl: "https://foodandjourneys.net/wp-content/uploads/2025/02/Chicken-Afritada-FTR.jpg",
        ingredients: ["150g chicken", "2 tbsp tomato sauce", "¼ cup diced potatoes", "¼ cup bell peppers", "Garlic", "Onion", "Salt", "Pepper"],
        instructions: ["Sauté garlic and onion.", "Add chicken and tomato sauce, cook for 15 mins.", "Add potatoes and bell pepper; simmer until tender."]
      },
      {
        name: "Chicken Stir-Fry (Oyster Soy Sauce)",
        category: "lunch",
        description: "Quick stir-fried chicken and vegetables with oyster and soy sauce.",
        difficulty: 4,
        prepTime: 15,
        servings: 2,
        imageUrl: "https://www.jocooks.com/wp-content/uploads/2013/07/oyster-sauce-chicken-1-4.jpg",
        ingredients: ["150g chicken", "½ cup mixed veggies", "1 tbsp soy sauce", "1 tsp oyster sauce", "Garlic", "Oil"],
        instructions: ["Sauté garlic, add chicken until cooked.", "Add veggies, soy sauce, and oyster sauce.", "Stir-fry 5 mins and serve with rice."]
      },
      {
        name: "Homemade Fish Fillet + Mayo Dip",
        category: "lunch",
        description: "Crispy fried fish fillet with creamy mayo-calamansi dip.",
        difficulty: 2,
        prepTime: 20,
        servings: 2,
        imageUrl: "https://images.cookforyourlife.org/wp-content/uploads/2018/08/Fish-Sticks-Lemon-Mayo-e1641532578923.jpg",
        ingredients: ["1 small fish fillet (cream dory or tilapia)", "2 tbsp flour", "Salt", "Pepper", "Oil", "1 tbsp mayo", "½ tsp calamansi for dip"],
        instructions: ["Season fish, coat with flour.", "Fry until golden and crisp.", "Serve with dip and rice."]
      },
      {
        name: "Garlic Butter Shrimp",
        category: "lunch",
        description: "Juicy shrimp cooked in butter and garlic, a quick seafood treat.",
        difficulty: 3,
        prepTime: 15,
        servings: 2,
        imageUrl: "https://www.jocooks.com/wp-content/uploads/2021/09/garlic-butter-shrimp-1-10.jpg",
        ingredients: ["100g shrimp", "1 tbsp butter", "2 cloves garlic, minced", "Salt", "Pepper"],
        instructions: ["Melt butter, sauté garlic.", "Add shrimp and cook until pink.", "Season with salt and pepper, serve with rice."]
      },
   
      // Dinner (10 recipes)
          {  
        name: "Egg Fried Rice",
        category: "dinner",
        description: "Classic fried rice with garlic, soy sauce, and scrambled egg.",
        difficulty: 2,
        prepTime: 15,
        servings: 2,
        imageUrl: "https://www.seriouseats.com/thmb/BJjCEDw9OZe95hpZxmNcD3rJnHo=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/20230529-SEA-EggFriedRice-AmandaSuarez-hero-c8d95fbf69314b318bc279159f582882.jpg",
        ingredients: ["1 cup cooked rice", "1 egg", "2 cloves garlic, minced", "1 tsp soy sauce", "1 tbsp Oil"],
        instructions: ["Heat oil, sauté garlic until golden.", "Add rice, mix well, and season with soy sauce.", "Push rice aside, scramble egg, then combine everything."]
      },
      {
        name: "Chicken Tinola (Broth-Based Meal)",
        category: "dinner",
        description: "Warm chicken broth with sayote and greens, ideal for dinner.",
        difficulty: 3,
        prepTime: 20,
        servings: 2,
        imageUrl: "https://www.allrecipes.com/thmb/qR8H8geIqn2mauSwKLAz8Z1lfSE=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/212929-chicken-tinola-ddmfs-step-05-ae1989c161494c38b0556967d587d8d9.jpg",
        ingredients: ["150g chicken", "1 cup water", "1 small sayote or papaya, sliced", "Malunggay or spinach leaves", "1 slice ginger", "1 garlic clove", "¼ onion"],
        instructions: ["Sauté garlic, onion, and ginger.", "Add chicken, cook 2 mins, then pour water.", "Simmer 15–20 mins; add sayote and greens until tender."]
      },
      {
        name: "Vegetable Stir-Fry + Fried Egg",
        category: "dinner",
        description: "Simple veggie stir-fry topped with a fried egg.",
        difficulty: 3,
        prepTime: 12,
        servings: 1,
        imageUrl: "https://i.ytimg.com/vi/85RdLY6-xI0/maxresdefault.jpg",
        ingredients: ["½ cup chopped cabbage", "¼ cup carrots, sliced", "1 tbsp soy sauce", "1 egg", "Garlic", "Oil"],
        instructions: ["Sauté garlic, add vegetables, stir-fry until soft.", "Add soy sauce and toss.", "Fry egg separately and serve on top of rice."]
      },
      {
        name: "Tofu + Rice + Soy-Vinegar Dip",
        category: "dinner",
        description: "Crispy tofu with tangy soy-vinegar dip and rice.",
        difficulty: 2,
        prepTime: 10,
        servings: 1,
        imageUrl: "https://images.squarespace-cdn.com/content/v1/56c61656859fd03ce9b15cfa/1595014580945-3J85HIJPJ9E5SEQ854ST/Adjustments.jpeg",
        ingredients: ["4 pcs tofu cubes", "1 tbsp soy sauce + ½ tbsp vinegar (dip)", "Garlic", "Oil"],
        instructions: ["Pan-fry or air-fry tofu until golden.", "Mix soy sauce and vinegar for dip.", "Serve with rice."]
      },
      {
        name: "Chicken or Pork Stir-Fry + Rice",
        category: "dinner",
        description: "Quick stir-fry of chicken or pork with veggies and soy-oyster sauce.",
        difficulty: 4,
        prepTime: 15,
        servings: 2,
        imageUrl: "https://www.allrecipes.com/thmb/J-O1b6CjwXDhYqReRVrCMmRxfrQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/AR-230818-pork-fried-rice-DDMFS-4x3-ab7afb2bbf4c4d158bd1c3de00c2c553.jpg",
        ingredients: ["150g chicken or pork", "½ cup mixed veggies", "1 tbsp soy sauce", "1 tsp oyster sauce or sugar", "Garlic", "Oil"],
        instructions: ["Sauté garlic, add meat until cooked.", "Add veggies, season, and stir-fry for 5 mins.", "Serve over rice."]
      },
      {
        name: "Omelet Rice (Omurice)",
        category: "dinner",
        description: "Japanese-style fried rice wrapped in a fluffy omelet with ketchup topping.",
        difficulty: 3,
        prepTime: 20,
        servings: 2,
        imageUrl: "https://www.thespruceeats.com/thmb/HXxhmNHTFqscKvh_jpTbDEEnD8Q=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/omelet-rice-2031329-hero-01-a7e0906fd73b49739f28717d01e6cc33.jpg",
        ingredients: ["1 cup fried rice", "2 eggs", "1 tbsp ketchup or tomato sauce"],
        instructions: ["Scramble eggs lightly and cook into a thin omelet.", "Place fried rice in the center, fold egg around it.", "Top with ketchup."]
      },
      {
        name: "Ginisang Munggo (Mung Beans + Malunggay + Tinapa Flakes)",
        category: "dinner",
        description: "Hearty mung bean stew with malunggay and smoked fish.",
        difficulty: 3,
        prepTime: 25,
        servings: 2,
        imageUrl: "https://yummykitchentv.com/wp-content/uploads/2021/03/ginisang-munggo.jpg",
        ingredients: ["¼ cup munggo (mung beans)", "1 ½ cups water", "1 clove garlic", "¼ onion", "A few malunggay leaves", "1 tbsp tinapa flakes or small dried fish"],
        instructions: ["Boil mung beans until soft (about 30 mins).", "Sauté garlic and onion, add tinapa, then munggo.", "Add malunggay and season with salt."]
      },
      {
        name: "Simple Fried Fish + Rice + Tomatoes",
        category: "dinner",
        description: "Pan-fried fish served with rice and sliced tomatoes.",
        difficulty: 2,
        prepTime: 15,
        servings: 2,
        imageUrl: "https://tastephilippines.com/wp-content/uploads/2022/10/fried-milkfish-with-rice-and-vegetables.jpg",
        ingredients: ["1 small fish (tilapia or bangus slice)", "Salt", "Pepper", "1 tomato, sliced"],
        instructions: ["Season fish, fry until golden.", "Serve with fresh tomatoes and rice."]
      },
      {
        name: "Sautéed Pechay with Garlic and Soy Sauce",
        category: "dinner",
        description: "Light and healthy sautéed pechay with soy garlic flavor.",
        difficulty: 1,
        prepTime: 10,
        servings: 1,
        imageUrl: "https://lh4.googleusercontent.com/LAb66LYyd_KkEtjz-NCgE0upxiwnEvtQsih6eeLTijOt2ozzLLgxzUjsZ8x0bDZKruZ_Qjw691pxeJBA0VL9nACwJAnX6ioOeeegcqAHc5upIU4gFn4NI6Tsx2Tvq_u3YsmAadvL",
        ingredients: ["1 cup chopped pechay", "2 cloves garlic, minced", "1 tsp soy sauce", "Oil", "Salt"],
        instructions: ["Sauté garlic until fragrant.", "Add pechay and soy sauce, toss until wilted.", "Serve with rice."]
      },
      {
        name: "Garlic Butter Rice + Egg + Fried Hotdog",
        category: "dinner",
        description: "Comforting combo of garlic butter rice, egg, and fried hotdog.",
        difficulty: 3,
        prepTime: 15,
        servings: 2,
        imageUrl: "https://agiletestkitchen.com/wp-content/uploads/2025/01/25.png",
        ingredients: ["1 cup rice", "1 tbsp butter", "2 cloves garlic, minced", "1 egg", "1–2 hotdogs, sliced"],
        instructions: ["Sauté garlic in butter, add rice, and mix.", "Fry egg and hotdog separately.", "Serve together."]
      },
      {
        name: "Stir-Fried Chicken with Peppers (Soy + Sugar + Calamansi)",
        category: "dinner",
        description: "Tangy and savory chicken stir-fry with colorful bell peppers.",
        difficulty: 4,
        prepTime: 20,
        servings: 2,
        imageUrl: "https://www.eatwell101.com/wp-content/uploads/2022/09/Pepper-Chicken-Stir-Fry-recipe.jpg",
        ingredients: ["150g chicken, sliced", "¼ cup bell peppers, sliced", "1 tbsp soy sauce", "1 tsp sugar", "1 tsp calamansi juice"],
        instructions: ["Cook chicken until slightly browned.", "Add bell peppers and sauce mixture.", "Stir-fry until glossy and fragrant."]
      },
      {
        name: "Vegetable Fried Rice (Leftover Veggies + Egg)",
        category: "dinner",
        description: "Fried rice made with leftover vegetables and a fresh egg.",
        difficulty: 3,
        prepTime: 15,
        servings: 2,
        imageUrl: "https://cdn.loveandlemons.com/wp-content/uploads/2025/02/301_LLBlog_FriedRice_47795.jpg",
        ingredients: ["1 cup rice", "½ cup chopped leftover veggies", "1 egg", "1 tbsp soy sauce", "Garlic", "Oil"],
        instructions: ["Sauté garlic, add veggies, then rice.", "Push aside, scramble egg, mix all together.", "Season with soy sauce and serve."]
      },

      // snacks (15 recipes)
       {
      name: "Mini Nacho Bowl",
      category: "snacks",
      description: "Quick nacho bowl with melted cheese, salsa, and optional corn or beef.",
      difficulty: 2,
      prepTime: 10,
      servings: 1,
      imageUrl: "https://simple-veganista.com/wp-content/uploads/2019/08/nacho-bowl-recipe-1.jpg",
      ingredients: ["1 cup store-bought tortilla chips", "2 tbsp grated cheese or cheese spread", "2 tbsp salsa (or diced tomato + 1 tsp ketchup + 1 tsp onion)", "Optional: 1 tbsp canned corn or 2 tbsp cooked ground beef"],
      instructions: ["In a microwave-safe bowl, layer chips, cheese, and salsa.", "Microwave for 30–45 seconds until cheese melts.", "Top with corn or beef if desired, then serve warm."]
    },
    {
      name: "Cheesy Garlic Bread Bites",
      category: "snacks",
      description: "Toasty garlic bread bites with melted cheese, perfect for snacksing.",
      difficulty: 1,
      prepTime: 5,
      servings: 1,
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7Qg8_Iv3E_QZgM10bhz-2gmJXAegB8DdlfA&s",
      ingredients: ["2 slices loaf bread", "1 tbsp butter or margarine", "½ tsp garlic powder", "2 tbsp grated cheese"],
      instructions: ["Spread butter on bread and sprinkle garlic powder.", "Add cheese on top.", "Toast in microwave (45 sec–1 min) or mini-oven toaster until cheese melts and edges crisp, then slice into bite-size pieces."]
    },
    {
      name: "Ham & Cheese Quesadilla (Filipino Version)",
      category: "snacks",
      description: "Quick ham and cheese quesadilla using tortilla or bread.",
      difficulty: 1,
      prepTime: 5,
      servings: 1,
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5uwljscURvHM4L7GeXi1yIf1g5d9DhMm2iw&s",
      ingredients: ["1 small tortilla or 2 slices bread", "1 slice ham", "1 slice cheese"],
      instructions: ["Layer ham and cheese between bread or tortilla.", "Microwave for 40–60 seconds until cheese melts.", "Slice into triangles and enjoy."]
    },
    {
      name: "Milo Mug Cake",
      category: "snacks",
      description: "Microwave Milo mug cake, soft and chocolaty in just a minute.",
      difficulty: 2,
      prepTime: 5,
      servings: 1,
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2WX7NhvDdwEHBesCt9b9VH6mChiDKlDHXfg&s",
      ingredients: ["4 tbsp Milo", "3 tbsp all-purpose flour", "3 tbsp milk (or water)", "1 tbsp Oil", "1 tsp sugar", "½ tsp baking powder"],
      instructions: ["Combine all ingredients in a microwave-safe mug; mix until smooth.", "Microwave for 1 minute (add 10–15 seconds if still wet in the center).", "Optional: drizzle with condensed milk or peanut butter before serving."]
    },
    {
      name: "Egg Mayo Sandwich",
      category: "snacks",
      description: "Simple boiled egg sandwich with creamy mayonnaise.",
      difficulty: 1,
      prepTime: 5,
      servings: 1,
      imageUrl: "https://www.kewpie.com.my/sites/default/files/styles/wide/public/content/recipe/img/2021-08/20200324230119_egg%202.jpg?itok=iZRPuDM1",
      ingredients: ["1 egg", "1 tbsp mayonnaise", "Salt", "Pepper", "2 slices bread"],
      instructions: ["Mash boiled egg with mayo, salt, and pepper.", "Spread on bread and close sandwich.", "Toast lightly if desired."]
    },
    {
      name: "Cheesy Instant Fries",
      category: "snacks",
      description: "Quick cheesy fries drizzled with mayo, ready in minutes.",
      difficulty: 2,
      prepTime: 10,
      servings: 1,
      imageUrl: "https://www.acouplecooks.com/wp-content/uploads/2022/06/Cheese-Fries-005.jpg",
      ingredients: ["1 cup frozen fries or boiled potato slices", "2 tbsp cheese spread or grated cheese", "1 tsp mayonnaise"],
      instructions: ["Air fry fries for 8–10 minutes or microwave until hot.", "Drizzle with cheese and mayo.", "Microwave 20 seconds more if you want the cheese melty."]
    },
    {
      name: "Microwave Cheesy Corned Beef Toast",
      category: "snacks",
      description: "Toasty bread with corned beef and melted cheese in just 1 minute.",
      difficulty: 1,
      prepTime: 5,
      servings: 1,
      imageUrl: "https://images.yummy.ph/yummy/uploads/2017/01/grilled-cheese-corned-beef-6-500x360.jpg",
      ingredients: ["1 slice bread", "2 tbsp canned corned beef", "2 tbsp grated cheese"],
      instructions: ["Spread corned beef evenly on bread.", "Top with cheese.", "Microwave for 1 minute until heated and cheese melts."]
    },
    {
      name: "Chocolate Graham Bites",
      category: "snacks",
      description: "Graham crackers layered with chocolate and marshmallow, microwaved until gooey.",
      difficulty: 1,
      prepTime: 5,
      servings: 1,
      imageUrl: "https://images.squarespace-cdn.com/content/v1/5ee6b529e604570272bc3337/1678379234819-48DQI44FI7HSC9ADV90P/F96DD9B2-778B-47F5-951D-94519E6B7A24.jpeg",
      ingredients: ["4 graham crackers", "2 tbsp chocolate spread", "2 small marshmallows"],
      instructions: ["Stack graham + chocolate + marshmallow + graham.", "Microwave 10–15 seconds until soft and gooey.", "Let cool slightly before eating."]
    },
    {
      name: "Peanut Butter Oat Balls",
      category: "snacks",
      description: "No-bake peanut butter oat balls, a healthy sweet bite.",
      difficulty: 1,
      prepTime: 10,
      servings: 1,
      imageUrl: "https://thecookiedoughdiaries.com/wp-content/uploads/2021/12/3-ingredient-peanut-butter-oatmeal-balls-5-1200x1800.jpg",
      ingredients: ["¼ cup rolled oats", "2 tbsp peanut butter", "1 tbsp honey or condensed milk"],
      instructions: ["Mix everything in a small bowl until sticky.", "Roll into bite-sized balls.", "Chill in the fridge for 10–15 minutes before eating."]
    },
    {
      name: "Mini Lumpia Wraps",
      category: "snacks",
      description: "Small spring rolls filled with giniling or tuna, quick and tasty.",
      difficulty: 2,
      prepTime: 10,
      servings: 1,
      imageUrl: "https://www.allrecipes.com/thmb/LLudQLmfYVebaH8ycc6dIOzcrh0=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/35151-traditional-filipino-lumpia-ddmfs-hero-1x2-0745-d25195def74049598ca7cfa057f9d77e.jpg",
      ingredients: ["3 tbsp leftover giniling or tuna", "4 small lumpia wrappers"],
      instructions: ["Place 1 tbsp filling per wrapper, roll tightly, seal edges with water.", "Air fry for 3–5 minutes or microwave 1–2 minutes (turn halfway).", "Serve with dip."]
    },
    {
      name: "Pandesal Burger Slider",
      category: "snacks",
      description: "Mini pandesal burger with cheese and patty, perfect for snackss.",
      difficulty: 2,
      prepTime: 5,
      servings: 1,
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0sif-6btMS9f_jFhy_XnYrMytHxZ8FVaxzvvRh_Gp4YK5j08Dq-I8aVRixMkxjeDiKOs&usqp=CAU",
      ingredients: ["1 pandesal", "1 small burger patty or sliced hotdog", "1 slice cheese", "1 tsp mayonnaise"],
      instructions: ["Cut pandesal in half.", "Add patty/hotdog, cheese, and mayo.", "Microwave 30–45 seconds or toast until warm."]
    },
    {
      name: "Fruit Cup with Condensed Milk",
      category: "snacks",
      description: "Fresh fruit cup drizzled with sweet condensed milk.",
      difficulty: 1,
      prepTime: 5,
      servings: 1,
      imageUrl: "https://www.thetravelpalate.com/wp-content/uploads/2024/10/fruit-salad-with-condensed-milk-26.jpg",
      ingredients: ["½ banana, sliced", "¼ apple, diced (or ¼ cup canned fruit cocktail)", "1 tbsp condensed milk or cream"],
      instructions: ["Combine all fruits in a small cup or bowl.", "Drizzle condensed milk or cream.", "Chill before eating (optional)."]
    }
    ];

    sampleRecipes.forEach((recipe) => {
      const id = randomUUID();
      this.recipes.set(id, { ...recipe, id, isCustom: 0 });
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
    const recipe: Recipe = { ...insertRecipe, id, isCustom: 1 };
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
