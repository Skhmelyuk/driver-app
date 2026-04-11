import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/expo";
import { createAuthenticatedAPI } from "@/services/api";

const GREEN = "#22c55e";
const PRIMARY = "#7900FF";
const BG = "#F0EEF5";

// ─── Types ───────────────────────────────────────────────────────────────
interface WithdrawalRecord {
  id: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "completed";
  admin_comment: string | null;
  payment_reference: string | null;
  created_at: string;
  resolved_at: string | null;
}

// ─── History Status Badge ────────────────────────────────────────────────────
function HistoryStatusBadge({
  status,
}: {
  status: WithdrawalRecord["status"];
}) {
  const config: Record<
    WithdrawalRecord["status"],
    { label: string; color: string; bg: string }
  > = {
    pending: { label: "⏳ Очікує", color: "#f59e0b", bg: "#fffbeb" },
    approved: { label: "✅ Схвалено", color: "#10b981", bg: "#f0fdf4" },
    rejected: { label: "❌ Відхилено", color: "#ef4444", bg: "#fef2f2" },
    completed: { label: "💸 Виплачено", color: "#7900FF", bg: "#f5f3ff" },
  };
  const { label, color, bg } = config[status];
  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
      }}
    >
      <Text style={{ color, fontSize: 11, fontWeight: "700" }}>{label}</Text>
    </View>
  );
}

// ─── Withdrawal Detail Modal ───────────────────────────────────────────────
function WithdrawalDetailModal({
  record,
  onClose,
}: {
  record: WithdrawalRecord | null;
  onClose: () => void;
}) {
  if (!record) return null;

  const statusConfig: Record<
    WithdrawalRecord["status"],
    { label: string; color: string; bg: string }
  > = {
    pending: { label: "⏳ Очікує розгляду", color: "#f59e0b", bg: "#fffbeb" },
    approved: { label: "✅ Схвалено", color: "#10b981", bg: "#f0fdf4" },
    rejected: { label: "❌ Відхилено", color: "#ef4444", bg: "#fef2f2" },
    completed: { label: "💸 Виплачено", color: "#7900FF", bg: "#f5f3ff" },
  };
  const { label, color, bg } = statusConfig[record.status];

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <Modal transparent animationType="fade" visible={!!record}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>Деталі запиту</Text>
          <View style={styles.modalDivider} />

          {/* Amount */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Сума</Text>
            <Text
              style={[
                styles.detailValue,
                { color: PRIMARY, fontWeight: "800" },
              ]}
            >
              {record.amount.toFixed(0)} ₴
            </Text>
          </View>

          {/* Status */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Статус</Text>
            <View
              style={{
                backgroundColor: bg,
                borderRadius: 20,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text style={{ color, fontSize: 12, fontWeight: "700" }}>
                {label}
              </Text>
            </View>
          </View>

          {/* Created */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Надіслано</Text>
            <Text style={styles.detailValue}>{fmt(record.created_at)}</Text>
          </View>

          {/* Resolved */}
          {record.resolved_at && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Оброблено</Text>
              <Text style={styles.detailValue}>{fmt(record.resolved_at)}</Text>
            </View>
          )}

          {/* Admin comment */}
          {record.admin_comment && (
            <View style={styles.detailCommentBox}>
              <Text style={styles.detailCommentLabel}>
                💬 Коментар адміністратора
              </Text>
              <Text style={styles.detailCommentText}>
                {record.admin_comment}
              </Text>
            </View>
          )}

          {/* Payment reference */}
          {record.payment_reference && (
            <View
              style={[
                styles.detailCommentBox,
                { borderColor: "#d1fae5", backgroundColor: "#f0fdf4" },
              ]}
            >
              <Text style={[styles.detailCommentLabel, { color: "#10b981" }]}>
                🟢 Номер транзакції / квитанції
              </Text>
              <Text style={styles.detailCommentText}>
                {record.payment_reference}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.detailCloseBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.detailCloseBtnText}>Закрити</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Date Pill ───────────────────────────────────────────────────────────────
function DatePill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.datePill, active && styles.datePillActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.datePillText, active && styles.datePillTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function WithdrawModal({
  visible,
  amount,
  isLoading,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  amount: number;
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>Запит на виведення ?</Text>
          <View style={styles.modalDivider} />
          <Text style={styles.modalDesc}>
            Сума до виведення:{" "}
            <Text style={{ fontWeight: "700", color: PRIMARY }}>
              {amount.toFixed(0)} ₴
            </Text>
            {"\n\n"}
            Запит буде надіслано адміністратору для розгляду.
          </Text>
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalBtnCancel}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.modalBtnCancelText}>Скасувати</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtnConfirm, isLoading && { opacity: 0.7 }]}
              onPress={isLoading ? undefined : onConfirm}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.modalBtnConfirmText}>Надіслати</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDateForApi(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDateForDisplay(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${d}.${m}.${y}`;
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(formatDateForApi(d));
  }
  return days;
}

interface WalletStats {
  date: string;
  cash_earnings: number;
  cash_rides: number;
  card_earnings: number;
  card_rides: number;
  total_earnings: number;
  total_rides: number;
  all_time_total: number;
  all_time_cash: number;
  all_time_card: number;
  pending_card_withdrawal: number;
  active_withdrawal_status: "pending" | "approved" | "completed" | null;
  payout_card_number: string | null;
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function WalletScreen() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const DATES = getLast7Days();
  const today = formatDateForApi(new Date());
  const [activeDate, setActiveDate] = useState(today);
  const [modal, setModal] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [cardInput, setCardInput] = useState("");
  const [editingCard, setEditingCard] = useState(false);

  const { data: stats, isLoading } = useQuery<WalletStats>({
    queryKey: ["driver", "wallet_stats", activeDate],
    queryFn: async () => {
      const api = createAuthenticatedAPI(getToken);
      const res = await api.getWalletStats(activeDate);
      return res.data;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });

  const { mutate: doWithdraw, isPending: isWithdrawing } = useMutation({
    mutationFn: async () => {
      const api = createAuthenticatedAPI(getToken);
      await api.requestWithdrawal();
    },
    onSuccess: () => {
      setModal(false);
      setWithdrawSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["driver", "wallet_stats"] });
      setTimeout(() => setWithdrawSuccess(false), 4000);
    },
    onError: (error: unknown) => {
      setModal(false);
      const msg =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Не вдалося надіслати запит. Спробуйте пізніше.";
      Alert.alert("Помилка", msg);
    },
  });

  const { mutate: saveCard, isPending: isSavingCard } = useMutation({
    mutationFn: async (cardNumber: string) => {
      const api = createAuthenticatedAPI(getToken);
      await api.savePayoutCard(cardNumber);
    },
    onSuccess: () => {
      setEditingCard(false);
      setCardInput("");
      queryClient.invalidateQueries({ queryKey: ["driver", "wallet_stats"] });
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Не вдалося зберегти картку. Спробуйте пізніше.";
      Alert.alert("Помилка", msg);
    },
  });

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLimit, setHistoryLimit] = useState<5 | 10 | null>(5);
  const [selectedRecord, setSelectedRecord] = useState<WithdrawalRecord | null>(
    null,
  );

  const { data: history = [] } = useQuery<WithdrawalRecord[]>({
    queryKey: ["driver", "withdrawal_history"],
    queryFn: async () => {
      const api = createAuthenticatedAPI(getToken);
      const res = await api.getWithdrawalHistory();
      return res.data;
    },
    staleTime: 0,
    refetchInterval: 30_000,
  });

  const visibleHistory =
    historyLimit === null ? history : history.slice(0, historyLimit);

  const activeStatus = stats?.active_withdrawal_status ?? null;
  const canWithdraw =
    (stats?.pending_card_withdrawal ?? 0) > 0 && activeStatus === null;

  // Show "completed" banner if the most recent withdrawal was completed within last 7 days
  const lastRecord = history[0] ?? null;
  const showCompletedBanner =
    lastRecord?.status === "completed" &&
    activeStatus === null &&
    (stats?.pending_card_withdrawal ?? 0) === 0 &&
    !!lastRecord.resolved_at &&
    Date.now() - new Date(lastRecord.resolved_at).getTime() <
      7 * 24 * 60 * 60 * 1000;

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <Text style={styles.headerTitle}>Ваш дохід</Text>
      </SafeAreaView>

      {/* Date selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dateScroll}
        contentContainerStyle={styles.dateScrollContent}
      >
        {DATES.map((d) => (
          <DatePill
            key={d}
            label={formatDateForDisplay(d)}
            active={activeDate === d}
            onPress={() => setActiveDate(d)}
          />
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Success banner */}
          {withdrawSuccess && (
            <View style={styles.successBanner}>
              <Text style={styles.successBannerText}>
                ✓ Запит на виведення надіслано адміністратору
              </Text>
            </View>
          )}

          {/* Cash card — driver receives cash directly, no withdrawal needed */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text
                style={[
                  styles.cardAmount,
                  {
                    color: (stats?.cash_earnings ?? 0) > 0 ? GREEN : "#1B1B1B",
                  },
                ]}
              >
                {(stats?.cash_earnings ?? 0).toFixed(0)} ₴
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Готівка</Text>
              </View>
            </View>
            <Text style={styles.cardOrders}>
              Замовлень{"  "}
              <Text style={styles.cardOrdersBold}>
                {stats?.cash_rides ?? 0}
              </Text>
            </Text>
            <Text style={styles.cardNote}>
              Готівку водій отримує напряму від клієнта
            </Text>
          </View>

          {/* Card earnings — driver needs to request withdrawal */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text
                style={[
                  styles.cardAmount,
                  {
                    color:
                      (stats?.card_earnings ?? 0) > 0 ? PRIMARY : "#1B1B1B",
                  },
                ]}
              >
                {(stats?.card_earnings ?? 0).toFixed(0)} ₴
              </Text>
              <View style={[styles.badge, styles.badgeCard]}>
                <Text style={[styles.badgeText, styles.badgeCardText]}>
                  Картка
                </Text>
              </View>
            </View>
            <Text style={styles.cardOrders}>
              Замовлень{"  "}
              <Text style={styles.cardOrdersBold}>
                {stats?.card_rides ?? 0}
              </Text>
            </Text>
            {(stats?.pending_card_withdrawal ?? 0) > 0 && (
              <Text style={styles.pendingNote}>
                До виведення: {(stats?.pending_card_withdrawal ?? 0).toFixed(0)}{" "}
                ₴
              </Text>
            )}
            {activeStatus === "pending" && (
              <Text style={styles.pendingRequestNote}>
                ⏳ Запит надіслано — очікує розгляду
              </Text>
            )}
            {activeStatus === "approved" && (
              <Text style={styles.approvedNote}>
                ✅ Запит схвалено — кошти будуть виплачені
              </Text>
            )}
            {showCompletedBanner && (
              <View style={styles.completedBanner}>
                <Text style={styles.completedBannerTitle}>
                  💸 Кошти виплачено!
                </Text>
                <Text style={styles.completedBannerSub}>
                  Перевірте надходження на вашій картці{" "}
                  {stats?.payout_card_number ?? ""}
                </Text>
              </View>
            )}
            {/* Payout card block */}
            {!editingCard && stats?.payout_card_number ? (
              <TouchableOpacity
                style={styles.payoutCardRow}
                onPress={() => {
                  setCardInput(stats.payout_card_number ?? "");
                  setEditingCard(true);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.payoutCardLabel}>💳 Картка виплати</Text>
                <Text style={styles.payoutCardNumber}>
                  {stats.payout_card_number}
                </Text>
                <Text style={styles.payoutCardEdit}>Змінити</Text>
              </TouchableOpacity>
            ) : editingCard ? (
              <View style={styles.payoutCardInputWrap}>
                <TextInput
                  style={styles.payoutCardInput}
                  value={cardInput}
                  onChangeText={(t) => {
                    const digits = t.replace(/\D/g, "").slice(0, 16);
                    const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
                    setCardInput(formatted);
                  }}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  maxLength={19}
                  autoFocus
                />
                <View style={styles.payoutCardActions}>
                  <TouchableOpacity
                    style={styles.payoutCardCancel}
                    onPress={() => setEditingCard(false)}
                  >
                    <Text style={styles.payoutCardCancelText}>Скасувати</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.payoutCardSave,
                      (cardInput.replace(/\s/g, "").length < 16 ||
                        isSavingCard) &&
                        styles.payoutCardSaveDisabled,
                    ]}
                    onPress={() =>
                      cardInput.replace(/\s/g, "").length === 16 &&
                      saveCard(cardInput)
                    }
                    disabled={
                      cardInput.replace(/\s/g, "").length < 16 || isSavingCard
                    }
                  >
                    <Text style={styles.payoutCardSaveText}>
                      {isSavingCard ? "Збереження..." : "Зберегти"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.payoutCardAddBtn}
                onPress={() => setEditingCard(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.payoutCardAddText}>
                  + Додати картку виплати
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.withdrawBtn,
                !canWithdraw && styles.withdrawBtnDisabled,
              ]}
              onPress={canWithdraw ? () => setModal(true) : undefined}
              activeOpacity={canWithdraw ? 0.8 : 1}
            >
              <Text
                style={[
                  styles.withdrawBtnText,
                  !canWithdraw && styles.withdrawBtnTextDisabled,
                ]}
              >
                Запросити виведення
              </Text>
            </TouchableOpacity>
          </View>

          {/* Withdrawal history — collapsible */}
          {history.length > 0 && (
            <View style={styles.historyCard}>
              {/* Header row — burger toggle */}
              <TouchableOpacity
                style={styles.historyHeader}
                onPress={() => setHistoryOpen((v) => !v)}
                activeOpacity={0.8}
              >
                <Text style={styles.historyTitle}>Історія виплат</Text>
                <View style={styles.historyBurger}>
                  <View
                    style={[
                      styles.historyBurgerLine,
                      historyOpen && styles.historyBurgerLineOpen,
                    ]}
                  />
                  <View
                    style={[
                      styles.historyBurgerLine,
                      { width: 14 },
                      historyOpen && styles.historyBurgerLineOpen,
                    ]}
                  />
                  <View
                    style={[
                      styles.historyBurgerLine,
                      historyOpen && styles.historyBurgerLineOpen,
                    ]}
                  />
                </View>
              </TouchableOpacity>

              {historyOpen && (
                <>
                  {/* Limit selector */}
                  <View style={styles.historyLimitRow}>
                    {([5, 10, null] as const).map((val) => (
                      <TouchableOpacity
                        key={String(val)}
                        style={[
                          styles.historyLimitBtn,
                          historyLimit === val && styles.historyLimitBtnActive,
                        ]}
                        onPress={() => setHistoryLimit(val)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.historyLimitText,
                            historyLimit === val &&
                              styles.historyLimitTextActive,
                          ]}
                        >
                          {val === null ? "Всі" : `${val}`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Records */}
                  {visibleHistory.map((item, idx) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.historyRow,
                        idx < visibleHistory.length - 1 &&
                          styles.historyRowBorder,
                      ]}
                      onPress={() => setSelectedRecord(item)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.historyLeft}>
                        <Text style={styles.historyAmount}>
                          {item.amount.toFixed(0)} ₴
                        </Text>
                        <Text style={styles.historyDate}>
                          {new Date(item.created_at).toLocaleDateString(
                            "uk-UA",
                            { day: "2-digit", month: "short", year: "numeric" },
                          )}
                        </Text>
                        {item.status === "rejected" && item.admin_comment && (
                          <Text style={styles.historyRejectedReason}>
                            Причина: {item.admin_comment}
                          </Text>
                        )}
                      </View>
                      <View style={styles.historyRight}>
                        <HistoryStatusBadge status={item.status} />
                        {item.admin_comment && (
                          <Text style={styles.historyCommentHint}>💬</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}

                  {historyLimit !== null && history.length > historyLimit && (
                    <Text style={styles.historyMore}>
                      + ще {history.length - historyLimit} запитів — оберіть
                      “Всі”
                    </Text>
                  )}
                </>
              )}
            </View>
          )}

          {/* All-time summary */}
          <View style={[styles.card, styles.summaryCard]}>
            <Text style={styles.summaryTitle}>Загалом за весь час</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Всього</Text>
              <Text style={styles.summaryValue}>
                {(stats?.all_time_total ?? 0).toFixed(0)} ₴
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Готівкою</Text>
              <Text style={[styles.summaryValue, { color: GREEN }]}>
                {(stats?.all_time_cash ?? 0).toFixed(0)} ₴
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Карткою</Text>
              <Text style={[styles.summaryValue, { color: PRIMARY }]}>
                {(stats?.all_time_card ?? 0).toFixed(0)} ₴
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Withdrawal detail modal */}
      <WithdrawalDetailModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />

      {/* Withdraw modal */}
      <WithdrawModal
        visible={modal}
        amount={stats?.pending_card_withdrawal ?? 0}
        isLoading={isWithdrawing}
        onCancel={() => setModal(false)}
        onConfirm={() => doWithdraw()}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  headerSafe: {
    backgroundColor: BG,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B1B1B",
    textAlign: "center",
    paddingVertical: 14,
  },

  // Date pills
  dateScroll: {
    flexGrow: 0,
    height: 52,
  },
  dateScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: "center",
    height: 52,
  },
  datePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
  },
  datePillActive: {
    backgroundColor: "#7900FF",
    borderColor: "#7900FF",
  },
  datePillText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
  },
  datePillTextActive: {
    color: "#fff",
    fontWeight: "700",
  },

  // Scroll
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 150,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardAmount: {
    fontSize: 32,
    fontWeight: "700",
  },
  cardOrders: {
    fontSize: 16,
    color: "#1B1B1B",
    marginBottom: 16,
  },
  cardOrdersBold: {
    fontWeight: "700",
  },

  // Withdraw button
  withdrawBtn: {
    borderWidth: 1.5,
    borderColor: GREEN,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  withdrawBtnText: {
    color: GREEN,
    fontSize: 14,
    fontWeight: "600",
  },
  withdrawBtnDisabled: {
    borderColor: "#d1d5db",
  },
  withdrawBtnTextDisabled: {
    color: "#9ca3af",
  },

  // Success banner
  successBanner: {
    backgroundColor: "#dcfce7",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#86efac",
  },
  successBannerText: {
    color: "#166534",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },

  // Badge
  badge: {
    backgroundColor: "#dcfce7",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    color: GREEN,
    fontSize: 13,
    fontWeight: "600",
  },
  badgeCard: {
    backgroundColor: "#ede9fe",
  },
  badgeCardText: {
    color: PRIMARY,
  },

  // Card note
  cardNote: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: -10,
    marginBottom: 4,
  },
  pendingNote: {
    fontSize: 13,
    color: PRIMARY,
    fontWeight: "600",
    marginBottom: 8,
  },
  pendingRequestNote: {
    fontSize: 13,
    color: "#f59e0b",
    fontWeight: "500",
    marginBottom: 8,
  },
  approvedNote: {
    fontSize: 13,
    color: "#10b981",
    fontWeight: "600",
    marginBottom: 8,
  },
  completedBanner: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#86efac",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  completedBannerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#16a34a",
    marginBottom: 4,
  },
  completedBannerSub: {
    fontSize: 12,
    color: "#15803d",
    lineHeight: 17,
  },

  // Payout card
  payoutCardRow: {
    backgroundColor: "#f5f3ff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ede9fe",
  },
  payoutCardLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  payoutCardNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: PRIMARY,
    letterSpacing: 1,
    marginBottom: 4,
  },
  payoutCardEdit: {
    fontSize: 12,
    color: "#9ca3af",
    textDecorationLine: "underline",
  },
  payoutCardInputWrap: {
    marginBottom: 10,
  },
  payoutCardInput: {
    borderWidth: 1,
    borderColor: PRIMARY,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: "700",
    color: "#1B1B1B",
    letterSpacing: 2,
    backgroundColor: "#faf5ff",
    marginBottom: 8,
  },
  payoutCardActions: {
    flexDirection: "row",
    gap: 8,
  },
  payoutCardCancel: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
  },
  payoutCardCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  payoutCardSave: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: "center",
  },
  payoutCardSaveDisabled: {
    backgroundColor: "#d1d5db",
  },
  payoutCardSaveText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  payoutCardAddBtn: {
    borderWidth: 1,
    borderColor: PRIMARY,
    borderStyle: "dashed",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  payoutCardAddText: {
    fontSize: 13,
    fontWeight: "600",
    color: PRIMARY,
  },

  // History collapsible
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
  },
  historyBurger: {
    gap: 4,
    alignItems: "flex-end",
    justifyContent: "center",
    padding: 4,
  },
  historyBurgerLine: {
    width: 20,
    height: 2,
    borderRadius: 2,
    backgroundColor: "#9ca3af",
  },
  historyBurgerLineOpen: {
    backgroundColor: PRIMARY,
  },
  historyLimitRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    marginBottom: 4,
  },
  historyLimitBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
  },
  historyLimitBtnActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  historyLimitText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  historyLimitTextActive: {
    color: "#fff",
  },
  historyMore: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 10,
    fontStyle: "italic",
  },
  historyRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  historyCommentHint: {
    fontSize: 14,
  },

  // Detail modal
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  detailLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 13,
    color: "#1B1B1B",
    fontWeight: "600",
    flexShrink: 1,
    textAlign: "right",
    maxWidth: "60%",
  },
  detailCommentBox: {
    marginTop: 14,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  detailCommentLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  detailCommentText: {
    fontSize: 14,
    color: "#1B1B1B",
    lineHeight: 20,
  },
  detailCloseBtn: {
    marginTop: 20,
    backgroundColor: PRIMARY,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  detailCloseBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },

  // History
  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6b7280",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  historyRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  historyLeft: {
    flex: 1,
    marginRight: 8,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B1B1B",
  },
  historyDate: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  historyRejectedReason: {
    fontSize: 11,
    color: "#ef4444",
    marginTop: 4,
    fontStyle: "italic",
  },

  // Summary card
  summaryCard: {
    backgroundColor: "#faf5ff",
    borderWidth: 1,
    borderColor: "#e9d5ff",
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6b7280",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1B1B1B",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#e9d5ff",
    marginVertical: 8,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    width: "100%",
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1B1B1B",
    textAlign: "center",
    marginBottom: 14,
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginBottom: 14,
  },
  modalDesc: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "left",
    lineHeight: 20,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalBtnCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalBtnCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1B1B1B",
  },
  modalBtnConfirm: {
    flex: 1,
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalBtnConfirmText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});
