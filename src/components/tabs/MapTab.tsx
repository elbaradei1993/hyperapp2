
"use client";

import React from "react";
import Map from "@/components/Map";
import { Card } from "@/components/ui/card";

const sampleVibes = [
  {
    id: "1",
    lat: 40.7128,
    lng: -74.006,
    type: "calm",
    radius: 500,
    color: "#1EAEDB"
  },
  {
    id: "2",
    lat: 40.7328,
    lng: -73.986,
    type: "dangerous",
    radius: 300,
    color: "#ea384c"
  },
  {
    id: "3",
    lat: 40.7228,
    lng: -74.016,
    type: "noisy",
    radius: 400,
    color: "#FEF7CD"
  },
  {
    id: "4",
    lat: 40.7428,
    lng: -74.026,
    type: "lgbtq",
    radius: 350,
    color: "#8B5CF6"
  }
];

const MapTab = () => {
  return (
    <div className="h-full space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Vibe Map</h2>
        <div className="space-x-2">
          <span className="inline-flex items-center text-xs">
            <span className="w-3 h-3 rounded-full bg-[#1EAEDB] mr-1 opacity-50"></span>
            Calm
          </span>
          <span className="inline-flex items-center text-xs">
            <span className="w-3 h-3 rounded-full bg-[#ea384c] mr-1 opacity-50"></span>
            Dangerous
          </span>
          <span className="inline-flex items-center text-xs">
            <span className="w-3 h-3 rounded-full bg-[#FEF7CD] mr-1 opacity-50"></span>
            Noisy
          </span>
          <span className="inline-flex items-center text-xs">
            <span className="w-3 h-3 rounded-full bg-[#8B5CF6] mr-1 opacity-50"></span>
            LGBTQIA+
          </span>
        </div>
      </div>
      <Card className="h-[calc(100%-2rem)] overflow-hidden shadow-2xl border border-white/10">
        <div className="h-full rounded-md overflow-hidden">
          <Map radiusKm={10} vibes={sampleVibes} />
        </div>
      </Card>
    </div>
  );
};

export default MapTab;
