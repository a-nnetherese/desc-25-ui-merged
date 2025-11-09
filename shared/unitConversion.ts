// Unit conversion utilities for recipe ingredients

export type UnitSystem = 'metric' | 'imperial';

// Conversion factors
const CONVERSIONS = {
  // Volume conversions (to ml)
  'ml': 1,
  'l': 1000,
  'cup': 236.588,
  'cups': 236.588,
  'tbsp': 14.787,
  'tsp': 4.929,
  'oz': 29.574,
  
  // Weight conversions (to g)
  'g': 1,
  'kg': 1000,
  'lb': 453.592,
  'lbs': 453.592,
  'oz-weight': 28.3495,
};

interface ParsedIngredient {
  quantity: number;
  unit: string;
  name: string;
  original: string;
}

export function parseIngredient(ingredient: string): ParsedIngredient {
  // Match patterns like "2 cups flour", "100g beef", "1/2 tsp salt"
  const patterns = [
    /^(\d+(?:\/\d+)?(?:\.\d+)?)\s*(ml|l|g|kg|cup|cups|tbsp|tsp|oz|lb|lbs)?\s+(.+)$/i,
    /^(\d+(?:\/\d+)?(?:\.\d+)?)(ml|l|g|kg)?\s+(.+)$/i,
  ];
  
  for (const pattern of patterns) {
    const match = ingredient.match(pattern);
    if (match) {
      let quantity = match[1];
      // Handle fractions
      if (quantity.includes('/')) {
        const [num, den] = quantity.split('/').map(Number);
        quantity = (num / den).toString();
      }
      
      return {
        quantity: parseFloat(quantity),
        unit: (match[2] || '').toLowerCase(),
        name: match[3].trim(),
        original: ingredient,
      };
    }
  }
  
  // If no match, return as-is
  return {
    quantity: 0,
    unit: '',
    name: ingredient,
    original: ingredient,
  };
}

export function convertIngredient(
  ingredient: string,
  targetSystem: UnitSystem
): string {
  const parsed = parseIngredient(ingredient);
  
  if (!parsed.unit || parsed.quantity === 0) {
    return ingredient; // Return original if can't parse
  }
  
  const unit = parsed.unit.toLowerCase();
  
  // Determine if current unit is metric or imperial
  const isMetric = ['ml', 'l', 'g', 'kg'].includes(unit);
  const isImperial = ['cup', 'cups', 'tbsp', 'tsp', 'oz', 'lb', 'lbs'].includes(unit);
  
  if (!isMetric && !isImperial) {
    return ingredient; // Unknown unit, return original
  }
  
  // If already in target system, return original
  if ((isMetric && targetSystem === 'metric') || (isImperial && targetSystem === 'imperial')) {
    return ingredient;
  }
  
  // Convert volume units
  if (['ml', 'l', 'cup', 'cups', 'tbsp', 'tsp', 'oz'].includes(unit)) {
    const mlValue = parsed.quantity * (CONVERSIONS[unit as keyof typeof CONVERSIONS] || 1);
    
    if (targetSystem === 'metric') {
      // Convert to ml or l
      if (mlValue >= 1000) {
        const liters = mlValue / 1000;
        return `${formatQuantity(liters)} l ${parsed.name}`;
      } else {
        return `${formatQuantity(mlValue)} ml ${parsed.name}`;
      }
    } else {
      // Convert to cups, tbsp, or tsp
      if (mlValue >= 236.588) {
        const cups = mlValue / 236.588;
        return `${formatQuantity(cups)} ${cups === 1 ? 'cup' : 'cups'} ${parsed.name}`;
      } else if (mlValue >= 14.787) {
        const tbsp = mlValue / 14.787;
        return `${formatQuantity(tbsp)} tbsp ${parsed.name}`;
      } else {
        const tsp = mlValue / 4.929;
        return `${formatQuantity(tsp)} tsp ${parsed.name}`;
      }
    }
  }
  
  // Convert weight units
  if (['g', 'kg', 'lb', 'lbs', 'oz-weight'].includes(unit)) {
    const gValue = parsed.quantity * (CONVERSIONS[unit as keyof typeof CONVERSIONS] || 1);
    
    if (targetSystem === 'metric') {
      // Convert to g or kg
      if (gValue >= 1000) {
        const kg = gValue / 1000;
        return `${formatQuantity(kg)} kg ${parsed.name}`;
      } else {
        return `${formatQuantity(gValue)} g ${parsed.name}`;
      }
    } else {
      // Convert to lbs or oz
      if (gValue >= 453.592) {
        const lbs = gValue / 453.592;
        return `${formatQuantity(lbs)} ${lbs === 1 ? 'lb' : 'lbs'} ${parsed.name}`;
      } else {
        const oz = gValue / 28.3495;
        return `${formatQuantity(oz)} oz ${parsed.name}`;
      }
    }
  }
  
  return ingredient;
}

function formatQuantity(value: number): string {
  // Round to 1 decimal place if needed
  if (value % 1 === 0) {
    return value.toString();
  }
  return value.toFixed(1);
}

// Function to normalize ingredient names for deduplication
export function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Remove common modifiers
    .replace(/\b(cooked|boiled|fresh|frozen|raw|sliced|diced|chopped|minced)\b/g, '')
    // Normalize plural forms
    .replace(/\b(egg)s?\b/g, 'egg')
    .replace(/\b(potato|tomato)e?s?\b/g, '$1')
    .replace(/\b(onion)s?\b/g, 'onion')
    .replace(/\b(carrot)s?\b/g, 'carrot')
    .replace(/\b(rice)\b/g, 'rice')
    .replace(/\b(chicken)\b/g, 'chicken')
    .replace(/\b(garlic)\b/g, 'garlic')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
}
