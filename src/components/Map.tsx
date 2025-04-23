
"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
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

const LocateControl = () => {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;
    map.locate({ setView: true, maxZoom: 15 });
    
    function onLocationFound(e: L.LocationEvent) {
      map.setView(e.latlng, 15);
    }
    
    map.on("locationfound", onLocationFound);
    
    return () => {
      map.off("locationfound", onLocationFound);
    };
  }, [map]);

  return null;
};

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

  // Explicitly type userPos as a LatLngExpression for Leaflet
  const position = userPos as L.LatLngExpression;
  
  return (
    <div className="h-full w-full">
      <MapContainer
        className="rounded-xl shadow-lg"
        style={{ height: "100%", width: "100%" }}
        center={position}
        zoom={13}
        scrollWheelZoom={true}
      >
        <TileLayer url={darkTileLayer} />
        <LocateControl />
        
        <Marker position={position}>
          <Popup>You are here</Popup>
        </Marker>
        
        <Circle
          center={position}
          pathOptions={{ color: "blue", fillColor: "blue", fillOpacity: 0.1 }}
          radius={radiusKm * 1000}
        />
        
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            position={[pin.lat, pin.lng] as L.LatLngExpression}
            icon={pin.type === "sos" ? sosIcon : vibeIcon}
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
  );
};

export default Map;
