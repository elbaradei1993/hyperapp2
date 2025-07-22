import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import { VibeService, Vibe } from '@/services/vibes';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import L from 'leaflet';
import 'leaflet.heat';
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from '@/hooks/use-mobile';
import UserLocationMarker from '@/components/map/UserLocationMarker';

// Fix Leaflet icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Extend L namespace for heatLayer
declare global {
  namespace L {
    function heatLayer(latlngs: [number, number, number][], options?: any): any;
  }
}

// Heat map component
function HeatMapLayer({ vibes }: { vibes: any[] }) {
  const map = useMap();
  const heatLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!vibes.length) return;

    // Remove existing heat layer
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    // Group vibes by type and create heat data
    const vibeTypeColors = {
      'Party': '#8b5cf6', // Purple
      'Danger': '#ef4444', // Red  
      'Safe Zone': '#22c55e', // Green
      'Social': '#3b82f6', // Blue
      'Food': '#f59e0b', // Orange
      'Music': '#ec4899', // Pink
    };

    // Create separate heat layers for each vibe type
    const heatData: [number, number, number][] = vibes
      .filter(vibe => vibe.latitude && vibe.longitude)
      .map(vibe => {
        const lat = parseFloat(vibe.latitude);
        const lng = parseFloat(vibe.longitude);
        const intensity = Math.min(vibe.confirmed_count + 1, 10) / 10; // Normalize intensity
        
        if (isNaN(lat) || isNaN(lng)) return null;
        return [lat, lng, intensity];
      })
      .filter(Boolean) as [number, number, number][];

    if (heatData.length > 0) {
      // Create heat layer with custom gradient
      heatLayerRef.current = (L as any).heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: {
          0.0: '#3b82f6',
          0.2: '#22c55e', 
          0.4: '#f59e0b',
          0.6: '#ec4899',
          0.8: '#8b5cf6',
          1.0: '#ef4444'
        }
      }).addTo(map);
    }

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [vibes, map]);

  return null;
}

// Location finder component
function LocationMarker() {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    });
  }, [map]);

  return position === null ? null : (
    <UserLocationMarker position={position} />
  );
}

const HeatMapTab = () => {
  const [vibes, setVibes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const { toast } = useToast();
  const [locationError, setLocationError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const loadVibes = useCallback(async () => {
    try {
      const data = await VibeService.getVibeReports();
      setVibes(data);
    } catch (error) {
      console.error("Error loading vibes:", error);
      toast({
        title: "Failed to load vibes",
        description: "Could not load vibe data from the server",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    // Check for stored location from other pages first
    const storedLocation = sessionStorage.getItem('mapLocation');
    if (storedLocation) {
      try {
        const location = JSON.parse(storedLocation);
        setUserLocation([location.lat, location.lng]);
        sessionStorage.removeItem('mapLocation'); // Clear after using
      } catch (error) {
        console.error('Error parsing stored location:', error);
      }
    } else {
      // Get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            setUserLocation([position.coords.latitude, position.coords.longitude]);
            setLocationError(null);
          },
          error => {
            console.error("Error getting location:", error);
            setLocationError(`Could not get your location: ${error.message}`);
            // Default to a location if we can't get the user's
            setUserLocation([37.7749, -122.4194]); // San Francisco
            toast({
              title: "Location access denied",
              description: "Using default location. Please enable location services for better experience.",
              variant: "destructive"
            });
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        setLocationError("Your browser doesn't support geolocation");
        // Default location
        setUserLocation([37.7749, -122.4194]); // San Francisco
      }
    }
    
    // Load vibes
    loadVibes();

    // Set up subscription for real-time updates
    const channel = supabase
      .channel('public:vibe_reports')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'vibe_reports' 
      }, () => {
        // Add new vibe to the list
        loadVibes(); // Reload all vibes
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    
  }, [loadVibes, toast]);

  if (loading || !userLocation) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">
          {locationError ? "Using default location..." : "Loading heat map..."}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-border/40 relative">
      <MapContainer 
        className="h-full w-full z-0"
        // Fix the typescript errors by adding these props as part of the any object
        {...{
          center: userLocation,
          zoom: 12,
          minZoom: 3,
          maxZoom: 19,
          scrollWheelZoom: true
        } as any}
        style={{ height: isMobile ? '70vh' : '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          // Fix the attribution typescript error by using as any
          {...{
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          } as any}
        />
        
        <LocationMarker />
        <HeatMapLayer vibes={vibes} />
      </MapContainer>
      
      {/* Current Location Button */}
      <button
        onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
              setUserLocation([position.coords.latitude, position.coords.longitude]);
            });
          }
        }}
        className="absolute bottom-4 right-4 z-10 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors animate-fade-in"
        title="Go to my location"
      >
        <MapPin size={20} />
      </button>

      {/* Heat Map Legend */}
      <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-sm rounded-lg p-3 border border-border/40">
        <h4 className="text-sm font-medium mb-2">Heat Map Intensity</h4>
        <div className="flex items-center space-x-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Low</span>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Medium</span>
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>High</span>
        </div>
      </div>
    </div>
  );
};

export default HeatMapTab;