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
  ScrollView,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, FormProvider } from "react-hook-form";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUser, useAuth } from "@clerk/expo";

import {
  useDriverProfile,
  useUpdateUserProfile,
  useUploadDriverDocument,
  useDriverRegistration,
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
  const { width, height } = useWindowDimensions();
  const isCompact = height < 780;
  const isNarrow = width < 360;
  const { user } = useUser();
  const { data: driverData, isLoading, isError, error, refetch } = useDriverProfile();
  const { registerAsync, isLoading: isRegistering } = useDriverRegistration();
  const updateProfile = useUpdateUserProfile();
  const uploadDocument = useUploadDriverDocument();
  const { setDriver } = useDriverStore();
  const { signOut } = useAuth();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [optimisticAvatar, setOptimisticAvatar] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });
  const [pendingDocuments, setPendingDocuments] = useState<
    Partial<
      Record<
        DriverDocumentType,
        | { uri: string; name: string; type: string }
        | { uri: string; name: string; type: string }[]
      >
    >
  >({});

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setIsKeyboardVisible(true)
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const initialValues = useMemo(
    () => mapDriverToFormValues(driverData),
    [driverData],
  );

  const methods = useForm<ProfileFormValues>({
    defaultValues: initialValues,
  });

  const {
    control,
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isDirty },
  } = methods;

  useEffect(() => {
    if (driverData) {
      setDriver(driverData);
      reset(mapDriverToFormValues(driverData));
    }
  }, [driverData, reset, setDriver]);

  const formValues = watch();
  const documents: DriverDocument[] = driverData?.documents ?? [];
  const docEntries = useMemo(
    () =>
      Object.entries(pendingDocuments) as [
        DriverDocumentType,
        | { uri: string; name: string; type: string }
        | { uri: string; name: string; type: string }[],
      ][],
    [pendingDocuments],
  );
  const pendingDocFlags = useMemo(() => {
    return docEntries.reduce(
      (acc, [key]) => {
        acc[key] = true;
        return acc;
      },
      {} as Partial<Record<DriverDocumentType, boolean>>,
    );
  }, [docEntries]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      first_name: values.firstName.trim() || undefined,
      last_name: values.lastName.trim() || undefined,
      phone_number: buildPhonePayload(values.phoneNumber),
      date_of_birth: unmaskDateInput(values.dateOfBirth),
      license_expiry: unmaskDateInput(values.licenseExpiry),
      vehicle_plate: values.vehiclePlate,
    };

    const hasProfileChanges = isDirty;
    const hasDocuments = docEntries.length > 0;

    if (!hasProfileChanges && !hasDocuments) {
      Alert.alert(
        "Немає змін",
        "Оновіть дані профілю або додайте документи, щоб зберегти",
      );
      return;
    }

    const isFirstTimeRegistration = !driverData;

    try {
      if (hasProfileChanges || isFirstTimeRegistration) {
        await updateProfile.mutateAsync(payload);
        
        if (isFirstTimeRegistration) {
          await registerAsync({
            vehicle_type: "economy", 
          } as any);
        }

        reset(values);
      }

      if (hasDocuments) {
        for (const [docType, files] of docEntries) {
          if (Array.isArray(files)) {
            for (let i = 0; i < files.length; i++) {
              const formData = new FormData();
              const dt = (docType === "vehicle_photo" && i > 0) ? `vehicle_photo_${i + 1}` : docType;
              formData.append("doc_type", dt);
              formData.append("file", {
                uri: files[i].uri,
                name: files[i].name,
                type: files[i].type,
              } as any);
              await uploadDocument.mutateAsync(formData);
            }
          } else {
            const formData = new FormData();
            formData.append("doc_type", docType);
            formData.append("file", {
              uri: files.uri,
              name: files.name,
              type: files.type,
            } as any);
            await uploadDocument.mutateAsync(formData);
          }
        }
        setPendingDocuments({});
      }

      showToast("Профіль успішно оновлено");
    } catch (error) {
      Alert.alert("Помилка", getErrorMessage(error));
    }
  });

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handlePickAvatar = async () => {
    if (!user) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.75,
      base64: true,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    if (!asset.uri) return;

    try {
      setIsUploadingAvatar(true);
      const base64 = asset.base64;
      if (!base64) {
         throw new Error("Не вдалося отримати дані зображення");
      }

      const mimeType = asset.mimeType || "image/jpeg";
      const imageEncoded = `data:${mimeType};base64,${base64}`;

      setOptimisticAvatar(asset.uri);
      setValue("profileImage", asset.uri);

      await user.setProfileImage({
        file: imageEncoded,
      });

      setTimeout(() => {
        refetch();
        setOptimisticAvatar(null);
      }, 2000);
      
      Alert.alert("Успіх", "Фото профілю оновлено");
    } catch (error) {
      console.error("Avatar upload error:", error);
      Alert.alert("Помилка", "Не вдалося завантажити фото");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/(auth)/welcome");
    } catch (error) {
       Alert.alert("Помилка", "Не вдалося вийти з акаунта");
    }
  };

  const handleUploadDocument = async (docType: DriverDocumentType) => {
    const isVehiclePhoto = docType === "vehicle_photo";
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.75,
      allowsMultipleSelection: isVehiclePhoto,
      selectionLimit: isVehiclePhoto ? 3 : 1,
    });

    if (result.canceled || !result.assets?.length) return;

    if (isVehiclePhoto && result.assets.length !== 3) {
      Alert.alert("Фото автомобіля", "Будь ласка, виберіть рівно 3 фотографії автомобіля.");
      return;
    }

    if (isVehiclePhoto) {
      const files = result.assets.map((asset, i) => ({
        uri: asset.uri,
        name: asset.fileName || `${docType}_${i + 1}.jpg`,
        type: asset.mimeType || "image/jpeg",
      }));
      setPendingDocuments((prev) => ({ ...prev, [docType]: files }));
      showToast("3 фото автомобіля готові до збереження");
    } else {
      const asset = result.assets[0];
      setPendingDocuments((prev) => ({
        ...prev,
        [docType]: {
          uri: asset.uri,
          name: asset.fileName || `${docType}.jpg`,
          type: asset.mimeType || "image/jpeg",
        },
      }));
      showToast("Документ готовий до збереження");
    }
  };

  const handleResetForm = () => {
    reset(initialValues);
    setPendingDocuments({});
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

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={Colors.error}
          />
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              marginTop: 16,
              textAlign: "center",
              color: "#333",
            }}
          >
            Не вдалося завантажити профіль
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#666",
              textAlign: "center",
              marginTop: 8,
              marginBottom: 24,
            }}
          >
            {getErrorMessage(error)}
          </Text>
          <TouchableOpacity
            style={[
              styles.footerButton,
              { width: "100%", backgroundColor: Colors.primary },
            ]}
            onPress={() => router.back()}
          >
            <Text style={{ color: "#FFF", fontWeight: "600" }}>Назад</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.footerButton,
              { width: "100%", marginTop: 12, backgroundColor: "#F2F2F7" },
            ]}
            onPress={handleLogout}
          >
            <Text style={{ color: Colors.error, fontWeight: "600" }}>Вийти з акаунта</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const hasPendingDocs = docEntries.length > 0;
  const saveInProgress = updateProfile.isPending || uploadDocument.isPending || isRegistering;
  const isFirstTimeRegistration = !driverData;
  const isSaveDisabled = saveInProgress || (!isDirty && !hasPendingDocs && !isFirstTimeRegistration);

  const contentStyles = [
    styles.content,
    isCompact && styles.contentCompact,
    isNarrow && styles.contentNarrow,
    { paddingBottom: isKeyboardVisible ? 60 : 20 }
  ];
  const footerStyles = [styles.footer, isCompact && styles.footerCompact];

  return (
    <SafeAreaView style={styles.container}>
      <FormProvider {...methods}>
        <KeyboardAvoidingView
          style={styles.screen}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.screenLayout}>
            <View style={{ paddingHorizontal: 24, paddingTop: 10 }}>
              <ProfileHeader 
                onBack={() => router.back()} 
                onLogout={handleLogout}
                compact={isCompact} 
              />
            </View>

            <ScrollView 
              style={{ flex: 1 }}
              contentContainerStyle={contentStyles}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              scrollEnabled={isKeyboardVisible || isCompact} 
            >
              <AvatarSection
                imageUri={optimisticAvatar || formValues.profileImage}
                placeholderInitial={
                  driverData?.user?.first_name &&
                  driverData.user.first_name.trim()
                    ? driverData.user.first_name.charAt(0).toUpperCase()
                    : "?"
                }
                onPickAvatar={handlePickAvatar}
                compact={isCompact}
              />

              {isUploadingAvatar && (
                 <View style={{ marginTop: -20, marginBottom: 10 }}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                 </View>
              )}

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
                onUpload={handleUploadDocument}
                pendingDocuments={pendingDocFlags}
                disableInteractions={saveInProgress}
                compact={isCompact}
                narrow={isNarrow}
              />
              
              {/* Re-enabled spacer for Android as well to allow scrolling above keyboard */}
              {isKeyboardVisible && (
                <View style={{ height: Platform.OS === "ios" ? 60 : 300 }} />
              )}
            </ScrollView>

            <View style={footerStyles}>
              <TouchableOpacity
                style={[
                  styles.footerButton,
                  isCompact && styles.footerButtonCompact,
                  styles.cancelButton,
                ]}
                onPress={handleResetForm}
                disabled={saveInProgress}
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
                {saveInProgress ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.saveText}>
                    {isFirstTimeRegistration ? "Створити профіль" : "Зберегти"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </FormProvider>

      {toast.visible && (
        <View style={styles.toastContainer}>
          <Ionicons name="information-circle" size={24} color="#FFF" />
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
