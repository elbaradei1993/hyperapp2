
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
    color: "#0EA5E9"  // More vivid blue
  },
  {
    id: "2",
    lat: 40.7328,
    lng: -73.986,
    type: "dangerous",
    radius: 300,
    color: "#F43F5E"  // More vivid red
  },
  {
    id: "3",
    lat: 40.7228,
    lng: -74.016,
    type: "noisy",
    radius: 400,
    color: "#FACC15"  // More vivid yellow
  },
  {
    id: "4",
    lat: 40.7428,
    lng: -74.026,
    type: "lgbtq",
    radius: 350,
    color: "#8B5CF6"  // More vivid purple
  }
];

const MapTab = () => {
  return (
    <div className="h-full space-y-4">
      <div className="flex justify-end items-center">
        <div className="space-x-3">
          <span className="inline-flex items-center text-xs">
            <span className="w-3 h-3 rounded-full bg-[#0EA5E9] mr-1 opacity-70"></span>
            Calm
          </span>
          <span className="inline-flex items-center text-xs">
            <span className="w-3 h-3 rounded-full bg-[#F43F5E] mr-1 opacity-70"></span>
            Dangerous
          </span>
          <span className="inline-flex items-center text-xs">
            <span className="w-3 h-3 rounded-full bg-[#FACC15] mr-1 opacity-70"></span>
            Noisy
          </span>
          <span className="inline-flex items-center text-xs">
            <span className="w-3 h-3 rounded-full bg-[#8B5CF6] mr-1 opacity-70"></span>
            LGBTQIA+ Friendly
          </span>
        </div>
      </div>
      <Card className="h-[calc(100vh-12rem)] overflow-hidden shadow-2xl border border-white/10">
        <div className="h-full rounded-md overflow-hidden">
          <Map radiusKm={12} vibes={sampleVibes} />
        </div>
      </Card>
    </div>
  );
};

export default MapTab;
