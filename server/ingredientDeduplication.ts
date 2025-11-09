// Ingredient deduplication logic

interface IngredientMatch {
  base: string;
  variations: string[];
}

// Common ingredient variations that should be merged
const INGREDIENT_PATTERNS: IngredientMatch[] = [
  {
    base: "eggs",
    variations: ["egg", "eggs", "boiled egg", "boiled eggs", "scrambled egg", "fried egg"]
  },
  {
    base: "rice",
    variations: ["rice", "cooked rice", "steamed rice", "white rice", "jasmine rice"]
  },
  {
    base: "chicken",
    variations: ["chicken", "chicken breast", "chicken thigh", "chicken wing", "chicken meat"]
  },
  {
    base: "milk",
    variations: ["milk", "whole milk", "skim milk", "low-fat milk"]
  },
  {
    base: "butter",
    variations: ["butter", "unsalted butter", "salted butter"]
  },
  {
    base: "flour",
    variations: ["flour", "all-purpose flour", "plain flour", "wheat flour"]
  },
  {
    base: "sugar",
    variations: ["sugar", "white sugar", "granulated sugar", "caster sugar"]
  },
  {
    base: "salt",
    variations: ["salt", "sea salt", "table salt", "kosher salt"]
  },
  {
    base: "pepper",
    variations: ["pepper", "black pepper", "ground pepper", "peppercorn"]
  },
  {
    base: "onion",
    variations: ["onion", "onions", "yellow onion", "white onion", "red onion"]
  },
  {
    base: "garlic",
    variations: ["garlic", "garlic clove", "garlic cloves", "minced garlic"]
  },
  {
    base: "tomato",
    variations: ["tomato", "tomatoes", "fresh tomato", "ripe tomato"]
  },
  {
    base: "oil",
    variations: ["oil", "cooking oil", "vegetable oil", "olive oil", "canola oil"]
  },
  {
    base: "soy sauce",
    variations: ["soy sauce", "light soy sauce", "dark soy sauce", "shoyu"]
  },
  {
    base: "potato",
    variations: ["potato", "potatoes", "russet potato", "white potato"]
  },
  {
    base: "carrot",
    variations: ["carrot", "carrots", "fresh carrot"]
  },
  {
    base: "cheese",
    variations: ["cheese", "cheddar cheese", "mozzarella cheese", "shredded cheese"]
  },
  {
    base: "bread",
    variations: ["bread", "white bread", "wheat bread", "loaf bread"]
  }
];

/**
 * Normalize an ingredient name to its base form for deduplication
 */
export function normalizeIngredient(ingredientName: string): string {
  const cleaned = ingredientName.toLowerCase().trim();
  
  // Check against known patterns
  for (const pattern of INGREDIENT_PATTERNS) {
    for (const variation of pattern.variations) {
      if (cleaned.includes(variation) || variation.includes(cleaned)) {
        return pattern.base;
      }
    }
  }
  
  // If no pattern matches, clean up the name
  // Remove common modifiers
  const modifiers = [
    'fresh', 'organic', 'raw', 'cooked', 'steamed', 'boiled', 'fried',
    'chopped', 'diced', 'minced', 'sliced', 'shredded', 'grated',
    'large', 'small', 'medium', 'whole'
  ];
  
  let normalized = cleaned;
  for (const modifier of modifiers) {
    normalized = normalized.replace(new RegExp(`\\b${modifier}\\b`, 'g'), '').trim();
  }
  
  // Remove extra whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  // Singularize (simple approach)
  if (normalized.endsWith('s') && normalized.length > 3 && !normalized.endsWith('ss')) {
    normalized = normalized.slice(0, -1);
  }
  
  return normalized || cleaned; // Fallback to cleaned if normalization results in empty string
}

/**
 * Parse an ingredient string to extract quantity, unit, and name
 */
export function parseIngredientString(ingredient: string): {
  quantity: number;
  unit: string;
  name: string;
  normalized: string;
} {
  // Match patterns like: "250 ml milk", "2 cups flour", "1/2 cup sugar", "3 eggs"
  const match = ingredient.match(/^([\d.\/]+)\s*([a-zA-Z]+)?\s+(.+)$/);
  
  if (!match) {
    const name = ingredient.trim();
    return {
      quantity: 1,
      unit: '',
      name,
      normalized: normalizeIngredient(name)
    };
  }
  
  let quantity = match[1];
  // Handle fractions
  if (quantity.includes('/')) {
    const parts = quantity.split('/');
    quantity = (parseFloat(parts[0]) / parseFloat(parts[1])).toString();
  }
  
  const unit = (match[2] || '').toLowerCase();
  const name = match[3].trim();
  
  return {
    quantity: parseFloat(quantity),
    unit,
    name,
    normalized: normalizeIngredient(name)
  };
}

/**
 * Merge duplicate ingredients by summing their quantities
 */
export function mergeIngredients(ingredients: string[]): Map<string, { quantity: number; unit: string; name: string }> {
  const merged = new Map<string, { quantity: number; unit: string; name: string }>();
  
  for (const ingredient of ingredients) {
    const parsed = parseIngredientString(ingredient);
    const key = `${parsed.normalized}|${parsed.unit}`; // Group by normalized name and unit
    
    if (merged.has(key)) {
      const existing = merged.get(key)!;
      existing.quantity += parsed.quantity;
    } else {
      merged.set(key, {
        quantity: parsed.quantity,
        unit: parsed.unit,
        name: parsed.normalized // Use normalized name for consistency
      });
    }
  }
  
  return merged;
}
