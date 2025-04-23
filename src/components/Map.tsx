
"use client";

import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

// Fix default icon issues with Leaflet
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

// Custom icons
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

// Helper component to set map view
const MapView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  
  return null;
};

// Helper component for pins
const PinMarker = ({ pin }: { pin: Pin }) => {
  const icon = pin.type === "sos" ? sosIcon : vibeIcon;
  
  return (
    <Marker
      key={pin.id}
      position={[pin.lat, pin.lng]}
      icon={icon}
    >
      <Popup>
        <strong>{pin.type.toUpperCase()}</strong>
        <br />
        {pin.description}
      </Popup>
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
          // Fallback coords (NYC)
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
        style={{ height: "100%", width: "100%" }}
        className="rounded-xl shadow-lg h-full w-full"
        zoom={13}
        center={[0, 0]} // Default center that will be overridden by MapView
      >
        <TileLayer url={darkTileLayer} />
        <MapView center={userPos} />
        
        {/* User position marker */}
        <Marker position={userPos}>
          <Popup>You are here</Popup>
        </Marker>
        
        {/* Display all pins */}
        {pins.map((pin) => (
          <PinMarker key={pin.id} pin={pin} />
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;
