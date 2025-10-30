import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { type GroceryItem } from "@shared/schema";

interface GroceryListItemProps {
  item: GroceryItem;
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function GroceryListItem({ item, onToggle, onDelete }: GroceryListItemProps) {
  return (
    <div 
      data-testid={`item-${item.id}`}
      className="bg-white rounded-xl border-2 border-green-dark p-4 flex items-center justify-between gap-4 hover-elevate"
    >
      <div className="flex items-center gap-4 flex-1">
        <Checkbox
          data-testid={`checkbox-${item.id}`}
          checked={item.checked === 1}
          onCheckedChange={() => onToggle(item.id)}
          className="h-6 w-6 border-2 border-green-dark data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <span data-testid={`text-item-name-${item.id}`} className={`text-lg font-medium ${item.checked === 1 ? 'line-through text-muted-foreground' : 'text-green-dark'}`}>
          {item.name}
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">|</span>
        <span data-testid={`text-item-quantity-${item.id}`} className="text-lg font-semibold text-green-dark">
          x{item.quantity}
        </span>
        {onDelete && (
          <Button
            data-testid={`button-delete-${item.id}`}
            variant="ghost"
            size="icon"
            onClick={() => onDelete(item.id)}
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
