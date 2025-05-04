
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Map as MapIcon } from 'lucide-react';
import { VibeService } from '@/services/VibeService';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import L from 'leaflet';

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
    <Circle 
      center={[position.lat, position.lng]} 
      pathOptions={{ color: 'blue', fillColor: '#3388ff', fillOpacity: 0.2 }}
      radius={200 as number}
    />
  );
}

const MapTab = () => {
  const [vibes, setVibes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        error => {
          console.error("Error getting location:", error);
          // Default to a location if we can't get the user's
          setUserLocation([37.7749, -122.4194]); // San Francisco
        }
      );
    } else {
      // Default location
      setUserLocation([37.7749, -122.4194]); // San Francisco
    }
    
    // Load vibes
    async function loadVibes() {
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
    }
    
    loadVibes();
  }, [toast]);

  if (loading || !userLocation) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">
          Loading map...
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-border/40">
      <MapContainer 
        className="h-full w-full"
        zoom={14}
        minZoom={3}
        maxZoom={19}
        scrollWheelZoom={true}
        center={userLocation}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <LocationMarker />
        
        {vibes.map((vibe) => {
          if (!vibe.latitude || !vibe.longitude) return null;
          
          const lat = parseFloat(vibe.latitude);
          const lng = parseFloat(vibe.longitude);
          
          if (isNaN(lat) || isNaN(lng)) return null;
          
          return (
            <Marker 
              key={vibe.id} 
              position={[lat, lng]}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-medium text-sm">{vibe.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{vibe.description}</p>
                  {vibe.vibe_type && (
                    <div className="flex items-center gap-1 mt-2">
                      <span 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: vibe.vibe_type.color }}
                      />
                      <span className="text-xs">{vibe.vibe_type.name}</span>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapTab;
