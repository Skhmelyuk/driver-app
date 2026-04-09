import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useAuth } from "@clerk/expo";

import { useDriverProfile } from "@/hooks/useDriverRegistration";
import { useLocation } from "@/hooks/useLocation";
import { ExploreNearbyIcon } from "@/components/icons/ExploreNearbyIcon";
import { NavigationIcon } from "@/components/icons/NavigationIcon";
import { SearchIcon } from "@/components/icons/SearchIcon";
import { NotificationIcon } from "@/components/icons/NotificationIcon";
import { useDriverStatus } from "@/providers/DriverStatusProvider";

const PRIMARY = "#7900FF";

export default function HomeScreen() {
  const router = useRouter();
  const { data: driverData, isLoading } = useDriverProfile();
  const { location, address } = useLocation();
  const mapRef = useRef<MapView>(null);
  const { isOnline } = useDriverStatus();

  // Redirect to profile if no driver record exists
  useEffect(() => {
    if (!isLoading && driverData === null) {
      router.replace("/(main)/profile" as any);
    }
  }, [driverData, isLoading, router]);

  // Center map when location is received
  useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        800,
      );
    }
  }, [location]);

  const handleCenterMap = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        600,
      );
    }
  };

  if (isLoading || driverData === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  const driverStatus = driverData?.status;
  const isPending = driverStatus === "pending";

  const initialRegion = {
    latitude: location?.latitude || 48.6208,
    longitude: location?.longitude || 22.2879,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {location && (
          <>
            {/* Car Marker */}
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
              zIndex={1}
              image={require("../../../assets/images/car-driver.png")}
            />
          </>
        )}
      </MapView>

      {/* TOP HEADER */}
      <SafeAreaView style={styles.headerWrapper} edges={["top"]}>
        <View style={styles.headerRow}>
          <View style={styles.locationPill}>
            <ExploreNearbyIcon size={20} color={PRIMARY} />
            <Text
              style={[
                styles.locationText,
                {
                  fontWeight: "700",
                  textTransform: "uppercase",
                  color: "#1B1B1B",
                },
              ]}
              numberOfLines={1}
            >
              {address || "УЖГОРОД"}
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
              <SearchIcon size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
              <NotificationIcon size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {isPending && (
          <View style={styles.statusBanner}>
            <Text style={{ fontSize: 14 }}>⏳</Text>
            <Text style={styles.statusBannerText}>
              Ваш профіль на перевірці. Зачекайте підтвердження.
            </Text>
          </View>
        )}
      </SafeAreaView>

      {/* Center button */}
      <TouchableOpacity
        style={[styles.centerBtn, { bottom: 140 }]}
        onPress={handleCenterMap}
        activeOpacity={0.8}
      >
        <NavigationIcon size={24} color={PRIMARY} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  map: { ...StyleSheet.absoluteFillObject },

  // Header
  headerWrapper: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  locationPill: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingVertical: 10,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  locationText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1f1f1f",
    letterSpacing: 0.5,
  },
  statusBanner: {
    marginHorizontal: 16,
    marginTop: 4,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  statusBannerText: {
    flex: 1,
    fontSize: 12,
    color: "#b45309",
    fontWeight: "500",
  },

  // Center button
  centerBtn: {
    position: "absolute",
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
});
