import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useEffect, useRef } from "react";
import { useChatStore } from "@/store/useChatStore";

const queryClient = new QueryClient();

const AppContent = () => {
  const loadFromFirebase = useChatStore((s) => s.loadFromFirebase);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Load conversations and messages from Firebase only once on app initialization
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      loadFromFirebase();
    }
  }, []); // Empty dependency array - run only once

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
