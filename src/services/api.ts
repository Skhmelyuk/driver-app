import axios from "axios";
import { DriverRegistrationData } from "@/types/auth.types";

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
    getProfile: () => authenticatedClient.get("/drivers/me/"),
    updateUserProfile: (data: {
      first_name?: string;
      last_name?: string;
      phone_number?: string;
      profile_image?: string;
      date_of_birth?: string;
    }) => authenticatedClient.patch("/users/update_profile/", data),
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
  };
};
