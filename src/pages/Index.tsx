
"use client";

import React from "react";
import Map from "@/components/Map";
import SosButton from "@/components/SosButton";
import Navbar from "@/components/Navbar";

const Index = () => {
  // Sample pins data
  const samplePins = [
    {
      id: "1",
      lat: 40.7128,
      lng: -74.006,
      type: "vibe" as const,
      description: "Great vibes in NYC!",
    },
    {
      id: "2",
      lat: 40.7328,
      lng: -73.986,
      type: "sos" as const,
      description: "Help needed in Manhattan!",
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-background/95 to-background">
      {/* Map container taking 60% of the viewport height */}
      <div className="h-[60vh] px-4 pt-4">
        <div className="h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          <Map radiusKm={10} pins={samplePins} />
        </div>
      </div>
      {/* SOS button container with equal spacing above and below */}
      <div className="flex-1 flex items-center justify-center">
        <SosButton />
      </div>
      {/* Navbar */}
      <Navbar />
    </div>
  );
};

export default Index;
