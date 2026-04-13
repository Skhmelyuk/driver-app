import React, { createContext, useContext, useState, useCallback } from "react";

interface RideRequestContextValue {
  hasRideRequest: boolean;
  setHasRideRequest: (v: boolean) => void;
  onRejectRide: () => void;
  registerRejectHandler: (fn: () => void) => void;
}

const RideRequestContext = createContext<RideRequestContextValue>({
  hasRideRequest: false,
  setHasRideRequest: () => {},
  onRejectRide: () => {},
  registerRejectHandler: () => {},
});

export function RideRequestProvider({ children }: { children: React.ReactNode }) {
  const [hasRideRequest, setHasRideRequest] = useState(false);
  const rejectHandlerRef = React.useRef<(() => void) | null>(null);

  const registerRejectHandler = useCallback((fn: () => void) => {
    rejectHandlerRef.current = fn;
  }, []);

  const onRejectRide = useCallback(() => {
    rejectHandlerRef.current?.();
  }, []);

  return (
    <RideRequestContext.Provider
      value={{ hasRideRequest, setHasRideRequest, onRejectRide, registerRejectHandler }}
    >
      {children}
    </RideRequestContext.Provider>
  );
}

export function useRideRequest() {
  return useContext(RideRequestContext);
}
