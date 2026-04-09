import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  Image,
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
import { Colors } from "@/constants/theme";

import { ExploreNearbyIcon } from "@/components/icons/ExploreNearbyIcon";

// Custom icons
import { HomeIcon } from "@/components/icons/HomeIcon";
import { StarIcon } from "@/components/icons/StarIcon";
import { WalletIcon } from "@/components/icons/WalletIcon";
import { PersonIcon } from "@/components/icons/PersonIcon";
import { DoubleArrowIcon } from "@/components/icons/DoubleArrowIcon";
import { CarIcon } from "@/components/icons/CarIcon";
import { NavigationIcon } from "@/components/icons/NavigationIcon";
import { SearchIcon } from "@/components/icons/SearchIcon";
import { NotificationIcon } from "@/components/icons/NotificationIcon";
import { RadarPulse } from "@/components/RadarPulse";
import { createAuthenticatedAPI } from "@/services/api";

const PRIMARY = "#7900FF";

type TabKey = "home" | "rating" | "start" | "wallet" | "profile";

// ─────────────────────────── Start Modal ────────────────────────────────────
function StartShiftModal({
  visible,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={modalStyles.backdrop} onPress={onCancel}>
        <View style={modalStyles.card}>
          <View style={modalStyles.divider} />
          <Text style={modalStyles.title}>Відкрити зміну?</Text>
          <Text style={modalStyles.body}>
            Ви переходите в онлайн-режим. Після відкриття зміни ви почнете
            отримувати замовлення.
          </Text>
          <View style={modalStyles.actions}>
            <TouchableOpacity
              style={modalStyles.cancelBtn}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={modalStyles.cancelText}>Скасувати</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={modalStyles.confirmBtn}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={modalStyles.confirmText}>Відкрити</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─────────────────────────── Stop Modal ─────────────────────────────────────
function StopShiftModal({
  visible,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={modalStyles.backdrop} onPress={onCancel}>
        <View style={modalStyles.card}>
          <View style={modalStyles.divider} />
          <Text style={modalStyles.title}>Закрити зміну?</Text>
          <Text style={modalStyles.body}>
            Ви переходите в офлайн-режим. Нові замовлення надходити не будуть.
          </Text>
          <View style={modalStyles.actions}>
            <TouchableOpacity
              style={modalStyles.cancelBtn}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={modalStyles.cancelText}>Скасувати</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.confirmBtn, { backgroundColor: "#EF4444" }]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={modalStyles.confirmText}>Закрити</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─────────────────────────── Main Screen ────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getToken } = useAuth();
  const { data: driverData, isLoading } = useDriverProfile();
  const { location, address } = useLocation();
  const mapRef = useRef<MapView>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [isOnline, setIsOnline] = useState(false);
  const [hasWorked, setHasWorked] = useState(false); // Тракаємо, чи був водій в онлайн
  const [showStartModal, setShowStartModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Redirect to profile if no driver record exists
  useEffect(() => {
    if (!isLoading && driverData === null) {
      router.replace("/(main)/profile" as any);
    }
  }, [driverData, isLoading, router]);

  // Set initial online/offline state from backend
  useEffect(() => {
    if (driverData) {
      const isCurrentlyOnline = driverData.availability === "online";
      setIsOnline(isCurrentlyOnline);
      if (isCurrentlyOnline) setHasWorked(true);
    }
  }, [driverData]);

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

  const syncAvailability = async (availability: "online" | "offline") => {
    setIsSyncing(true);
    try {
      const api = createAuthenticatedAPI(getToken);
      await api.setAvailability(availability);
      setIsOnline(availability === "online");
      if (availability === "online") setHasWorked(true);
    } catch (err) {
      Alert.alert("Помилка", "Не вдалося змінити статус. Перевірте з'єднання.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTabPress = (key: TabKey) => {
    if (key === "start") {
      handleStartPress();
      return;
    }
    if (key === "profile") {
      router.push("/(main)/profile" as any);
      return;
    }
    setActiveTab(key);
  };

  const handleStartPress = () => {
    // Block if profile is still pending or not approved
    const status = driverData?.status;
    if (status !== "approved") {
      Alert.alert(
        "Недоступно",
        status === "pending"
          ? "Ваш профіль ще на перевірці. Зачекайте підтвердження адміністратора."
          : "Ваш профіль не підтверджено.",
      );
      return;
    }

    if (isOnline) {
      setShowStopModal(true);
    } else {
      setShowStartModal(true);
    }
  };

  const handleConfirmStart = async () => {
    setShowStartModal(false);
    await syncAvailability("online");
  };

  const handleConfirmStop = async () => {
    setShowStopModal(false);
    await syncAvailability("offline");
  };

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
  const isApproved = driverStatus === "approved";
  const isStartDisabled = !isApproved || isSyncing;

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
              image={require("../../assets/images/car-driver.png")}
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

      {/* ─── BOTTOM TAB BAR ─── */}
      <View style={styles.tabBar}>
        {/* Home */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress("home")}
          activeOpacity={0.7}
        >
          <HomeIcon
            size={28}
            color={activeTab === "home" ? PRIMARY : "#9ca3af"}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === "home" && styles.tabLabelActive,
            ]}
          >
            Головна
          </Text>
        </TouchableOpacity>

        {/* Rating */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress("rating")}
          activeOpacity={0.7}
        >
          <StarIcon
            size={28}
            color={activeTab === "rating" ? PRIMARY : "#9ca3af"}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === "rating" && styles.tabLabelActive,
            ]}
          >
            Рейтинг
          </Text>
        </TouchableOpacity>

        {/* START button – centre */}
        <View style={styles.startWrapper}>
          <TouchableOpacity
            style={[
              styles.startBtn,
              isOnline && styles.startBtnOnline,
              (!isOnline && hasWorked) && styles.startBtnOffline,
              isStartDisabled && styles.startBtnDisabled,
            ]}
            onPress={handleStartPress}
            activeOpacity={isStartDisabled ? 1 : 0.85}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <DoubleArrowIcon size={34} color="#fff" />
            )}
          </TouchableOpacity>
          <Text 
            style={[
              styles.startLabel, 
              isOnline && { color: "#22c55e" },
              (!isOnline && hasWorked) && { color: "#B91C1C" }
            ]}
            numberOfLines={1}
          >
            {isOnline ? "ВИ ОНЛАЙН" : (hasWorked ? "ВИ ОФЛАЙН" : "ПОЧАТИ")}
          </Text>
        </View>

        {/* Wallet */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress("wallet")}
          activeOpacity={0.7}
        >
          <WalletIcon
            size={28}
            color={activeTab === "wallet" ? PRIMARY : "#9ca3af"}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === "wallet" && styles.tabLabelActive,
            ]}
          >
            Гаманець
          </Text>
        </TouchableOpacity>

        {/* Profile */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress("profile")}
          activeOpacity={0.7}
        >
          <PersonIcon
            size={28}
            color={activeTab === "profile" ? PRIMARY : "#9ca3af"}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === "profile" && styles.tabLabelActive,
            ]}
          >
            Профіль
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <StartShiftModal
        visible={showStartModal}
        onConfirm={handleConfirmStart}
        onCancel={() => setShowStartModal(false)}
      />
      <StopShiftModal
        visible={showStopModal}
        onConfirm={handleConfirmStop}
        onCancel={() => setShowStopModal(false)}
      />
    </View>
  );
}

// ─────────────────────────── Styles ─────────────────────────────────────────
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
    top: 20, // Lowered
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Розносимо по краях
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
    paddingHorizontal: 16, // Оновимо трішки падінг для кращого вигляду з іконкою
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Center content inside pill
    backgroundColor: "#fff",
    borderRadius: 22, // Match the pill look

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

  // Car marker
  markerWrapper: {
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  radarCircle: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  radarCircle1: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(0, 0, 0, 0.12)",
  },
  radarCircle2: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(0, 0, 0, 0.07)",
  },
  radarCircle3: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
  },
  carMarkerOuter: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(100, 100, 100, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  carMarkerOuterActive: {
    // optional subtle glow exactly behind the car
  },
  carMarkerInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
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

  // ─── Tab Bar ───
  tabBar: {
    position: "absolute",
    bottom: 25,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 35,
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  tabLabel: {
    fontSize: 11,
    color: "#9ca3af",
    fontWeight: "500",
  },
  tabLabelActive: {
    color: PRIMARY,
    fontWeight: "700",
  },

  // Start Button
  startWrapper: {
    flex: 1.2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -40,
    zIndex: 30,
  },
  startBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#2B2B2B", // Darker default for contrast
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  startBtnOnline: {
    backgroundColor: "#22c55e",
    shadowColor: "#22c55e",
    shadowOpacity: 0.4,
  },
  startBtnOffline: {
    backgroundColor: "#B91C1C", // Red state as requested
    shadowColor: "#B91C1C",
    shadowOpacity: 0.4,
  },
  startBtnDisabled: {
    opacity: 0.45,
  },
  startLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2B2B2B",
    letterSpacing: 0.6,
    marginTop: 6,
    textTransform: "uppercase",
  },
});

// ─────────────────────────── Modal Styles ───────────────────────────────────
const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    paddingTop: 12,
  },
  divider: {
    width: 40,
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
    textAlign: "center",
  },
  body: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 24,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  confirmBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});
