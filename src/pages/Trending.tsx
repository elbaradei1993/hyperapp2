
"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Trending = () => {
  const { toast } = useToast();

  const showMessage = () => {
    toast({
      title: "Coming Soon",
      description: "Trending vibes will be available when connected to a database.",
    });
  };

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen pb-16">
      <h1 className="text-3xl font-bold mb-6">Trending Vibes</h1>
      
      <div className="flex flex-col items-center justify-center space-y-4 min-h-[60vh]">
        <TrendingUp className="w-16 h-16 text-primary opacity-30" />
        <p className="text-lg text-center text-muted-foreground">
          Trending vibes will appear here when you connect to a database
        </p>
        <Button onClick={showMessage}>Learn More</Button>
      </div>
      
      <Navbar />
    </div>
  );
};

export default Trending;
