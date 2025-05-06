
"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/auth/AuthProvider";
import { FadeIn } from "@/components/ui/design-system";
import MapTab from "@/components/tabs/MapTab";
import Banner from "@/components/Banner";
import { useIsMobile } from "@/hooks/use-mobile";
import TrendingVibesSection from "@/components/TrendingVibesSection";

const Index = () => {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Avoid hydration errors
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Banner at the top with no margin/padding */}
      <Banner />
      
      {/* Main Content with adjusted height */}
      <div className="flex flex-col flex-1 container max-w-7xl mx-auto px-2 py-2 md:h-[calc(100vh-130px)] overflow-hidden">
        <div className="flex flex-col md:flex-row gap-4 h-full">
          {/* Map */}
          <div className="flex-grow h-[60vh] md:h-full md:w-3/4">
            <FadeIn delay="200ms" className="h-full">
              <MapTab />
            </FadeIn>
          </div>
          
          {/* Trending Vibes Sidebar */}
          <div className="md:w-1/4 md:min-w-72 overflow-y-auto max-h-[40vh] md:max-h-full">
            <FadeIn delay="300ms">
              <TrendingVibesSection />
            </FadeIn>
          </div>
        </div>
      </div>
      
      <Navbar />
    </div>
  );
};

export default Index;
