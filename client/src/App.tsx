import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MobileViewProvider } from "@/contexts/MobileViewContext";
import { MobileViewToggle } from "@/components/MobileViewToggle";
import Home from "@/pages/home";
import GroceryList from "@/pages/grocery-list";
import Inventory from "@/pages/inventory";
import CategoryRecipes from "@/pages/category-recipes";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/grocery-list" component={GroceryList} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/category/:category" component={CategoryRecipes} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MobileViewProvider>
          <div className="min-h-screen">
            <div className="fixed top-4 right-4 z-50">
              <MobileViewToggle />
            </div>
            <Toaster />
            <Router />
          </div>
        </MobileViewProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
