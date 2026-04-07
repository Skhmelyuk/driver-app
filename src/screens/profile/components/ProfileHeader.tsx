import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "@/constants/theme";
import { profileStyles as styles } from "@/styles/profile.styles";

type ProfileHeaderProps = {
  onBack: () => void;
  compact?: boolean;
};

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  onBack,
  compact,
}) => (
  <View style={[styles.header, compact && styles.headerCompact]}>
    <TouchableOpacity style={styles.backButton} onPress={onBack}>
      <Ionicons name="chevron-back" size={22} color={Colors.black} />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Ваш профіль</Text>
    <View style={styles.headerSpacer} />
  </View>
);
