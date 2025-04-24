
"use client";

import React from "react";
import Map from "@/components/Map";
import { Card } from "@/components/ui/card";

// Sample pins data with different types
const samplePins = [
  {
    id: "1",
    lat: 40.7128,
    lng: -74.006,
    type: "vibe" as const,
    description: "Calm area - positive vibes",
  },
  {
    id: "2",
    lat: 40.7328,
    lng: -73.986,
    type: "sos" as const,
    description: "Help needed!",
  },
  {
    id: "3",
    lat: 40.7228,
    lng: -74.016,
    type: "vibe" as const,
    description: "Noisy area - construction work",
  },
  {
    id: "4",
    lat: 40.7428,
    lng: -74.026,
    type: "vibe" as const,
    description: "LGBTQIA+ friendly zone",
  },
  {
    id: "5",
    lat: 40.7028,
    lng: -73.956,
    type: "vibe" as const,
    description: "Dangerous area - avoid at night",
  },
];

const MapTab = () => {
  return (
    <div className="h-full space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Vibe Map</h2>
        <div className="space-x-2">
          <span className="inline-flex items-center text-xs">
            <span className="w-3 h-3 rounded-full bg-red-500 mr-1"></span>
            Dangerous
          </span>
          <span className="inline-flex items-center text-xs">
            <span className="w-3 h-3 rounded-full bg-blue-400 mr-1"></span>
            Calm
          </span>
          <span className="inline-flex items-center text-xs">
            <span className="w-3 h-3 rounded-full bg-yellow-300 mr-1"></span>
            Noisy
          </span>
        </div>
      </div>
      <Card className="h-[calc(100%-2rem)] overflow-hidden shadow-2xl border border-white/10">
        <div className="h-full rounded-md overflow-hidden">
          <Map radiusKm={10} pins={samplePins} />
        </div>
      </Card>
    </div>
  );
};

export default MapTab;
