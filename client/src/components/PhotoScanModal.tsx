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
    // Check for API key first
    const apiKey = import.meta.env.VITE_OCR_API_KEY;
    if (!apiKey) {
      toast({
        title: "Configuration Error",
        description: "OCR API key is not configured. Please contact the administrator.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setStep("processing");

    try {
      // Create FormData for OCR.space API
      const formData = new FormData();
      formData.append("file", file);
      formData.append("apikey", apiKey);
      formData.append("language", "eng");
      formData.append("isOverlayRequired", "false");

      const response = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.ParsedResults && result.ParsedResults[0]) {
        const extractedText = result.ParsedResults[0].ParsedText;
        
        // Parse the extracted text to identify grocery items
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
    } catch (error) {
      console.error("OCR error:", error);
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

  const parseGroceryItems = (text: string): Array<{ name: string; category: string; quantity: string }> => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const items: Array<{ name: string; category: string; quantity: string }> = [];

    // Valid schema categories - MUST match exactly
    const validCategories = ["Fruit", "Vegetable", "Meat", "Seafood", "Dairy", "Processed", "Grain"] as const;

    const categoryKeywords: Record<string, string[]> = {
      Fruit: ["apple", "banana", "orange", "grape", "strawberry", "mango", "pineapple", "watermelon", "lemon", "lime", "peach", "pear"],
      Vegetable: ["carrot", "tomato", "lettuce", "cucumber", "onion", "garlic", "potato", "cabbage", "spinach", "broccoli", "pepper", "celery"],
      Meat: ["chicken", "beef", "pork", "bacon", "ham", "sausage", "steak", "turkey", "lamb"],
      Seafood: ["fish", "salmon", "tuna", "shrimp", "crab", "lobster", "tilapia"],
      Dairy: ["milk", "cheese", "butter", "yogurt", "cream", "egg"],
      Grain: ["rice", "bread", "pasta", "flour", "oats", "cereal", "wheat"],
      Processed: ["chips", "cookie", "candy", "soda", "sauce", "oil", "vinegar", "salt", "sugar", "ketchup"],
    };

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Skip lines that are likely headers, totals, or metadata
      if (
        lowerLine.includes("total") ||
        lowerLine.includes("tax") ||
        lowerLine.includes("receipt") ||
        lowerLine.includes("thank") ||
        lowerLine.match(/^\d+\/\d+\/\d+/) || // dates
        lowerLine.match(/^\$?\d+\.?\d*$/) || // just prices
        line.length < 3
      ) {
        continue;
      }

      // Try to extract quantity
      const quantityMatch = line.match(/(\d+)\s*x?\s/i);
      const quantity = quantityMatch ? quantityMatch[1] : "1";

      // Clean the item name (remove prices, quantities, etc.)
      let itemName = line
        .replace(/^\d+\s*x?\s*/i, "") // remove leading quantities
        .replace(/\$?\d+\.?\d*\s*$/g, "") // remove trailing prices
        .replace(/[^a-zA-Z\s]/g, "") // remove special characters
        .trim();

      if (itemName.length < 3) continue;

      // Determine category based on keywords - ALWAYS use a valid category
      let category: string = "Processed"; // safe default
      for (const [cat, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => lowerLine.includes(keyword))) {
          category = cat;
          break;
        }
      }

      // Ensure category is valid before adding
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
              Extracting grocery items from your photo
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
