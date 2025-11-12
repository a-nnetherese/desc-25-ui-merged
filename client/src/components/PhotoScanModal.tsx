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
import { compressImage } from "@/lib/imageCompression";

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
    setIsProcessing(true);
    setStep("processing");

    try {
      // Compress and convert image to base64
      const base64Image = await compressImage(file, 1920, 1920, 0.85);
      
      // Call our backend API which uses improved OCR
      const response = await fetch("/api/analyze-grocery-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      const result = await response.json();
      const items = result.items || [];

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
    } catch (error) {
      console.error("OCR processing error:", error);
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
