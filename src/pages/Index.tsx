
"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AlertsTab from "@/components/tabs/AlertsTab";
import MapTab from "@/components/tabs/MapTab";
import { useAuth } from "@/components/auth/AuthProvider";
import { H1, FadeIn } from "@/components/ui/design-system";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Map } from "lucide-react";
import AddVibeReportDialog from "@/components/AddVibeReportDialog";
import SosButtonHome from "@/components/SosButtonHome";

const Index = () => {
  const [activeTab, setActiveTab] = useState("alerts");
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
                Stay safe...Stay connected
              </span>
              <H1>
                Welcome to <span className="text-gradient">HyperApp</span>
              </H1>
            </div>
          </div>
        </FadeIn>

        <Tabs 
          defaultValue="alerts" 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full h-full flex flex-col mt-4"
        >
          <FadeIn delay="100ms">
            <Card className="mb-6 border border-border/40">
              <CardContent className="p-2">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="alerts" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span>Alerts</span>
                  </TabsTrigger>
                  <TabsTrigger value="map" className="flex items-center gap-2">
                    <Map className="h-4 w-4" />
                    <span>Map</span>
                  </TabsTrigger>
                </TabsList>
              </CardContent>
            </Card>
          </FadeIn>
          
          <div className="flex-1 relative">
            <FadeIn delay="200ms" className="h-full">
              <TabsContent value="alerts" className="h-full m-0 overflow-auto">
                <AlertsTab />
              </TabsContent>
              <TabsContent value="map" className="h-full m-0">
                <MapTab />
              </TabsContent>
            </FadeIn>
            
            {/* Quick Action Button (Desktop) */}
            <div className="hidden md:block absolute bottom-6 right-6">
              <AddVibeReportDialog 
                trigger={
                  <button className="btn-gradient h-14 px-6 rounded-full shadow-lg shadow-primary/20 flex items-center justify-center gap-2 bg-primary text-white">
                    Add Vibe Report
                  </button>
                }
              />
            </div>
          </div>
        </Tabs>
      </div>
      
      {/* SOS Button positioned correctly below the content */}
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-30">
        <SosButtonHome />
      </div>
      
      <Navbar />
    </div>
  );
};

export default Index;
