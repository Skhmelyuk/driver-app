import React from "react";
import { ClerkProvider } from "@clerk/expo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { DriverStatusProvider } from "./DriverStatusProvider";
import { RideRequestProvider } from "./RideRequestProvider";

const queryClient = new QueryClient();

interface AppProviderProps {
  children: React.ReactNode;
}

// Token cache for Clerk
const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`${key} was used 🔐 \n`);
      } else {
        console.log("No values stored under key: " + key);
      }
      return item;
    } catch (error) {
      console.error("SecureStore get item error: ", error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export function AppProvider({ children }: AppProviderProps) {
  const publishableKey =
    Constants.expoConfig?.extra?.clerkPublishableKey ||
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error("Missing Clerk Publishable Key");
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <DriverStatusProvider>
          <RideRequestProvider>{children}</RideRequestProvider>
        </DriverStatusProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
