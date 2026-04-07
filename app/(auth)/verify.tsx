import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSignUp, useClerk } from '@clerk/expo';
import { verifyStyles as styles } from '../../src/styles/verify.styles';

export default function VerifyScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const { signUp } = useSignUp();
  const { setActive } = useClerk();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const verifyingRef = useRef(false);

  const CODE_LENGTH = 6;

  useEffect(() => {
    if (code.length === CODE_LENGTH) {
      onSubmit();
    }
  }, [code]);

  const onSubmit = async () => {
    if (!signUp || !setActive || verifyingRef.current || code.length < CODE_LENGTH) return;
    
    verifyingRef.current = true;
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      if (signUp.status !== 'complete') {
        const { error: verifyError } = await signUp.verifications.verifyEmailCode({
          code,
        });

        if (verifyError) {
          Alert.alert('Помилка', verifyError.longMessage || verifyError.message || 'Неправильний код');
          setCode('');
          return;
        }
      }

      if (signUp.status === 'complete') {
        const { error: finalizeError } = await signUp.finalize();
        if (finalizeError) throw finalizeError;
        
        const { createdSessionId } = signUp;
        if (createdSessionId) {
          await setActive({ session: createdSessionId });
          router.replace('/(main)/home' as any);
        }
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Помилка', err?.longMessage || err?.message || 'Невірний код підтвердження');
      setCode('');
    } finally {
      setIsLoading(false);
      verifyingRef.current = false;
    }
  };

  const handleResend = async () => {
    if (!signUp) return;
    try {
      await signUp.verifications.sendEmailCode();
      Alert.alert("Код відправлено", "Перевірте вашу електронну пошту");
    } catch (error: any) {
      Alert.alert("Помилка", error.message);
    }
  };

  const isFormValid = code.length === CODE_LENGTH && !isLoading;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.content}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#2D2D2D" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Підтвердження</Text>
              <View style={{ width: 40 }} />
            </View>

            <Text style={styles.subtitle}>
              Для завершення реєстрації введіть {CODE_LENGTH}-значний код, отриманий{'\n'}
              на пошту <Text style={styles.highlightText}>{email || 'вашу пошту'}</Text>
            </Text>

            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              keyboardType="number-pad"
              maxLength={CODE_LENGTH}
              value={code}
              onChangeText={setCode}
              autoFocus
              editable={!isLoading}
            />

            <TouchableOpacity 
              style={styles.codeContainer} 
              activeOpacity={1} 
              onPress={() => inputRef.current?.focus()}
            >
              {[...Array(CODE_LENGTH)].map((_, index) => (
                <View key={index} style={[styles.codeBox, code.length === index && styles.codeBoxActive]}>
                  <Text style={styles.codeText}>
                    {code[index] || ''}
                  </Text>
                </View>
              ))}
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Не отримали код? </Text>
              <TouchableOpacity disabled={isLoading} onPress={handleResend}>
                <Text style={styles.resendLink}>Надіслати ще раз</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
              disabled={!isFormValid}
              onPress={onSubmit}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Підтвердити</Text>
              )}
            </TouchableOpacity>

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
