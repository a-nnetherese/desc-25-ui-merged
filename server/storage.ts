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

          {
        name: "Fried Chicken",
        category: "lunch",
        description: "Crispy, golden fried chicken seasoned simply with salt and pepper.",
        difficulty: 3,
        prepTime: 25,
        servings: 2,
        imageUrl: "https://www.nestlegoodnes.com/ph/sites/default/files/styles/1_1_768px_width/public/srh_recipes/daf62ae8e9c2ffd5a32165d769f46628.jpg.webp?itok=OnON5UWk",
        ingredients: ["1 chicken leg or breast", "2 tbsp flour", "Salt and pepper", "Oil for frying"],
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
        ingredients: ["150g chicken", "2 tbsp tomato sauce", "¼ cup diced potatoes", "¼ cup bell peppers", "Garlic, onion, salt, pepper"],
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
        ingredients: ["150g chicken", "½ cup mixed veggies", "1 tbsp soy sauce", "1 tsp oyster sauce", "Garlic, oil"],
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
        ingredients: ["1 small fish fillet (cream dory or tilapia)", "2 tbsp flour", "Salt, pepper, oil", "1 tbsp mayo + ½ tsp calamansi for dip"],
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
        ingredients: ["100g shrimp", "1 tbsp butter", "2 cloves garlic, minced", "Salt, pepper"],
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
        ingredients: ["1 cup cooked rice", "1 egg", "2 cloves garlic, minced", "1 tsp soy sauce", "1 tbsp oil"],
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
        name: "Adobo",
        category: "dinner",
        description: "Repurpose your leftover adobo into a hearty evening meal.",
        difficulty: 1,
        prepTime: 10,
        servings: 2,
        imageUrl: "https://salu-salo.com/wp-content/uploads/2015/04/Pork-Adobo-3.jpg",
        ingredients: ["Leftover adobo", "Water (optional for reheating)"],
        instructions: ["Reheat adobo in the pan or rice cooker with a splash of water to keep moist.", "Serve with rice or wrap in lettuce for a lighter meal."]
      },
      {
        name: "Tortang Talong + Rice",
        category: "dinner",
        description: "Eggplant omelet served with rice and ketchup or soy sauce.",
        difficulty: 2,
        prepTime: 15,
        servings: 1,
        imageUrl: "https://maeservesyoufood.com/wp-content/uploads/2023/03/tortang-talong-5.jpeg",
        ingredients: ["1 eggplant", "1 egg", "Salt & oil"],
        instructions: ["Roast or microwave eggplant until soft, peel off skin.", "Flatten with fork, dip in beaten egg, fry until golden.", "Serve with rice."]
      },
      {
        name: "Vegetable Stir-Fry + Fried Egg",
        category: "dinner",
        description: "Simple veggie stir-fry topped with a fried egg.",
        difficulty: 3,
        prepTime: 12,
        servings: 1,
        imageUrl: "https://i.ytimg.com/vi/85RdLY6-xI0/maxresdefault.jpg",
        ingredients: ["½ cup chopped cabbage", "¼ cup carrots, sliced", "1 tbsp soy sauce", "1 egg", "Garlic, oil"],
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
        ingredients: ["4 pcs tofu cubes", "1 tbsp soy sauce + ½ tbsp vinegar (dip)", "Garlic (optional), oil"],
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
        ingredients: ["150g chicken or pork", "½ cup mixed veggies", "1 tbsp soy sauce", "1 tsp oyster sauce or sugar", "Garlic, oil"],
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
        ingredients: ["1 small fish (tilapia or bangus slice)", "Salt & pepper", "1 tomato, sliced"],
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
        ingredients: ["1 cup chopped pechay", "2 cloves garlic, minced", "1 tsp soy sauce", "Oil, salt"],
        instructions: ["Sauté garlic until fragrant.", "Add pechay and soy sauce, toss until wilted.", "Serve with rice."]
      },
      {
        name: "Sautéed Corned Tuna + Rice (Homemade Version)",
        category: "dinner",
        description: "Homemade corned tuna sautéed with garlic and onion.",
        difficulty: 2,
        prepTime: 12,
        servings: 1,
        imageUrl: "https://www.pureandsimplenourishment.com/wp-content/uploads/2022/08/tuna-fried-rice-feature-image.jpg",
        ingredients: ["1 small can tuna (flakes in oil)", "1 clove garlic, minced", "¼ onion, chopped", "1 tsp soy sauce", "Rice"],
        instructions: ["Drain some oil, then sauté garlic and onion.", "Add tuna and soy sauce, cook until slightly crisp.", "Serve with rice."]
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
        name: "Egg Rice Bowl",
        category: "dinner",
        description: "Simple rice bowl topped with buttery egg and soy sauce.",
        difficulty: 2,
        prepTime: 10,
        servings: 1,
        imageUrl: "https://www.okonomikitchen.com/wp-content/uploads/2020/09/vegan-eggy-Japanese-scrambled-tofu-1-of-1-2.jpg",
        ingredients: ["1 cup rice", "1 egg", "1 tsp soy sauce", "1 tsp butter"],
        instructions: ["Melt butter into rice.", "Fry or scramble egg, then place on top.", "Drizzle soy sauce and mix before eating."]
      },
      {
        name: "Vegetable Fried Rice (Leftover Veggies + Egg)",
        category: "dinner",
        description: "Fried rice made with leftover vegetables and a fresh egg.",
        difficulty: 3,
        prepTime: 15,
        servings: 2,
        imageUrl: "https://cdn.loveandlemons.com/wp-content/uploads/2025/02/301_LLBlog_FriedRice_47795.jpg",
        ingredients: ["1 cup rice", "½ cup chopped leftover veggies", "1 egg", "1 tbsp soy sauce", "Garlic, oil"],
        instructions: ["Sauté garlic, add veggies, then rice.", "Push aside, scramble egg, mix all together.", "Season with soy sauce and serve."]
      },

      // Snacks (15 recipes)
      {
        name: "Banana Chips",
        category: "snacks",
        description: "Crispy homemade banana chips, lightly salted and perfect for snacking.",
        difficulty: 2,
        prepTime: 25,
        servings: 4,
        imageUrl: "https://www.shutterstock.com/image-photo/banana-chips-bowl-on-white-600nw-1696140806.jpg",
        ingredients: ["3 unripe saba bananas", "2 cups cooking oil", "Salt to taste"],
        instructions: ["Slice bananas thinly using a mandoline or knife.", "Heat oil in a pan over medium heat.", "Fry banana slices until golden and crispy.", "Drain on paper towels and sprinkle with salt."]
      },
      {
        name: "Turon (Banana Spring Rolls)",
        category: "snacks",
        description: "Sweet caramelized banana wrapped in crispy spring roll wrapper.",
        difficulty: 2,
        prepTime: 20,
        servings: 6,
        imageUrl: "https://panlasangpinoy.com/wp-content/uploads/2009/07/turon-recipe.jpg",
        ingredients: ["6 saba bananas", "12 spring roll wrappers", "1 cup brown sugar", "Oil for frying"],
        instructions: ["Slice bananas lengthwise.", "Wrap each banana in spring roll wrapper.", "Roll in brown sugar.", "Deep fry until golden and caramelized."]
      },
      {
        name: "Cheese Sticks",
        category: "snacks",
        description: "Crispy fried cheese wrapped in spring roll wrappers.",
        difficulty: 1,
        prepTime: 15,
        servings: 8,
        imageUrl: "https://www.yummytummyaarthi.com/wp-content/uploads/2014/09/1-25.jpg",
        ingredients: ["8 cheese sticks", "16 spring roll wrappers", "Oil for frying"],
        instructions: ["Wrap each cheese stick in 2 layers of spring roll wrapper.", "Seal edges with water.", "Deep fry until golden and crispy.", "Serve hot with sweet chili sauce."]
      },
      {
        name: "Lumpia Shanghai (Mini Spring Rolls)",
        category: "snacks",
        description: "Filipino-style meat spring rolls, crispy and savory.",
        difficulty: 3,
        prepTime: 35,
        servings: 12,
        imageUrl: "https://www.foxyfolksy.com/wp-content/uploads/2023/02/lumpia-shanghai-1200t.jpg",
        ingredients: ["250g ground pork", "1 carrot, minced", "1 onion, minced", "2 cloves garlic, minced", "20 spring roll wrappers", "Oil for frying", "Salt and pepper"],
        instructions: ["Mix ground pork, carrot, onion, garlic, salt, and pepper.", "Place filling on wrapper and roll tightly.", "Seal edges with water.", "Deep fry until golden brown."]
      },
      {
        name: "Cassava Cake",
        category: "snacks",
        description: "Sweet and creamy cassava cake with a custard topping.",
        difficulty: 3,
        prepTime: 60,
        servings: 8,
        imageUrl: "https://www.kawalingpinoy.com/wp-content/uploads/2014/03/cassava-cake-3.jpg",
        ingredients: ["2 cups grated cassava", "1 can condensed milk", "1 can coconut milk", "2 eggs", "½ cup sugar", "¼ cup butter"],
        instructions: ["Mix cassava, condensed milk, coconut milk, eggs, and sugar.", "Pour into greased baking dish.", "Bake at 350°F for 45 minutes.", "Top with custard and broil until golden."]
      },
      {
        name: "Puto (Steamed Rice Cakes)",
        category: "snacks",
        description: "Soft and fluffy steamed rice cakes, a Filipino favorite.",
        difficulty: 2,
        prepTime: 30,
        servings: 12,
        imageUrl: "https://www.kawalingpinoy.com/wp-content/uploads/2014/02/puto-1.jpg",
        ingredients: ["2 cups rice flour", "1 cup sugar", "1 cup water", "2 tsp baking powder", "½ cup coconut milk", "Cheese slices for topping"],
        instructions: ["Mix flour, sugar, and baking powder.", "Add water and coconut milk, mix well.", "Pour into molds and top with cheese.", "Steam for 15-20 minutes."]
      },
      {
        name: "Palabok (Noodle Snack)",
        category: "snacks",
        description: "Rice noodles topped with savory shrimp sauce and garnishes.",
        difficulty: 3,
        prepTime: 30,
        servings: 4,
        imageUrl: "https://www.foxyfolksy.com/wp-content/uploads/2024/06/palabok-1200t.jpg",
        ingredients: ["200g rice noodles", "½ cup shrimp", "2 tbsp shrimp paste", "1 cup pork broth", "2 eggs, hard-boiled", "Green onions", "Chicharron"],
        instructions: ["Cook rice noodles according to package.", "Make sauce with shrimp paste and broth.", "Top noodles with sauce, shrimp, eggs, and garnishes."]
      },
      {
        name: "Fishball Skewers",
        category: "snacks",
        description: "Street-style fishballs on skewers with sweet and spicy sauce.",
        difficulty: 1,
        prepTime: 15,
        servings: 4,
        imageUrl: "https://www.kawalingpinoy.com/wp-content/uploads/2023/02/fish-balls-4.jpg",
        ingredients: ["20 fishballs", "2 tbsp soy sauce", "1 tbsp vinegar", "1 tbsp banana ketchup", "Chili flakes", "Bamboo skewers"],
        instructions: ["Boil fishballs until cooked through.", "Thread onto skewers.", "Mix sauce ingredients.", "Serve with sauce for dipping."]
      },
      {
        name: "Kwek-Kwek (Battered Quail Eggs)",
        category: "snacks",
        description: "Deep-fried quail eggs in orange batter, a Filipino street food classic.",
        difficulty: 2,
        prepTime: 20,
        servings: 6,
        imageUrl: "https://www.kawalingpinoy.com/wp-content/uploads/2013/05/kwek-kwek-1.jpg",
        ingredients: ["12 quail eggs, hard-boiled", "1 cup flour", "½ cup cornstarch", "1 tsp orange food coloring", "Water", "Oil for frying"],
        instructions: ["Mix flour, cornstarch, food coloring, and water to make batter.", "Dip eggs in batter.", "Deep fry until crispy and orange.", "Serve with vinegar sauce."]
      },
      {
        name: "Peanut Butter Sandwich",
        category: "snacks",
        description: "Classic peanut butter sandwich, simple and satisfying.",
        difficulty: 1,
        prepTime: 5,
        servings: 1,
        imageUrl: "https://www.simplyrecipes.com/thmb/8caxM6p7BBjJqdjOx5Xfqz6a1Zg=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Simply-Recipes-Peanut-Butter-And-Jelly-Sandwich-LEAD-1-c94e1e3e8f7d4f0b9c6e7b8f8b3b9b9e.jpg",
        ingredients: ["2 slices bread", "2 tbsp peanut butter", "1 tbsp jelly (optional)"],
        instructions: ["Spread peanut butter on one slice of bread.", "Add jelly if desired.", "Top with second slice and cut in half."]
      },
      {
        name: "Crackers with Cheese Spread",
        category: "snacks",
        description: "Quick and easy cheese and crackers snack.",
        difficulty: 1,
        prepTime: 5,
        servings: 2,
        imageUrl: "https://www.tasteofhome.com/wp-content/uploads/2018/01/Cheese-and-Crackers_EXPS_FT23_12344_EC_120822_3.jpg",
        ingredients: ["10 crackers", "3 tbsp cheese spread or cream cheese"],
        instructions: ["Spread cheese on crackers.", "Arrange on a plate and serve."]
      },
      {
        name: "Banana Cue",
        category: "snacks",
        description: "Caramelized banana skewers, a popular Filipino street snack.",
        difficulty: 2,
        prepTime: 15,
        servings: 4,
        imageUrl: "https://panlasangpinoy.com/wp-content/uploads/2013/06/banana-cue.jpg",
        ingredients: ["4 saba bananas", "½ cup brown sugar", "Oil for frying", "4 bamboo skewers"],
        instructions: ["Heat oil in pan.", "Add bananas and sprinkle with brown sugar.", "Fry until caramelized, turning occasionally.", "Skewer and serve warm."]
      },
      {
        name: "Polvoron (Powdered Milk Candy)",
        category: "snacks",
        description: "Traditional Filipino powdered milk candy, crumbly and sweet.",
        difficulty: 2,
        prepTime: 20,
        servings: 12,
        imageUrl: "https://www.kawalingpinoy.com/wp-content/uploads/2013/12/polvoron-1.jpg",
        ingredients: ["2 cups toasted flour", "1 cup powdered milk", "1 cup sugar", "½ cup melted butter"],
        instructions: ["Toast flour in a pan until lightly brown.", "Mix all ingredients together.", "Press into molds firmly.", "Wrap in cellophane or parchment paper."]
      },
      {
        name: "Ensaymada (Sweet Cheese Bread)",
        category: "snacks",
        description: "Soft, buttery bread topped with butter, sugar, and cheese.",
        difficulty: 4,
        prepTime: 90,
        servings: 8,
        imageUrl: "https://www.kawalingpinoy.com/wp-content/uploads/2014/12/ensaymada-1.jpg",
        ingredients: ["3 cups flour", "½ cup sugar", "1 tsp yeast", "3 eggs", "½ cup butter", "½ cup milk", "Grated cheese", "Extra butter and sugar for topping"],
        instructions: ["Mix flour, sugar, yeast, eggs, and milk to form dough.", "Knead and let rise for 1 hour.", "Shape into coils, let rise again.", "Bake at 350°F for 20 minutes.", "Top with butter, sugar, and cheese."]
      },
      {
        name: "Sweet Corn Kernels",
        category: "snacks",
        description: "Boiled sweet corn kernels with butter and salt.",
        difficulty: 1,
        prepTime: 10,
        servings: 2,
        imageUrl: "https://www.cookingclassy.com/wp-content/uploads/2019/07/boiled-corn-02.jpg",
        ingredients: ["2 cups corn kernels", "1 tbsp butter", "Salt to taste", "Water for boiling"],
        instructions: ["Boil corn kernels in water for 5-7 minutes.", "Drain and toss with butter and salt.", "Serve warm in a cup."]
      }
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
