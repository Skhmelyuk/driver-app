import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "@/constants/theme";
import { profileStyles as styles } from "@/styles/profile.styles";

type ProfileHeaderProps = {
  onBack: () => void;
  onLogout?: () => void;
  compact?: boolean;
};

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  onBack,
  onLogout,
  compact,
}) => (
  <View style={[styles.header, compact && styles.headerCompact]}>
    <TouchableOpacity style={styles.backButton} onPress={onBack}>
      <Ionicons name="chevron-back" size={22} color={Colors.black} />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Ваш профіль</Text>
    
    {onLogout ? (
      <TouchableOpacity style={styles.headerRight} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={22} color={Colors.error} />
      </TouchableOpacity>
    ) : (
      <View style={styles.headerSpacer} />
    )}
  </View>
);
