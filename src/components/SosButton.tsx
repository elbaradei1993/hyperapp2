
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
    <div className="relative flex items-center justify-center w-48 h-48 mx-auto group">
      {/* Outer glow effect */}
      <div className="absolute inset-0 rounded-full bg-red-500/30 blur-xl group-hover:bg-red-500/40 transition-colors" />
      
      {/* Multiple pulse rings */}
      <span className="absolute inline-flex h-full w-full rounded-full bg-red-400/60 animate-ping-sos-1 opacity-75" />
      <span className="absolute inline-flex h-full w-full rounded-full bg-red-400/40 animate-ping-sos-2 opacity-60" />
      
      {/* Gradient border ring */}
      <span className="absolute inline-flex h-full w-full rounded-full bg-gradient-to-br from-red-500 to-red-600 p-1" />
      
      {/* Main button */}
      <button
        type="button"
        onClick={handleSOS}
        className="relative z-10 w-44 h-44 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-95 group-hover:shadow-red-500/25"
        aria-label="Send SOS"
      >
        <span className="text-6xl font-black tracking-widest text-white drop-shadow-lg select-none">
          SOS
        </span>
      </button>

      <style>{`
        /* Multiple pulsing animations with different timings */
        @keyframes ping-sos-1 {
          0% { transform: scale(0.95); opacity: 0.9; }
          70% { transform: scale(1.3); opacity: 0; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes ping-sos-2 {
          0% { transform: scale(0.95); opacity: 0.8; }
          70% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .animate-ping-sos-1 {
          animation: ping-sos-1 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-ping-sos-2 {
          animation: ping-sos-2 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default SosButton;
