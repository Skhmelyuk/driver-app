import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { welcomeStyles as styles } from '../../src/styles/welcome.styles';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSpacer} />
      
      <View style={styles.imageWrapper}>
        <Image 
          source={require('../../assets/images/Welcome-Screen.png')} 
          style={styles.welcomeImage}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Вітаємо!</Text>
        <Text style={styles.subtitle}>Почни працювати водієм вже сьогодні !</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={() => router.push('/(auth)/register' as any)}
          activeOpacity={0.7}
        >
          <Text style={styles.primaryButtonText}>Створити акаунт</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={() => router.push('/(auth)/login' as any)}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>Увійти</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
