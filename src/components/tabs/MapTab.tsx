import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, ThumbsUp, Rainbow } from 'lucide-react';
import { VibeService, Vibe } from '@/services/VibeService';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import L from 'leaflet';
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from '@/hooks/use-mobile';

// Fix Leaflet icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Rainbow gradient colors for LGBTQIA+ friendly vibes
const rainbowGradient = {
  color: 'linear-gradient(90deg, #ea384c, #F97316, #FEF7CD, #F2FCE2, #0EA5E9, #7E69AB, #D946EF)',
  cssColor: 'url(#rainbow-gradient)',
  name: 'LGBTQIA+ Friendly',
};

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
    <Circle 
      center={position}
      pathOptions={{ 
        color: 'blue', 
        fillColor: '#3388ff', 
        fillOpacity: 0.2
      }}
      // Fix for the radius typescript error - use the radius as part of the CircleProps
      {...{ radius: 200 }}
    />
  );
}

// Pulse effect component for vibes
const PulsingMarker = ({ position, color, vibe }: { position: [number, number], color: string, vibe: Vibe }) => {
  const [isLGBTQIAFriendly, setIsLGBTQIAFriendly] = useState(false);
  
  useEffect(() => {
    // Check if this is LGBTQIA+ friendly vibe based on vibe_type name
    if (vibe?.vibe_type?.name?.toLowerCase().includes('lgbtq')) {
      setIsLGBTQIAFriendly(true);
    }
  }, [vibe]);

  // Create multiple circles for pulse effect with increasing radius around the vibe report
  return (
    <>
      {/* Rainbow gradient definition for SVG elements */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <linearGradient id="rainbow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ea384c" />
            <stop offset="16.6%" stopColor="#F97316" />
            <stop offset="33.3%" stopColor="#FEF7CD" />
            <stop offset="50%" stopColor="#F2FCE2" />
            <stop offset="66.6%" stopColor="#0EA5E9" />
            <stop offset="83.3%" stopColor="#7E69AB" />
            <stop offset="100%" stopColor="#D946EF" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Main vibe circle */}
      <Circle 
        center={position}
        pathOptions={{ 
          color: isLGBTQIAFriendly ? '#D946EF' : color,
          fillColor: isLGBTQIAFriendly ? '#D946EF' : color,
          fillOpacity: 0.6,
          weight: 2
        }}
        {...{ radius: 100 }}
      />
      
      {/* Pulse circles with animation - 15km radius (15000m) */}
      {[5000, 10000, 15000].map((radius, i) => (
        <Circle 
          key={`pulse-${vibe.id}-${i}`}
          center={position}
          pathOptions={{ 
            color: isLGBTQIAFriendly ? '#D946EF' : color,
            fillColor: isLGBTQIAFriendly ? '#D946EF' : color,
            fillOpacity: 0.05 - (i * 0.01),
            weight: 1,
            dashArray: '5, 10',
            className: `animate-pulse-slow`
          }}
          {...{ radius }}
        />
      ))}
      
      {/* Marker */}
      <Marker position={position}>
        <Popup>
          <div className="p-1">
            <h3 className="font-medium text-sm">{vibe.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{vibe.description}</p>
            {vibe.vibe_type && (
              <div className="flex items-center gap-1 mt-2">
                {isLGBTQIAFriendly ? (
                  <Rainbow className="h-3 w-3" />
                ) : (
                  <span 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: vibe.vibe_type.color }}
                  />
                )}
                <span className="text-xs">{vibe.vibe_type.name}</span>
              </div>
            )}
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-muted-foreground">
                {vibe.confirmed_count} confirmations
              </span>
            </div>
          </div>
        </Popup>
      </Marker>
    </>
  );
};

const MapTab = () => {
  const [vibes, setVibes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const { toast } = useToast();
  const [isUpvoting, setIsUpvoting] = useState<number | null>(null);
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

  const handleConfirmVibe = async (id: number) => {
    try {
      setIsUpvoting(id);
      await VibeService.upvoteVibe(id);
      
      // Update local state to reflect the new count
      setVibes(prevVibes => prevVibes.map(vibe => 
        vibe.id === id ? { ...vibe, confirmed_count: vibe.confirmed_count + 1 } : vibe
      ));
      
      toast({
        title: "Vibe confirmed",
        description: "Thanks for confirming this vibe!",
      });
    } catch (error) {
      console.error("Error confirming vibe:", error);
      toast({
        title: "Failed to confirm vibe",
        description: "Could not register your confirmation",
        variant: "destructive"
      });
    } finally {
      setIsUpvoting(null);
    }
  };

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
    <div className="h-full w-full rounded-lg overflow-hidden border border-border/40">
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
          
          const position: L.LatLngTuple = [lat, lng];
          const isLGBTQIAFriendly = vibe?.vibe_type?.name?.toLowerCase().includes('lgbtq');
          
          return (
            <PulsingMarker 
              key={vibe.id}
              position={position}
              color={vibe.vibe_type?.color || '#888888'}
              vibe={vibe}
            />
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapTab;
