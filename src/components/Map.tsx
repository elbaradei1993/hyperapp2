
"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

// Map location control as a separate component
const LocateControl = () => {
  // Instead of using useMap and context, we'll use a simpler approach
  // This helps avoid the context consumer errors
  useEffect(() => {
    // Handle location finding outside of the context consumer
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Located user at:", position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.log("Geolocation error:", error.message);
        }
      );
    }
  }, []);

  return null;
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

  // Using a simpler rendering approach to avoid Context Consumer issues
  return (
    <div className="h-full w-full">
      <div className="h-full w-full rounded-xl">
        {/* Using the MapContainer with only necessary props */}
        <MapContainer
          className="rounded-xl shadow-lg h-full w-full"
          whenCreated={(mapInstance) => {
            // Set the view manually to avoid using center prop
            mapInstance.setView(userPos, 13);
            // Enable scroll wheel zoom
            mapInstance.scrollWheelZoom.enable();
          }}
        >
          <TileLayer url={darkTileLayer} />
          
          <LocateControl />
          
          {/* Manually add marker with proper typing */}
          <Marker 
            position={userPos as [number, number]} 
          >
            <Popup>You are here</Popup>
          </Marker>
          
          {/* Add circle with proper props */}
          <Circle
            center={userPos as [number, number]}
            pathOptions={{ color: "blue", fillColor: "blue", fillOpacity: 0.1 }}
            radius={radiusKm * 1000}
          />
          
          {/* Map all pins with proper typing */}
          {pins.map((pin) => (
            <Marker
              key={pin.id}
              position={[pin.lat, pin.lng] as [number, number]}
              icon={(pin.type === "sos" ? sosIcon : vibeIcon) as unknown as L.Icon}
            >
              <Popup>
                <strong>{pin.type.toUpperCase()}</strong>
                <br />
                {pin.description}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default Map;
