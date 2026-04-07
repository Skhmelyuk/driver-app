import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSignIn, useClerk } from '@clerk/expo';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { loginStyles as styles } from '../../src/styles/login.styles';

const schema = yup.object().shape({
  email: yup.string().email('Некоректний email').required('Обов\'язкове поле'),
  password: yup.string().min(8, 'Мінімум 8 символів').required('Обов\'язкове поле'),
});

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useSignIn();
  const { setActive } = useClerk();
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState: { errors, isValid } } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = async (data: any) => {
    if (!signIn || !setActive) return;
    setIsLoading(true);

    try {
      const { error: signInError } = await signIn.password({
        emailAddress: data.email,
        password: data.password,
      });

      if (signInError) {
        const isAlreadySignedIn = 
          signInError.code === 'session_exists' || 
          (signInError.longMessage || '').toLowerCase().includes('already signed in');

        if (isAlreadySignedIn) {
          router.replace('/(main)/home' as any);
          return;
        }

        Alert.alert('Помилка', signInError.longMessage || signInError.message || 'Не вдалося увійти');
        return;
      }

      if (signIn.status === 'complete') {
        const { error: finalizeError } = await signIn.finalize();
        if (finalizeError) throw finalizeError;
        
        if (signIn.createdSessionId) {
          await setActive({ session: signIn.createdSessionId });
          router.replace('/(main)/home' as any);
        }
      } else {
        // Handle other statuses like MFA if needed
        Alert.alert('Помилка', 'Для входу потрібні додаткові дії, які поки не підтримуються');
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Помилка', err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || 'Щось пішло не так при вході');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#2D2D2D" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Вхід</Text>
            <View style={{ width: 40 }} />
          </View>

          <Text style={styles.subtitle}>Введіть дані для входу в акаунт водія</Text>

          <View style={styles.formContainer}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
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
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
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
              )}
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, !isValid && styles.submitButtonDisabled]}
            disabled={!isValid || isLoading}
            onPress={handleSubmit(onSubmit)}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Далі</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Ще не маєте акаунта? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
              <Text style={styles.footerLink}>Зареєструватися</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
