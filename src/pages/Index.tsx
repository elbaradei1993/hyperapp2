
"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Header from "@/components/Header";
import SosButton from "@/components/SosButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Search, Calendar, Bell } from "lucide-react";
import MapTab from "@/components/tabs/MapTab";
import VibesTab from "@/components/tabs/VibesTab";
import EventsTab from "@/components/tabs/EventsTab";
import AlertsTab from "@/components/tabs/AlertsTab";

const Index = () => {
  const [activeTab, setActiveTab] = useState("vibes");

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-background/95 to-background">
      <Header />
      
      {/* Main content area */}
      <div className="flex-1 px-4 pt-4 pb-24 overflow-hidden">
        {/* Tabs Container */}
        <Tabs 
          defaultValue="vibes" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-full flex flex-col"
        >
          {/* Tab Navigation */}
          <TabsList className="grid grid-cols-2 gap-2 h-auto p-1 mb-4 bg-background/50 backdrop-blur-sm border border-white/10 rounded-xl">
            <TabsTrigger 
              value="vibes" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-20 rounded-lg flex flex-col gap-1"
            >
              <Search className="h-6 w-6" />
              <span>Vibes</span>
            </TabsTrigger>
            <TabsTrigger 
              value="map" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-20 rounded-lg flex flex-col gap-1"
            >
              <MapPin className="h-6 w-6" />
              <span>Map</span>
            </TabsTrigger>
            <TabsTrigger 
              value="events" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-20 rounded-lg flex flex-col gap-1"
            >
              <Calendar className="h-6 w-6" />
              <span>Events</span>
            </TabsTrigger>
            <TabsTrigger 
              value="alerts" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-20 rounded-lg flex flex-col gap-1"
            >
              <Bell className="h-6 w-6" />
              <span>Alerts</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <div className="flex-1 overflow-hidden rounded-2xl">
            <TabsContent value="vibes" className="h-full m-0">
              <VibesTab />
            </TabsContent>
            <TabsContent value="map" className="h-full m-0">
              <MapTab />
            </TabsContent>
            <TabsContent value="events" className="h-full m-0">
              <EventsTab />
            </TabsContent>
            <TabsContent value="alerts" className="h-full m-0">
              <AlertsTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* SOS Button */}
      <SosButton />

      {/* Navbar */}
      <Navbar />
    </div>
  );
};

export default Index;
