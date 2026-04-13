import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@clerk/expo";
import { createAuthenticatedAPI } from "@/services/api";
import type { ActiveRide } from "@/types/ride.types";

const POLL_INTERVAL_MS = 4000;

export function useActiveRide(isOnline: boolean) {
  const { getToken } = useAuth();
  const [activeRide, setActiveRide] = useState<ActiveRide | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchActiveRide = useCallback(async () => {
    if (!isOnline) return;
    try {
      const api = createAuthenticatedAPI(getToken);
      const ride = await api.getActiveRideForDriver();
      setActiveRide(ride);
    } catch {
      // Non-critical: silently ignore network errors during polling
    }
  }, [getToken, isOnline]);

  useEffect(() => {
    if (!isOnline) {
      setActiveRide(null);
      return;
    }

    // Fetch immediately on mount / going online
    setIsLoading(true);
    fetchActiveRide().finally(() => setIsLoading(false));

    intervalRef.current = setInterval(fetchActiveRide, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isOnline, fetchActiveRide]);

  const refreshNow = useCallback(() => {
    fetchActiveRide();
  }, [fetchActiveRide]);

  return { activeRide, setActiveRide, isLoading, refreshNow };
}
