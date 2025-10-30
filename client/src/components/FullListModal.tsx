import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GroceryListItem } from "./GroceryListItem";
import { type GroceryItem } from "@shared/schema";

interface FullListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: GroceryItem[];
  onToggleItem: (id: string) => void;
  onDeleteItem?: (id: string) => void;
  onAddNew: () => void;
}

export function FullListModal({ open, onOpenChange, items, onToggleItem, onDeleteItem, onAddNew }: FullListModalProps) {
  const sortedItems = [...items].sort((a, b) => a.category.localeCompare(b.category));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-2 border-green-dark rounded-2xl max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-8 py-6 border-b-2 border-green-dark flex flex-row items-center justify-between">
          <DialogTitle className="text-3xl font-bold text-green-dark">
            Your Grocery List
          </DialogTitle>
          <Button
            data-testid="button-add-new-full-list"
            onClick={onAddNew}
            size="icon"
            className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {sortedItems.length === 0 ? (
            <div className="text-center py-12">
              <p data-testid="text-empty-list" className="text-lg text-muted-foreground">
                Your grocery list is empty. Add items using Scan or Self Input!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedItems.map((item) => (
                <GroceryListItem
                  key={item.id}
                  item={item}
                  onToggle={onToggleItem}
                  onDelete={onDeleteItem}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
