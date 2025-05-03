
"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MapTab from "@/components/tabs/MapTab";
import VibesTab from "@/components/tabs/VibesTab";
import EventsTab from "@/components/tabs/EventsTab";
import AlertsTab from "@/components/tabs/AlertsTab";
import { useAuth } from "@/components/auth/AuthProvider";
import { H1, FadeIn } from "@/components/ui/design-system";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Bell, Calendar, TrendingUp, Plus } from "lucide-react";
import { NavLink } from "react-router-dom";
import AddVibeReportDialog from "@/components/AddVibeReportDialog";

const Index = () => {
  const [activeTab, setActiveTab] = useState("map");
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Avoid hydration errors
  }

  return (
    <div className="min-h-screen flex flex-col bg-background pt-16 pb-20">
      {/* Main Content */}
      <div className="flex flex-col flex-1 container max-w-7xl mx-auto px-4 py-6 h-[calc(100vh-160px)]">
        <FadeIn>
          <div className="md:flex md:justify-between md:items-center mb-6">
            <div>
              <span className="inline-block mb-2 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                Explore your surroundings
              </span>
              <H1>
                Discover what's happening <span className="text-gradient">around you</span>
              </H1>
            </div>
          </div>
        </FadeIn>

        <Tabs 
          defaultValue="map" 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full h-full flex flex-col mt-4"
        >
          <FadeIn delay="100ms">
            <Card className="mb-6 border border-border/40">
              <CardContent className="p-2">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="map" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="hidden sm:inline">Map</span>
                  </TabsTrigger>
                  <TabsTrigger value="vibes" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="hidden sm:inline">Vibes</span>
                  </TabsTrigger>
                  <TabsTrigger value="events" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="hidden sm:inline">Events</span>
                  </TabsTrigger>
                  <TabsTrigger value="alerts" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span className="hidden sm:inline">Alerts</span>
                  </TabsTrigger>
                </TabsList>
              </CardContent>
            </Card>
          </FadeIn>
          
          <div className="flex-1 relative">
            <FadeIn delay="200ms" className="h-full">
              <TabsContent value="map" className="h-full m-0 overflow-hidden rounded-lg">
                <MapTab />
              </TabsContent>
              
              <TabsContent value="vibes" className="h-full m-0 overflow-auto">
                <VibesTab />
              </TabsContent>
              
              <TabsContent value="events" className="h-full m-0 overflow-auto">
                <EventsTab />
              </TabsContent>
              
              <TabsContent value="alerts" className="h-full m-0 overflow-auto">
                <AlertsTab />
              </TabsContent>
            </FadeIn>
            
            {/* Quick Action Button (Desktop) */}
            <div className="hidden md:block absolute bottom-6 right-6">
              <AddVibeReportDialog 
                trigger={
                  <Button className="btn-gradient h-14 px-6 rounded-full shadow-lg shadow-primary/20">
                    <Plus className="h-6 w-6 mr-2" />
                    Add Vibe Report
                  </Button>
                }
              />
            </div>
          </div>
        </Tabs>
      </div>
      
      <Navbar />
    </div>
  );
};

export default Index;
