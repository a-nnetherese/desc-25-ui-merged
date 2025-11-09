// Unit conversion utilities for recipes

export type UnitSystem = 'metric' | 'imperial';

// Conversion factors
const CONVERSIONS = {
  // Volume conversions (to ml)
  ml: 1,
  l: 1000,
  cup: 236.588,
  cups: 236.588,
  tbsp: 14.7868,
  tsp: 4.92892,
  
  // Weight conversions (to grams)
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
  lbs: 453.592,
};

interface ParsedIngredient {
  quantity: number;
  unit: string;
  ingredient: string;
  originalString: string;
}

export function parseIngredient(ingredient: string): ParsedIngredient {
  // Match patterns like: "250 ml milk", "2 cups flour", "1/2 cup sugar"
  const pattern = /^([\d.\/]+)\s*([a-zA-Z]+)?\s+(.+)$/;
  const match = ingredient.match(pattern);
  
  if (!match) {
    return {
      quantity: 0,
      unit: '',
      ingredient: ingredient.trim(),
      originalString: ingredient
    };
  }
  
  let quantity = match[1];
  // Handle fractions like 1/2
  if (quantity.includes('/')) {
    const parts = quantity.split('/');
    quantity = (parseFloat(parts[0]) / parseFloat(parts[1])).toString();
  }
  
  return {
    quantity: parseFloat(quantity),
    unit: (match[2] || '').toLowerCase(),
    ingredient: match[3].trim(),
    originalString: ingredient
  };
}

export function convertIngredient(ingredient: string, toSystem: UnitSystem): string {
  const parsed = parseIngredient(ingredient);
  
  if (!parsed.unit || parsed.quantity === 0) {
    return ingredient;
  }
  
  const fromUnit = parsed.unit.toLowerCase();
  
  // Determine if we're dealing with volume or weight
  const volumeUnits = ['ml', 'l', 'cup', 'cups', 'tbsp', 'tsp'];
  const weightUnits = ['g', 'kg', 'oz', 'lb', 'lbs'];
  
  const isVolume = volumeUnits.includes(fromUnit);
  const isWeight = weightUnits.includes(fromUnit);
  
  if (!isVolume && !isWeight) {
    return ingredient; // Can't convert this unit
  }
  
  // Convert to base unit (ml or g)
  const baseValue = parsed.quantity * (CONVERSIONS[fromUnit as keyof typeof CONVERSIONS] || 1);
  
  // Convert to target system
  let newQuantity: number;
  let newUnit: string;
  
  if (isVolume) {
    if (toSystem === 'metric') {
      // Convert to ml or L
      if (baseValue >= 1000) {
        newQuantity = baseValue / 1000;
        newUnit = 'L';
      } else {
        newQuantity = baseValue;
        newUnit = 'ml';
      }
    } else {
      // Convert to cups or tbsp
      const cups = baseValue / CONVERSIONS.cup;
      if (cups >= 0.25) {
        newQuantity = cups;
        newUnit = cups === 1 ? 'cup' : 'cups';
      } else {
        newQuantity = baseValue / CONVERSIONS.tbsp;
        newUnit = 'tbsp';
      }
    }
  } else {
    // Weight conversion
    if (toSystem === 'metric') {
      // Convert to g or kg
      if (baseValue >= 1000) {
        newQuantity = baseValue / 1000;
        newUnit = 'kg';
      } else {
        newQuantity = baseValue;
        newUnit = 'g';
      }
    } else {
      // Convert to oz or lbs
      const lbs = baseValue / CONVERSIONS.lb;
      if (lbs >= 1) {
        newQuantity = lbs;
        newUnit = lbs === 1 ? 'lb' : 'lbs';
      } else {
        newQuantity = baseValue / CONVERSIONS.oz;
        newUnit = 'oz';
      }
    }
  }
  
  // Format quantity nicely
  let formattedQuantity: string;
  if (newQuantity % 1 === 0) {
    formattedQuantity = newQuantity.toString();
  } else if (toSystem === 'imperial') {
    // Try to convert to common fractions for imperial
    formattedQuantity = toFraction(newQuantity);
  } else {
    formattedQuantity = newQuantity.toFixed(1);
  }
  
  return `${formattedQuantity} ${newUnit} ${parsed.ingredient}`;
}

function toFraction(decimal: number): string {
  const commonFractions: { [key: string]: string } = {
    '0.25': '1/4',
    '0.33': '1/3',
    '0.5': '1/2',
    '0.67': '2/3',
    '0.75': '3/4',
  };
  
  const whole = Math.floor(decimal);
  const fraction = decimal - whole;
  
  // Check if fraction matches a common fraction
  for (const [dec, frac] of Object.entries(commonFractions)) {
    if (Math.abs(fraction - parseFloat(dec)) < 0.05) {
      return whole > 0 ? `${whole} ${frac}` : frac;
    }
  }
  
  // Otherwise return with one decimal place
  return decimal.toFixed(1);
}

export function convertIngredients(ingredients: string[], toSystem: UnitSystem): string[] {
  return ingredients.map(ing => convertIngredient(ing, toSystem));
}
