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

import Svg, { Path, Circle, G } from "react-native-svg";
import { createAuthenticatedAPI } from "@/services/api";

function HeadsetMicSvg({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 23V21H19V20H15V12H19V11C19 9.06667 18.3167 7.41667 16.95 6.05C15.5833 4.68333 13.9333 4 12 4C10.0667 4 8.41667 4.68333 7.05 6.05C5.68333 7.41667 5 9.06667 5 11V12H9V20H5C4.45 20 3.97917 19.8042 3.5875 19.4125C3.19583 19.0208 3 18.55 3 18V11C3 9.76667 3.2375 8.60417 3.7125 7.5125C4.1875 6.42083 4.83333 5.46667 5.65 4.65C6.46667 3.83333 7.42083 3.1875 8.5125 2.7125C9.60417 2.2375 10.7667 2 12 2C13.2333 2 14.3958 2.2375 15.4875 2.7125C16.5792 3.1875 17.5333 3.83333 18.35 4.65C19.1667 5.46667 19.8125 6.42083 20.2875 7.5125C20.7625 8.60417 21 9.76667 21 11V21C21 21.55 20.8042 22.0208 20.4125 22.4125C20.0208 22.8042 19.55 23 19 23H12ZM5 18H7V14H5V18ZM17 18H19V14H17V18Z"
        fill="white"
      />
    </Svg>
  );
}

function ShieldSvg({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22C9.68333 21.4167 7.77083 20.0875 6.2625 18.0125C4.75417 15.9375 4 13.6333 4 11.1V5L12 2L20 5V11.1C20 13.6333 19.2458 15.9375 17.7375 18.0125C16.2292 20.0875 14.3167 21.4167 12 22ZM12 19.9C13.7333 19.35 15.1667 18.25 16.3 16.6C17.4333 14.95 18 13.1167 18 11.1V6.375L12 4.125L6 6.375V11.1C6 13.1167 6.56667 14.95 7.7 16.6C8.83333 18.25 10.2667 19.35 12 19.9Z"
        fill="white"
      />
    </Svg>
  );
}

function StarSvg({ size = 21 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 21 21" fill="none">
      <Path
        d="M5.03049 20.356C4.65512 20.5943 4.17868 20.2608 4.27411 19.8266L5.66053 13.5175C5.69888 13.343 5.6412 13.1613 5.50923 13.0409L0.83728 8.77726C0.516281 8.48432 0.696055 7.94956 1.12883 7.91001L7.25545 7.3502C7.44239 7.33311 7.60401 7.21277 7.67395 7.03857L10.036 1.15563C10.2039 0.737361 10.7961 0.737362 10.964 1.15563L13.3261 7.03857C13.396 7.21277 13.5576 7.33311 13.7446 7.3502L19.8712 7.91001C20.3039 7.94956 20.4837 8.48432 20.1627 8.77726L15.4908 13.0409C15.3588 13.1613 15.3011 13.343 15.3395 13.5175L16.7259 19.8266C16.8213 20.2608 16.3449 20.5943 15.9695 20.356L10.768 17.0531C10.6044 16.9492 10.3956 16.9492 10.232 17.0531L5.03049 20.356Z"
        fill="white"
      />
    </Svg>
  );
}

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

// ─── SVG Arc Ring Chart ───────────────────────────────────────────────────────
function arcPath(cx: number, cy: number, r: number, pct: number): string {
  if (pct <= 0) return "";
  const clamped = Math.min(pct, 99.99);
  const angle = (clamped / 100) * 2 * Math.PI;
  const startX = cx;
  const startY = cy - r;
  const endX = cx + r * Math.sin(angle);
  const endY = cy - r * Math.cos(angle);
  const largeArc = clamped > 50 ? 1 : 0;
  return `M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY}`;
}

function SvgRingChart({
  segments,
}: {
  segments: { percent: number; color: string }[];
}) {
  const SIZE = 164;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const TRACK_COLOR = "rgba(200,190,220,0.3)";

  const rings = [
    {
      r: 72,
      sw: 14,
      color: segments[0]?.color ?? "#22c55e",
      pct: segments[0]?.percent ?? 0,
    },
    {
      r: 53,
      sw: 14,
      color: segments[1]?.color ?? PRIMARY,
      pct: segments[1]?.percent ?? 0,
    },
    {
      r: 34,
      sw: 14,
      color: segments[2]?.color ?? "#ef4444",
      pct: segments[2]?.percent ?? 0,
    },
  ];

  return (
    <Svg width={SIZE} height={SIZE}>
      {rings.map((ring, idx) => (
        <G key={idx}>
          {/* Track */}
          <Circle
            cx={CX}
            cy={CY}
            r={ring.r}
            stroke={TRACK_COLOR}
            strokeWidth={ring.sw}
            fill="none"
          />
          {/* Arc */}
          {ring.pct > 0 && (
            <Path
              d={arcPath(CX, CY, ring.r, ring.pct)}
              stroke={ring.color}
              strokeWidth={ring.sw}
              strokeLinecap="round"
              fill="none"
            />
          )}
        </G>
      ))}
    </Svg>
  );
}

// ─── Bar Chart ───────────────────────────────────────────────────────────────
// Week opacities: alternate dark/light within each month group
const WEEK_OPACITIES = [1, 0.45, 1, 0.45];

function BarChart({ data }: { data: MonthData[] }) {
  const maxVal = useMemo(() => {
    let m = 1;
    data.forEach((month) =>
      month.weeks.forEach((w) => {
        if (w > m) m = w;
      }),
    );
    return m;
  }, [data]);

  const MAX_HEIGHT = 90;

  return (
    <View style={barStyles.container}>
      <View style={barStyles.chart}>
        {data.map((month, mIdx) => (
          <View key={mIdx} style={barStyles.monthGroup}>
            {month.weeks.map((val, wIdx) => {
              const height = Math.max(6, (val / maxVal) * MAX_HEIGHT);
              const opacity = WEEK_OPACITIES[wIdx] ?? 0.5;
              return (
                <View
                  key={wIdx}
                  style={[
                    barStyles.bar,
                    { height, backgroundColor: PRIMARY, opacity },
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>
      {/* Axis line */}
      <View style={barStyles.axisLine} />
      {/* Axis dot + labels */}
      <View style={barStyles.labelsRow}>
        <View style={barStyles.axisDotRow}>
          <View style={barStyles.axisDot} />
          <Text style={barStyles.label}>{data[0]?.label ?? ""}</Text>
        </View>
        <View style={barStyles.axisDotRow}>
          <View style={barStyles.axisDot} />
          <Text style={barStyles.label}>
            {data[data.length - 1]?.label ?? ""}
          </Text>
        </View>
      </View>
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: { width: "100%" },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    height: 100,
    paddingBottom: 2,
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
    minHeight: 6,
  },
  axisLine: {
    height: 2,
    backgroundColor: "#1B1B1B",
    borderRadius: 1,
    marginTop: 2,
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  axisDotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  axisDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#1B1B1B",
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
      <View style={[statStyles.badge, { backgroundColor: color }]}>
        <Text style={statStyles.badgeText}>{percent}%</Text>
      </View>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 6,
  },
  badge: {
    width: 52,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: "#1B1B1B",
    fontWeight: "500",
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
            <HeadsetMicSvg size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ваш рейтинг</Text>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
            <ShieldSvg size={24} />
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
                    {(stats?.first_name?.[0] ?? "") +
                      (stats?.last_name?.[0] ?? "")}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.ratingBadge}>
              <StarSvg size={18} />
              <Text style={styles.ratingBadgeText}>
                {stats?.rating?.toFixed(1) ?? "—"}
              </Text>
            </View>
          </View>

          <Text style={styles.driverName}>
            {stats?.last_name ?? ""} {stats?.first_name ?? ""}
          </Text>

          {/* Stats card */}
          <View style={styles.card}>
            <SvgRingChart segments={segments} />
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
          <Text style={styles.sectionTitle}>Активність по тижнях</Text>
          <View style={styles.card}>
            {stats?.monthly_chart && stats.monthly_chart.length > 0 ? (
              <BarChart data={stats.monthly_chart} />
            ) : (
              <Text style={{ color: "#9ca3af", fontSize: 13 }}>
                Немає даних
              </Text>
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
    paddingTop: 18,
    paddingBottom: 10,
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
    width: 164,
    height: 164,
    borderRadius: 82,
    borderWidth: 6,
    borderColor: PRIMARY,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 152,
    height: 152,
    borderRadius: 76,
  },
  avatarPlaceholder: {
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 38,
    fontWeight: "700",
    color: PRIMARY,
  },
  ratingBadge: {
    position: "absolute",
    bottom: -4,
    right: -8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PRIMARY,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 5,
  },
  ratingBadgeText: {
    fontSize: 16,
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
