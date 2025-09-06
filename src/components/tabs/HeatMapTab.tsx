import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Activity, Loader2, RefreshCw } from 'lucide-react';
import { VibeDataPoint } from '@/services/externalVibeAPI';
import L from 'leaflet';
import 'leaflet.heat';
import { useIsMobile } from '@/hooks/use-mobile';
import UserLocationMarker from '@/components/map/UserLocationMarker';
import { useVibeDataContext } from '@/contexts/VibeDataContext';
import { useAccurateLocation } from '@/hooks/useAccurateLocation';

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

// Heat map component with performance optimizations
function HeatMapLayer({ vibes }: { vibes: VibeDataPoint[] }) {
  const map = useMap();
  const heatLayerRef = useRef<any>(null);

  // Memoize heat data calculation to avoid recalculating on every render
  const heatData = useMemo(() => {
    if (!vibes.length) return [];

    // Convert external API data to heatmap format
    const data: [number, number, number][] = vibes
      .filter(vibe => {
        return !isNaN(vibe.lat) && !isNaN(vibe.lng) && 
               vibe.lat !== 0 && vibe.lng !== 0 &&
               vibe.lat >= -90 && vibe.lat <= 90 &&
               vibe.lng >= -180 && vibe.lng <= 180;
      })
      .map(vibe => {
        // Use intensity directly from external API (should be 0-1)
        const intensity = Math.max(0.1, Math.min(1.0, vibe.intensity));
        return [vibe.lat, vibe.lng, intensity] as [number, number, number];
      });

    return data;
  }, [vibes]);

  useEffect(() => {
    // Remove existing heat layer
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (heatData.length > 0) {
      // Create enhanced heat layer with better gradient and performance settings
      heatLayerRef.current = (L as any).heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 18,
        minOpacity: 0.4,
        max: 1.0,
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
  }, [heatData, map]);

  return null;
}

// Map controls component
function MapControls({ 
  userLocation, 
  onToggleLegend, 
  onRefresh, 
  isRefreshing 
}: { 
  userLocation: [number, number] | null;
  onToggleLegend: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  const map = useMap();
  return (
    <div className="absolute bottom-4 right-4 z-[1000] flex flex-col space-y-2">
      <button
        onClick={onToggleLegend}
        className="bg-background/90 border border-border/40 text-foreground p-3 rounded-full shadow-lg hover:bg-muted/90 transition-colors"
        title="Toggle legend"
      >
        <Activity size={16} />
      </button>
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="bg-secondary text-secondary-foreground p-3 rounded-full shadow-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
        title="Refresh data"
      >
        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
      </button>
      <button
        onClick={() => {
          if (userLocation) {
            map.setView(userLocation as any, map.getZoom(), { animate: true });
          }
        }}
        className="bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
        title="Go to my location"
      >
        <MapPin size={20} />
      </button>
    </div>
  );
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

interface HeatMapTabProps {
  highlightLocation?: { lat: number; lng: number } | null;
}

const HeatMapTab: React.FC<HeatMapTabProps> = ({ highlightLocation }) => {
  const [showLegend, setShowLegend] = useState(true);
  const isMobile = useIsMobile();

  // Use global vibe data context and location
  const { vibes, loading: vibesLoading, refetch, error: vibesError } = useVibeDataContext();
  const { position: userLocation, loading: locationLoading, error: locationError } = useAccurateLocation({
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 300000
  });

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Set default location from stored data or highlight location
  const mapCenter = useMemo(() => {
    if (highlightLocation) {
      return [highlightLocation.lat, highlightLocation.lng] as [number, number];
    }
    const storedLocation = sessionStorage.getItem('mapLocation');
    if (storedLocation) {
      try {
        const location = JSON.parse(storedLocation);
        sessionStorage.removeItem('mapLocation'); // Clear after using
        return [location.lat, location.lng] as [number, number];
      } catch (error) {
        console.error('Error parsing stored location:', error);
      }
    }
    return userLocation || [30.0444, 31.2357]; // Default to Cairo, Egypt
  }, [userLocation, highlightLocation]);

  if (vibesLoading || locationLoading || !mapCenter) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">
          {vibesError ? `Error: ${vibesError}` : 
           locationError ? "Using default location..." : 
           "Loading heat map..."}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-border/40 relative">
      <MapContainer 
        className="h-full w-full z-[1]"
        // Fix the typescript errors by adding these props as part of the any object
        {...{
          center: mapCenter,
          zoom: 12,
          minZoom: 3,
          maxZoom: 19,
          scrollWheelZoom: true,
          preferCanvas: true, // Better performance for heat maps
          zoomSnap: 0.5
        } as any}
        style={{ height: '100%' }}
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
        <MapControls 
          userLocation={userLocation} 
          onToggleLegend={() => setShowLegend(!showLegend)}
          onRefresh={handleRefresh}
          isRefreshing={vibesLoading}
        />
      </MapContainer>
      

      {/* Enhanced Heat Map Legend */}
      {showLegend && (
        <div className="absolute top-4 left-4 z-[1000] bg-background/95 backdrop-blur-sm rounded-lg p-4 border border-border/40 shadow-lg animate-fade-in">
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
              <div>Avg Intensity: {vibes.length > 0 ? (vibes.reduce((sum, v) => sum + v.intensity, 0) / vibes.length).toFixed(2) : '0.00'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeatMapTab;