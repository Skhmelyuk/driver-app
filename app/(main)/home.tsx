import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@clerk/expo";

import { useDriverProfile } from "@/hooks/useDriverRegistration";
import { useLocation } from "@/hooks/useLocation";
import { Colors } from "@/constants/theme";

const PRIMARY = "#7900FF";
const CARD_BG = "rgba(255,255,255,0.97)";

type TabKey = "home" | "rating" | "start" | "wallet" | "profile";

interface TabItem {
  key: TabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive?: keyof typeof Ionicons.glyphMap;
}

const TABS: TabItem[] = [
  { key: "home", label: "Головна", icon: "home-outline", iconActive: "home" },
  { key: "rating", label: "Рейтинг", icon: "star-outline", iconActive: "star" },
  { key: "start", label: "ПОЧАТИ", icon: "chevron-up" },
  { key: "wallet", label: "Гаманець", icon: "wallet-outline", iconActive: "wallet" },
  { key: "profile", label: "Профіль", icon: "person-outline", iconActive: "person" },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { data: driverData, isLoading } = useDriverProfile();
  const { location, address } = useLocation();
  const mapRef = useRef<MapView>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [isOnline, setIsOnline] = useState(false);

  // Redirect to profile if no driver profile
  useEffect(() => {
    if (!isLoading && driverData === null) {
      router.replace("/(main)/profile" as any);
    }
  }, [driverData, isLoading, router]);

  // Auto-center map on location
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

  const handleTabPress = (key: TabKey) => {
    if (key === "start") {
      handleToggleOnline();
      return;
    }
    if (key === "profile") {
      router.push("/(main)/profile" as any);
      return;
    }
    setActiveTab(key);
  };

  const handleToggleOnline = () => {
    if (!isOnline) {
      Alert.alert(
        "Вийти в онлайн?",
        "Ви готові приймати замовлення?",
        [
          { text: "Скасувати", style: "cancel" },
          {
            text: "Так, почати",
            onPress: () => setIsOnline(true),
          },
        ],
      );
    } else {
      Alert.alert(
        "Перейти офлайн?",
        "Зупинити отримання нових замовлень?",
        [
          { text: "Скасувати", style: "cancel" },
          { text: "Так", onPress: () => setIsOnline(false) },
        ],
      );
    }
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

  const driverName = driverData?.user?.first_name || "Водій";
  const driverStatus = driverData?.status;
  const isPending = driverStatus === "pending";
  const isApproved = driverStatus === "approved";

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
                <Ionicons name="car" size={18} color={isOnline ? PRIMARY : "#555"} />
              </View>
            </View>
          </Marker>
        )}
      </MapView>

      {/* TOP HEADER OVERLAY */}
      <SafeAreaView style={styles.headerWrapper} edges={["top"]}>
        <View style={styles.headerRow}>
          {/* Menu Button */}
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
            <Ionicons name="menu" size={22} color="#fff" />
          </TouchableOpacity>

          {/* Location Pill */}
          <View style={styles.locationPill}>
            <Ionicons name="location" size={14} color={PRIMARY} />
            <Text style={styles.locationText} numberOfLines={1}>
              {address || "МОЄ МІСТО"}
            </Text>
          </View>

          {/* Right Buttons */}
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
              <Ionicons name="search" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.headerBtn, { marginLeft: 8 }]} activeOpacity={0.8}>
              <Ionicons name="notifications-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Banner */}
        {isPending && (
          <View style={styles.statusBanner}>
            <Ionicons name="time-outline" size={16} color="#f59e0b" />
            <Text style={styles.statusBannerText}>
              Ваш профіль на перевірці. Зачекайте підтвердження.
            </Text>
          </View>
        )}
      </SafeAreaView>

      {/* Top Right: Online Status Badge */}
      <View style={[styles.onlineBadge, { top: insets.top + 70 }]}>
        <View style={[styles.onlineDot, isOnline ? styles.onlineDotActive : styles.onlineDotOff]} />
        <Text style={[styles.onlineLabel, { color: isOnline ? "#22c55e" : "#9ca3af" }]}>
          {isOnline ? "Онлайн" : "Офлайн"}
        </Text>
      </View>

      {/* Center on location button */}
      <TouchableOpacity
        style={[styles.centerBtn, { bottom: 100 + insets.bottom }]}
        onPress={handleCenterMap}
        activeOpacity={0.8}
      >
        <Ionicons name="navigate" size={22} color="#444" />
      </TouchableOpacity>

      {/* Earnings Widget */}
      {isApproved && (
        <View style={[styles.earningsCard, { bottom: 100 + insets.bottom }]}>
          <Text style={styles.earningsLabel}>Сьогодні</Text>
          <Text style={styles.earningsAmount}>
            {Number(driverData?.total_earnings || 0).toFixed(0)} ₴
          </Text>
          <Text style={styles.earningsRides}>{driverData?.total_rides || 0} поїздок</Text>
        </View>
      )}

      {/* BOTTOM TAB BAR */}
      <View style={[styles.tabBar, { paddingBottom: insets.bottom + 4 }]}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          const isStartBtn = tab.key === "start";

          if (isStartBtn) {
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.startBtnWrapper}
                onPress={() => handleTabPress(tab.key)}
                activeOpacity={0.85}
              >
                <View style={[styles.startBtn, isOnline && styles.startBtnActive]}>
                  <Ionicons
                    name={isOnline ? "pause" : "chevron-up"}
                    size={26}
                    color="#fff"
                  />
                </View>
                <Text style={[styles.tabLabel, styles.startLabel]}>
                  {isOnline ? "СТОП" : "ПОЧАТИ"}
                </Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => handleTabPress(tab.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isActive && tab.iconActive ? tab.iconActive : tab.icon}
                size={24}
                color={isActive ? PRIMARY : "#9ca3af"}
              />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },

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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
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

  // Online badge
  onlineBadge: {
    position: "absolute",
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 5,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  onlineDotActive: {
    backgroundColor: "#22c55e",
  },
  onlineDotOff: {
    backgroundColor: "#9ca3af",
  },
  onlineLabel: {
    fontSize: 12,
    fontWeight: "600",
  },

  // Car marker
  carMarkerOuter: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(100,100,100,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  carMarkerOuterActive: {
    backgroundColor: "rgba(121, 0, 255, 0.15)",
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
    shadowOpacity: 0.2,
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

  // Earnings widget
  earningsCard: {
    position: "absolute",
    left: 16,
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 12,
    zIndex: 10,
    alignItems: "center",
    minWidth: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  earningsLabel: {
    fontSize: 10,
    color: "#9ca3af",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  earningsAmount: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1f1f1f",
    marginTop: 2,
  },
  earningsRides: {
    fontSize: 10,
    color: "#9ca3af",
    marginTop: 1,
  },

  // Tab bar
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
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 4,
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
    color: "#9ca3af",
    fontWeight: "500",
    marginTop: 2,
  },
  tabLabelActive: {
    color: PRIMARY,
    fontWeight: "700",
  },

  // Start Button
  startBtnWrapper: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 4,
    gap: 2,
    marginTop: -20,
  },
  startBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#6b7280",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  startBtnActive: {
    backgroundColor: PRIMARY,
  },
  startLabel: {
    color: PRIMARY,
    fontWeight: "800",
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
