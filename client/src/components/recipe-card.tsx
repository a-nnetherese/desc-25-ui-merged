import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ShoppingBasket, Minus, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Recipe } from "@shared/schema";

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const addToBasket = useMutation({
    mutationFn: async (servingsMultiplier: number) => {
      const scaledServings = recipe.servings * servingsMultiplier;
      const scaledIngredients = recipe.ingredients.map((ing) => {
        // Handle fractions (1/2, 3/4) and mixed numbers (1 1/2)
        return ing.replace(/(\d+\s+)?(\d+)\/(\d+)|\d+(?:\.\d+)?/g, (match, whole, num, denom) => {
          let value: number;
          
          if (num && denom) {
            // Fraction or mixed number
            const wholeNum = whole ? parseFloat(whole.trim()) : 0;
            value = wholeNum + (parseFloat(num) / parseFloat(denom));
          } else {
            // Regular decimal
            value = parseFloat(match);
          }
          
          const scaled = value * servingsMultiplier;
          
          // Format result
          if (scaled % 1 === 0) {
            return scaled.toString();
          } else {
            // Try to convert to common fractions for imperial measurements
            const fractionMap: {[key: string]: string} = {
              '0.25': '1/4', '0.5': '1/2', '0.75': '3/4',
              '0.33': '1/3', '0.67': '2/3'
            };
            const decimal = scaled % 1;
            const wholeNumScaled = Math.floor(scaled);
            for (const [dec, frac] of Object.entries(fractionMap)) {
              if (Math.abs(decimal - parseFloat(dec)) < 0.05) {
                return wholeNumScaled > 0 ? `${wholeNumScaled} ${frac}` : frac;
              }
            }
            return scaled.toFixed(1);
          }
        });
      });

      return apiRequest("POST", "/api/basket", {
        recipeId: recipe.id,
        recipeName: recipe.name,
        servings: scaledServings,
        ingredients: scaledIngredients,
      });
    },
    onSuccess: (_data, servingsMultiplier) => {
      queryClient.invalidateQueries({ queryKey: ["/api/basket"] });
      queryClient.invalidateQueries({ queryKey: ["/api/grocery-list"] });
      toast({
        title: "Added to basket!",
        description: `${recipe.name} (${recipe.servings * servingsMultiplier} servings) has been added to your basket.`,
      });
      setQuantity(1);
    },
  });

  const getDifficultyText = (difficulty: number) => {
    if (difficulty <= 2) return "Easy";
    if (difficulty <= 3) return "Medium";
    return "Hard";
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToBasket.mutate(quantity);
  };

  const incrementQuantity = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity(prev => Math.min(prev + 1, 10));
  };

  const decrementQuantity = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  return (
    <Card
      className="group overflow-hidden hover-elevate transition-all duration-300 cursor-pointer border-card-border"
      onClick={onClick}
      data-testid={`card-recipe-${recipe.id}`}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={recipe.imageUrl}
          alt={recipe.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      
      <div className="p-6 space-y-3">
        <div>
          <h4 className="text-xl font-semibold text-card-foreground mb-2 line-clamp-1">
            {recipe.name}
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {recipe.description}
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{recipe.prepTime} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{recipe.servings}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              Difficulty: {getDifficultyText(recipe.difficulty)}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border rounded-full">
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                data-testid={`button-decrement-${recipe.id}`}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-sm font-medium w-6 text-center" data-testid={`text-quantity-${recipe.id}`}>
                {quantity}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full"
                onClick={incrementQuantity}
                disabled={quantity >= 10}
                data-testid={`button-increment-${recipe.id}`}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            <Button
              size="sm"
              variant="default"
              className="rounded-full flex-1"
              onClick={handleQuickAdd}
              disabled={addToBasket.isPending}
              data-testid={`button-quick-add-${recipe.id}`}
            >
              <ShoppingBasket className="h-4 w-4 mr-1" />
              {addToBasket.isPending ? "Adding..." : "Add"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
