import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import AnkiBody from "@/pages/AnkiBody";
import ChatPage from "@/pages/ChatPage";
import AdminPage from "@/pages/AdminPage";
import RedistributionPage from "@/pages/RedistributionPage";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { GlobalTones } from "./lib/audioUtilities";

function Router() {
  return (
    <Switch>
      {/* Add pages below */}
      <Route path="/" component={AnkiBody} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/redistribution" component={RedistributionPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize audio system 
  useEffect(() => {
    // Initialize the global audio context and load saved settings
    const initAudio = async () => {
      await GlobalTones.initialize();
      
      // Load saved tone settings from localStorage
      GlobalTones.loadSettings();
    };
    
    initAudio();
    
    // Cleanup on unmount - pause all tones
    return () => {
      GlobalTones.pauseAllTones();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
