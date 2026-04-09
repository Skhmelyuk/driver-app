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
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@clerk/expo";

import { useDriverProfile } from "@/hooks/useDriverRegistration";
import { useLocation } from "@/hooks/useLocation";
import { Colors } from "@/constants/theme";

// Custom icons
import { HomeIcon } from "@/components/icons/HomeIcon";
import { StarIcon } from "@/components/icons/StarIcon";
import { WalletIcon } from "@/components/icons/WalletIcon";
import { PersonIcon } from "@/components/icons/PersonIcon";
import { DoubleArrowIcon } from "@/components/icons/DoubleArrowIcon";
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
            Ви переходите в онлайн-режим. Після відкриття зміни ви почнете отримувати замовлення.
          </Text>
          <View style={modalStyles.actions}>
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
              <Text style={modalStyles.cancelText}>Скасувати</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modalStyles.confirmBtn} onPress={onConfirm} activeOpacity={0.8}>
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
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
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
      setIsOnline(driverData.availability === "online");
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
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

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
          <Marker
            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={[styles.carMarkerOuter, isOnline && styles.carMarkerOuterActive]}>
              <View style={styles.carMarkerInner}>
                <Text style={{ fontSize: 16 }}>🚗</Text>
              </View>
            </View>
          </Marker>
        )}
      </MapView>

      {/* TOP HEADER */}
      <SafeAreaView style={styles.headerWrapper} edges={["top"]}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
            <Text style={{ fontSize: 18, color: "#fff" }}>☰</Text>
          </TouchableOpacity>

          <View style={styles.locationPill}>
            <Text style={{ fontSize: 12, color: PRIMARY }}>📍</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {address || "МОЄ МІСТО"}
            </Text>
          </View>

          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
            <Text style={{ fontSize: 16, color: "#fff" }}>🔔</Text>
          </TouchableOpacity>
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
        style={[styles.centerBtn, { bottom: 110 + insets.bottom }]}
        onPress={handleCenterMap}
        activeOpacity={0.8}
      >
        <Text style={{ fontSize: 20 }}>🎯</Text>
      </TouchableOpacity>

      {/* ─── BOTTOM TAB BAR ─── */}
      <View style={[styles.tabBar, { paddingBottom: insets.bottom + 6 }]}>
        {/* Home */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress("home")}
          activeOpacity={0.7}
        >
          <HomeIcon size={26} color={activeTab === "home" ? PRIMARY : "#9ca3af"} />
          <Text style={[styles.tabLabel, activeTab === "home" && styles.tabLabelActive]}>
            Головна
          </Text>
        </TouchableOpacity>

        {/* Rating */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress("rating")}
          activeOpacity={0.7}
        >
          <StarIcon size={26} color={activeTab === "rating" ? PRIMARY : "#9ca3af"} />
          <Text style={[styles.tabLabel, activeTab === "rating" && styles.tabLabelActive]}>
            Рейтинг
          </Text>
        </TouchableOpacity>

        {/* START button – centre */}
        <View style={styles.startWrapper}>
          <TouchableOpacity
            style={[
              styles.startBtn,
              isOnline && styles.startBtnOnline,
              isStartDisabled && styles.startBtnDisabled,
            ]}
            onPress={handleStartPress}
            activeOpacity={isStartDisabled ? 1 : 0.85}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <DoubleArrowIcon size={32} color="#fff" />
            )}
          </TouchableOpacity>
          <Text style={[styles.startLabel, isOnline && { color: "#22c55e" }]}>
            {isOnline ? "ВИ ОНЛАЙН" : "ПОЧАТИ"}
          </Text>
        </View>

        {/* Wallet */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress("wallet")}
          activeOpacity={0.7}
        >
          <WalletIcon size={26} color={activeTab === "wallet" ? PRIMARY : "#9ca3af"} />
          <Text style={[styles.tabLabel, activeTab === "wallet" && styles.tabLabelActive]}>
            Гаманець
          </Text>
        </TouchableOpacity>

        {/* Profile */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress("profile")}
          activeOpacity={0.7}
        >
          <PersonIcon size={26} color={activeTab === "profile" ? PRIMARY : "#9ca3af"} />
          <Text style={[styles.tabLabel, activeTab === "profile" && styles.tabLabelActive]}>
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
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
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
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  locationPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
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
  carMarkerOuter: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(100,100,100,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  carMarkerOuterActive: { backgroundColor: "rgba(121, 0, 255, 0.12)" },
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
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#fff",
    paddingTop: 10,
    paddingHorizontal: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 4,
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    color: "#9ca3af",
    fontWeight: "500",
    marginTop: 1,
  },
  tabLabelActive: {
    color: PRIMARY,
    fontWeight: "700",
  },

  // Start Button
  startWrapper: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 4,
    marginTop: -28,
    gap: 3,
  },
  startBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#6b7280",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 10,
  },
  startBtnOnline: {
    backgroundColor: "#22c55e",
  },
  startBtnDisabled: {
    opacity: 0.45,
  },
  startLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: PRIMARY,
    letterSpacing: 0.5,
  },
});

// ─────────────────────────── Modal Styles ───────────────────────────────────
const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
    paddingBottom: 30,
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
