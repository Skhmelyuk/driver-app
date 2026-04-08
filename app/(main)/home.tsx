import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useDriverProfile } from "@/hooks/useDriverRegistration";
import { ActivityIndicator } from "react-native";

export default function HomeScreen() {
  const { signOut } = useAuth();
  const router = useRouter();
  const { data: driverData, isLoading } = useDriverProfile();

  React.useEffect(() => {
    if (!isLoading && driverData === null) {
      router.replace("/(main)/profile" as any);
    }
  }, [driverData, isLoading, router]);

  const handleOpenProfile = () => {
    router.push("/(main)/profile" as any);
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/welcome" as any);
  };

  if (isLoading || driverData === null) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#2F80ED" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver Home</Text>

      <TouchableOpacity
        style={styles.profileButton}
        onPress={handleOpenProfile}
      >
        <Text style={styles.profileText}>Відкрити профіль (тест)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Вийти з акаунту (Тимчасово)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
  },
  profileButton: {
    backgroundColor: "#2F80ED",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  profileText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
