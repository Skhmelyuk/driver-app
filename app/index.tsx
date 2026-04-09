import { useState, useEffect } from "react";
import { Redirect } from "expo-router";
import { AppSplashScreen } from "@/screens/SplashScreen";
import { useAuth } from "@clerk/expo";
import { useDriverStore } from "@/store/driverStore";

export default function Index() {
  const [appReady, setAppReady] = useState(false);
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { checkAuthStatus, isLoading } = useDriverStore();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      checkAuthStatus(getToken);
    }
  }, [isLoaded, isSignedIn]);

  if (!appReady || !isLoaded || (isSignedIn && isLoading)) {
    return (
      <AppSplashScreen
        onFinish={() => {
          setAppReady(true);
        }}
      />
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(main)" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
