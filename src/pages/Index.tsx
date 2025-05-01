
"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MapTab from "@/components/tabs/MapTab";
import VibesTab from "@/components/tabs/VibesTab";
import EventsTab from "@/components/tabs/EventsTab";
import AlertsTab from "@/components/tabs/AlertsTab";
import { useAuth } from "@/components/auth/AuthProvider";

const Index = () => {
  const [activeTab, setActiveTab] = useState("map");
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-foreground">HyperApp</h1>
          <div className="flex items-center space-x-2">
            {!user ? (
              <a 
                href="/auth" 
                className="text-sm text-primary hover:text-primary/80"
              >
                Sign In
              </a>
            ) : (
              <span className="text-sm text-muted-foreground">
                {user.email?.split('@')[0]}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex flex-col flex-1 container max-w-7xl mx-auto px-4 py-4 h-[calc(100vh-128px)]">
        <Tabs 
          defaultValue="map" 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full h-full flex flex-col"
        >
          <TabsList className="self-center mb-4">
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="vibes">Vibes</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="map" className="flex-1 mt-0">
            <MapTab />
          </TabsContent>
          
          <TabsContent value="vibes" className="flex-1 mt-0">
            <VibesTab />
          </TabsContent>
          
          <TabsContent value="events" className="flex-1 mt-0">
            <EventsTab />
          </TabsContent>
          
          <TabsContent value="alerts" className="flex-1 mt-0">
            <AlertsTab />
          </TabsContent>
        </Tabs>
      </div>
      
      <Navbar />
    </div>
  );
};

export default Index;
