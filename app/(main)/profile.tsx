import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm } from "react-hook-form";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

import {
  useDriverProfile,
  useUpdateUserProfile,
  useUploadDriverDocument,
} from "@/hooks/useDriverRegistration";
import { DriverDocument, DriverDocumentType } from "@/types/auth.types";
import { Colors } from "@/constants/theme";
import { profileStyles as styles } from "@/styles/profile.styles";
import { useDriverStore } from "@/store/driverStore";
import { ProfileHeader } from "@/screens/profile/components/ProfileHeader";
import { AvatarSection } from "@/screens/profile/components/AvatarSection";
import { PersonalInfoForm } from "@/screens/profile/components/PersonalInfoForm";
import { DocumentsSection } from "@/screens/profile/components/DocumentsSection";
import type { ProfileFormValues } from "@/screens/profile/types";
import {
  PHONE_MASK,
  buildPhonePayload,
  getErrorMessage,
  mapDriverToFormValues,
  unmaskDateInput,
} from "@/screens/profile/utils";

export default function ProfileScreen() {
  const router = useRouter();
  const { data: driverData, isLoading } = useDriverProfile();
  const updateProfile = useUpdateUserProfile();
  const uploadDocument = useUploadDriverDocument();
  const { setDriver } = useDriverStore();
  const [uploadingDoc, setUploadingDoc] = useState<DriverDocumentType | null>(
    null,
  );

  const initialValues = useMemo(
    () => mapDriverToFormValues(driverData),
    [driverData],
  );

  const {
    control,
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (driverData) {
      setDriver(driverData);
      reset(mapDriverToFormValues(driverData));
    }
  }, [driverData, reset, setDriver]);

  const formValues = watch();
  const documents: DriverDocument[] = driverData?.documents ?? [];
  const { width, height } = useWindowDimensions();
  const isCompact = height < 780;
  const isNarrow = width < 360;

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      first_name: values.firstName.trim() || undefined,
      last_name: values.lastName.trim() || undefined,
      phone_number: buildPhonePayload(values.phoneNumber),
      date_of_birth: unmaskDateInput(values.dateOfBirth),
      profile_image: values.profileImage || undefined,
    };

    try {
      await updateProfile.mutateAsync(payload);
      Alert.alert("Готово", "Профіль успішно оновлено");
    } catch (error) {
      Alert.alert("Помилка", getErrorMessage(error));
    }
  });

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.75,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    if (!asset.uri) return;

    setValue("profileImage", asset.uri, { shouldDirty: true });
  };

  const handleUploadDocument = async (docType: DriverDocumentType) => {
    if (uploadDocument.isPending) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.75,
    });

    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    if (!asset.uri) {
      Alert.alert("Помилка", "Не вдалося отримати файл");
      return;
    }

    const formData = new FormData();
    formData.append("doc_type", docType);
    formData.append("file", {
      uri: asset.uri,
      name: asset.fileName || `${docType}.jpg`,
      type: asset.mimeType || "image/jpeg",
    } as any);

    setUploadingDoc(docType);
    try {
      await uploadDocument.mutateAsync(formData);
      Alert.alert("Готово", "Документ успішно завантажено");
    } catch (error) {
      Alert.alert("Помилка", getErrorMessage(error));
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleResetForm = () => {
    reset(initialValues);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const isSaveDisabled = updateProfile.isPending || !isDirty;
  const contentStyles = [
    styles.content,
    isCompact && styles.contentCompact,
    isNarrow && styles.contentNarrow,
  ];
  const footerStyles = [styles.footer, isCompact && styles.footerCompact];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.screenLayout}>
          <View style={contentStyles}>
            <ProfileHeader onBack={() => router.back()} compact={isCompact} />

            <AvatarSection
              imageUri={formValues.profileImage}
              placeholderInitial={
                driverData?.user?.first_name &&
                driverData.user.first_name.trim()
                  ? driverData.user.first_name.charAt(0).toUpperCase()
                  : "?"
              }
              onPickAvatar={handlePickAvatar}
              compact={isCompact}
            />

            <PersonalInfoForm
              control={control}
              errors={errors}
              phonePrefix={PHONE_MASK}
              compact={isCompact}
              narrow={isNarrow}
            />

            <DocumentsSection
              driver={driverData}
              documents={documents}
              uploadingDoc={uploadingDoc}
              isUploading={uploadDocument.isPending}
              onUpload={handleUploadDocument}
              compact={isCompact}
              narrow={isNarrow}
            />
          </View>

          <View style={footerStyles}>
            <TouchableOpacity
              style={[
                styles.footerButton,
                isCompact && styles.footerButtonCompact,
                styles.cancelButton,
              ]}
              onPress={handleResetForm}
              disabled={updateProfile.isPending || uploadDocument.isPending}
            >
              <Text style={styles.cancelText}>Скасувати</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.footerButton,
                isCompact && styles.footerButtonCompact,
                isSaveDisabled
                  ? styles.saveButtonDisabled
                  : styles.saveButtonActive,
              ]}
              onPress={onSubmit}
              disabled={isSaveDisabled}
            >
              {updateProfile.isPending ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.saveText}>Зберегти</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
