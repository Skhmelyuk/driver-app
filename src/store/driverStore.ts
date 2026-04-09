import { create } from "zustand";
import { Driver } from "@/types/auth.types";
import { createAuthenticatedAPI } from "@/services/api";

interface DriverRegistrationStoreData {
  firstName: string;
  lastName: string;
  phone: string;
}

interface DriverState {
  driver: Driver | null;
  isLoading: boolean;
  registrationData: DriverRegistrationStoreData | null;

  // Actions
  setDriver: (driver: Driver | null) => void;
  checkAuthStatus: (getToken: () => Promise<string | null>) => Promise<void>;
  clearDriver: () => void;
  setRegistrationData: (data: DriverRegistrationStoreData | null) => void;
  clearRegistrationData: () => void;
}

export const useDriverStore = create<DriverState>((set, get) => ({
  driver: null,
  isLoading: true,
  registrationData: null,

  setDriver: (driver) => {
    set({ driver });
  },

  checkAuthStatus: async (getToken) => {
    try {
      if (!getToken) {
        set({ driver: null });
        return;
      }

      const api = createAuthenticatedAPI(getToken);
      const driver = await api.getProfile();
      set({ driver });
    } catch (error) {
      console.error("Auth check failed:", error);
      get().clearDriver();
    } finally {
      set({ isLoading: false });
    }
  },

  clearDriver: () => {
    set({ driver: null });
  },

  setRegistrationData: (data) => {
    set({ registrationData: data });
  },

  clearRegistrationData: () => {
    set({ registrationData: null });
  },
}));
