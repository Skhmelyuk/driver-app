import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleOpenProfile = () => {
    router.push("/(main)/profile" as any);
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/welcome" as any);
  };

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
