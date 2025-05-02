
"use client";

import React, { useEffect, useState } from "react";
import Map from "@/components/Map";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

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
          .order('created_at', { ascending: false });

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
        toast({
          title: "Error loading vibes",
          description: "Could not load vibe data from the server",
          variant: "destructive"
        });
        
        // Empty array as fallback
        setVibes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVibes();
  }, [toast]);

  const getLegendItems = () => {
    // Get unique vibe types
    const uniqueVibeTypes = vibes.reduce((acc: {type: string, color: string}[], vibe) => {
      if (!acc.some(item => item.type === vibe.type)) {
        acc.push({type: vibe.type, color: vibe.color});
      }
      return acc;
    }, []);

    return uniqueVibeTypes;
  };

  return (
    <div className="h-full space-y-4">
      <div className="flex justify-end items-center">
        {loading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Loading vibes...</span>
          </div>
        ) : (
          <div className="space-x-3">
            {getLegendItems().map((item, index) => (
              <span key={index} className="inline-flex items-center text-xs">
                <span 
                  className="w-3 h-3 rounded-full mr-1 opacity-80" 
                  style={{ backgroundColor: item.color }}
                />
                {item.type}
              </span>
            ))}
          </div>
        )}
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
