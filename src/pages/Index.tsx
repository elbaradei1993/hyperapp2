
"use client";

import React, { useState } from "react";
import Map from "@/components/Map";
import SosButton from "@/components/SosButton";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen pb-16">
      <div className="flex-grow h-[70vh]">
        <Map radiusKm={10} pins={[]} />
      </div>
      <SosButton />
      <Navbar />
    </div>
  );
};

export default Index;
