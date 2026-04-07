import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSignUp } from "@clerk/expo";
import { registerStyles as styles } from "@/styles/register.styles";

const schema = yup.object().shape({
  lastName: yup.string().required("Обов'язкове поле"),
  firstName: yup.string().required("Обов'язкове поле"),
  email: yup.string().email("Некоректний email").required("Обов'язкове поле"),
  phone: yup
    .string()
    .matches(/^\d{9}$/, "Введіть 9 цифр номеру")
    .required("Обов'язкове поле"),
  password: yup
    .string()
    .min(8, "Мінімум 8 символів")
    .required("Обов'язкове поле"),
});

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useSignUp();
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const onSubmit = async (data: any) => {
    if (!signUp) return;
    setIsLoading(true);

    try {
      // 1. Create user with email and password
      const { error: signUpError } = await signUp.password({
        emailAddress: data.email,
        password: data.password,
      });

      if (signUpError) {
        Alert.alert("Помилка", signUpError.longMessage || signUpError.message);
        return;
      }

      // 2. Update user profile details (Name + Phone)
      // NOTE: publicMetadata cannot be set from the client (Clerk restriction).
      // Role 'driver' will be assigned by the Django webhook (user.created/user.updated)
      // via Clerk Backend API. We use unsafeMetadata for phone (allowed from client).
      const fullPhone = `+380${data.phone}`;
      await (signUp as any).update({
        firstName: data.firstName,
        lastName: data.lastName,
        unsafeMetadata: {
          phone_number: fullPhone,
        },
      });

      // 3. Prepare email verification
      const { error: sendCodeError } =
        await signUp.verifications.sendEmailCode();

      if (sendCodeError) {
        Alert.alert("Помилка", sendCodeError.message);
        return;
      }

      // Navigate to verification screen
      router.push({
        pathname: "/(auth)/verify" as any,
        params: { email: data.email },
      });
    } catch (err: any) {
      console.error(err);
      Alert.alert("Помилка", err?.message || "Щось пішло не так");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = isValid && agreed && !isLoading;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#2D2D2D" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Реєстрація</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.formContainer}>
            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, errors.lastName && styles.inputError]}
                    placeholder="Прізвище"
                    placeholderTextColor="#A0A0A0"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isLoading}
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      errors.firstName && styles.inputError,
                    ]}
                    placeholder="Ім'я"
                    placeholderTextColor="#A0A0A0"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isLoading}
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="Електронна пошта"
                    placeholderTextColor="#A0A0A0"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isLoading}
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  style={[
                    styles.input,
                    styles.phoneInputContainer,
                    errors.phone && styles.inputError,
                  ]}
                >
                  <View style={styles.phonePrefix}>
                    <Text style={styles.phonePrefixText}>+380</Text>
                  </View>
                  <View style={styles.separator} />
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Ваш номер телефону"
                    placeholderTextColor="#A0A0A0"
                    keyboardType="phone-pad"
                    maxLength={9}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isLoading}
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, errors.password && styles.inputError]}
                    placeholder="Пароль"
                    placeholderTextColor="#A0A0A0"
                    secureTextEntry
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isLoading}
                  />
                </View>
              )}
            />
          </View>

          <View style={styles.termsContainer}>
            <TouchableOpacity
              onPress={() => setAgreed(!agreed)}
              style={styles.checkboxTouch}
              disabled={isLoading}
            >
              <Ionicons
                name={agreed ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={agreed ? "#34C759" : "#D1D1D6"}
              />
            </TouchableOpacity>
            <Text style={styles.termsText}>
              Реєструючись, ви погоджуєтеся з{" "}
              <Text style={styles.termsLink}>Умовами надання послуг</Text> та{" "}
              <Text style={styles.termsLink}>Політикою конфіденційності</Text>.
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              !isFormValid && styles.submitButtonDisabled,
            ]}
            disabled={!isFormValid}
            onPress={handleSubmit(onSubmit)}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Зареєструватися</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
