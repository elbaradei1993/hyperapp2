
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Compass } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { safeParseInt } from "@/utils/typeConverters";

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Vibe {
  id: string;
  lat: number;
  lng: number;
  type: string;
  radius: number;
  color: string;
  title?: string;
}

interface MapProps {
  radiusKm?: number;
  vibes?: Vibe[];
  initialCenter?: [number, number];
}

// Component to handle map center changes
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

const Map = ({ vibes: initialVibes = [], initialCenter = [40.7128, -74.006], radiusKm = 10 }: MapProps) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [vibes, setVibes] = useState<Vibe[]>(initialVibes);
  const [mapCenter, setMapCenter] = useState<[number, number]>(initialCenter);
  const [mapInitialized, setMapInitialized] = useState(false);
  const { toast } = useToast();
  const mapRef = useRef<L.Map | null>(null);

  // Get user's location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoordinates: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(userCoordinates);
          setMapCenter(userCoordinates);
          
          // Fetch vibes and SOS alerts near this location
          fetchNearbyVibes(userCoordinates[0], userCoordinates[1], radiusKm);
          setIsLocating(false);
        },
        (error) => {
          console.error('Error getting user location:', error);
          setIsLocating(false);
          toast({
            title: "Location Error",
            description: `Could not get your location: ${error.message}`,
            variant: "destructive"
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive"
      });
    }
  };
  
  // Fetch nearby vibes from Supabase
  const fetchNearbyVibes = async (lat: number, lng: number, radius: number) => {
    try {
      // Convert radius from km to degrees (approximate)
      // 1 degree of latitude = ~111km
      const radiusDegrees = radius / 111;
      
      // Fetch vibe reports near this location
      const { data: vibeReports, error } = await supabase
        .from('vibe_reports')
        .select(`
          id,
          title,
          description,
          latitude,
          longitude,
          vibe_type: vibe_type_id (
            id,
            name,
            color
          )
        `)
        .gte('latitude', (lat - radiusDegrees).toString())
        .lte('latitude', (lat + radiusDegrees).toString())
        .gte('longitude', (lng - radiusDegrees).toString())
        .lte('longitude', (lng + radiusDegrees).toString());

      if (error) throw error;
      
      if (vibeReports) {
        // Transform to our Vibe interface
        const formattedVibes = vibeReports.map(report => ({
          id: report.id.toString(),
          lat: parseFloat(report.latitude),
          lng: parseFloat(report.longitude),
          type: report.vibe_type?.name || "unknown",
          radius: 400, // Default pulse radius in map units
          color: report.vibe_type?.color || "#888888",
          title: report.title
        }));
        
        setVibes(formattedVibes);
      }
    } catch (error) {
      console.error("Error fetching nearby vibes:", error);
    }
  };

  useEffect(() => {
    // Set map as initialized
    setMapInitialized(true);
    
    // Get initial user location automatically
    getUserLocation();
    
    // Set up real-time subscription for new vibes
    if (userLocation) {
      const subscription = supabase
        .channel('public:vibe_reports')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'vibe_reports' 
        }, (payload) => {
          // When a new vibe is added, check if it's within our radius and fetch it
          const newVibeLat = parseFloat(payload.new.latitude);
          const newVibeLng = parseFloat(payload.new.longitude);
          
          if (userLocation) {
            // Approximate distance check (in degrees)
            const distanceDegLat = Math.abs(newVibeLat - userLocation[0]);
            const distanceDegLng = Math.abs(newVibeLng - userLocation[1]);
            
            // Rough check if it's within our radius (1 degree ~ 111km at equator)
            if (distanceDegLat < radiusKm / 111 && distanceDegLng < radiusKm / 111) {
              // Fetch complete vibe data with joins
              fetchNewVibe(payload.new.id.toString());
            }
          }
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [userLocation, radiusKm]);
  
  // Fetch a single new vibe by ID
  const fetchNewVibe = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('vibe_reports')
        .select(`
          id,
          title,
          description,
          latitude,
          longitude,
          vibe_type: vibe_type_id (
            id,
            name,
            color
          )
        `)
        .eq('id', safeParseInt(id))
        .single();
      
      if (error) throw error;
      
      if (data) {
        const newVibe: Vibe = {
          id: data.id.toString(),
          lat: parseFloat(data.latitude),
          lng: parseFloat(data.longitude),
          type: data.vibe_type?.name || "unknown",
          radius: 400,
          color: data.vibe_type?.color || "#888888",
          title: data.title
        };
        
        // Add to existing vibes
        setVibes(prev => [...prev, newVibe]);
        
        toast({
          title: "New Vibe Nearby",
          description: data.title || "Someone reported a new vibe near you"
        });
      }
    } catch (error) {
      console.error("Error fetching new vibe:", error);
    }
  };

  // Save map reference when it's available
  const saveMapRef = (map: L.Map) => {
    mapRef.current = map;
  };

  return (
    <div className="w-full h-full relative">
      {mapInitialized && (
        <MapContainer
          ref={saveMapRef}
          className="h-full w-full"
          // Fix TypeScript errors by casting props to any
          center={mapCenter as any}
          zoom={13 as any}
          minZoom={3 as any} 
          maxZoom={18 as any}
          scrollWheelZoom={false}
        >
          <ChangeView center={mapCenter} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            // Cast attribution to any
            attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' as any}
          />
          
          {userLocation && (
            <Marker position={userLocation}>
              <Popup>You are here</Popup>
            </Marker>
          )}
          
          {vibes.map((vibe) => (
            <React.Fragment key={vibe.id}>
              <Circle
                center={[vibe.lat, vibe.lng]}
                pathOptions={{
                  color: vibe.color,
                  fillColor: vibe.color,
                  fillOpacity: 0.2
                }}
                // Cast radius to any to fix TypeScript error
                radius={vibe.radius as any}
              />
              <Marker position={[vibe.lat, vibe.lng]}>
                <Popup>
                  <div>
                    <strong>{vibe.title || vibe.type}</strong>
                    <p>Type: {vibe.type}</p>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}
        </MapContainer>
      )}
      
      {/* User location button */}
      <button 
        onClick={getUserLocation}
        disabled={isLocating}
        className="absolute bottom-24 right-4 bg-primary text-white p-3 rounded-full shadow-lg z-10 hover:bg-primary/80 transition-colors"
        aria-label="Go to my location"
      >
        <Compass className={`h-6 w-6 ${isLocating ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};

export default Map;
