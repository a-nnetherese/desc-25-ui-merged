import { Checkbox } from "@/components/ui/checkbox";
import { type GroceryItem } from "@shared/schema";

interface GroceryListItemProps {
  item: GroceryItem;
  onToggle: (id: string) => void;
}

export function GroceryListItem({ item, onToggle }: GroceryListItemProps) {
  return (
    <div 
      data-testid={`item-${item.id}`}
      className="bg-white rounded-xl border-2 border-green-dark p-4 flex items-center justify-between gap-4 hover-elevate"
    >
      <div className="flex items-center gap-4 flex-1">
        <Checkbox
          data-testid={`checkbox-${item.id}`}
          onCheckedChange={() => onToggle(item.id)}
          className="h-6 w-6 border-2 border-green-dark data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <span data-testid={`text-item-name-${item.id}`} className="text-lg font-medium text-green-dark">
          {item.name}
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">|</span>
        <span data-testid={`text-item-quantity-${item.id}`} className="text-lg font-semibold text-green-dark">
          x{item.quantity}
        </span>
      </div>
    </div>
  );
}
