
"use client";
import React from "react";
import { useToast } from "@/hooks/use-toast";

const SosButton = () => {
  const { toast } = useToast();

  const handleSOS = () => {
    toast({
      title: "SOS Alert",
      description:
        "This feature will be available when connected to a database.",
      variant: "destructive",
    });
  };

  return (
    <div className="relative flex items-center justify-center w-52 h-52 mx-auto my-6 group">
      {/* Stronger pulsing red signal ring */}
      <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60 animate-ping-sos group-hover:opacity-80 pointer-events-none" />
      {/* Static red outer ring */}
      <span className="absolute inline-flex h-full w-full rounded-full border-8 border-red-500 pointer-events-none" />
      <button
        type="button"
        onClick={handleSOS}
        className="relative z-10 w-48 h-48 rounded-full bg-red-600 hover:bg-red-700 focus:outline-none flex items-center justify-center text-white shadow-2xl transition active:scale-95"
        aria-label="Send SOS"
      >
        <span className="text-5xl font-black tracking-widest select-none">
          SOS
        </span>
      </button>
      <style>{`
        /* Custom big, slow pulsating ping for SOS */
        @keyframes ping-sos {
          0% { transform: scale(1); opacity: 0.7; }
          70% { transform: scale(2); opacity: 0; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .animate-ping-sos {
          animation: ping-sos 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default SosButton;
