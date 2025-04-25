
"use client";

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Compass } from 'lucide-react';

interface Vibe {
  id: string;
  lat: number;
  lng: number;
  type: string;
  radius: number;
  color: string;
}

interface MapProps {
  radiusKm?: number;
  vibes?: Vibe[];
  initialCenter?: [number, number];
}

const Map = ({ vibes = [], initialCenter = [-74.006, 40.7128], radiusKm = 10 }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

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
          }
        },
        (error) => {
          console.error('Error getting user location:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
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

    // Get initial user location
    getUserLocation();

    map.current.on('load', () => {
      if (!map.current) return;
      
      // Add vibe pulses
      vibes.forEach((vibe) => {
        const sourceId = `vibe-source-${vibe.id}`;
        const layerId = `vibe-layer-${vibe.id}`;

        // Create rainbow gradient for LGBTQIA+ vibes
        if (vibe.type === 'lgbtq') {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
            gradient.addColorStop(0, 'violet');
            gradient.addColorStop(0.2, 'indigo');
            gradient.addColorStop(0.4, 'blue');
            gradient.addColorStop(0.6, 'green');
            gradient.addColorStop(0.8, 'yellow');
            gradient.addColorStop(1, 'red');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 256, 256);
            
            map.current?.addImage('rainbow-gradient', canvas);
          }
        }

        map.current?.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
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
              100, vibe.type === 'lgbtq' ? radiusKm / 5 : radiusKm / 10
            ],
            'circle-color': vibe.type === 'lgbtq' ? [
              'match',
              ['get', 'radius'],
              50, 'rgba(139,92,246,0.3)',
              vibe.color
            ] : vibe.color,
            'circle-opacity': [
              'interpolate',
              ['linear'],
              ['get', 'radius'],
              0, 0.4,
              100, 0
            ]
          }
        });

        // Animate the pulse
        let radius = 0;
        const animate = () => {
          radius = (radius + 1) % 100;
          if (map.current?.getSource(sourceId)) {
            (map.current?.getSource(sourceId) as maplibregl.GeoJSONSource).setData({
              type: 'Feature',
              properties: {
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
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
    };
  }, [vibes, initialCenter, radiusKm]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* User location button */}
      <button 
        onClick={getUserLocation}
        className="absolute bottom-4 right-4 bg-primary text-white p-2 rounded-full shadow-lg z-10 hover:bg-primary/80 transition-colors"
        aria-label="Go to my location"
      >
        <Compass className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Map;
