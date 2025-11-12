import OpenAI from "openai";

// This is using OpenAI's API, which points to OpenAI's API servers and requires your own API key.
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface GroceryItem {
  name: string;
  category: string;
  quantity: string;
}

export async function analyzeGroceryImage(base64Image: string): Promise<GroceryItem[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an expert at analyzing images of grocery lists, receipts, and food items. 
Analyze the image and extract all grocery items you can identify.
For each item, provide:
- name: the item name (capitalized)
- category: must be one of: Fruit, Vegetable, Meat, Seafood, Dairy, Processed, Grain
- quantity: the quantity with unit (e.g., "2 lbs", "1 cup", "3 items") or "1 item" if not specified

Return the results as a JSON object with an "items" array. Example:
{
  "items": [
    {"name": "Apples", "category": "Fruit", "quantity": "2 lbs"},
    {"name": "Milk", "category": "Dairy", "quantity": "1 gallon"}
  ]
}`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this image and extract all grocery items you can identify.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 2048,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.items || [];
  } catch (error) {
    console.error("OpenAI Vision API error:", error);
    throw new Error("Failed to analyze grocery image: " + (error as Error).message);
  }
}

export async function analyzeRecipeImage(base64Image: string): Promise<{
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  servings: number;
  difficulty: number;
  category: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an expert at analyzing recipe images and extracting recipe information.
Analyze the image and extract recipe details.
Return a JSON object with:
- name: recipe name
- description: brief description (1-2 sentences)
- ingredients: array of ingredient strings with quantities (e.g., "2 cups flour")
- instructions: array of instruction steps
- prepTime: estimated prep time in minutes
- servings: number of servings
- difficulty: 1-5 (1=easy, 5=hard)
- category: one of: Breakfast, Lunch, Dinner, Snack, Dessert

Example:
{
  "name": "Chocolate Chip Cookies",
  "description": "Classic homemade chocolate chip cookies.",
  "ingredients": ["2 cups flour", "1 cup sugar", "1/2 cup butter"],
  "instructions": ["Mix dry ingredients", "Add wet ingredients", "Bake at 350F for 12 minutes"],
  "prepTime": 30,
  "servings": 24,
  "difficulty": 2,
  "category": "Dessert"
}`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this recipe image and extract all the details.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 2048,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("OpenAI Vision API error:", error);
    throw new Error("Failed to analyze recipe image: " + (error as Error).message);
  }
}
