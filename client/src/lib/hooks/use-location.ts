import { useState, useEffect, useCallback } from "react";

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;


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

  const getAddressFromCoords = async (
      lat: number,
      lng: number
  ): Promise<string | undefined> => {
    try {
      console.log("🔑 Google key:", import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
      const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as {
        results?: { formatted_address: string }[];
        status: string;
      };
      if (data.status !== "OK" || !data.results?.length) {
        console.warn("Geocode lookup failed:", data.status);
        return undefined;
      }
      return data.results[0].formatted_address;
    } catch (err) {
      console.error("Error reverse-geocoding coords:", err);
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

    useEffect(() => {
        // Automatically get location when the component mounts
        getLocation();
    }, [getLocation]);

  return { location, error, loading, getLocation };
}
