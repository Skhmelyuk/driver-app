import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ActiveRide } from "@/types/ride.types";

const PRIMARY = "#7900FF";
const CASH_PINK = "#FFEBEE";
const CASH_PINK_TEXT = "#C62828";

const VEHICLE_LABEL: Record<string, string> = {
  economy: "Економ",
  comfort: "Комфорт",
  business: "Бізнес",
};

const COMMISSION_RATE = 0.15;

interface Props {
  ride: ActiveRide;
  onAccept: () => Promise<void>;
  onReject: () => Promise<void>;
}

export function RideRequestCard({ ride, onAccept, onReject }: Props) {
  const insets = useSafeAreaInsets();

  const priceAfterCommission =
    parseFloat(ride.estimated_price) * (1 - COMMISSION_RATE);

  const distanceKm = parseFloat(String(ride.estimated_distance));
  const durationMin = ride.estimated_duration;
  const dropoffDistanceKm = distanceKm;
  const dropoffDurationMin = durationMin;

  return (
    <View style={[styles.overlay, { paddingBottom: insets.bottom + 8 }]}>
      <View style={styles.card}>
        {/* Tags row */}
        <View style={styles.tagsRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>
              🚗 {VEHICLE_LABEL[ride.vehicle_type] ?? ride.vehicle_type}
            </Text>
          </View>
          <View style={[styles.tag, { backgroundColor: CASH_PINK }]}>
            <Text style={[styles.tagText, { color: CASH_PINK_TEXT }]}>
              💵 Оплата готівкою
            </Text>
          </View>
        </View>

        {/* Price */}
        <Text style={styles.price}>
          {priceAfterCommission.toFixed(2)}{" "}
          <Text style={styles.priceCurrency}>₴</Text>
          {"  "}
          <Text style={styles.priceNote}>(Після вирахування комісії)</Text>
        </Text>

        <View style={styles.divider} />

        {/* Passenger */}
        <View style={styles.passengerRow}>
          <Text style={styles.passengerIcon}>👤</Text>
          <Text style={styles.passengerName}>
            {ride.passenger_info.name} —{" "}
            {ride.passenger_info.rating.toFixed(1)}{" "}
          </Text>
          <Text style={styles.star}>★</Text>
          <Text style={styles.ratingCount}>
            ({Math.round(ride.passenger_info.rating * 20)})
          </Text>
        </View>

        {/* Pickup */}
        <View style={styles.routeRow}>
          <View style={styles.dotPurple} />
          <View style={styles.routeTextCol}>
            <Text style={styles.routeTime}>1 хв • 0.4 km</Text>
            <Text style={styles.routeAddress} numberOfLines={2}>
              {ride.pickup_address}
            </Text>
          </View>
        </View>

        {/* Dropoff */}
        <View style={styles.routeRow}>
          <View style={styles.dotRed} />
          <View style={styles.routeTextCol}>
            <Text style={styles.routeTime}>
              {Math.round(dropoffDurationMin)} хв •{" "}
              {dropoffDistanceKm.toFixed(1)} km
            </Text>
            <Text style={styles.routeAddress} numberOfLines={2}>
              {ride.dropoff_address}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    bottom: 82,
    left: 16,
    right: 16,
    zIndex: 100,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  tagsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: "#F3F3F3",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1B1B1B",
  },
  price: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1B1B1B",
    marginBottom: 4,
  },
  priceCurrency: {
    fontSize: 22,
    fontWeight: "700",
  },
  priceNote: {
    fontSize: 13,
    fontWeight: "400",
    color: "#777",
  },
  divider: {
    height: 1,
    backgroundColor: "#EFEFEF",
    marginVertical: 12,
  },
  passengerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 4,
  },
  passengerIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  passengerName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1B1B1B",
  },
  star: {
    fontSize: 15,
    color: "#F5A623",
  },
  ratingCount: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 10,
  },
  dotPurple: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: PRIMARY,
    marginTop: 3,
  },
  dotRed: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#D32F2F",
    marginTop: 3,
  },
  routeTextCol: {
    flex: 1,
  },
  routeTime: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1B1B1B",
    marginBottom: 2,
  },
  routeAddress: {
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
  },
});
