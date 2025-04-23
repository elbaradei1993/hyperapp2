
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
      description: "Great vibes in NYC!"
    },
    {
      id: "2",
      lat: 40.7328,
      lng: -73.986,
      type: "sos" as const,
      description: "Help needed in Manhattan!"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <div className="flex-grow h-[70vh]">
        <Map radiusKm={10} pins={samplePins} />
      </div>
      <SosButton />
      <Navbar />
    </div>
  );
};

export default Index;
