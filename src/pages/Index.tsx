
"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/auth/AuthProvider";
import { H1, FadeIn } from "@/components/ui/design-system";
import MapTab from "@/components/tabs/MapTab";

const Index = () => {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Avoid hydration errors
  }

  return (
    <div className="min-h-screen flex flex-col bg-background pt-16 pb-20">
      {/* Main Content */}
      <div className="flex flex-col flex-1 container max-w-7xl mx-auto px-4 py-6 h-[calc(100vh-160px)]">
        <FadeIn>
          <div className="md:flex md:justify-between md:items-center mb-6">
            <div>
              <span className="inline-block mb-2 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                Stay safe...Stay connected
              </span>
              <H1>
                Welcome to <span className="text-gradient">HyperApp</span>
              </H1>
            </div>
          </div>
        </FadeIn>

        <div className="flex-1 relative">
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
