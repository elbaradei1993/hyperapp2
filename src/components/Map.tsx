
"use client";

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Compass } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

const Map = ({ vibes: initialVibes = [], initialCenter = [-74.006, 40.7128], radiusKm = 10 }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [vibes, setVibes] = useState<Vibe[]>(initialVibes);
  const markersRef = useRef<{[key: string]: maplibregl.Marker}>({});
  const sourceIdsRef = useRef<string[]>([]);
  const layerIdsRef = useRef<string[]>([]);
  const { toast } = useToast();

  // Convert kilometers to pixels at the current zoom level and latitude
  const kmToPixels = (km: number, latitude: number, zoom: number) => {
    // Earth's radius in kilometers
    const earthRadius = 6371;
    // Pixels per tile at zoom level 0
    const pixelsPerTile = 256;
    // Number of tiles at zoom level
    const tilesAtZoom = Math.pow(2, zoom);
    // Earth's circumference in pixels at zoom level
    const pixelsPerKm = (tilesAtZoom * pixelsPerTile) / (2 * Math.PI * earthRadius * Math.cos(latitude * Math.PI / 180));
    
    return km * pixelsPerKm;
  };

  // Get user's location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoordinates: [number, number] = [position.coords.longitude, position.coords.latitude];
          setUserLocation(userCoordinates);
          
          if (map.current) {
            map.current.flyTo({
              center: userCoordinates,
              zoom: 14,
              speed: 1.5,
            });

            // Create or update user location marker
            const el = document.createElement('div');
            el.className = 'user-location-marker';
            el.style.background = '#3b82f6';
            el.style.width = '16px';
            el.style.height = '16px';
            el.style.borderRadius = '50%';
            el.style.border = '3px solid white';
            el.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.5)';

            if (markersRef.current['user-location']) {
              markersRef.current['user-location'].setLngLat(userCoordinates);
            } else {
              markersRef.current['user-location'] = new maplibregl.Marker(el)
                .setLngLat(userCoordinates)
                .addTo(map.current);
            }
            
            // Fetch vibes and SOS alerts near this location
            fetchNearbyVibes(userCoordinates[1], userCoordinates[0], radiusKm);
          }
          
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
    if (!mapContainer.current) return;
    
    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://api.maptiler.com/maps/streets/style.json?key=QosEXQtxnqMVMLuCrptw',
      center: initialCenter,
      zoom: 12
    });

    // Get initial user location automatically
    getUserLocation();

    map.current.on('load', () => {
      if (!map.current) return;
      
      // Add popup functionality for vibes
      map.current.on('click', (e) => {
        const features = map.current?.queryRenderedFeatures(e.point, {
          layers: layerIdsRef.current
        });
        
        if (features && features.length > 0) {
          const vibe = vibes.find(v => v.id === features[0].properties?.id);
          if (vibe) {
            new maplibregl.Popup()
              .setLngLat([vibe.lng, vibe.lat])
              .setHTML(`
                <div style="padding: 8px;">
                  <strong>${vibe.title || vibe.type}</strong>
                  <p>Type: ${vibe.type}</p>
                </div>
              `)
              .addTo(map.current!);
          }
        }
      });
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
    };
  }, [initialCenter]);
  
  // Update vibes on the map when vibes state changes
  useEffect(() => {
    if (!map.current || !map.current.loaded()) return;
    
    // Clean up old sources and layers
    layerIdsRef.current.forEach(id => {
      if (map.current?.getLayer(id)) {
        map.current.removeLayer(id);
      }
    });
    
    sourceIdsRef.current.forEach(id => {
      if (map.current?.getSource(id)) {
        map.current.removeSource(id);
      }
    });
    
    layerIdsRef.current = [];
    sourceIdsRef.current = [];
    
    // Add vibe pulses
    vibes.forEach((vibe) => {
      const sourceId = `vibe-source-${vibe.id}`;
      const layerId = `vibe-layer-${vibe.id}`;
      
      sourceIdsRef.current.push(sourceId);
      layerIdsRef.current.push(layerId);

      // Create rainbow gradient for LGBTQIA+ vibes
      if (vibe.type.toLowerCase() === 'lgbtq' || vibe.type.toLowerCase() === 'lgbtqia+') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = 256;
          canvas.height = 256;
          
          const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
          gradient.addColorStop(0, 'violet');
          gradient.addColorStop(0.2, 'indigo');
          gradient.addColorStop(0.4, 'blue');
          gradient.addColorStop(0.6, 'green');
          gradient.addColorStop(0.8, 'yellow');
          gradient.addColorStop(1, 'red');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 256, 256);
          
          // Get the image data
          const imageData = ctx.getImageData(0, 0, 256, 256);
          
          // Create an ImageData object
          const imageDataObj = new ImageData(
            new Uint8ClampedArray(imageData.data), 
            imageData.width, 
            imageData.height
          );

          // Add the image to the map
          map.current?.addImage('rainbow-gradient', imageDataObj);
        }
      }

      map.current?.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {
            id: vibe.id,
            type: vibe.type
          },
          geometry: {
            type: 'Point',
            coordinates: [vibe.lng, vibe.lat]
          }
        }
      });

      // Add pulse effect layer
      map.current?.addLayer({
        id: layerId,
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'radius'],
            0, vibe.radius / 30,
            100, vibe.type.toLowerCase() === 'lgbtq' ? radiusKm / 5 : radiusKm / 8
          ],
          'circle-color': vibe.type.toLowerCase() === 'lgbtq' ? [
            'match',
            ['get', 'radius'],
            50, 'rgba(139,92,246,0.3)',
            vibe.color
          ] : vibe.color,
          'circle-opacity': [
            'interpolate',
            ['linear'],
            ['get', 'radius'],
            0, 0.5,
            100, 0
          ]
        }
      });

      // Animate the pulse
      let radius = 0;
      const animate = () => {
        if (!map.current) return;
        
        radius = (radius + 1) % 100;
        if (map.current?.getSource(sourceId)) {
          (map.current?.getSource(sourceId) as maplibregl.GeoJSONSource).setData({
            type: 'Feature',
            properties: {
              id: vibe.id,
              type: vibe.type,
              radius: radius
            },
            geometry: {
              type: 'Point',
              coordinates: [vibe.lng, vibe.lat]
            }
          });
        }
        requestAnimationFrame(animate);
      };
      animate();
    });
  }, [vibes, radiusKm]);
  
  // Set up real-time subscription for new vibes
  useEffect(() => {
    if (!userLocation) return;
    
    // Subscribe to new vibe reports
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
          const distanceDegLat = Math.abs(newVibeLat - userLocation[1]);
          const distanceDegLng = Math.abs(newVibeLng - userLocation[0]);
          
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
        .eq('id', id)
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

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full" />
      
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
