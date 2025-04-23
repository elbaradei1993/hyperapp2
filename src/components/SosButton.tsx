
"use client";
import React from "react";
import { LifeBuoy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Pulse animation (override/add tailwind classes)
const pulse =
  "relative flex items-center justify-center w-32 h-32 mx-auto my-6 group";

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
    <div className={pulse}>
      {/* Pulsing signal ring */}
      <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60 animate-ping-sos group-hover:opacity-80 pointer-events-none" />
      {/* Static red ring */}
      <span className="absolute inline-flex h-full w-full rounded-full border-4 border-red-500 pointer-events-none" />
      <button
        type="button"
        onClick={handleSOS}
        className="relative z-10 w-28 h-28 rounded-full bg-red-600 hover:bg-red-700 focus:outline-none flex items-center justify-center text-white shadow-xl transition active:scale-95"
        aria-label="Send SOS"
      >
        <LifeBuoy size={56} className="text-white" />
      </button>
      <style>{`
        /* Custom pulsating ping for SOS, larger and slower than Tailwind default. */
        @keyframes ping-sos {
          0% { transform: scale(1); opacity: 0.7; }
          70% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .animate-ping-sos {
          animation: ping-sos 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default SosButton;
