
import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import { VibeService, Vibe } from '@/services/vibes';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import L from 'leaflet';
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from '@/hooks/use-mobile';
import VibeMarker from '@/components/map/VibeMarker';
import UserLocationMarker from '@/components/map/UserLocationMarker';

// Fix Leaflet icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

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

const MapTab = () => {
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
          {locationError ? "Using default location..." : "Loading map..."}
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
          zoom: 14,
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
        
        {vibes.map((vibe) => {
          if (!vibe.latitude || !vibe.longitude) return null;
          
          const lat = parseFloat(vibe.latitude);
          const lng = parseFloat(vibe.longitude);
          
          if (isNaN(lat) || isNaN(lng)) return null;
          
          return (
            <div key={vibe.id}>
              <Circle
                center={[lat, lng]}
                radius={vibe.vibe_type?.name === 'Party' ? 200 : 
                       vibe.vibe_type?.name === 'Danger' ? 300 : 
                       vibe.vibe_type?.name === 'Safe Zone' ? 150 : 100}
                pathOptions={{
                  color: vibe.vibe_type?.color || '#6366f1',
                  fillColor: vibe.vibe_type?.color || '#6366f1',
                  fillOpacity: 0.3,
                  weight: 2,
                  className: 'animate-pulse'
                }}
              />
              <VibeMarker 
                vibe={vibe}
                position={[lat, lng]}
              />
            </div>
          );
        })}
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
    </div>
  );
};

export default MapTab;
