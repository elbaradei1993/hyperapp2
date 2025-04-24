
"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Locate } from "lucide-react";
import { Button } from "./ui/button";

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

const DEFAULT_CENTER: [number, number] = [40.73061, -73.935242];
const MAPTILER_KEY = "QosEXQtxnqMVMLuCrptw";
const MAPTILER_STYLE = `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`;

const Map = ({ pins = [], initialCenter }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const mapInitializedRef = useRef<boolean>(false);

  const centerOnUser = () => {
    if (navigator.geolocation && mapRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCenter: [number, number] = [
            position.coords.longitude,
            position.coords.latitude,
          ];
          setUserLocation(newCenter);
          mapRef.current?.flyTo({
            center: newCenter,
            zoom: 15,
            duration: 2000,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      if (!mapContainer.current || !isMounted || mapInitializedRef.current) return;

      // Get user location first
      try {
        await new Promise<void>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              if (isMounted) {
                setUserLocation([
                  position.coords.longitude,
                  position.coords.latitude,
                ]);
              }
              resolve();
            },
            (error) => {
              console.error("Error getting location:", error);
              resolve(); // Resolve anyway to continue map initialization
            }
          );
        });
      } catch (error) {
        console.error("Failed to get user location:", error);
      }

      // Initialize map
      const initialLocation = userLocation || initialCenter || DEFAULT_CENTER;

      // Only attempt to remove the map if it exists
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      if (!mapContainer.current || !isMounted) return;

      try {
        const map = new maplibregl.Map({
          container: mapContainer.current,
          style: MAPTILER_STYLE,
          center: initialLocation,
          zoom: 13,
          attributionControl: true,
        });

        mapRef.current = map;
        mapInitializedRef.current = true;

        // Add navigation control
        map.addControl(new maplibregl.NavigationControl(), "top-right");

        // Add user location marker
        if (userLocation) {
          new maplibregl.Marker({ color: "#2563eb" })
            .setLngLat(userLocation)
            .setPopup(new maplibregl.Popup({ offset: 20 }).setText("You are here"))
            .addTo(map);
        }

        // Add other pins
        pins.forEach((pin) => {
          const iconUrl =
            pin.type === "sos"
              ? "https://cdn-icons-png.flaticon.com/512/564/564619.png"
              : "https://cdn-icons-png.flaticon.com/512/833/833472.png";
          const markerDiv = document.createElement("div");
          markerDiv.innerHTML = `<img src="${iconUrl}" alt="pin" style="width:30px;height:30px;" />`;

          new maplibregl.Marker({ element: markerDiv })
            .setLngLat([pin.lng, pin.lat])
            .setPopup(
              new maplibregl.Popup({ offset: 20 }).setHTML(
                `<strong>${pin.type.toUpperCase()}</strong><br/>${pin.description || ""}`
              )
            )
            .addTo(map);
        });
      } catch (error) {
        console.error("Error initializing map:", error);
        mapInitializedRef.current = false;
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      // Add a safety check before removing the map
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (error) {
          console.error("Error removing map:", error);
        }
        mapRef.current = null;
      }
    };
  }, [pins, initialCenter]);

  // Re-initialize map if container changes
  useEffect(() => {
    if (mapContainer.current && !mapInitializedRef.current) {
      // Reset the initialization flag
      mapInitializedRef.current = false;
    }
  }, [mapContainer.current]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      {/* Recenter button */}
      <Button
        onClick={centerOnUser}
        className="absolute bottom-4 right-4 bg-primary/90 hover:bg-primary shadow-lg backdrop-blur-sm z-10"
      >
        <Locate className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default Map;
