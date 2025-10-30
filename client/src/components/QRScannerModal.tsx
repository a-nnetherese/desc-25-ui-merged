import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Html5Qrcode } from "html5-qrcode";
import { useToast } from "@/hooks/use-toast";

interface QRScannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (data: string) => void;
}

export function QRScannerModal({ open, onOpenChange, onScan }: QRScannerModalProps) {
  const { toast } = useToast();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (open && !isScanning) {
      startScanner();
    }

    return () => {
      if (scannerRef.current && isScanning) {
        stopScanner();
      }
    };
  }, [open]);

  const startScanner = async () => {
    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanner();
          onOpenChange(false);
        },
        (errorMessage) => {
          // Ignore error messages during scanning
        }
      );

      setIsScanning(true);
    } catch (err) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
      onOpenChange(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && isScanning) {
      stopScanner();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-white border-2 border-primary rounded-2xl max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-8 py-6 border-b-2 border-primary bg-gradient-to-r from-pink-50 to-pink-100">
          <DialogTitle className="text-3xl font-bold text-primary">
            Scan QR Code
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-8">
          <div 
            id="qr-reader" 
            data-testid="qr-scanner"
            className="rounded-xl overflow-hidden border-2 border-green-dark"
          />
          <p className="text-center text-sm text-muted-foreground mt-4">
            Position the QR code within the frame to scan
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
