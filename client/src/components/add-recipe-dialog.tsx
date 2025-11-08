import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AddRecipeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: string;
}

export function AddRecipeDialog({ isOpen, onClose, defaultCategory }: AddRecipeDialogProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(defaultCategory || "breakfast");
  const [description, setDescription] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [servings, setServings] = useState("");
  const [difficulty, setDifficulty] = useState("2");
  const [imageUrl, setImageUrl] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [instructions, setInstructions] = useState<string[]>([""]);
  
  const { toast } = useToast();

  // Sync category with defaultCategory prop
  useEffect(() => {
    if (defaultCategory) {
      setCategory(defaultCategory);
    }
  }, [defaultCategory]);

  const createRecipe = useMutation({
    mutationFn: async () => {
      const filteredIngredients = ingredients.filter(i => i.trim() !== "");
      const filteredInstructions = instructions.filter(i => i.trim() !== "");

      if (!name || !description || !prepTime || !servings || filteredIngredients.length === 0 || filteredInstructions.length === 0) {
        throw new Error("Please fill in all required fields");
      }

      return apiRequest("POST", "/api/recipes", {
        name: name.trim(),
        category,
        description: description.trim(),
        difficulty: parseInt(difficulty),
        prepTime: parseInt(prepTime),
        servings: parseInt(servings),
        imageUrl: imageUrl.trim() || "https://via.placeholder.com/400x400?text=Recipe",
        ingredients: filteredIngredients,
        instructions: filteredInstructions,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      toast({
        title: "Recipe created!",
        description: `${name} has been added to your recipes.`,
      });
      resetForm();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create recipe",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrepTime("");
    setServings("");
    setDifficulty("2");
    setImageUrl("");
    setIngredients([""]);
    setInstructions([""]);
    // Don't reset category here since it should keep the defaultCategory value set by useEffect
  };

  const addIngredient = () => setIngredients([...ingredients, ""]);
  const removeIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients.length > 0 ? newIngredients : [""]);
  };
  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addInstruction = () => setInstructions([...instructions, ""]);
  const removeInstruction = (index: number) => {
    const newInstructions = instructions.filter((_, i) => i !== index);
    setInstructions(newInstructions.length > 0 ? newInstructions : [""]);
  };
  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add Custom Recipe</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="recipe-name" data-testid="label-recipe-name">Recipe Name</Label>
            <Input
              id="recipe-name"
              placeholder="Enter recipe name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-recipe-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" data-testid="label-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" data-testid="select-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snacks">Snacks</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" data-testid="label-description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter recipe description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-20"
              data-testid="input-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prep-time" data-testid="label-prep-time">Prep Time (minutes)</Label>
              <Input
                id="prep-time"
                type="number"
                placeholder="30"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                data-testid="input-prep-time"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="servings" data-testid="label-servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                placeholder="4"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                data-testid="input-servings"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty" data-testid="label-difficulty">Difficulty (1-5)</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger id="difficulty" data-testid="select-difficulty">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Very Easy</SelectItem>
                <SelectItem value="2">2 - Easy</SelectItem>
                <SelectItem value="3">3 - Medium</SelectItem>
                <SelectItem value="4">4 - Hard</SelectItem>
                <SelectItem value="5">5 - Very Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image-url" data-testid="label-image-url">Image URL (optional)</Label>
            <Input
              id="image-url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              data-testid="input-image-url"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label data-testid="label-ingredients">Ingredients</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addIngredient}
                data-testid="button-add-ingredient"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="e.g., 2 cups flour"
                    value={ingredient}
                    onChange={(e) => updateIngredient(index, e.target.value)}
                    data-testid={`input-ingredient-${index}`}
                  />
                  {ingredients.length > 1 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeIngredient(index)}
                      data-testid={`button-remove-ingredient-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label data-testid="label-instructions">Instructions</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addInstruction}
                data-testid="button-add-instruction"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2">
                  <Textarea
                    placeholder={`Step ${index + 1}`}
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    className="min-h-16"
                    data-testid={`input-instruction-${index}`}
                  />
                  {instructions.length > 1 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeInstruction(index)}
                      data-testid={`button-remove-instruction-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onClose();
            }}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={() => createRecipe.mutate()}
            disabled={createRecipe.isPending}
            data-testid="button-submit"
          >
            {createRecipe.isPending ? "Creating..." : "Create Recipe"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
