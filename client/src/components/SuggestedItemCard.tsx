import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { type GroceryCategory } from "@shared/schema";

interface SuggestedItemCardProps {
  name: string;
  category: GroceryCategory;
  onAdd: (name: string, category: GroceryCategory, quantity: number) => void;
}

export function SuggestedItemCard({ name, category, onAdd }: SuggestedItemCardProps) {
  const [quantity, setQuantity] = useState(1);

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleAdd = () => {
    onAdd(name, category, quantity);
    setQuantity(1);
  };

  return (
    <div 
      data-testid={`card-suggested-${name.toLowerCase().replace(/\s+/g, '-')}`}
      className="bg-pink-50 rounded-2xl border-2 border-pink-200 p-4 flex flex-col gap-3 hover-elevate"
    >
      <div className="flex-1">
        <h3 data-testid={`text-suggested-name-${name.toLowerCase().replace(/\s+/g, '-')}`} className="text-lg font-bold text-primary mb-1">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground">{category}</p>
      </div>
      
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button
            data-testid={`button-decrease-suggested-${name.toLowerCase().replace(/\s+/g, '-')}`}
            type="button"
            variant="outline"
            size="icon"
            onClick={decreaseQuantity}
            className="h-8 w-8 rounded-md border border-muted-foreground/30"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <div className="w-12 text-center">
            <span data-testid={`text-suggested-quantity-${name.toLowerCase().replace(/\s+/g, '-')}`} className="text-lg font-semibold">
              {quantity}
            </span>
          </div>
          <Button
            data-testid={`button-increase-suggested-${name.toLowerCase().replace(/\s+/g, '-')}`}
            type="button"
            variant="outline"
            size="icon"
            onClick={increaseQuantity}
            className="h-8 w-8 rounded-md border border-muted-foreground/30"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <Button
          data-testid={`button-add-suggested-${name.toLowerCase().replace(/\s+/g, '-')}`}
          onClick={handleAdd}
          size="icon"
          className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
