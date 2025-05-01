
"use client";

import React, { useEffect, useState } from "react";
import Map from "@/components/Map";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface Vibe {
  id: string;
  lat: number;
  lng: number;
  type: string;
  radius: number;
  color: string;
}

const MapTab = () => {
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVibes = async () => {
      try {
        const { data, error } = await supabase
          .from('vibe_reports')
          .select(`
            id,
            latitude,
            longitude,
            vibe_type: vibe_type_id (
              name, 
              color
            )
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        const formattedVibes = data.map(vibe => ({
          id: vibe.id.toString(),
          lat: parseFloat(vibe.latitude),
          lng: parseFloat(vibe.longitude),
          type: vibe.vibe_type?.name || 'unknown',
          radius: 400,
          color: vibe.vibe_type?.color || '#888888'
        }));

        setVibes(formattedVibes);
      } catch (error) {
        console.error("Error fetching vibes:", error);
        // Use sample data as fallback
        setVibes([
          {
            id: "1",
            lat: 40.7128,
            lng: -74.006,
            type: "dangerous",
            radius: 400,
            color: "#F43F5E"
          },
          {
            id: "2",
            lat: 40.7328,
            lng: -73.986,
            type: "calm",
            radius: 400,
            color: "#0EA5E9"
          },
          {
            id: "3",
            lat: 40.7228,
            lng: -74.016,
            type: "noisy",
            radius: 400,
            color: "#FACC15"
          },
          {
            id: "4",
            lat: 40.7428,
            lng: -74.026,
            type: "lgbtq",
            radius: 350,
            color: "#8B5CF6"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchVibes();
  }, []);

  return (
    <div className="h-full space-y-4">
      <div className="flex justify-end items-center">
        <div className="space-x-3">
          <span className="inline-flex items-center text-xs">
            <span className="w-3 h-3 rounded-full bg-[#0EA5E9] mr-1 opacity-80"></span>
            Calm
          </span>
          <span className="inline-flex items-center text-xs">
            <span className="w-3 h-3 rounded-full bg-[#F43F5E] mr-1 opacity-80"></span>
            Dangerous
          </span>
          <span className="inline-flex items-center text-xs">
            <span className="w-3 h-3 rounded-full bg-[#FACC15] mr-1 opacity-80"></span>
            Noisy
          </span>
          <span className="inline-flex items-center text-xs">
            <span className="w-3 h-3 rounded-full bg-[#8B5CF6] mr-1 opacity-80"></span>
            LGBTQIA+ Friendly
          </span>
        </div>
      </div>
      <Card className="h-[calc(100vh-10rem)] overflow-hidden shadow-2xl border border-white/10">
        <div className="h-full rounded-md overflow-hidden">
          <Map radiusKm={10} vibes={vibes} />
        </div>
      </Card>
    </div>
  );
};

export default MapTab;
