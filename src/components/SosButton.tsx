
"use client";
import React from "react";
import { useToast } from "@/hooks/use-toast";

const SosButton = () => {
  const { toast } = useToast();

  const handleSOS = () => {
    toast({
      title: "SOS Alert",
      description: "This feature will be available when connected to a database.",
      variant: "destructive",
    });
  };

  return (
    <button
      type="button"
      onClick={handleSOS}
      className="fixed right-4 bottom-28 z-50 w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-95 group"
      aria-label="Send SOS"
    >
      {/* Pulsing effect */}
      <div className="absolute inset-0 rounded-full bg-red-500/30 blur-xl animate-pulse opacity-75" />
      
      <span className="relative z-10 text-white font-bold text-lg">SOS</span>
    </button>
  );
};

export default SosButton;
