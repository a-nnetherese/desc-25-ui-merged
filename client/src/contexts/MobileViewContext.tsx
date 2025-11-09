import { createContext, useContext, useState, useEffect } from "react";

interface MobileViewContextType {
  isMobileView: boolean;
  setIsMobileView: (value: boolean) => void;
  toggleMobileView: () => void;
}

const MobileViewContext = createContext<MobileViewContextType | undefined>(undefined);

export function MobileViewProvider({ children }: { children: React.ReactNode }) {
  const [isMobileView, setIsMobileView] = useState(() => {
    const saved = localStorage.getItem('mobileView');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('mobileView', JSON.stringify(isMobileView));
    
    // Apply mobile view class to body
    if (isMobileView) {
      document.documentElement.classList.add('mobile-view');
    } else {
      document.documentElement.classList.remove('mobile-view');
    }
  }, [isMobileView]);

  const toggleMobileView = () => setIsMobileView(!isMobileView);

  return (
    <MobileViewContext.Provider value={{ isMobileView, setIsMobileView, toggleMobileView }}>
      {children}
    </MobileViewContext.Provider>
  );
}

export function useMobileView() {
  const context = useContext(MobileViewContext);
  if (context === undefined) {
    throw new Error('useMobileView must be used within a MobileViewProvider');
  }
  return context;
}
