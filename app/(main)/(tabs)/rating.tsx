import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@clerk/expo";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { createAuthenticatedAPI } from "@/services/api";
import { StarIcon } from "@/components/icons/StarIcon";
import { NotificationIcon } from "@/components/icons/NotificationIcon";

const PRIMARY = "#7900FF";
const BG = "#F5F3F8";

// ─── Types ───────────────────────────────────────────────────────────────────
interface MonthData {
  label: string;
  weeks: number[];
}

interface RatingStats {
  rating: number;
  total_rides: number;
  first_name: string;
  last_name: string;
  profile_image: string | null;
  on_time_percent: number;
  convenient_route_percent: number;
  safe_driving_percent: number;
  monthly_chart: MonthData[];
}

// ─── Native ring chart using plain Views ─────────────────────────────────────
function NativeRingChart({
  segments,
}: {
  segments: { percent: number; color: string }[];
}) {
  const SIZE = 130;
  const rings = [
    { color: segments[0]?.color ?? "#22c55e", pct: segments[0]?.percent ?? 0, thickness: 11, radius: 56 },
    { color: segments[1]?.color ?? PRIMARY, pct: segments[1]?.percent ?? 0, thickness: 11, radius: 41 },
    { color: segments[2]?.color ?? "#ef4444", pct: segments[2]?.percent ?? 0, thickness: 11, radius: 26 },
  ];

  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" }}>
      {rings.map((ring, idx) => {
        const diameter = ring.radius * 2;
        const filled = ring.pct / 100;
        return (
          <View
            key={idx}
            style={[
              StyleSheet.absoluteFill,
              { alignItems: "center", justifyContent: "center" },
            ]}
          >
            <View
              style={{
                width: diameter + ring.thickness,
                height: diameter + ring.thickness,
                borderRadius: (diameter + ring.thickness) / 2,
                borderWidth: ring.thickness,
                borderColor: "#E8E3F0",
                position: "absolute",
              }}
            />
            {filled > 0 && (
              <View
                style={{
                  width: diameter + ring.thickness,
                  height: diameter + ring.thickness,
                  borderRadius: (diameter + ring.thickness) / 2,
                  borderWidth: ring.thickness,
                  borderColor: ring.color,
                  borderRightColor: filled < 0.75 ? "transparent" : ring.color,
                  borderBottomColor: filled < 0.5 ? "transparent" : ring.color,
                  borderLeftColor: filled < 0.25 ? "transparent" : ring.color,
                  position: "absolute",
                  transform: [{ rotate: "-90deg" }],
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

// ─── Bar Chart ───────────────────────────────────────────────────────────────
function BarChart({ data }: { data: MonthData[] }) {
  const maxVal = useMemo(() => {
    let m = 1;
    data.forEach((month) => month.weeks.forEach((w) => { if (w > m) m = w; }));
    return m;
  }, [data]);

  const MAX_HEIGHT = 80;

  return (
    <View style={barStyles.container}>
      <View style={barStyles.chart}>
        {data.map((month, mIdx) => (
          <View key={mIdx} style={barStyles.monthGroup}>
            {month.weeks.map((val, wIdx) => {
              const height = Math.max(4, (val / maxVal) * MAX_HEIGHT);
              const isLast = mIdx === data.length - 1;
              const opacity = isLast ? 1 : 0.4;
              return (
                <View
                  key={wIdx}
                  style={[
                    barStyles.bar,
                    {
                      height,
                      backgroundColor: PRIMARY,
                      opacity,
                    },
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>
      <View style={barStyles.labelsRow}>
        <Text style={barStyles.label}>{data[0]?.label ?? ""}</Text>
        <Text style={barStyles.label}>{data[data.length - 1]?.label ?? ""}</Text>
      </View>
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: { width: "100%" },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
    height: 90,
  },
  monthGroup: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
  },
  bar: {
    flex: 1,
    borderRadius: 4,
    minHeight: 4,
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  label: {
    fontSize: 11,
    color: "#9ca3af",
    fontWeight: "500",
  },
});

// ─── Stat Row ─────────────────────────────────────────────────────────────────
function StatRow({
  color,
  label,
  percent,
}: {
  color: string;
  label: string;
  percent: number;
}) {
  return (
    <View style={statStyles.row}>
      <View style={[statStyles.dot, { backgroundColor: color }]} />
      <Text style={statStyles.label}>{label}</Text>
      <Text style={[statStyles.value, { color }]}>{percent}%</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 5,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: "#1B1B1B",
    fontWeight: "500",
  },
  value: {
    fontSize: 14,
    fontWeight: "700",
  },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function RatingScreen() {
  const router = useRouter();
  const { getToken } = useAuth();

  const { data: stats, isLoading } = useQuery<RatingStats>({
    queryKey: ["driver", "rating_stats"],
    queryFn: async () => {
      const api = createAuthenticatedAPI(getToken);
      const res = await api.getRatingStats();
      return res.data;
    },
  });

  const segments = stats
    ? [
        { percent: stats.on_time_percent, color: "#22c55e" },
        { percent: stats.convenient_route_percent, color: PRIMARY },
        { percent: stats.safe_driving_percent, color: "#ef4444" },
      ]
    : [];

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
            <NotificationIcon size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ваш рейтинг</Text>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
            <View style={styles.shieldIcon}>
              <Text style={{ fontSize: 16 }}>🛡</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ── Content ── */}
      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar + rating badge */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarRing}>
              {stats?.profile_image ? (
                <Image
                  source={{ uri: stats.profile_image }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarInitials}>
                    {(stats?.first_name?.[0] ?? "") + (stats?.last_name?.[0] ?? "")}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.ratingBadge}>
              <StarIcon size={14} color="#fff" />
              <Text style={styles.ratingBadgeText}>
                {stats?.rating?.toFixed(1) ?? "—"}
              </Text>
            </View>
          </View>

          <Text style={styles.driverName}>
            {stats?.last_name ?? ""}{" "}
            {stats?.first_name ?? ""}
          </Text>

          {/* Stats card */}
          <View style={styles.card}>
            <NativeRingChart segments={segments} />
            <View style={styles.statsRight}>
              <StatRow
                color="#22c55e"
                label="Прибуття вчасно"
                percent={stats?.on_time_percent ?? 0}
              />
              <StatRow
                color={PRIMARY}
                label="Зручний маршрут"
                percent={stats?.convenient_route_percent ?? 0}
              />
              <StatRow
                color="#ef4444"
                label="Безпечне водіння"
                percent={stats?.safe_driving_percent ?? 0}
              />
            </View>
          </View>

          {/* Bar chart */}
          <Text style={styles.sectionTitle}>Оперативність прийняття замовлень</Text>
          <View style={styles.card}>
            {stats?.monthly_chart && stats.monthly_chart.length > 0 ? (
              <BarChart data={stats.monthly_chart} />
            ) : (
              <Text style={{ color: "#9ca3af", fontSize: 13 }}>Немає даних</Text>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  headerSafe: { backgroundColor: BG },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },
  shieldIcon: { alignItems: "center", justifyContent: "center" },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B1B1B",
  },

  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110, // Added padding to avoid bottom bar overlap
    alignItems: "center",
  },

  avatarWrapper: {
    marginTop: 12,
    alignItems: "center",
    marginBottom: 4,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: PRIMARY,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarPlaceholder: {
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: "700",
    color: PRIMARY,
  },
  ratingBadge: {
    position: "absolute",
    bottom: -2,
    right: -4,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 3,
    gap: 3,
  },
  ratingBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },

  driverName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1B1B1B",
    marginTop: 10,
    marginBottom: 16,
  },

  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },

  statsRight: { flex: 1 },

  sectionTitle: {
    alignSelf: "flex-start",
    fontSize: 15,
    fontWeight: "700",
    color: "#1B1B1B",
    marginBottom: 10,
  },
});
