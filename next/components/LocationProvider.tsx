"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface LocationContextType {
  location: { latitude: number; longitude: number } | null;
  locationName: string | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_NOMINATIM_URL}/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            {
              headers: {
                "User-Agent": "local-link-app",
              },
            }
          );
          const data = await response.json();
          const name =
            data.display_name ||
            `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setLocationName(name);
        } catch (err) {
          console.error("Failed to get location name:", err);
          setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }

        setIsLoading(false);
      },
      (error) => {
        setError(error.message);
        setIsLoading(false);

        const fallbackLat = 28.4595;
        const fallbackLng = 77.0266;
        setLocation({ latitude: fallbackLat, longitude: fallbackLng });
        setLocationName("Location not Detected");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return (
    <LocationContext.Provider
      value={{
        location,
        locationName,
        isLoading,
        error,
        requestLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}
