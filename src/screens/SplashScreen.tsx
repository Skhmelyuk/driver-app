import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "@clerk/expo";
import * as SplashScreen from "expo-splash-screen";
import { Colors } from "@/constants/theme";

SplashScreen.preventAutoHideAsync();

interface SplashScreenProps {
  onFinish: (isAuthenticated: boolean) => void;
}

export function AppSplashScreen({ onFinish }: SplashScreenProps) {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded) {
      initialize();
    }
  }, [isLoaded]);

  const initialize = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } finally {
      await SplashScreen.hideAsync();
      onFinish(isSignedIn || false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.brandText}>VARD</Text>
        <View style={styles.carIcon}>
          <Text style={styles.carEmoji}>🚗</Text>
        </View>
        <Text style={styles.driverText}>DRIVER</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
  },
  brandText: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.white,
    letterSpacing: 2,
  },
  carIcon: {
    marginVertical: 16,
  },
  carEmoji: {
    fontSize: 48,
  },
  driverText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.white,
    letterSpacing: 4,
  },
});
