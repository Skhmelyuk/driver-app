import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@clerk/expo";
import { createAuthenticatedAPI } from "@/services/api";

const GREEN = "#2E7D32";
const STAR_FILLED = "#F5A623";
const STAR_EMPTY = "#1B1B1B";

export default function RatePassengerScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { rideId } = useLocalSearchParams<{ rideId: string }>();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (rating === 0) {
      Alert.alert("Оберіть оцінку", "Будь ласка, оберіть кількість зірок.");
      return;
    }
    setSubmitting(true);
    try {
      const api = createAuthenticatedAPI(getToken);
      await api.ratePassenger(rideId, rating, comment.trim() || undefined);
      router.replace("/(main)/(tabs)" as any);
    } catch {
      Alert.alert("Помилка", "Не вдалося зберегти оцінку. Спробуйте ще раз.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Text style={styles.title}>Оцініть пасажира</Text>

      {/* Stars */}
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            activeOpacity={0.7}
            style={styles.starBtn}
          >
            <Text
              style={[
                styles.star,
                { color: star <= rating ? STAR_FILLED : STAR_EMPTY },
              ]}
            >
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Safety note */}
      <Text style={styles.note}>
        Після підтвердження команда підтримки{"\n"}може зв'язатися з вами у
        випадках{"\n"}пов'язаних з безпекою.
      </Text>

      {/* Comment */}
      <TextInput
        style={styles.commentInput}
        placeholder="Додати коментар"
        placeholderTextColor="#AAAAAA"
        value={comment}
        onChangeText={setComment}
        multiline
        maxLength={300}
      />

      <View style={styles.spacer} />

      {/* Confirm button */}
      <TouchableOpacity
        style={[styles.confirmBtn, rating === 0 && styles.disabledBtn]}
        onPress={handleConfirm}
        disabled={submitting || rating === 0}
        activeOpacity={0.85}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.confirmBtnText}>Підтвердити</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F1F6",
    paddingHorizontal: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1B1B1B",
    marginTop: 32,
    marginBottom: 28,
    textAlign: "center",
  },
  starsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  starBtn: {
    padding: 4,
  },
  star: {
    fontSize: 52,
  },
  note: {
    fontSize: 13,
    color: "#555",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  commentInput: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1B1B1B",
    minHeight: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  spacer: { flex: 1 },
  confirmBtn: {
    width: "100%",
    backgroundColor: GREEN,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 8,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  confirmBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
