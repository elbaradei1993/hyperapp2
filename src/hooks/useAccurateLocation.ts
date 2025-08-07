import { useState, useEffect, useCallback } from 'react';

interface LocationState {
  position: [number, number] | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
}

interface UseAccurateLocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
}

export const useAccurateLocation = (options: UseAccurateLocationOptions = {}) => {
  const {
    enableHighAccuracy = true,
    timeout = 15000,
    maximumAge = 300000, // 5 minutes
    watchPosition = false
  } = options;

  const [locationState, setLocationState] = useState<LocationState>({
    position: null,
    accuracy: null,
    loading: true,
    error: null
  });

  const [watchId, setWatchId] = useState<number | null>(null);

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    const coords = position.coords;
    setLocationState({
      position: [coords.latitude, coords.longitude],
      accuracy: coords.accuracy,
      loading: false,
      error: null
    });
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    console.error("Geolocation error:", error);
    let errorMessage = "Could not get your location";
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = "Location access denied by user";
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = "Location information unavailable";
        break;
      case error.TIMEOUT:
        errorMessage = "Location request timed out";
        break;
    }

    setLocationState({
      position: [30.0444, 31.2357], // Default to Cairo, Egypt
      accuracy: null,
      loading: false,
      error: errorMessage
    });
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationState({
        position: [30.0444, 31.2357], // Default to Cairo, Egypt
        accuracy: null,
        loading: false,
        error: "Geolocation is not supported by this browser"
      });
      return;
    }

    setLocationState(prev => ({ ...prev, loading: true, error: null }));

    const options: PositionOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge
    };

    if (watchPosition) {
      const id = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        options
      );
      setWatchId(id);
    } else {
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        options
      );
    }
  }, [enableHighAccuracy, timeout, maximumAge, watchPosition, handleSuccess, handleError]);

  useEffect(() => {
    requestLocation();

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [requestLocation, watchId]);

  const clearWatch = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  return {
    ...locationState,
    requestLocation,
    clearWatch
  };
};