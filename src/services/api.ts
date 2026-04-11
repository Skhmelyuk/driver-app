import axios from "axios";
import type { Driver, DriverRegistrationData } from "@/types/auth.types";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const createAuthenticatedAPI = (
  getToken: () => Promise<string | null>,
) => {
  const authenticatedClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  authenticatedClient.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return {
    registerDriver: (data: DriverRegistrationData) =>
      authenticatedClient.post("/drivers/register/", data),
    getProfile: async (): Promise<Driver | null> => {
      try {
        const response = await authenticatedClient.get<Driver>("/drivers/me/");
        return response.data;
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          (error.response?.status === 404 || error.response?.status === 403)
        ) {
          return null;
        }
        throw error;
      }
    },
    updateUserProfile: async (userData: {
      first_name?: string;
      last_name?: string;
      phone_number?: string;
      profile_image?: string;
      date_of_birth?: string;
    }) => {
      return authenticatedClient.patch("/users/update_profile/", userData);
    },
    updateDriverProfile: async (driverData: {
      vehicle_plate?: string;
      license_expiry?: string;
      vehicle_type?: string;
      vehicle_make?: string;
      vehicle_model?: string;
      vehicle_year?: number;
      vehicle_color?: string;
    }) => {
      return authenticatedClient.patch("/drivers/update_profile/", driverData);
    },
    uploadDriverDocument: (formData: FormData) =>
      authenticatedClient.post("/drivers/documents/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    updateLocation: (latitude: number, longitude: number) =>
      authenticatedClient.post("/drivers/update_location/", {
        latitude,
        longitude,
      }),
    setAvailability: (availability: string) =>
      authenticatedClient.patch("/drivers/availability/", { availability }),
    getRatingStats: () => authenticatedClient.get("/drivers/rating_stats/"),
    getWalletStats: (date?: string) =>
      authenticatedClient.get("/drivers/wallet_stats/", {
        params: date ? { date } : undefined,
      }),
    requestWithdrawal: () =>
      authenticatedClient.post("/drivers/request_withdrawal/"),
    getWithdrawalHistory: () =>
      authenticatedClient.get("/drivers/withdrawal_history/"),
    savePayoutCard: (card_number: string) =>
      authenticatedClient.patch("/drivers/payout_card/", { card_number }),
  };
};
