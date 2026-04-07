import { create } from "zustand";
import { Driver } from "@/types/auth.types";
import { createAuthenticatedAPI } from "@/services/api";

interface DriverState {
  driver: Driver | null;
  isLoading: boolean;

  // Actions
  setDriver: (driver: Driver | null) => void;
  checkAuthStatus: (getToken: () => Promise<string | null>) => Promise<void>;
  clearDriver: () => void;
}

export const useDriverStore = create<DriverState>((set, get) => ({
  driver: null,
  isLoading: true,

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
      const response = await api.getProfile();
      set({ driver: response.data });
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
}));
