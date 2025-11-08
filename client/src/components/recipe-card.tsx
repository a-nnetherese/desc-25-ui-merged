import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Users, ShoppingBasket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Recipe } from "@shared/schema";

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const { toast } = useToast();

  const addToBasket = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/basket", {
        recipeId: recipe.id,
        recipeName: recipe.name,
        servings: recipe.servings,
        ingredients: recipe.ingredients,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/basket"] });
      queryClient.invalidateQueries({ queryKey: ["/api/grocery-list"] });
      toast({
        title: "Added to basket!",
        description: `${recipe.name} (${recipe.servings} servings) has been added to your basket.`,
      });
    },
  });

  const getDifficultyText = (difficulty: number) => {
    if (difficulty <= 2) return "Easy";
    if (difficulty <= 3) return "Medium";
    return "Hard";
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToBasket.mutate();
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
        <Button
          size="icon"
          variant="secondary"
          className="absolute bottom-3 right-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          data-testid={`button-view-${recipe.id}`}
        >
          <Plus className="h-5 w-5" />
        </Button>
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

        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="text-xs">
            Difficulty: {getDifficultyText(recipe.difficulty)}
          </Badge>
          <Button
            size="sm"
            variant="default"
            className="rounded-full"
            onClick={handleQuickAdd}
            disabled={addToBasket.isPending}
            data-testid={`button-quick-add-${recipe.id}`}
          >
            <ShoppingBasket className="h-4 w-4 mr-1" />
            {addToBasket.isPending ? "Adding..." : "Add"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
