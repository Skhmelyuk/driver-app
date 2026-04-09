import React, { createContext, useContext, useState, useEffect } from "react";
import { Alert } from "react-native";
import { useAuth } from "@clerk/expo";
import { useDriverProfile } from "@/hooks/useDriverRegistration";
import { createAuthenticatedAPI } from "@/services/api";

interface DriverStatusContextType {
  isOnline: boolean;
  hasWorked: boolean;
  isSyncing: boolean;
  showStartModal: boolean;
  showStopModal: boolean;
  setShowStartModal: (show: boolean) => void;
  setShowStopModal: (show: boolean) => void;
  handleStartPress: () => void;
  handleConfirmStart: () => Promise<void>;
  handleConfirmStop: () => Promise<void>;
}

const DriverStatusContext = createContext<DriverStatusContextType | undefined>(undefined);

export function DriverStatusProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const { data: driverData, isLoading } = useDriverProfile();
  
  const [isOnline, setIsOnline] = useState(false);
  const [hasWorked, setHasWorked] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync state with backend data
  useEffect(() => {
    if (driverData) {
      const isCurrentlyOnline = driverData.availability === "online";
      setIsOnline(isCurrentlyOnline);
      if (isCurrentlyOnline) setHasWorked(true);
    }
  }, [driverData]);

  const syncAvailability = async (availability: "online" | "offline") => {
    setIsSyncing(true);
    try {
      const api = createAuthenticatedAPI(getToken);
      await api.setAvailability(availability);
      setIsOnline(availability === "online");
      if (availability === "online") setHasWorked(true);
    } catch (err) {
      Alert.alert("Помилка", "Не вдалося змінити статус. Перевірте з'єднання.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleStartPress = () => {
    const status = driverData?.status;
    if (status !== "approved") {
      Alert.alert(
        "Недоступно",
        status === "pending"
          ? "Ваш профіль ще на перевірці. Зачекайте підтвердження адміністратора."
          : "Ваш профіль не підтверджено.",
      );
      return;
    }

    if (isOnline) {
      setShowStopModal(true);
    } else {
      setShowStartModal(true);
    }
  };

  const handleConfirmStart = async () => {
    setShowStartModal(false);
    await syncAvailability("online");
  };

  const handleConfirmStop = async () => {
    setShowStopModal(false);
    await syncAvailability("offline");
  };

  return (
    <DriverStatusContext.Provider
      value={{
        isOnline,
        hasWorked,
        isSyncing,
        showStartModal,
        showStopModal,
        setShowStartModal,
        setShowStopModal,
        handleStartPress,
        handleConfirmStart,
        handleConfirmStop,
      }}
    >
      {children}
    </DriverStatusContext.Provider>
  );
}

export function useDriverStatus() {
  const context = useContext(DriverStatusContext);
  if (context === undefined) {
    throw new Error("useDriverStatus must be used within a DriverStatusProvider");
  }
  return context;
}
