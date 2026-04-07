import { useAuth } from "@clerk/expo";
import { useEffect } from "react";
import { apiClient } from "@/services/api";

export const useAxiosInterceptors = () => {
  const { getToken } = useAuth();

  useEffect(() => {
    // Request interceptor - додає JWT токен
    const requestInterceptor = apiClient.interceptors.request.use(
      async (config) => {
        try {
          const token = await getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error("Помилка отримання токену", error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor - обробка помилок
    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        if (error.response) {
          const status = error.response.status;

          if (status === 401) {
            console.error("Unauthorized - access denied");
          } else if (status === 403) {
            console.error("Forbidden - access denied");
          } else if (status === 404) {
            console.error("Resource not found");
          } else if (status >= 500) {
            console.error("Server error:", error.response.data);
          }
        } else if (error.request) {
          console.error("No response from server");
        } else {
          console.error("Request setup error:", error.message);
        }

        return Promise.reject(error);
      },
    );

    // Очищення interceptors при unmount
    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, [getToken]);
};
