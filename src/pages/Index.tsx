
"use client";

import React, { useState } from "react";
import Map from "@/components/Map";
import SosModal from "@/components/SosModal";
import VibeModal from "@/components/VibeModal";
import Navbar from "@/components/Navbar";

interface Pin {
  id: string;
  lat: number;
  lng: number;
  type: "sos" | "vibe";
  description: string;
}

const Index = () => {
  // Example pins, in real app these come from DB / real-time updates
  const [pins, setPins] = useState<Pin[]>([]);

  // For demo purposes, add pins on report
  const addSosPin = (data: { type: string; anonymous: boolean }) => {
    const newPin: Pin = {
      id: "sos_" + Date.now(),
      lat: 40.73061 + Math.random() * 0.02 - 0.01, // slight random nearby
      lng: -73.935242 + Math.random() * 0.02 - 0.01,
      type: "sos",
      description: data.anonymous ? "An anonymous SOS alert" : `SOS Alert: ${data.type}`,
    };
    setPins((prev) => [...prev, newPin]);
  };

  const addVibePin = (data: {
    type: string;
    description: string;
    anonymous: boolean;
    location: { lat: number; lng: number } | null;
  }) => {
    if (!data.location) return;
    const newPin: Pin = {
      id: "vibe_" + Date.now(),
      lat: data.location.lat,
      lng: data.location.lng,
      type: "vibe",
      description: data.anonymous ? "Anonymous Vibe" : `${data.type} Vibe: ${data.description}`,
    };
    setPins((prev) => [...prev, newPin]);
  };

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <div className="flex-grow">
        <Map radiusKm={10} pins={pins} />
      </div>
      <SosModal onReport={addSosPin} />
      <VibeModal onReport={addVibePin} />
      <Navbar />
    </div>
  );
};

export default Index;

