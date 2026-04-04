import { Stack } from "expo-router";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <Stack screenOptions={{ headerShown: false }} />
      </ClerkProvider>
    </QueryClientProvider>
  );
}
