import { useState, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import cartImage from "/Users/theresedeang/Downloads/shopping cart.png";
import { Link } from "wouter";
import { RecipeCard } from "@/components/recipe-card";
import { RecipeModal } from "@/components/recipe-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Recipe } from "@shared/schema";

export default function Home() {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const breakfastRef = useRef<HTMLDivElement>(null);

  const { data: recipes = [], isLoading } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes"],
  });

  // ======= ADD THIS BLOCK (paste once directly after the useQuery above) =======
  // chunk helper
  const chunkArray = (arr: any[], size: number) =>
    Array.from({ length: Math.max(1, Math.ceil(arr.length / size)) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    );

  // derive recipe groups by category (declare once)
  const breakfastRecipes = useMemo(() => recipes.filter((r) => r.category === "breakfast"), [recipes]);
  const lunchRecipes     = useMemo(() => recipes.filter((r) => r.category === "lunch"), [recipes]);
  const dinnerRecipes    = useMemo(() => recipes.filter((r) => r.category === "dinner"), [recipes]);

  // pagination state for each meal
  const [breakfastPage, setBreakfastPage] = useState(0);
  const [lunchPage, setLunchPage]         = useState(0);
  const [dinnerPage, setDinnerPage]       = useState(0);

  // chunk into pages of 3
  const breakfastChunks = useMemo(() => chunkArray(breakfastRecipes, 3), [breakfastRecipes]);
  const lunchChunks     = useMemo(() => chunkArray(lunchRecipes, 3), [lunchRecipes]);
  const dinnerChunks    = useMemo(() => chunkArray(dinnerRecipes, 3), [dinnerRecipes]);

  // visible slices to render (max 3 items)
  const visibleBreakfast = breakfastChunks[breakfastPage] || [];
  const visibleLunch     = lunchChunks[lunchPage] || [];
  const visibleDinner    = dinnerChunks[dinnerPage] || [];

  // no-arg handlers for buttons (TypeScript-friendly)
  const nextBreakfast = () => {
    if (breakfastChunks.length === 0) return;
    setBreakfastPage((p) => (p + 1) % breakfastChunks.length);
  };
  const nextLunch = () => {
    if (lunchChunks.length === 0) return;
    setLunchPage((p) => (p + 1) % lunchChunks.length);
  };
  const nextDinner = () => {
    if (dinnerChunks.length === 0) return;
    setDinnerPage((p) => (p + 1) % dinnerChunks.length);
  };
  // ========================================================================



  const scrollToBreakfast = () => {
    breakfastRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <div className="min-h-screen">
        {/* Theme Toggle - Fixed Top Right */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        {/* Hero Section */}
        <section className="relative bg-primary text-primary-foreground overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2),transparent_50%)]"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-32">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
                    Pantry<span className="text-secondary">Pal</span>
                  </h1>
                </div>
                
                <div>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                    Choose your next meal here
                  </h2>
                  <p className="text-lg md:text-xl opacity-90">
                    Add some recipes to your cart now!
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={scrollToBreakfast}
                    className="rounded-full px-8 text-base font-medium"
                    data-testid="button-browse-recipes"
                  >
                    Browse Recipes
                  </Button>
                  <Link href="/grocery-list">
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-full px-8 text-base font-medium bg-tertiary/100 border-tertiary/30 hover:bg-tertiary/20 backdrop-blur-sm w-full sm:w-auto"
                      data-testid="button-grocery-list"
                    >
                      See Current Grocery List
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="hidden md:flex items-center justify-center">
                <div className="relative">
                  <img
  src={cartImage}
  alt="Shopping cart"
  className="h-64 w-64 opacity-100 object-contain"
/>

                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg
              viewBox="0 0 1440 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full"
            >
              <path
                d="M0 120L60 105C120 90 240 60 360 52.5C480 45 600 60 720 67.5C840 75 960 75 1080 67.5C1200 60 1320 45 1380 37.5L1440 30V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
                fill="hsl(var(--background))"
              />
            </svg>
          </div>
        </section>

        {/* Recipe Sections */}
        <section className="max-w-7xl mx-auto px-6 py-16">
         {/* Breakfast */}
<div ref={breakfastRef} className="mb-20 scroll-mt-8">
  <div className="flex items-center justify-between mb-8">
    <h3 className="text-3xl md:text-4xl font-bold text-foreground">Breakfast</h3>
    <span className="text-sm text-muted-foreground">See all</span>
  </div>

  {isLoading ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-80 bg-card rounded-xl animate-pulse" />
      ))}
    </div>
  ) : (
    <div className="relative w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleBreakfast.length === 0 ? (
          <div className="col-span-3 text-center text-muted-foreground">
            No breakfast recipes yet.
          </div>
        ) : (
          visibleBreakfast.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => setSelectedRecipe(recipe)}
            />
          ))
        )}
      </div>

      {breakfastChunks.length > 1 && (
        <button
        onClick={nextBreakfast}
        aria-label="Next breakfast"
        className="absolute right-[-2rem] top-1/2 -translate-y-1/2 z-20 rounded-full bg-secondary text-secondary-foreground shadow-lg hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 p-3 transition"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      )}
    </div>
  )}
</div>


          {/* Lunch */}
<div className="mb-20">
  <div className="flex items-center justify-between mb-8">
    <h3 className="text-3xl md:text-4xl font-bold text-foreground">Lunch</h3>
    <span className="text-sm text-muted-foreground">See all</span>
  </div>

  {isLoading ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-80 bg-card rounded-xl animate-pulse" />
      ))}
    </div>
  ) : (
    <div className="relative w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleLunch.length === 0 ? (
          <div className="col-span-3 text-center text-muted-foreground">
            No lunch recipes yet.
          </div>
        ) : (
          visibleLunch.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => setSelectedRecipe(recipe)}
            />
          ))
        )}
      </div>

      {lunchChunks.length > 1 && (
         <button
        onClick={nextLunch}
        aria-label="Next breakfast"
        className="absolute right-[-2rem] top-1/2 -translate-y-1/2 z-20 rounded-full bg-secondary text-secondary-foreground shadow-lg hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 p-3 transition"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
      )}
    </div>
  )}
</div>


          {/* Dinner */}
<div className="mb-20">
  <div className="flex items-center justify-between mb-8">
    <h3 className="text-3xl md:text-4xl font-bold text-foreground">Dinner</h3>
    <span className="text-sm text-muted-foreground">See all</span>
  </div>

  {isLoading ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-80 bg-card rounded-xl animate-pulse" />
      ))}
    </div>
  ) : (
    <div className="relative w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleDinner.length === 0 ? (
          <div className="col-span-3 text-center text-muted-foreground">
            No dinner recipes yet.
          </div>
        ) : (
          visibleDinner.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => setSelectedRecipe(recipe)}
            />
          ))
        )}
      </div>

      {dinnerChunks.length > 1 && (
         <button
        onClick={nextDinner} // or nextLunch / nextDinner
        aria-label="Next breakfast"
        className="absolute right-[-2rem] top-1/2 -translate-y-1/2 z-20 rounded-full bg-secondary text-secondary-foreground shadow-lg hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 p-3 transition"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
      )}
    </div>
  )}
</div>

        </section>
      </div>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          isOpen={!!selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </>
  );
}
