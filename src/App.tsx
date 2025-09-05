
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { VibeDataProvider } from "@/contexts/VibeDataContext";
import { useState, useEffect } from "react";
import { SplashScreen } from "@/components/SplashScreen";
import Welcome from "./pages/Welcome";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Trending from "./pages/Trending";

import Services from "./pages/Services";
import Activity from "./pages/Activity";
import Account from "./pages/Account";
import Terms from "./pages/Terms";
import Pulse from "./pages/Pulse";

import Explore from "./pages/Explore";
import NotFound from "./pages/NotFound";
import { useTheme } from "./hooks/use-theme";
import Communities from "./pages/Communities";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Wait until component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }
  
  return <>{children}</>;
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const splashShown = sessionStorage.getItem('splash-shown');
    if (splashShown) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('splash-shown', 'true');
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <VibeDataProvider enableRealtime={true} defaultUpdateInterval={30000}>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                <div className="min-h-screen app-gradient-bg">
                  <Routes>
                    <Route path="/welcome" element={<Welcome />} />
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/settings" 
                      element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="/trending" element={<Trending />} />
                    
                    <Route path="/services" element={<Services />} />
                    <Route 
                      path="/activity" 
                      element={
                        <ProtectedRoute>
                          <Activity />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/account" 
                      element={
                        <ProtectedRoute>
                          <Account />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/pulse" element={<Pulse />} />
                    
                    <Route path="/explore" element={<Explore />} />
                    <Route 
                      path="/communities" 
                      element={
                        <ProtectedRoute>
                          <Communities />
                        </ProtectedRoute>
                      } 
                    />
                    {/* Legacy redirects */}
                    <Route path="/alerts" element={<Navigate to="/trending" replace />} />
                    <Route path="/notifications" element={<Navigate to="/trending" replace />} />
                    {/* Catch-all route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </BrowserRouter>
              </TooltipProvider>
            </VibeDataProvider>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
