import { useState, useEffect, useCallback } from "react";

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
}

interface LocationHook {
  location: LocationData | null;
  error: string | null;
  loading: boolean;
  getLocation: () => void;
}

export function useLocation(): LocationHook {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Get address using reverse geocoding
  const getAddressFromCoords = async (lat: number, lng: number): Promise<string | undefined> => {
    try {
      // In a real application, you would use a geocoding service like Google Maps, Mapbox, etc.
      // For this demo, we'll just return a mock address
      return "1234 Example Street, City, Country";
    } catch (error) {
      console.error("Error getting address:", error);
      return undefined;
    }
  };

  const getLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const address = await getAddressFromCoords(latitude, longitude);
        
        setLocation({
          latitude,
          longitude,
          accuracy,
          address
        });
        setLoading(false);
      },
      (err) => {
        setError(
          err.code === 1
            ? "Location access denied. Please enable location services."
            : err.code === 2
            ? "Location unavailable. Please try again."
            : err.code === 3
            ? "Location request timed out. Please try again."
            : "An unknown error occurred"
        );
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  return { location, error, loading, getLocation };
}
