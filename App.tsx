import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  SafeAreaView,
  Animated,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';

// Import Screens
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';

import { API_URL } from './config';

type ScreenType = 'onboarding' | 'login' | 'register' | 'welcome';

interface UserType {
  username: string;
  email: string;
}

export default function App() {
  // Load clean geometric typography
  const [fontsLoaded] = useFonts({
    'GeistSans-Regular': Inter_400Regular,
    'GeistSans-Medium': Inter_500Medium,
    'GeistSans-SemiBold': Inter_600SemiBold,
    'GeistSans-Bold': Inter_700Bold,
    'GeistSans-ExtraBold': Inter_800ExtraBold,
  });

  const [screen, setScreen] = useState<ScreenType>('onboarding');
  const [loading, setLoading] = useState<boolean>(false);
  const [sessionLoading, setSessionLoading] = useState<boolean>(true);

  // Form states
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loginInput, setLoginInput] = useState<string>(''); // email or username
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

  // Authenticated state
  const [user, setUser] = useState<UserType | null>(null);

  // Animations & Toast
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'error',
  });
  const toastY = useRef(new Animated.Value(-120)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Check login session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const transitionTo = (nextScreen: ScreenType) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setScreen(nextScreen);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
    });
  };

  const showToast = (message: string, type: 'success' | 'error' = 'error') => {
    setToast({ visible: true, message, type });
    Animated.sequence([
      Animated.timing(toastY, {
        toValue: 50,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(toastY, {
        toValue: -120,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    });
  };

  const checkSession = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await fetch(`${API_URL}/auth/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok && data.success) {
          setUser(data.user);
          setScreen('welcome');
        } else {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
        }
      }
    } catch (err) {
      console.log('Session validation failed:', err);
    } finally {
      setSessionLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      showToast('Harap lengkapi semua kolom input!', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Password dan konfirmasi password tidak cocok!', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password minimal harus 6 karakter!', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        showToast('Registrasi berhasil! Silakan masuk.', 'success');
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        transitionTo('login');
      } else {
        showToast(data.error || 'Registrasi gagal. Coba lagi.', 'error');
      }
    } catch (err) {
      showToast('Gagal terhubung ke server backend.', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!loginInput || !password) {
      showToast('Harap isi email/username dan password!', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailOrUsername: loginInput,
          password,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        
        setLoginInput('');
        setPassword('');
        showToast('Selamat datang kembali!', 'success');
        transitionTo('welcome');
      } else {
        showToast(data.error || 'Login gagal. Cek kembali akun Anda.', 'error');
      }
    } catch (err) {
      showToast('Gagal terhubung ke server backend.', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
      showToast('Anda telah keluar akun.', 'success');
      transitionTo('login');
    } catch (err) {
      showToast('Gagal logout.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading || !fontsLoaded) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Memuat Echo Tech...</Text>
      </View>
    );
  }

  const isLightScreen = screen === 'login' || screen === 'register' || screen === 'welcome';

  return (
    <SafeAreaView style={[
      styles.container,
      screen === 'onboarding' && { backgroundColor: '#38a154' },
      isLightScreen && { backgroundColor: '#F9FAFB' }
    ]}>
      <StatusBar
        barStyle={isLightScreen ? 'dark-content' : 'light-content'}
        backgroundColor={screen === 'onboarding' ? '#38a154' : isLightScreen ? '#F9FAFB' : '#090D16'}
      />
      
      {toast.visible && (
        <Animated.View
          style={[
            styles.toast,
            {
              transform: [{ translateY: toastY }],
              backgroundColor: toast.type === 'success' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
            },
          ]}
        >
          <Ionicons
            name={toast.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
            size={22}
            color="#fff"
          />
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
      )}

      <Animated.View style={[styles.flex1, { opacity: fadeAnim }]}>
        {screen === 'onboarding' && (
          <OnboardingScreen transitionTo={transitionTo} />
        )}

        {screen === 'login' && (
          <LoginScreen
            loginInput={loginInput}
            setLoginInput={setLoginInput}
            password={password}
            setPassword={setPassword}
            passwordVisible={passwordVisible}
            setPasswordVisible={setPasswordVisible}
            handleLogin={handleLogin}
            loading={loading}
            transitionTo={transitionTo}
          />
        )}

        {screen === 'register' && (
          <RegisterScreen
            username={username}
            setUsername={setUsername}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            handleRegister={handleRegister}
            loading={loading}
            transitionTo={transitionTo}
          />
        )}

        {screen === 'welcome' && user && (
          <DashboardScreen
            user={user}
            handleLogout={handleLogout}
            loading={loading}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16', // Deep elegant slate dark background
  },
  flex1: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 14,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.5,
    fontFamily: 'GeistSans-Medium',
  },
  toast: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 999,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
    fontFamily: 'GeistSans-SemiBold',
  },
});
