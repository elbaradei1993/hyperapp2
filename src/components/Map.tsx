
"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Circle } from "react-leaflet";

// Fix default icon issues with Leaflet + Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const darkTileLayer = "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png";

type PinType = "sos" | "vibe";

interface Pin {
  id: string;
  lat: number;
  lng: number;
  type: PinType;
  description: string;
}

interface MapProps {
  radiusKm?: number;
  pins?: Pin[];
  initialCenter?: [number, number];
}

// Custom icons with proper typing
const sosIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/564/564619.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const vibeIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/833/833472.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

// Helper component to handle map view setting
const MapView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  
  return null;
};

// A wrapper for Circle component to fix TypeScript issues
const CircleMarker = ({ 
  center, 
  radius, 
  pathOptions 
}: { 
  center: [number, number]; 
  radius: number; 
  pathOptions: { color: string; fillColor: string; fillOpacity: number } 
}) => {
  return (
    // @ts-ignore - type definitions in react-leaflet are incomplete
    <Circle center={center} radius={radius} pathOptions={pathOptions} />
  );
};

// A wrapper for Marker component to fix TypeScript issues
const PinMarker = ({
  position,
  icon,
  children
}: {
  position: [number, number];
  icon: L.Icon;
  children: React.ReactNode;
}) => {
  return (
    // @ts-ignore - type definitions in react-leaflet are incomplete
    <Marker position={position} icon={icon}>
      {children}
    </Marker>
  );
};

const Map = ({ radiusKm = 10, pins = [], initialCenter }: MapProps) => {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (initialCenter) {
      setUserPos(initialCenter);
      return;
    }
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPos([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          // Fallback coords
          setUserPos([40.73061, -73.935242]);
        }
      );
    } else {
      setUserPos([40.73061, -73.935242]);
    }
  }, [initialCenter]);

  if (!userPos) {
    return <div className="h-full w-full bg-gray-200 rounded-xl flex items-center justify-center">Loading map...</div>;
  }

  return (
    <div className="h-full w-full">
      <MapContainer
        className="rounded-xl shadow-lg h-full w-full"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url={darkTileLayer} />
        
        <MapView center={userPos} />
        
        <PinMarker position={userPos} icon={new L.Icon.Default()}>
          <Popup>You are here</Popup>
        </PinMarker>
        
        <CircleMarker
          center={userPos}
          pathOptions={{ color: "blue", fillColor: "blue", fillOpacity: 0.1 }}
          radius={radiusKm * 1000}
        />
        
        {pins.map((pin) => (
          <PinMarker
            key={pin.id}
            position={[pin.lat, pin.lng]}
            icon={pin.type === "sos" ? sosIcon : vibeIcon}
          >
            <Popup>
              <strong>{pin.type.toUpperCase()}</strong>
              <br />
              {pin.description}
            </Popup>
          </PinMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;
