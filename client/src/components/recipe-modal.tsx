import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Plus, Minus, Clock, Users, ShoppingBasket, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { convertIngredients, type UnitSystem } from "@/lib/unitConversion";
import type { Recipe } from "@shared/schema";

interface RecipeModalProps {
  recipe: Recipe;
  isOpen: boolean;
  onClose: () => void;
}

export function RecipeModal({ recipe, isOpen, onClose }: RecipeModalProps) {
  const [servings, setServings] = useState(recipe.servings);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const { toast } = useToast();

  const { data: basket = [] } = useQuery({
    queryKey: ["/api/basket"],
  });

  const addToBasket = useMutation({
    mutationFn: async () => {
      const scaledIngredients = recipe.ingredients.map((ing) => {
        const multiplier = servings / recipe.servings;
        return ing.replace(/(\d+(?:\.\d+)?)/g, (match) => {
          const scaled = parseFloat(match) * multiplier;
          return scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(1);
        });
      });

      return apiRequest("POST", "/api/basket", {
        recipeId: recipe.id,
        recipeName: recipe.name,
        servings,
        ingredients: scaledIngredients,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/basket"] });
      queryClient.invalidateQueries({ queryKey: ["/api/grocery-list"] });
      toast({
        title: "Added to basket!",
        description: `${recipe.name} (${servings} servings) has been added to your basket.`,
      });
      onClose();
    },
  });

  const deleteRecipe = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/recipes/${recipe.id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      toast({
        title: "Recipe deleted",
        description: `${recipe.name} has been deleted.`,
      });
      onClose();
    },
  });

  const getDifficultyText = (difficulty: number) => {
    if (difficulty <= 2) return "Easy";
    if (difficulty <= 3) return "Medium";
    return "Hard";
  };

  // Scale and convert ingredients
  const displayIngredients = recipe.ingredients.map((ingredient) => {
    // First scale the ingredient
    const scaledIngredient = ingredient.replace(
      /(\d+(?:\.\d+)?)/g,
      (match) => {
        const multiplier = servings / recipe.servings;
        const scaled = parseFloat(match) * multiplier;
        return scaled % 1 === 0
          ? scaled.toString()
          : scaled.toFixed(1);
      }
    );
    return scaledIngredient;
  });

  // Convert to selected unit system
  const convertedIngredients = convertIngredients(displayIngredients, unitSystem);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative aspect-square md:aspect-auto bg-muted">
            <img
              src={recipe.imageUrl}
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content Section */}
          <div className="flex flex-col max-h-[90vh] md:max-h-none overflow-y-auto">
            <DialogHeader className="p-8 pb-4">
              <DialogTitle className="text-3xl font-bold mb-2">
                {recipe.name}
              </DialogTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{recipe.prepTime} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{recipe.servings} servings</span>
                </div>
              </div>
              <Badge variant="secondary" className="w-fit mt-2">
                Difficulty: {getDifficultyText(recipe.difficulty)}
              </Badge>
            </DialogHeader>

            <div className="px-8 pb-8 space-y-6 flex-1">
              <div>
                <h4 className="font-semibold mb-2 text-base">Description</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {recipe.description}
                </p>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-base">Ingredients</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {unitSystem === 'metric' ? 'ml/kg' : 'cups/lbs'}
                    </span>
                    <Switch
                      checked={unitSystem === 'imperial'}
                      onCheckedChange={(checked) => setUnitSystem(checked ? 'imperial' : 'metric')}
                      data-testid="switch-unit-system"
                    />
                  </div>
                </div>
                <ul className="space-y-2">
                  {convertedIngredients.map((ingredient, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="text-primary mt-1">•</span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-4 text-base">Instructions</h4>
                <ol className="space-y-3">
                  {recipe.instructions.map((instruction, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm text-muted-foreground"
                    >
                      <span className="font-semibold text-primary min-w-[24px]">
                        {index + 1}.
                      </span>
                      <span className="flex-1">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-4 text-base">Servings</h4>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setServings(Math.max(1, servings - 1))}
                    disabled={servings <= 1}
                    data-testid="button-decrease-servings"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-2xl font-semibold w-12 text-center" data-testid="text-servings">
                    {servings}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setServings(servings + 1)}
                    data-testid="button-increase-servings"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-8 pt-4 border-t bg-card">
              <div className="flex gap-3">
                {recipe.isCustom === 1 && (
                  <Button
                    size="lg"
                    variant="destructive"
                    className="flex-1 rounded-full"
                    onClick={() => deleteRecipe.mutate()}
                    disabled={deleteRecipe.isPending}
                    data-testid="button-delete-recipe"
                  >
                    <Trash2 className="mr-2 h-5 w-5" />
                    {deleteRecipe.isPending ? "Deleting..." : "Delete Recipe"}
                  </Button>
                )}
                <Button
                  size="lg"
                  className={`${recipe.isCustom === 1 ? 'flex-1' : 'w-full'} rounded-full`}
                  onClick={() => addToBasket.mutate()}
                  disabled={addToBasket.isPending}
                  data-testid="button-add-to-basket"
                >
                  <ShoppingBasket className="mr-2 h-5 w-5" />
                  {addToBasket.isPending ? "Adding..." : "Add to Basket"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
