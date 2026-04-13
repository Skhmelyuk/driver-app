import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const GREEN = "#2E7D32";

export default function ConfirmPriceScreen() {
  const router = useRouter();
  const { rideId, price } = useLocalSearchParams<{ rideId: string; price: string }>();

  const displayPrice = price ? parseFloat(price).toFixed(2) : "0.00";

  const handleConfirm = () => {
    router.replace(`/(main)/rate-passenger?rideId=${rideId}` as any);
  };

  const handleReportProblem = () => {
    Alert.alert(
      "Повідомити про проблему",
      "Зверніться до служби підтримки для вирішення питання з ціною.",
      [
        { text: "Скасувати", style: "cancel" },
        {
          text: "Написати в підтримку",
          onPress: () => Linking.openURL("mailto:support@taxiservice.ua"),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Title row */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Підтвердити ціну</Text>
        <View style={styles.shieldIcon}>
          <Text style={styles.shieldText}>🛡</Text>
        </View>
      </View>

      {/* Price card */}
      <View style={styles.card}>
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>{displayPrice}</Text>
          <Text style={styles.currencyText}> ₴</Text>
          <Text style={styles.cashIcon}>  💵</Text>
        </View>
        <Text style={styles.cardSubtitle}>
          Прийміть оплату від пасажира{"\n"}та підтвердіть отримання готівки
        </Text>
      </View>

      {/* Report problem */}
      <TouchableOpacity onPress={handleReportProblem} style={styles.problemRow}>
        <Text style={styles.problemIcon}>⚠️</Text>
        <Text style={styles.problemText}>повідомити про проблему з ціною</Text>
      </TouchableOpacity>

      <View style={styles.spacer} />

      {/* Confirm button */}
      <TouchableOpacity
        style={styles.confirmBtn}
        onPress={handleConfirm}
        activeOpacity={0.85}
      >
        <Text style={styles.arrowIcon}>»</Text>
        <Text style={styles.confirmBtnText}>Підтвердити ціну</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F1F6",
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1B1B1B",
  },
  shieldIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  shieldText: { fontSize: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
  },
  priceText: {
    fontSize: 42,
    fontWeight: "800",
    color: "#1B1B1B",
  },
  currencyText: {
    fontSize: 30,
    fontWeight: "700",
    color: "#1B1B1B",
  },
  cashIcon: {
    fontSize: 26,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    lineHeight: 20,
  },
  problemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
  },
  problemIcon: { fontSize: 16, color: "#D32F2F" },
  problemText: {
    fontSize: 14,
    color: "#D32F2F",
    textDecorationLine: "underline",
  },
  spacer: { flex: 1 },
  confirmBtn: {
    backgroundColor: GREEN,
    borderRadius: 50,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 8,
  },
  arrowIcon: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  confirmBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
