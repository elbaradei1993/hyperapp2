
"use client";

import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

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

const Map = ({ vibes = [], initialCenter = [-74.006, 40.7128] }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://api.maptiler.com/maps/streets/style.json?key=QosEXQtxnqMVMLuCrptw',
      center: initialCenter,
      zoom: 12
    });

    map.current.on('load', () => {
      if (!map.current) return;
      
      // Add vibe pulses
      vibes.forEach((vibe, index) => {
        const sourceId = `vibe-source-${vibe.id}`;
        const layerId = `vibe-layer-${vibe.id}`;

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
              100, vibe.radius
            ],
            'circle-color': vibe.color,
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
  }, [vibes, initialCenter]);

  return (
    <div className="w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default Map;
