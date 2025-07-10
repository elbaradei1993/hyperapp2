
import React, { useState, useEffect } from "react";
import { HeroSection } from "@/components/hero/HeroSection";
import { FeatureGrid } from "@/components/features/FeatureGrid";
import { UberNavbar } from "@/components/layout/UberNavbar";
import MapTab from "@/components/tabs/MapTab";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <UberNavbar />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need for community safety
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover trending vibes, create events, explore your neighborhood, 
              and track community pulse — all in one place.
            </p>
          </div>
          <FeatureGrid />
        </div>
      </section>
      
      {/* Map Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Live Community Map
            </h2>
            <p className="text-muted-foreground text-lg">
              See what's happening around you in real-time
            </p>
          </div>
          
          <div className="bg-card rounded-lg uber-shadow-lg overflow-hidden" style={{ height: isMobile ? "400px" : "500px" }}>
            <MapTab />
          </div>
        </div>
      </section>
      
      {/* Mobile spacing for bottom nav */}
      {isMobile && <div className="h-16" />}
    </div>
  );
};

export default Index;
