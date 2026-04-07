import { Stack } from "expo-router";
import { AppProvider } from "@/providers/AppProvider";
import { useAxiosInterceptors } from "@/hooks/useAxiosInterceptors";

function RootLayoutNav() {
  // Initialize axios interceptors inside the provider context so useAuth works
  useAxiosInterceptors();

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AppProvider>
      <RootLayoutNav />
    </AppProvider>
  );
}
