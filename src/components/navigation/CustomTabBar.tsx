import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import { useDriverStatus } from "@/providers/DriverStatusProvider";

// Icons
import { HomeIcon } from "@/components/icons/HomeIcon";
import { StarIcon } from "@/components/icons/StarIcon";
import { WalletIcon } from "@/components/icons/WalletIcon";
import { PersonIcon } from "@/components/icons/PersonIcon";
import { DoubleArrowIcon } from "@/components/icons/DoubleArrowIcon";

const PRIMARY = "#7900FF";

// ─────────────────────────── Modals ────────────────────────────────────
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

// ─────────────────────────── Custom Tab Bar ────────────────────────────────────
export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const {
    isOnline,
    hasWorked,
    isSyncing,
    showStartModal,
    showStopModal,
    setShowStartModal,
    setShowStopModal,
    handleStartPress,
    handleConfirmStart,
    handleConfirmStop,
  } = useDriverStatus();

  return (
    <View style={styles.tabBar}>
      {/* Home */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate("index")}
        activeOpacity={0.7}
      >
        <HomeIcon
          size={28}
          color={state.index === 0 ? PRIMARY : "#9ca3af"}
        />
        <Text style={[styles.tabLabel, state.index === 0 && styles.tabLabelActive]}>
          Головна
        </Text>
      </TouchableOpacity>

      {/* Rating */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate("rating")}
        activeOpacity={0.7}
      >
        <StarIcon
          size={28}
          color={state.index === 1 ? PRIMARY : "#9ca3af"}
        />
        <Text style={[styles.tabLabel, state.index === 1 && styles.tabLabelActive]}>
          Рейтинг
        </Text>
      </TouchableOpacity>

      {/* START button – centre */}
      <View style={styles.startWrapper}>
        <TouchableOpacity
          style={[
            styles.startBtn,
            isOnline && styles.startBtnOnline,
            !isOnline && hasWorked && styles.startBtnOffline,
            isSyncing && styles.startBtnDisabled,
          ]}
          onPress={handleStartPress}
          activeOpacity={isSyncing ? 1 : 0.85}
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
            !isOnline && hasWorked && { color: "#B91C1C" },
          ]}
          numberOfLines={1}
        >
          {isOnline ? "ВИ ОНЛАЙН" : hasWorked ? "ВИ ОФЛАЙН" : "ПОЧАТИ"}
        </Text>
      </View>

      {/* Wallet */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate("wallet")}
        activeOpacity={0.7}
      >
        <WalletIcon
          size={28}
          color={state.index === 2 ? PRIMARY : "#9ca3af"}
        />
        <Text style={[styles.tabLabel, state.index === 2 && styles.tabLabelActive]}>
          Гаманець
        </Text>
      </TouchableOpacity>

      {/* Profile - Special case: navigate to separate stack screen */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => router.push("/(main)/profile" as any)}
        activeOpacity={0.7}
      >
        <PersonIcon size={28} color="#9ca3af" />
        <Text style={styles.tabLabel}>Профіль</Text>
      </TouchableOpacity>

      {/* Shift Modals */}
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

const styles = StyleSheet.create({
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
    zIndex: 100,
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
  startWrapper: {
    flex: 1.2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -40,
    zIndex: 110,
  },
  startBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#2B2B2B",
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
    backgroundColor: "#B91C1C",
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
