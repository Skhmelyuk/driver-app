import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@clerk/expo";

import { useDriverProfile } from "@/hooks/useDriverRegistration";
import { useLocation } from "@/hooks/useLocation";
import { useActiveRide } from "@/hooks/useActiveRide";
import { ExploreNearbyIcon } from "@/components/icons/ExploreNearbyIcon";
import { NavigationIcon } from "@/components/icons/NavigationIcon";
import { SearchIcon } from "@/components/icons/SearchIcon";
import { NotificationIcon } from "@/components/icons/NotificationIcon";
import { useDriverStatus } from "@/providers/DriverStatusProvider";
import { useRideRequest } from "@/providers/RideRequestProvider";
import { RideRequestCard } from "@/components/RideRequestCard";
import { ActiveRideBottomSheet } from "@/components/ActiveRideBottomSheet";
import { createAuthenticatedAPI } from "@/services/api";
import { HeadphonesIcon } from "@/components/icons/HeadphonesIcon";
import { ShieldIcon } from "@/components/icons/ShieldIcon";
import { useRoutePolyline } from "@/hooks/useRoutePolyline";

const PRIMARY = "#7900FF";

export default function HomeScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { data: driverData, isLoading } = useDriverProfile();
  const { location, address } = useLocation();
  const mapRef = useRef<MapView>(null);
  const { isOnline } = useDriverStatus();
  const { setHasRideRequest, registerRejectHandler } = useRideRequest();

  // Whether the driver has already confirmed (tapped "Прийняти") the current ride
  const [rideConfirmed, setRideConfirmed] = useState(false);
  // Whether the ride is in_progress (driving to dropoff)
  const [rideInProgress, setRideInProgress] = useState(false);

  const { activeRide, setActiveRide, refreshNow } = useActiveRide(isOnline);

  // Derived ride state (must be before hooks below)
  const showActiveRide = activeRide !== null && rideConfirmed;

  // Route destination: dropoff when in_progress, pickup otherwise
  const routeDestination =
    activeRide && rideConfirmed
      ? rideInProgress
        ? {
            latitude: activeRide.dropoff_lat,
            longitude: activeRide.dropoff_lon,
          }
        : { latitude: activeRide.pickup_lat, longitude: activeRide.pickup_lon }
      : null;

  const routeCoords = useRoutePolyline(
    location
      ? { latitude: location.latitude, longitude: location.longitude }
      : null,
    routeDestination,
    rideConfirmed && activeRide !== null,
  );

  // Reset confirmation + progress state when ride disappears
  useEffect(() => {
    if (!activeRide) {
      setRideConfirmed(false);
      setRideInProgress(false);
    }
  }, [activeRide]);

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

  // --- Ride lifecycle handlers ---
  const handleAcceptRide = async () => {
    if (!activeRide) return;
    // Ride is already accepted by matching service — just confirm locally
    setRideConfirmed(true);
  };

  const handleRejectRide = async () => {
    if (!activeRide) return;
    try {
      const api = createAuthenticatedAPI(getToken);
      await api.rejectRide(activeRide.id);
      setActiveRide(null);
      setRideConfirmed(false);
      setHasRideRequest(false);
    } catch {
      Alert.alert("Помилка", "Не вдалося відхилити замовлення.");
    }
  };

  const handleStartWaiting = async () => {
    // "Розпочати очікування" — locally changes button state; no backend call yet
    // (backend start_ride will be called on "Розпочати поїздку")
  };

  const handleStartRide = async () => {
    if (!activeRide) return;
    try {
      const api = createAuthenticatedAPI(getToken);
      await api.startRide(activeRide.id);
      setRideInProgress(true);
      refreshNow();
    } catch {
      Alert.alert("Помилка", "Не вдалося розпочати поїздку.");
    }
  };

  const handleCompleteRide = async () => {
    if (!activeRide) return;
    try {
      const api = createAuthenticatedAPI(getToken);
      await api.completeRide(activeRide.id);
      // Don't refreshNow here — BottomSheet navigates to confirm-price first.
      // activeRide will be cleared when user returns to tabs screen.
    } catch {
      Alert.alert("Помилка", "Не вдалося завершити поїздку.");
    }
  };

  const showRideRequest = activeRide !== null && !rideConfirmed;
  const effectiveRide = activeRide;

  // Hide tab bar for entire ride duration (request card OR active ride panel)
  useEffect(() => {
    setHasRideRequest(showRideRequest || showActiveRide);
  }, [showRideRequest, showActiveRide]);

  useEffect(() => {
    registerRejectHandler(handleRejectRide);
  }, [effectiveRide]);

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
            {/* Car Marker — updates in real time via useLocation */}
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
              zIndex={2}
              image={require("../../../assets/images/car-driver.png")}
            />

            {/* Route polyline: to pickup or dropoff depending on state */}
            {showActiveRide && effectiveRide && (
              <>
                <Marker
                  coordinate={{
                    latitude: rideInProgress
                      ? effectiveRide.dropoff_lat
                      : effectiveRide.pickup_lat,
                    longitude: rideInProgress
                      ? effectiveRide.dropoff_lon
                      : effectiveRide.pickup_lon,
                  }}
                  anchor={{ x: 0.5, y: 0.5 }}
                  zIndex={1}
                >
                  <View
                    style={
                      rideInProgress ? styles.dropoffDot : styles.pickupDot
                    }
                  />
                </Marker>
                <Polyline
                  coordinates={
                    routeCoords.length > 0
                      ? routeCoords
                      : [
                          {
                            latitude: location.latitude,
                            longitude: location.longitude,
                          },
                          {
                            latitude: effectiveRide.pickup_lat,
                            longitude: effectiveRide.pickup_lon,
                          },
                        ]
                  }
                  strokeColor={PRIMARY}
                  strokeWidth={5}
                  strokeColors={[PRIMARY]}
                  geodesic={true}
                  lineJoin="round"
                  lineCap="round"
                />
              </>
            )}
          </>
        )}
      </MapView>

      {/* TOP LEFT buttons during active ride */}
      {showActiveRide && (
        <SafeAreaView style={styles.activeRideTopLeft} edges={["top"]}>
          <View style={styles.activeRideTopBtns}>
            <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
              <HeadphonesIcon size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
              <ShieldIcon size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}

      {/* TOP HEADER — hide when active ride is shown */}
      {!showActiveRide && (
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

            {showRideRequest ? (
              <TouchableOpacity
                style={styles.rejectPill}
                onPress={handleRejectRide}
                activeOpacity={0.85}
              >
                <Text style={styles.rejectPillText}>✕ Відхилити</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
                  <SearchIcon size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
                  <NotificationIcon size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
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
      )}

      {/* Center button — only visible when no active ride panel */}
      {!showActiveRide && (
        <TouchableOpacity
          style={[styles.centerBtn, { bottom: 140 }]}
          onPress={handleCenterMap}
          activeOpacity={0.8}
        >
          <NavigationIcon size={24} color={PRIMARY} />
        </TouchableOpacity>
      )}

      {/* Ride request info card (no accept/reject buttons — they are in header/bottom) */}
      {showRideRequest && effectiveRide && (
        <RideRequestCard
          ride={effectiveRide}
          onAccept={handleAcceptRide}
          onReject={handleRejectRide}
        />
      )}

      {/* Accept button — fixed at bottom, replaces tab bar */}
      {showRideRequest && (
        <View style={styles.acceptBarWrapper}>
          <TouchableOpacity
            style={styles.acceptBarBtn}
            onPress={handleAcceptRide}
            activeOpacity={0.85}
          >
            <Text style={styles.acceptBarBtnText}>Прийняти замовлення</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Active ride bottom sheet (after driver confirmed) */}
      {showActiveRide && effectiveRide && (
        <ActiveRideBottomSheet
          ride={effectiveRide}
          onStartWaiting={handleStartWaiting}
          onStartRide={handleStartRide}
          onCompleteRide={handleCompleteRide}
        />
      )}
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

  // Active ride top-left buttons
  activeRideTopLeft: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  activeRideTopBtns: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  // Pickup dot marker
  pickupDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#22c55e",
    borderWidth: 3,
    borderColor: "#fff",
  },
  dropoffDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#D32F2F",
    borderWidth: 3,
    borderColor: "#fff",
  },

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

  // Reject pill in header
  rejectPill: {
    backgroundColor: "#D32F2F",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 5,
  },
  rejectPillText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  // Accept bar at bottom
  acceptBarWrapper: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    zIndex: 101,
  },
  acceptBarBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 50,
    paddingVertical: 15,
    alignItems: "center",
  },
  acceptBarBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
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
