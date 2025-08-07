import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Activity, Loader2 } from 'lucide-react';
import { VibeService, Vibe } from '@/services/vibes';
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

    // Improved vibe type mapping for better heat visualization
    const vibeTypeIntensities = {
      'dangerous': 1.0,
      'suspicious': 0.9,
      'crowded': 0.7,
      'party': 0.6,
      'social': 0.5,
      'calm': 0.3,
      'safe': 0.2,
      'peaceful': 0.1
    };

    // Enhanced heat data calculation with vibe type consideration
    const heatData: [number, number, number][] = vibes
      .filter(vibe => vibe.latitude && vibe.longitude)
      .map(vibe => {
        const lat = parseFloat(vibe.latitude);
        const lng = parseFloat(vibe.longitude);
        
        if (isNaN(lat) || isNaN(lng)) return null;
        
        // Get base intensity from confirmed count
        const baseIntensity = Math.min((vibe.confirmed_count || 0) + 1, 10) / 10;
        
        // Get vibe type intensity modifier
        const vibeTypeName = vibe.vibe_type?.name?.toLowerCase() || 'calm';
        const typeIntensity = vibeTypeIntensities[vibeTypeName as keyof typeof vibeTypeIntensities] || 0.5;
        
        // Combine base intensity with type intensity
        const finalIntensity = Math.min(baseIntensity * typeIntensity * 2, 1.0);
        
        return [lat, lng, finalIntensity];
      })
      .filter(Boolean) as [number, number, number][];

    console.log(`Loaded ${heatData.length} vibes for heatmap:`, heatData.slice(0, 5));

    if (heatData.length > 0) {
      // Create enhanced heat layer with better gradient
      heatLayerRef.current = (L as any).heatLayer(heatData, {
        radius: 30,
        blur: 20,
        maxZoom: 18,
        minOpacity: 0.3,
        gradient: {
          0.0: 'rgba(59, 130, 246, 0.6)',   // Blue - Safe/Low
          0.2: 'rgba(34, 197, 94, 0.6)',    // Green - Calm
          0.4: 'rgba(245, 158, 11, 0.7)',   // Orange - Social
          0.6: 'rgba(236, 72, 153, 0.8)',   // Pink - Party
          0.8: 'rgba(139, 92, 246, 0.8)',   // Purple - Crowded
          1.0: 'rgba(239, 68, 68, 0.9)'     // Red - Dangerous
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
  const [showLegend, setShowLegend] = useState(true);
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
      
      {/* Control Buttons */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col space-y-2">
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="bg-background/90 border border-border/40 text-foreground p-3 rounded-full shadow-lg hover:bg-muted/90 transition-colors"
          title="Toggle legend"
        >
          <Activity size={16} />
        </button>
        <button
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((position) => {
                setUserLocation([position.coords.latitude, position.coords.longitude]);
              });
            }
          }}
          className="bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
          title="Go to my location"
        >
          <MapPin size={20} />
        </button>
      </div>

      {/* Enhanced Heat Map Legend */}
      {showLegend && (
        <div className="absolute top-4 left-4 z-10 bg-background/95 backdrop-blur-sm rounded-lg p-4 border border-border/40 shadow-lg animate-fade-in">
          <h4 className="text-sm font-semibold mb-3">Activity Heatmap</h4>
          
          {/* Gradient Legend */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-blue-500/60"></div>
              <span>Safe/Calm</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
              <span>Peaceful</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-orange-500/70"></div>
              <span>Social/Active</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-pink-500/80"></div>
              <span>Party/Event</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-purple-500/80"></div>
              <span>Crowded</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-red-500/90"></div>
              <span>Alert/Danger</span>
            </div>
          </div>
          
          {/* Stats */}
          <div className="border-t border-border/40 pt-2">
            <div className="text-xs text-muted-foreground">
              <div>Total Points: {vibes.length}</div>
              <div>Active Areas: {Math.max(1, Math.floor(vibes.length / 5))}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeatMapTab;