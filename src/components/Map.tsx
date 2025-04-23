
"use client";

import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

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

const DEFAULT_CENTER: [number, number] = [40.73061, -73.935242]; // NYC fallback

const Map = ({ pins = [], initialCenter }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    let mapCenter = DEFAULT_CENTER;

    const getUserLocation = () =>
      new Promise<[number, number]>((resolve) => {
        if (initialCenter) {
          resolve(initialCenter);
        } else if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve([pos.coords.latitude, pos.coords.longitude]),
            () => resolve(DEFAULT_CENTER)
          );
        } else {
          resolve(DEFAULT_CENTER);
        }
      });

    getUserLocation().then((center) => {
      // Remove duplicate maps if remounting
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      mapRef.current = new maplibregl.Map({
        container: mapContainer.current!,
        style: "https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json",
        center: [center[1], center[0]],
        zoom: 13,
        attributionControl: false,
      });

      // Add user marker
      const userMarker = new maplibregl.Marker({ color: "#2563eb" })
        .setLngLat([center[1], center[0]])
        .setPopup(
          new maplibregl.Popup({ offset: 20 }).setText("You are here")
        )
        .addTo(mapRef.current!);

      // Add any pins
      pins.forEach((pin) => {
        const iconUrl = pin.type === "sos"
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
          .addTo(mapRef.current!);
      });

      // Clean up
      return () => {
        mapRef.current?.remove();
        mapRef.current = null;
      };
    });

    // Cleanup on unmount
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line
  }, [pins, initialCenter]);

  return (
    <div ref={mapContainer} className="w-full h-full rounded-xl shadow-lg overflow-hidden" />
  );
};

export default Map;

