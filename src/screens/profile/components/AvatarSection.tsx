import React, { memo } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "@/constants/theme";
import { profileStyles as styles } from "@/styles/profile.styles";

type AvatarSectionProps = {
  imageUri?: string;
  placeholderInitial?: string;
  onPickAvatar: () => void;
  compact?: boolean;
};

const AvatarSectionComponent: React.FC<AvatarSectionProps> = ({
  imageUri,
  placeholderInitial,
  onPickAvatar,
  compact,
}) => (
  <View style={[styles.avatarSection, compact && styles.avatarSectionCompact]}>
    <View
      style={[styles.avatarWrapper, compact && styles.avatarWrapperCompact]}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={[styles.avatarImage, compact && styles.avatarImageCompact]}
        />
      ) : (
        <Text
          style={[
            styles.avatarPlaceholderText,
            compact && styles.avatarPlaceholderCompact,
          ]}
        >
          {placeholderInitial || "?"}
        </Text>
      )}
      <TouchableOpacity
        style={[styles.cameraButton, compact && styles.cameraButtonCompact]}
        onPress={onPickAvatar}
      >
        <Ionicons name="camera-outline" size={18} color={Colors.white} />
      </TouchableOpacity>
    </View>
  </View>
);

export const AvatarSection = memo(AvatarSectionComponent);
