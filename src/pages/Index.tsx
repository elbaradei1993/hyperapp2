
"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/auth/AuthProvider";
import { FadeIn } from "@/components/ui/design-system";
import MapTab from "@/components/tabs/MapTab";
import Banner from "@/components/Banner";
import { useIsMobile } from "@/hooks/use-mobile";

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
      {/* Banner with no gap */}
      <Banner />
      
      {/* Main Content with full height to avoid scrolling */}
      <div className="flex flex-col flex-1 container max-w-7xl mx-auto px-2 py-0 h-[calc(100vh-130px)] overflow-hidden">
        <div className="h-full w-full">
          {/* Map - taking full available space */}
          <FadeIn delay="200ms" className="h-full">
            <MapTab />
          </FadeIn>
        </div>
      </div>
      
      <Navbar />
    </div>
  );
};

export default Index;
