import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, List, Grid3x3 } from "lucide-react";
import { GroceryListItem } from "./GroceryListItem";
import type { GroceryItem, GroceryCategory } from "@shared/schema";

interface FullListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: GroceryItem[];
  onToggleItem: (id: string) => void;
  onDeleteItem?: (id: string) => void;
  onAddNew: () => void;
}

type ViewMode = 'list' | 'category';

export function FullListModal({ open, onOpenChange, items, onToggleItem, onDeleteItem, onAddNew }: FullListModalProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  
  // Group items by category
  const itemsByCategory = items.reduce((acc, item) => {
    const category = item.category as GroceryCategory;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<GroceryCategory, GroceryItem[]>);

  const categories: GroceryCategory[] = ['Fruit', 'Vegetable', 'Meat', 'Seafood', 'Dairy', 'Processed', 'Grain'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-2 border-green-dark rounded-2xl max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-8 py-6 border-b-2 border-green-dark flex flex-row items-center justify-between gap-4">
          <DialogTitle className="text-3xl font-bold text-green-dark">
            Your Grocery List
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              data-testid="button-view-list"
              onClick={() => setViewMode('list')}
              size="icon"
              variant={viewMode === 'list' ? 'default' : 'outline'}
              className="h-10 w-10 rounded-full"
            >
              <List className="w-5 h-5" />
            </Button>
            <Button
              data-testid="button-view-category"
              onClick={() => setViewMode('category')}
              size="icon"
              variant={viewMode === 'category' ? 'default' : 'outline'}
              className="h-10 w-10 rounded-full"
            >
              <Grid3x3 className="w-5 h-5" />
            </Button>
            <Button
              data-testid="button-add-new-full-list"
              onClick={onAddNew}
              size="icon"
              className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p data-testid="text-empty-list" className="text-lg text-muted-foreground">
                Your grocery list is empty. Add items using Scan or Self Input!
              </p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-3">
              {items.map((item) => (
                <GroceryListItem
                  key={item.id}
                  item={item}
                  onToggle={onToggleItem}
                  onDelete={onDeleteItem}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {categories.map((category) => {
                const categoryItems = itemsByCategory[category] || [];
                if (categoryItems.length === 0) return null;
                
                return (
                  <div key={category} data-testid={`category-group-${category.toLowerCase()}`}>
                    <h3 className="text-xl font-bold text-green-dark mb-3 flex items-center gap-2">
                      <span className="bg-primary/10 px-3 py-1 rounded-full text-primary">
                        {category}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({categoryItems.length})
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {categoryItems.map((item) => (
                        <GroceryListItem
                          key={item.id}
                          item={item}
                          onToggle={onToggleItem}
                          onDelete={onDeleteItem}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
