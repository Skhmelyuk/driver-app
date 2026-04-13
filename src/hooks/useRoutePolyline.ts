import { useState, useEffect } from "react";

interface LatLng {
  latitude: number;
  longitude: number;
}

const GOOGLE_MAPS_API_KEY = "AIzaSyBj84ACv8VbdOky7lTk8nNDkcqKQZ3KSIU";

function decodePolyline(encoded: string): LatLng[] {
  const points: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }

  return points;
}

export function useRoutePolyline(
  origin: LatLng | null,
  destination: LatLng | null,
  enabled: boolean,
) {
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);

  useEffect(() => {
    if (!enabled || !origin || !destination) {
      setRouteCoords([]);
      return;
    }

    const fetchRoute = async () => {
      try {
        const url =
          `https://maps.googleapis.com/maps/api/directions/json` +
          `?origin=${origin.latitude},${origin.longitude}` +
          `&destination=${destination.latitude},${destination.longitude}` +
          `&mode=driving` +
          `&alternatives=false` +
          `&units=metric` +
          `&key=${GOOGLE_MAPS_API_KEY}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.routes?.length > 0) {
          const legs = data.routes[0].legs ?? [];
          const allPoints: LatLng[] = [];
          for (const leg of legs) {
            for (const step of leg.steps ?? []) {
              const stepPoints = decodePolyline(step.polyline.points);
              allPoints.push(...stepPoints);
            }
          }
          if (allPoints.length > 0) {
            setRouteCoords(allPoints);
          }
        }
      } catch {
        // fallback — straight line stays
      }
    };

    fetchRoute();
  }, [
    origin?.latitude,
    origin?.longitude,
    destination?.latitude,
    destination?.longitude,
    enabled,
  ]);

  return routeCoords;
}
