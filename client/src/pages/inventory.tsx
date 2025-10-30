import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, AlertCircle, Scan } from "lucide-react";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";
import { format, differenceInDays } from "date-fns";
import { AddInventoryModal } from "@/components/add-inventory-modal";
import type { InventoryItem } from "@shared/schema";

type ExpiryResult =
  | { status: "none"; days: 0 }
  | { status: "expired" | "urgent" | "soon" | "fresh"; days: number };

/**
 * Accepts a string ISO date, a Date, or null, and returns a normalized status.
 */
const getExpiryStatus = (expiryDate: string | Date | null): ExpiryResult => {
  if (!expiryDate) return { status: "none", days: 0 };

  // normalize to a Date object
  const d: Date = typeof expiryDate === "string" ? new Date(expiryDate) : expiryDate;

  // handle invalid date input
  if (isNaN(d.getTime())) return { status: "none", days: 0 };

  const days = differenceInDays(d, new Date());

  if (days < 0) return { status: "expired", days };
  if (days <= 3) return { status: "urgent", days };
  if (days <= 7) return { status: "soon", days };
  return { status: "fresh", days };
};

export default function Inventory() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: inventoryItems = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  const sortedItems = [...inventoryItems].sort((a, b) => {
    const statusA = getExpiryStatus(a.expiryDate);
    const statusB = getExpiryStatus(b.expiryDate);
    
    const priority = { expired: 0, urgent: 1, soon: 2, fresh: 3, none: 4 };
    return priority[statusA.status as keyof typeof priority] - priority[statusB.status as keyof typeof priority];
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4 -ml-4" data-testid="button-back">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Recipes
            </Button>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Inventory</h1>
              <p className="text-muted-foreground">
                {inventoryItems.length} items in stock
              </p>
            </div>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              data-testid="button-scan-item"
            >
              <Scan className="mr-2 h-4 w-4" />
              Scan Item
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-card rounded-lg animate-pulse" />
            ))}
          </div>
        ) : inventoryItems.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No items tracked</h3>
            <p className="text-muted-foreground mb-6">
              Start scanning your groceries to track expiration dates
            </p>
            <Button onClick={() => setIsAddModalOpen(true)} data-testid="button-scan-first">
              <Scan className="mr-2 h-4 w-4" />
              Scan Your First Item
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedItems.map((item) => {
              const expiry = getExpiryStatus(item.expiryDate);
              
              return (
                <Card
                  key={item.id}
                  className="p-5 hover-elevate transition-all"
                  data-testid={`card-inventory-${item.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        Quantity: {item.quantity}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          Purchased: {format(new Date(item.purchaseDate), "MMM d, yyyy")}
                        </span>
                        {item.expiryDate && (
                          <span>
                            Expires: {format(new Date(item.expiryDate), "MMM d, yyyy")}
                          </span>
                        )}
                      </div>
                    </div>

                    {expiry.status !== "none" && (
                      <div>
                        {expiry.status === "expired" && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Expired
                          </Badge>
                        )}
                        {expiry.status === "urgent" && (
                          <Badge className="gap-1 bg-orange-500 hover:bg-orange-600">
                            <AlertCircle className="h-3 w-3" />
                            {expiry.days} day{expiry.days !== 1 ? "s" : ""} left
                          </Badge>
                        )}
                        {expiry.status === "soon" && (
                          <Badge className="gap-1 bg-yellow-500 hover:bg-yellow-600 text-foreground">
                            {expiry.days} days left
                          </Badge>
                        )}
                        {expiry.status === "fresh" && (
                          <Badge variant="secondary" className="gap-1">
                            Fresh
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <AddInventoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}