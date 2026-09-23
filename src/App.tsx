import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RISEContextProvider } from "@/contexts/RISEContext";
import LockScreen from "@/components/LockScreen";
import ModeSelector from "./pages/ModeSelector.tsx";
import JarvisUI from "./pages/JarvisUI.tsx";
import RiseDashboard from "./pages/RiseDashboard.tsx";
import Index from "./pages/Index.tsx";

const queryClient = new QueryClient();

const AppContent = () => {
  const [mode, setMode] = useState<"jarvis" | "rise" | null>(null);
  const [isLocked, setIsLocked] = useState(true);

  useEffect(() => {
    const savedMode = localStorage.getItem("appMode");
    if (savedMode === "jarvis" || savedMode === "rise") {
      setMode(savedMode);
    }
  }, []);

  const handleModeSelect = (selectedMode: "jarvis" | "rise") => {
    localStorage.setItem("appMode", selectedMode);
    setMode(selectedMode);
  };

  if (isLocked) return <LockScreen onUnlock={() => setIsLocked(false)} />;
  if (!mode) return <ModeSelector onModeSelect={handleModeSelect} />;
  if (mode === "jarvis") return <JarvisUI currentMode={mode} onSwitchMode={handleModeSelect} />;
  return <RiseDashboard currentMode={mode} onSwitchMode={handleModeSelect} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RISEContextProvider>
        <AppContent />
      </RISEContextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
