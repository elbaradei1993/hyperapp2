
import React from 'react';
import { Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface UserLocationMarkerProps {
  position: L.LatLng;
}

const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ position }) => {
  return (
    <>
      {/* User location accuracy circle */}
      <Circle 
        center={position}
        pathOptions={{ 
          color: 'blue', 
          fillColor: '#3388ff', 
          fillOpacity: 0.1,
          weight: 1
        }}
        radius={200}
      />
      
      {/* User location marker */}
      <Marker position={position}>
        <Popup>
          <div className="p-1">
            <strong>Your Location</strong>
            <p className="text-xs text-muted-foreground">
              Lat: {position.lat.toFixed(6)}, Lng: {position.lng.toFixed(6)}
            </p>
          </div>
        </Popup>
      </Marker>
    </>
  );
};

export default UserLocationMarker;
