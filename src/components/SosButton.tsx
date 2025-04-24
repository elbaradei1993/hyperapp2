
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
      className="fixed right-0 top-1/2 -translate-y-1/2 z-50 w-14 h-14 rounded-l-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-95 group"
      aria-label="Send SOS"
    >
      {/* Subtle pulsing effect */}
      <div 
        className="absolute inset-0 rounded-l-full bg-red-500/20 animate-[pulse_2s_ease-in-out_infinite] opacity-75"
        style={{ animationDelay: '1s' }}
      />
      <div 
        className="absolute inset-0 rounded-l-full bg-red-500/10 animate-[pulse_2s_ease-in-out_infinite]"
      />
      
      <span className="relative z-10 text-white font-bold text-base">SOS</span>
    </button>
  );
};

export default SosButton;
