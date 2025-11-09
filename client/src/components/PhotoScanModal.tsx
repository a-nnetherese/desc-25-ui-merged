import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PhotoScanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemsDetected: (items: Array<{ name: string; category: string; quantity: string }>) => void;
}

export function PhotoScanModal({ open, onOpenChange, onItemsDetected }: PhotoScanModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"choose" | "processing">("choose");

  const processImage = async (file: File) => {
    const apiKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY;
    if (!apiKey) {
      toast({
        title: "Configuration Error",
        description: "Google Vision API key is not configured. Please contact the administrator.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setStep("processing");

    try {
      // Convert image to base64
      const base64Image = await fileToBase64(file);
      const imageContent = base64Image.split(',')[1]; // Remove data:image/...;base64, prefix

      // Call Google Cloud Vision API
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requests: [
              {
                image: {
                  content: imageContent,
                },
                features: [
                  {
                    type: "DOCUMENT_TEXT_DETECTION",
                    maxResults: 1,
                  },
                ],
              },
            ],
          }),
        }
      );

      const result = await response.json();

      if (result.responses && result.responses[0]) {
        const textAnnotations = result.responses[0].textAnnotations;
        const fullTextAnnotation = result.responses[0].fullTextAnnotation;

        if (fullTextAnnotation && fullTextAnnotation.text) {
          const extractedText = fullTextAnnotation.text;
          const items = parseGroceryItems(extractedText);

          if (items.length === 0) {
            toast({
              title: "No items found",
              description: "We couldn't identify any grocery items in the image. Try a clearer photo.",
              variant: "destructive",
            });
          } else {
            onItemsDetected(items);
            toast({
              title: "Items detected!",
              description: `Found ${items.length} item${items.length > 1 ? 's' : ''} in the image.`,
            });
            onOpenChange(false);
          }
        } else {
          throw new Error("No text detected in image");
        }
      } else {
        throw new Error("Vision API error");
      }
    } catch (error) {
      console.error("Vision API error:", error);
      toast({
        title: "Scanning failed",
        description: "Unable to process the image. Please try again with a clearer photo.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setStep("choose");
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const parseGroceryItems = (text: string): Array<{ name: string; category: string; quantity: string }> => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const items: Array<{ name: string; category: string; quantity: string }> = [];

    const validCategories = ["Fruit", "Vegetable", "Meat", "Seafood", "Dairy", "Processed", "Grain"] as const;

    const categoryKeywords: Record<string, string[]> = {
      Fruit: ["apple", "apples", "banana", "bananas", "orange", "oranges", "grape", "grapes", "strawberry", "strawberries", "berry", "berries", "mango", "mangos", "pineapple", "watermelon", "lemon", "lemons", "lime", "limes", "peach", "peaches", "pear", "pears", "cherry", "cherries", "blueberry", "blueberries", "kiwi", "avocado"],
      Vegetable: ["carrot", "carrots", "tomato", "tomatoes", "lettuce", "cucumber", "cucumbers", "onion", "onions", "garlic", "potato", "potatoes", "cabbage", "spinach", "broccoli", "pepper", "peppers", "celery", "corn", "peas", "beans", "zucchini", "eggplant", "mushroom", "mushrooms"],
      Meat: ["chicken", "beef", "pork", "bacon", "ham", "sausage", "steak", "turkey", "lamb", "ground", "breast", "thigh", "wing", "ribs"],
      Seafood: ["fish", "salmon", "tuna", "shrimp", "crab", "lobster", "tilapia", "cod", "seafood", "prawn", "prawns"],
      Dairy: ["milk", "cheese", "butter", "yogurt", "yoghurt", "cream", "egg", "eggs", "dairy", "cheddar", "mozzarella"],
      Grain: ["rice", "bread", "pasta", "flour", "oats", "cereal", "wheat", "tortilla", "bagel", "roll", "noodle", "noodles", "quinoa"],
      Processed: ["chips", "chip", "cookie", "cookies", "candy", "soda", "pop", "sauce", "oil", "vinegar", "salt", "sugar", "ketchup", "mustard", "mayo", "mayonnaise", "dressing", "soy sauce", "pepper"],
    };

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Skip non-item lines
      if (
        lowerLine.includes("total") ||
        lowerLine.includes("subtotal") ||
        lowerLine.includes("tax") ||
        lowerLine.includes("receipt") ||
        lowerLine.includes("thank") ||
        lowerLine.includes("change") ||
        lowerLine.includes("payment") ||
        lowerLine.includes("card") ||
        lowerLine.match(/^\d+\/\d+\/\d+/) ||
        lowerLine.match(/^\d+:\d+/) ||
        lowerLine.match(/^\$?\d+\.?\d*$/) ||
        lowerLine.match(/^balance/i) ||
        line.length < 2
      ) {
        continue;
      }

      // Extract quantity
      const quantityMatch = line.match(/(?:^|\s)(\d+)\s*(?:x|qty)?(?:\s|$)/i) || 
                           line.match(/(?:x|qty)\s*(\d+)/i);
      const quantity = quantityMatch ? quantityMatch[1] : "1";

      // Clean item name
      let itemName = line
        .replace(/^\d+\s*x?\s*/i, "")
        .replace(/\s*x?\d+\s*$/i, "")
        .replace(/\$?\d+\.?\d*\s*$/g, "")
        .replace(/\$\d+\.?\d*/g, "")
        .replace(/[^a-zA-Z\s'-]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      if (itemName.length < 2) continue;

      // Determine category
      let category: string = "Processed";
      for (const [cat, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => lowerLine.includes(keyword))) {
          category = cat;
          break;
        }
      }

      if (!validCategories.includes(category as any)) {
        category = "Processed";
      }

      items.push({
        name: itemName.charAt(0).toUpperCase() + itemName.slice(1),
        category,
        quantity,
      });
    }

    return items;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        processImage(file);
      } else {
        toast({
          title: "Invalid file",
          description: "Please select an image file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleTakePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("capture", "environment");
      fileInputRef.current.click();
    }
  };

  const handleUploadPhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute("capture");
      fileInputRef.current.click();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {step === "choose" ? "Scan Receipt or List" : "Processing Image..."}
          </DialogTitle>
        </DialogHeader>

        {step === "choose" && !isProcessing && (
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground">
              Take a photo or upload an image of your grocery receipt or shopping list
            </p>
            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                onClick={handleTakePhoto}
                className="w-full rounded-full"
                data-testid="button-take-photo"
              >
                <Camera className="mr-2 h-5 w-5" />
                Take Photo
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleUploadPhoto}
                className="w-full rounded-full"
                data-testid="button-upload-photo"
              >
                <Upload className="mr-2 h-5 w-5" />
                Upload Photo
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
              data-testid="input-file-upload"
            />
          </div>
        )}

        {(step === "processing" || isProcessing) && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Scanning image...</p>
            <p className="text-sm text-muted-foreground text-center">
              Using Google Vision AI to extract grocery items
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
