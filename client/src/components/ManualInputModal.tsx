import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Minus, Plus, Edit } from "lucide-react";
import { groceryCategories, type GroceryCategory } from "@shared/schema";

interface ManualInputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string, category: GroceryCategory, quantity: number) => void;
}

export function ManualInputModal({ open, onOpenChange, onAdd }: ManualInputModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<GroceryCategory | "">("");
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    if (name && category) {
      onAdd(name, category, quantity);
      setName("");
      setCategory("");
      setQuantity(1);
      onOpenChange(false);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-2 border-primary rounded-2xl max-w-2xl p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-pink-50 to-pink-100 px-8 py-6 border-b-2 border-primary">
          <DialogTitle className="text-4xl font-bold text-primary">
            Add Manually
          </DialogTitle>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-2xl font-semibold text-green-dark mb-2 flex items-center gap-2">
                Input Name of Ingredient:
                <Edit className="w-6 h-6 text-green-dark" />
              </label>
              <Input
                data-testid="input-ingredient-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter ingredient name"
                className="text-lg h-14 border-2 border-green-dark/30 focus:border-primary"
              />
            </div>
            
            <div className="flex items-center gap-2 mt-8">
              <Button
                data-testid="button-decrease-quantity"
                type="button"
                variant="outline"
                size="icon"
                onClick={decreaseQuantity}
                className="h-14 w-14 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Minus className="w-6 h-6" />
              </Button>
              <div className="w-20 text-center">
                <span data-testid="text-quantity" className="text-4xl font-bold text-primary">{quantity}</span>
              </div>
              <Button
                data-testid="button-increase-quantity"
                type="button"
                variant="outline"
                size="icon"
                onClick={increaseQuantity}
                className="h-14 w-14 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Plus className="w-6 h-6" />
              </Button>
            </div>
          </div>

          <div>
            <label className="text-lg font-medium text-green-dark mb-2 block">
              Category:
            </label>
            <Select value={category} onValueChange={(value) => setCategory(value as GroceryCategory)}>
              <SelectTrigger 
                data-testid="select-category"
                className="h-14 text-lg border-2 border-green-dark/30 focus:border-primary bg-white"
              >
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {groceryCategories.map((cat) => (
                  <SelectItem 
                    key={cat} 
                    value={cat}
                    data-testid={`option-category-${cat.toLowerCase()}`}
                    className="text-lg py-3"
                  >
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            data-testid="button-add-item"
            onClick={handleAdd}
            disabled={!name || !category}
            className="w-full h-14 text-xl font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl"
          >
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
