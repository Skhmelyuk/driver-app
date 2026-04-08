import { useState, useEffect } from "react";
import * as Location from "expo-location";

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export function useLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [address, setAddress] = useState<string>("");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === "granted");

      if (status !== "granted") return;

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      };
      setLocation(coords);

      // Reverse geocode for city name
      try {
        const [geo] = await Location.reverseGeocodeAsync(coords);
        if (geo) {
          const city = geo.city || geo.subregion || geo.region || "Невідоме місто";
          setAddress(city.toUpperCase());
        }
      } catch (_) {
        setAddress("МОЄ МІСТО");
      }
    })();
  }, []);

  return { location, address, hasPermission };
}
