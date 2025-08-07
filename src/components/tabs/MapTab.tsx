import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import L from 'leaflet';
import { useIsMobile } from '@/hooks/use-mobile';
import VibeMarker from '@/components/map/VibeMarker';
import UserLocationMarker from '@/components/map/UserLocationMarker';
import { useVibeData } from '@/hooks/useVibeData';
import { useAccurateLocation } from '@/hooks/useAccurateLocation';

// Fix Leaflet icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Location finder component
function LocationMarker() {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMap();

  useEffect(() => {
    // Check for stored location first
    const storedLocation = sessionStorage.getItem('mapLocation');
    if (storedLocation) {
      try {
        const location = JSON.parse(storedLocation);
        const latLng = L.latLng(location.lat, location.lng);
        setPosition(latLng);
        map.setView([location.lat, location.lng], location.zoom || 16);
        sessionStorage.removeItem('mapLocation'); // Clear after using
        return;
      } catch (error) {
        console.error('Error parsing stored location:', error);
      }
    }

    // Otherwise get current location
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    });
  }, [map]);

  return position === null ? null : (
    <UserLocationMarker position={position} />
  );
}

const MapTab = () => {
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [mapZoom, setMapZoom] = useState(14);
  const isMobile = useIsMobile();

  // Use optimized hooks for data and location
  const { vibes, loading: vibesLoading } = useVibeData({ limit: 100, enableRealtime: true });
  const { position: userLocation, loading: locationLoading, error: locationError } = useAccurateLocation({
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 300000
  });

  // Memoize filtered vibes for better performance
  const validVibes = useMemo(() => {
    return vibes.filter(vibe => {
      const lat = parseFloat(vibe.latitude);
      const lng = parseFloat(vibe.longitude);
      return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    });
  }, [vibes]);

  useEffect(() => {
    // Check for stored location from other pages
    const storedLocation = sessionStorage.getItem('mapLocation');
    if (storedLocation) {
      try {
        const location = JSON.parse(storedLocation);
        setMapCenter([location.lat, location.lng]);
        setMapZoom(location.zoom || 16);
        sessionStorage.removeItem('mapLocation'); // Clear after using
        return;
      } catch (error) {
        console.error('Error parsing stored location:', error);
      }
    }

    // Set map center to user location when available
    if (userLocation && !mapCenter) {
      setMapCenter(userLocation);
    }
  }, [userLocation, mapCenter]);

  if (vibesLoading || locationLoading || !mapCenter) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">
          {locationError ? "Using default location..." : "Loading map..."}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-border/40 relative">
      <MapContainer 
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        style={{ height: isMobile ? '70vh' : '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <LocationMarker />
        
        {validVibes.map((vibe) => {
          const lat = parseFloat(vibe.latitude);
          const lng = parseFloat(vibe.longitude);
          
          return (
            <VibeMarker 
              key={vibe.id}
              vibe={vibe}
              position={[lat, lng]}
            />
          );
        })}
      </MapContainer>
      
      {/* Current Location Button */}
      <button
        onClick={() => {
          if (userLocation) {
            setMapCenter(userLocation);
          }
        }}
        className="absolute bottom-4 right-4 z-10 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors animate-fade-in"
        title="Go to my location"
      >
        <MapPin size={20} />
      </button>
    </div>
  );
};

export default MapTab;
