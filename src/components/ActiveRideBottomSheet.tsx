import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import type { ActiveRide } from "@/types/ride.types";

const PRIMARY = "#7900FF";
const GREEN = "#2E7D32";
const RED = "#D32F2F";
const FREE_WAIT_SECONDS = 40;

interface Props {
  ride: ActiveRide;
  onStartWaiting: () => Promise<void>;
  onStartRide: () => Promise<void>;
  onCompleteRide: () => Promise<void>;
}

type LocalState = "driving_to_passenger" | "waiting" | "in_progress";

export function ActiveRideBottomSheet({
  ride,
  onStartWaiting,
  onStartRide,
  onCompleteRide,
}: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [localState, setLocalState] = useState<LocalState>(
    ride.status === "in_progress" ? "in_progress" : "driving_to_passenger",
  );
  const [waitSeconds, setWaitSeconds] = useState(FREE_WAIT_SECONDS);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown while waiting
  useEffect(() => {
    if (localState === "waiting") {
      timerRef.current = setInterval(() => {
        setWaitSeconds((s) => (s > 0 ? s - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [localState]);

  // Sync with backend status change to in_progress
  useEffect(() => {
    if (ride.status === "in_progress" && localState !== "in_progress") {
      setLocalState("in_progress");
    }
  }, [ride.status]);

  const formatWait = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const headerLabel =
    localState === "driving_to_passenger"
      ? "Прямуємо до пасажира"
      : `Безкоштовне очікування ${formatWait(waitSeconds)}`;

  const handleStartWaiting = async () => {
    setLoading(true);
    try {
      await onStartWaiting();
      setLocalState("waiting");
    } finally {
      setLoading(false);
    }
  };

  const handleStartRide = async () => {
    setLoading(true);
    try {
      await onStartRide();
      setLocalState("in_progress");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRide = async () => {
    setLoading(true);
    try {
      await onCompleteRide();
      router.push(
        `/(main)/confirm-price?rideId=${ride.id}&price=${ride.estimated_price}` as any,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCallPassenger = () => {
    if (ride.passenger_info.phone) {
      Linking.openURL(`tel:${ride.passenger_info.phone}`);
    }
  };

  const btnColor =
    localState === "driving_to_passenger"
      ? PRIMARY
      : localState === "waiting"
        ? GREEN
        : RED;

  const btnLabel =
    localState === "driving_to_passenger"
      ? "Розпочати очікування"
      : localState === "waiting"
        ? "Розпочати поїздку"
        : "Завершити поїздку";

  const btnHandler =
    localState === "driving_to_passenger"
      ? handleStartWaiting
      : localState === "waiting"
        ? handleStartRide
        : handleCompleteRide;

  return (
    <>
      {/* Info card — floating with side margins */}
      <View style={styles.card}>
        {/* Header strip */}
        <View style={styles.header}>
          <Text style={styles.headerText}>{headerLabel}</Text>
        </View>

        {/* Passenger row */}
        <View style={styles.passengerRow}>
          <View style={styles.passengerLeft}>
            <Text style={styles.passengerIcon}>👤</Text>
            <Text style={styles.passengerName}>
              {ride.passenger_info.name}
              {"  —  "}
              {ride.passenger_info.rating.toFixed(1)}
            </Text>
            <Text style={styles.star}> ★</Text>
            <Text style={styles.ratingCount}>
              ({Math.round(ride.passenger_info.rating * 20)})
            </Text>
          </View>
          <View style={styles.passengerActions}>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <Text style={styles.iconBtnText}>💬</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={handleCallPassenger}
              activeOpacity={0.7}
            >
              <Text style={styles.iconBtnText}>📞</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Address row — pickup when driving/waiting, dropoff when in_progress */}
        <View style={styles.addressRow}>
          <View
            style={
              localState === "in_progress" ? styles.dotRed : styles.dotPurple
            }
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.addressTime}>
              {localState === "in_progress"
                ? `${ride.estimated_duration} хв • ${ride.estimated_distance} km`
                : `${Math.round(ride.estimated_duration * 0.15)} хв • ${(ride.estimated_distance * 0.1).toFixed(1)} km`}
            </Text>
            <Text style={styles.addressText} numberOfLines={2}>
              {localState === "in_progress"
                ? ride.dropoff_address
                : ride.pickup_address}
            </Text>
          </View>
        </View>
      </View>

      {/* Action button — separate at bottom */}
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: btnColor }]}
        onPress={btnHandler}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.arrowIcon}>››</Text>
            <Text style={styles.actionBtnText}>{btnLabel}</Text>
          </>
        )}
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    backgroundColor: PRIMARY,
    paddingVertical: 10,
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  passengerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  passengerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    flexWrap: "nowrap",
  },
  passengerIcon: { fontSize: 16, marginRight: 4 },
  passengerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1B1B1B",
  },
  star: { fontSize: 14, color: "#F5A623" },
  ratingCount: { fontSize: 13, color: "#555", marginLeft: 2 },
  passengerActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F3F3",
    justifyContent: "center",
    alignItems: "center",
  },
  iconBtnText: { fontSize: 17 },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
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
    backgroundColor: RED,
    marginTop: 3,
  },
  addressTime: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1B1B1B",
    marginBottom: 2,
  },
  addressText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
  },
  actionBtn: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    zIndex: 101,
    borderRadius: 50,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  arrowIcon: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
