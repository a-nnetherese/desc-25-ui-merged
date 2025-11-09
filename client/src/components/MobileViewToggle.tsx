import { Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMobileView } from "@/contexts/MobileViewContext";

export function MobileViewToggle() {
  const { isMobileView, toggleMobileView } = useMobileView();

  return (
    <Button
      onClick={toggleMobileView}
      variant="outline"
      size="icon"
      className="rounded-full"
      data-testid="button-mobile-view-toggle"
      aria-label={isMobileView ? "Switch to desktop view" : "Switch to mobile view"}
    >
      {isMobileView ? (
        <Monitor className="h-5 w-5" />
      ) : (
        <Smartphone className="h-5 w-5" />
      )}
    </Button>
  );
}
