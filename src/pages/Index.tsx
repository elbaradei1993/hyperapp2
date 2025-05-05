
"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/auth/AuthProvider";
import { H1, FadeIn } from "@/components/ui/design-system";
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
    <div className="min-h-screen flex flex-col bg-background pt-16 pb-28 md:pb-6">
      {/* Banner at the top */}
      <Banner />
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 container max-w-7xl mx-auto px-4 py-6 h-[calc(100vh-160px)]">
        <div className="flex flex-col md:flex-row gap-6 relative h-full">
          {/* Map */}
          <div className="flex-grow h-full md:w-3/4">
            <FadeIn delay="200ms" className="h-full">
              <MapTab />
            </FadeIn>
          </div>
          
          {/* Trending Vibes Sidebar */}
          <div className="md:w-1/4 md:min-w-80">
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
