import Tesseract from "tesseract.js";
import sharp from "sharp";

export interface GroceryItem {
  name: string;
  category: string;
  quantity: string;
}

const categoryKeywords: Record<string, string[]> = {
  Fruit: ["apple", "apples", "banana", "bananas", "orange", "oranges", "grape", "grapes", "strawberry", "strawberries", "berry", "berries", "mango", "mangos", "pineapple", "watermelon", "lemon", "lemons", "lime", "limes", "peach", "peaches", "pear", "pears", "cherry", "cherries", "blueberry", "blueberries"],
  Vegetable: ["carrot", "carrots", "tomato", "tomatoes", "lettuce", "cucumber", "cucumbers", "onion", "onions", "garlic", "potato", "potatoes", "cabbage", "spinach", "broccoli", "pepper", "peppers", "celery", "corn", "peas", "beans", "zucchini"],
  Meat: ["chicken", "beef", "pork", "bacon", "ham", "sausage", "steak", "turkey", "lamb", "ground", "breast"],
  Seafood: ["fish", "salmon", "tuna", "shrimp", "crab", "lobster", "tilapia", "cod", "seafood"],
  Dairy: ["milk", "cheese", "butter", "yogurt", "cream", "egg", "eggs", "dairy"],
  Grain: ["rice", "bread", "pasta", "flour", "oats", "cereal", "wheat", "tortilla", "bagel", "roll"],
  Processed: ["chips", "chip", "cookie", "cookies", "candy", "soda", "pop", "sauce", "oil", "vinegar", "salt", "sugar", "ketchup", "mustard", "mayo", "mayonnaise", "dressing"],
};

function categorizeItem(itemName: string): string {
  const lowerName = itemName.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerName.includes(keyword))) {
      return category;
    }
  }
  
  return "Processed";
}

async function preprocessImage(base64Image: string): Promise<Buffer> {
  try {
    const imageBuffer = Buffer.from(base64Image, 'base64');
    
    // Use sharp for image preprocessing to improve OCR accuracy
    const processed = await sharp(imageBuffer)
      .resize(2000, 2000, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .greyscale()
      .normalize()
      .sharpen()
      .toBuffer();
    
    return processed;
  } catch (error) {
    console.error("Error preprocessing image:", error);
    // Fallback to original image
    return Buffer.from(base64Image, 'base64');
  }
}

function parseGroceryItems(text: string): GroceryItem[] {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const items: GroceryItem[] = [];

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Skip non-item lines
    if (
      lowerLine.includes("total") ||
      lowerLine.includes("subtotal") ||
      lowerLine.includes("tax") ||
      lowerLine.includes("receipt") ||
      lowerLine.includes("thank") ||
      lowerLine.includes("change") ||
      lowerLine.includes("payment") ||
      lowerLine.match(/^\d+\/\d+\/\d+/) ||
      lowerLine.match(/^\d+:\d+/) ||
      lowerLine.match(/^\$?\d+\.?\d*$/) ||
      line.length < 2
    ) {
      continue;
    }

    // Extract quantity with unit
    const quantityUnitMatch = line.match(/^((\d+\s+)?(\d+)\/(\d+)|\d+(?:\.\d+)?)\s*(lbs?|oz|cups?|tbsp|tsp|g|kg|ml|l|gallons?|quarts?|pints?|items?)?/i);
    let quantity = "1 item";
    let itemName = line;

    if (quantityUnitMatch) {
      const fullQuantity = quantityUnitMatch[1];
      const unit = quantityUnitMatch[5] || "item";
      quantity = `${fullQuantity} ${unit}`;
      itemName = line.substring(quantityUnitMatch[0].length).trim();
    } else {
      const simpleQuantityMatch = line.match(/^(\d+)\s+/);
      if (simpleQuantityMatch) {
        quantity = `${simpleQuantityMatch[1]} items`;
        itemName = line.substring(simpleQuantityMatch[0].length).trim();
      }
    }

    // Clean item name
    itemName = itemName
      .replace(/\$?\d+\.?\d*\s*$/g, "")
      .replace(/\$\d+\.?\d*/g, "")
      .replace(/[^a-zA-Z\s'-]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (itemName.length < 2) continue;

    const category = categorizeItem(itemName);
    
    items.push({
      name: itemName.charAt(0).toUpperCase() + itemName.slice(1),
      category,
      quantity,
    });
  }

  return items;
}

export async function analyzeGroceryImage(base64Image: string): Promise<GroceryItem[]> {
  try {
    const imageData = base64Image.replace(/^data:image\/[a-z]+;base64,/, "");
    
    // Preprocess image for better OCR
    const processedImage = await preprocessImage(imageData);
    
    // Use improved Tesseract configuration
    const result = await Tesseract.recognize(
      processedImage,
      'eng',
      {
        logger: m => console.log(m),
      }
    );

    const extractedText = result.data.text;
    console.log('Extracted grocery text:', extractedText);
    
    return parseGroceryItems(extractedText);
  } catch (error) {
    console.error("OCR error:", error);
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
    const imageData = base64Image.replace(/^data:image\/[a-z]+;base64,/, "");
    
    // Preprocess image for better OCR
    const processedImage = await preprocessImage(imageData);
    
    // Use improved Tesseract configuration
    const result = await Tesseract.recognize(
      processedImage,
      'eng',
      {
        logger: m => console.log(m),
      }
    );

    const extractedText = result.data.text;
    console.log('Extracted recipe text:', extractedText);
    
    // Parse the extracted text to find recipe components
    const lines = extractedText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let name = "Custom Recipe";
    let description = "";
    let ingredients: string[] = [];
    let instructions: string[] = [];
    let prepTime = 30;
    let servings = 4;
    let difficulty = 2;
    let category = "Dinner";
    
    // Try to extract recipe name (usually first line or contains "recipe")
    if (lines.length > 0) {
      name = lines[0].length > 3 ? lines[0] : "Custom Recipe";
    }
    
    // Look for ingredients section
    let inIngredientsSection = false;
    let inInstructionsSection = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();
      
      // Detect sections
      if (lowerLine.includes("ingredient")) {
        inIngredientsSection = true;
        inInstructionsSection = false;
        continue;
      } else if (lowerLine.includes("instruction") || lowerLine.includes("direction") || lowerLine.includes("method")) {
        inIngredientsSection = false;
        inInstructionsSection = true;
        continue;
      }
      
      // Extract prep time
      const prepMatch = line.match(/(\d+)\s*(?:min|minute)/i);
      if (prepMatch) {
        prepTime = parseInt(prepMatch[1]);
      }
      
      // Extract servings
      const servingsMatch = line.match(/(?:serves?|servings?)\s*:?\s*(\d+)/i);
      if (servingsMatch) {
        servings = parseInt(servingsMatch[1]);
      }
      
      // Add to ingredients or instructions
      if (inIngredientsSection && line.length > 2 && !lowerLine.includes("ingredient")) {
        ingredients.push(line);
      } else if (inInstructionsSection && line.length > 5 && !lowerLine.includes("instruction")) {
        instructions.push(line);
      } else if (i > 0 && i < 5 && line.length > 10 && !description) {
        description = line;
      }
    }
    
    // Ensure we have at least some data
    if (ingredients.length === 0) {
      ingredients = ["Please add ingredients manually"];
    }
    if (instructions.length === 0) {
      instructions = ["Please add instructions manually"];
    }
    if (!description) {
      description = "Recipe extracted from image";
    }
    
    return {
      name,
      description,
      ingredients,
      instructions,
      prepTime,
      servings,
      difficulty,
      category,
    };
  } catch (error) {
    console.error("OCR error:", error);
    throw new Error("Failed to analyze recipe image: " + (error as Error).message);
  }
}
