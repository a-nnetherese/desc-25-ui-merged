import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { RecipeCard } from "@/components/recipe-card";
import { RecipeModal } from "@/components/recipe-modal";
import type { Recipe } from "@shared/schema";

export default function CategoryRecipes() {
  const [, params] = useRoute("/category/:category");
  const category = params?.category || "breakfast";
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Scroll to top when the page loads or category changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [category]);

  const { data: recipes = [], isLoading } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes"],
  });

  const categoryRecipes = recipes.filter((r) => r.category === category);

  const getCategoryTitle = (cat: string) => {
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading recipes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8">
          <Link href="/">
            <Button
              variant="ghost"
              className="mb-4 hover-elevate"
              data-testid="button-back-to-home"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {getCategoryTitle(category)} Recipes
          </h1>
          <p className="text-muted-foreground">
            Browse all {categoryRecipes.length} recipes in this category
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => setSelectedRecipe(recipe)}
            />
          ))}
        </div>

        {categoryRecipes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No recipes found in this category.
            </p>
          </div>
        )}
      </div>

      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          isOpen={!!selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
}
