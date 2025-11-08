import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Camera, Edit, ClipboardList } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GreenWaveBackground } from "@/components/GreenWaveBackground";
import { ManualInputModal } from "@/components/ManualInputModal";
import { FullListModal } from "@/components/FullListModal";
import { Link } from "wouter";
import { PhotoScanModal } from "@/components/PhotoScanModal";
import { GroceryListItem } from "@/components/GroceryListItem";
import { type GroceryItem, type GroceryCategory } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Clipboard3D from "@/assets/Clipboard.png";

export default function Home() {
  const { toast } = useToast();
  const [manualInputOpen, setManualInputOpen] = useState(false);
  const [fullListOpen, setFullListOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const { data: items = [], isLoading } = useQuery<GroceryItem[]>({
    queryKey: ["/api/grocery-list"],
  });

  const addItemMutation = useMutation({
    mutationFn: async (data: { name: string; category: GroceryCategory; quantity: string }) => {
      return await apiRequest("POST", "/api/grocery-list", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grocery-list"] });
      toast({
        title: "Item Added",
        description: "Your grocery item has been added to the list.",
      });
    },
  });

  const toggleItemMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("PATCH", `/api/grocery-list/${id}/toggle`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grocery-list"] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/grocery-list/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grocery-list"] });
      toast({
        title: "Item Deleted",
        description: "The item has been removed from your list.",
      });
    },
  });

  const handleAddItem = (name: string, category: GroceryCategory, quantity: number) => {
    addItemMutation.mutate({ name, category, quantity: quantity.toString() });
  };

  const handleToggleItem = (id: string) => {
    toggleItemMutation.mutate(id);
  };

  const handleDeleteItem = (id: string) => {
    deleteItemMutation.mutate(id);
  };

  const handleItemsDetected = (items: Array<{ name: string; category: string; quantity: string }>) => {
    items.forEach(item => {
      addItemMutation.mutate({
        name: item.name,
        category: item.category as GroceryCategory,
        quantity: item.quantity,
      });
    });
  };

  const displayItems = items.slice(0, 6);
  const hasItems = items.length > 0;

  return (
    <div className="min-h-screen bg-tertiary relative overflow-x-hidden pb-24">
      <GreenWaveBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="mb-12 flex items-center justify-center">
          <h1 className="text-5xl md:text-5xl font-bold mb-2 tracking-tight drop-shadow-sm flex items-center gap-2">
                    Pantry<span className="text-secondary">Pal</span>
                  </h1>
        </header>

        {/* Hero Section */}
        <div className="mb-16 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 md:gap-16">
          <div className="flex-1 max-w-lg">
            <h2 className="text-5xl sm:text-6xl font-bold text-green-900 mb-4 leading-tight">
              Let’s Track Your<br />Groceries
            </h2>
            <p className="text-xl font-regular sm:text-2xl text-green-700 mb-8">
              Track what you need the next time you go out for groceries
            </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              data-testid="button-see-current-pantry"
              onClick={() => setFullListOpen(true)}
              className="bg-secondary text-white px-8 text-1xl font-medium rounded-full transition duration-150 ease-in-out"
            >
              See Current Pantry
            </Button>

            <Link href="/">
              <Button
                size="lg"
                variant="secondary"
                className="rounded-full px-8 text-base font-medium bg-primary border-tertiary/30 hover:bg-tertiary/20 backdrop-blur-sm sm:w-auto"
                data-testid="button-grocery-list"
              >
                Back to home
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          </div>
          <div className="flex-shrink-0 flex items-center">
            <div className="relative">
              <img
                src={Clipboard3D}
                alt="Checklist illustration"
                className="h-64 w-64 opacity-100 object-contain"
                draggable={false}
              />
            </div>
          </div>
        </div>

        {/* Grocery List Section */}
        <div className="relative md:-mx-12 px-0 md:px-8 pb-12">
          <div className="absolute inset-0 top-8 w-full h-full z-0">
            <div className="w-full h-full bg-green-800 rounded-t-[48px] transform -skew-y-3" style={{minHeight: '480px'}} />
          </div>
          <div className="relative z-10 pt-10 px-4 md:px-16">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-4xl font-bold text-white tracking-tight drop-shadow mt-10">
                Track and Mark Your List
              </h3>
              <Button
                data-testid="button-see-all"
                onClick={() => setFullListOpen(true)}
                variant="ghost"
                className="text-white hover:text-pink-200/80 font-semibold text-lg underline underline-offset-2"
              >
                See all
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-8 w-full">
              {/* Action Buttons */}
              <div className="flex flex-row sm:flex-col gap-6 sm:gap-8 pt-1 min-w-max">
                <Button
                  data-testid="button-scan"
                  onClick={() => setScannerOpen(true)}
                  className="bg-secondary shadow-xl text-white w-28 h-28 sm:w-24 sm:h-24 rounded-2xl flex flex-col items-center justify-center gap-2 text-lg font-bold p-4 border-transparent border-2 focus:ring-4 focus:ring-pink-300"
                  style={{ boxShadow: '0 8px 28px -8px #e94279aa' }}
                >
                  <Camera className="w-10 h-10 mb-1" />
                  <span>Scan</span>
                </Button>
                <Button
                  data-testid="button-self-input"
                  onClick={() => setManualInputOpen(true)}
                  className="bg-secondary shadow-xl text-white w-28 h-28 sm:w-24 sm:h-24 rounded-2xl flex flex-col items-center justify-center gap-2 text-lg font-bold p-4 border-transparent border-2 focus:ring-4 focus:ring-pink-300"
                  style={{ boxShadow: '0 8px 28px -8px #e94279aa' }}
                >
                  <Edit className="w-10 h-10 mb-1" />
                  <span>Self Input</span>
                </Button>
              </div>
              {/* Grocery List Grid */}
              <div className="flex-1">
                {isLoading ? (
                  <div className="bg-white/80 rounded-3xl border-4 border-green-300/40 p-10 flex items-center justify-center min-h-[420px] shadow-lg">
                    <p className="text-green-700">Loading...</p>
                  </div>
                ) : !hasItems ? (
                  <div className="bg-white/80 rounded-3xl border-4 border-green-300/40 p-14 flex items-center justify-center min-h-[420px] shadow-lg">
                    <p data-testid="text-empty-message" className="text-xl text-green-600 font-semibold text-center">
                      Your grocery list is empty. Add items using Scan or Self Input!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[...Array(6)].map((_, index) => (
                      <div key={index}>
                        {displayItems[index] ? (
                          <div className="rounded-2xl bg-white border-2 border-green-200 shadow-lg px-6 py-4 flex items-center min-h-[72px]">
                            <GroceryListItem
                              item={displayItems[index]}
                              onToggle={handleToggleItem}
                              onDelete={handleDeleteItem}
                            />
                          </div>
                        ) : (
                          <div className="bg-transparent rounded-2xl border-2 border-dashed border-green-100 p-4 h-full min-h-[72px]" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ManualInputModal
        open={manualInputOpen}
        onOpenChange={setManualInputOpen}
        onAdd={handleAddItem}
      />
      
      <FullListModal
        open={fullListOpen}
        onOpenChange={setFullListOpen}
        items={items}
        onToggleItem={handleToggleItem}
        onDeleteItem={handleDeleteItem}
        onAddNew={() => {
          setFullListOpen(false);
          setManualInputOpen(true);
        }}
      />
      
      <PhotoScanModal
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onItemsDetected={handleItemsDetected}
      />
    </div>
  );
}
