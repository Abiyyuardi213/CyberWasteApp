import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

interface RegisterScreenProps {
  showToast: (message: string, type?: 'success' | 'error') => void;
}

type FieldType = 'username' | 'email' | 'password' | 'confirmPassword';

export default function RegisterScreen({ showToast }: RegisterScreenProps) {
  const navigation = useNavigation<any>();
  const { register } = useAuth();
  const [focusedInput, setFocusedInput] = useState<FieldType | null>(null);
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isButtonActive, setIsButtonActive] = useState<boolean>(false);

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Continuous decorative animations
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;

  // Button feedback
  const buttonScale = useRef(new Animated.Value(1)).current;
  const buttonGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 24000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, {
          toValue: 1,
          duration: 3200,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim1, {
          toValue: 0,
          duration: 3200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, {
          toValue: 1,
          duration: 3800,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim2, {
          toValue: 0,
          duration: 3800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleButtonActiveIn = () => {
    setIsButtonActive(true);
    Animated.parallel([
      Animated.spring(buttonScale, {
        toValue: 0.98,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(buttonGlow, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleButtonActiveOut = () => {
    setIsButtonActive(false);
    Animated.parallel([
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(buttonGlow, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
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
    const result = await register(username, email, password);
    setLoading(false);

    if (result.success) {
      showToast('Registrasi berhasil! Silakan masuk.', 'success');
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      navigation.navigate('Login');
    } else {
      showToast(result.error || 'Registrasi gagal. Coba lagi.', 'error');
    }
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const float1Interpolate = floatAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const float2Interpolate = floatAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  const glowOpacity = buttonGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.35],
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#f0fdf4" />

      {/* Background gradient */}
      <LinearGradient
        colors={['#dcfce7', '#f0fdf4', '#eff6ff'] as const}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Floating eco glass bubbles */}
      <Animated.View
        style={[styles.ecoBubble, styles.orb1, { transform: [{ translateY: float1Interpolate }, { rotate: rotateInterpolate }] }]}
        pointerEvents="none"
      >
        <BlurView intensity={40} tint="light" style={styles.orbBlur} />
        <MaterialCommunityIcons name="leaf" size={30} color="rgba(22, 163, 74, 0.55)" style={styles.ecoIcon} />
      </Animated.View>

      <Animated.View
        style={[styles.ecoBubble, styles.orb2, { transform: [{ translateY: float2Interpolate }, { rotate: rotateInterpolate }] }]}
        pointerEvents="none"
      >
        <BlurView intensity={35} tint="light" style={styles.orbBlur} />
        <MaterialCommunityIcons
          name="bottle-soda-classic-outline"
          size={26}
          color="rgba(59, 130, 246, 0.5)"
          style={styles.ecoIcon}
        />
      </Animated.View>

      <Animated.View
        style={[styles.ecoBubble, styles.orb3, { transform: [{ translateY: float1Interpolate }, { rotate: rotateInterpolate }] }]}
        pointerEvents="none"
      >
        <BlurView intensity={30} tint="light" style={styles.orbBlur} />
        <MaterialCommunityIcons name="leaf" size={20} color="rgba(16, 185, 129, 0.5)" style={styles.ecoIcon} />
      </Animated.View>

      <Animated.View
        style={[styles.ecoBubble, styles.orb4, { transform: [{ translateY: float2Interpolate }, { rotate: rotateInterpolate }] }]}
        pointerEvents="none"
      >
        <BlurView intensity={30} tint="light" style={styles.orbBlur} />
        <MaterialCommunityIcons name="trash-can-outline" size={22} color="rgba(100, 116, 139, 0.55)" style={styles.ecoIcon} />
      </Animated.View>

      <Animated.View
        style={[styles.ecoBubble, styles.orb5, { transform: [{ translateY: float1Interpolate }, { rotate: rotateInterpolate }] }]}
        pointerEvents="none"
      >
        <BlurView intensity={35} tint="light" style={styles.orbBlur} />
        <MaterialCommunityIcons name="leaf" size={18} color="rgba(34, 197, 94, 0.5)" style={styles.ecoIcon} />
      </Animated.View>

      <Animated.View
        style={[styles.ecoBubble, styles.orb6, { transform: [{ translateY: float2Interpolate }, { rotate: rotateInterpolate }] }]}
        pointerEvents="none"
      >
        <BlurView intensity={30} tint="light" style={styles.orbBlur} />
        <MaterialCommunityIcons name="recycle" size={24} color="rgba(34, 197, 94, 0.5)" style={styles.ecoIcon} />
      </Animated.View>

      <Animated.View
        style={[styles.ecoBubble, styles.orb7, { transform: [{ translateY: float1Interpolate }, { rotate: rotateInterpolate }] }]}
        pointerEvents="none"
      >
        <BlurView intensity={30} tint="light" style={styles.orbBlur} />
        <MaterialCommunityIcons name="leaf" size={16} color="rgba(22, 163, 74, 0.5)" style={styles.ecoIcon} />
      </Animated.View>

      <Animated.View
        style={[styles.ecoBubble, styles.orb8, { transform: [{ translateY: float2Interpolate }, { rotate: rotateInterpolate }] }]}
        pointerEvents="none"
      >
        <BlurView intensity={32} tint="light" style={styles.orbBlur} />
        <MaterialCommunityIcons name="bag-personal-outline" size={22} color="rgba(100, 116, 139, 0.5)" style={styles.ecoIcon} />
      </Animated.View>

      <Animated.View
        style={[styles.ecoBubble, styles.orb9, { transform: [{ translateY: float1Interpolate }, { rotate: rotateInterpolate }] }]}
        pointerEvents="none"
      >
        <BlurView intensity={28} tint="light" style={styles.orbBlur} />
        <MaterialCommunityIcons name="leaf" size={22} color="rgba(16, 185, 129, 0.5)" style={styles.ecoIcon} />
      </Animated.View>

      <View style={styles.fixedContainer}>
        <Animated.View
          style={[
            styles.contentWrapper,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient colors={['#22c55e', '#16a34a'] as const} style={styles.logoGradient}>
                <MaterialCommunityIcons name="leaf" size={36} color="#ffffff" />
              </LinearGradient>
              <View style={styles.logoBadge}>
                <Ionicons name="scan-outline" size={28} color="#22c55e" />
              </View>
            </View>

            <Text style={styles.appName}>EcoClassify</Text>
            <Text style={styles.appSubtitle}>Smart Waste Classification</Text>
          </View>

          {/* Glassmorphism Register Card */}
          <View style={styles.cardShadowWrapper}>
            <BlurView intensity={50} tint="light" style={styles.card}>
              <View style={styles.cardInnerBorder} />

              <Text style={styles.cardTitle}>Daftar Akun Baru</Text>
              <Text style={styles.cardSubtitle}>Buat akun untuk mulai berkontribusi</Text>

              {/* Username Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Username</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedInput === 'username' && styles.inputContainerFocused,
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={focusedInput === 'username' ? '#22c55e' : '#64748b'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Masukkan username"
                    placeholderTextColor="#94a3b8"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    onFocus={() => setFocusedInput('username')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Email</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedInput === 'email' && styles.inputContainerFocused,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={focusedInput === 'email' ? '#22c55e' : '#64748b'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="email@example.com"
                    placeholderTextColor="#94a3b8"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Kata Sandi</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedInput === 'password' && styles.inputContainerFocused,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={focusedInput === 'password' ? '#22c55e' : '#64748b'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, styles.inputWithPadding]}
                    placeholder="Minimal 6 karakter"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!passwordVisible}
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setPasswordVisible(!passwordVisible)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={focusedInput === 'password' ? '#22c55e' : '#64748b'}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Konfirmasi Kata Sandi</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedInput === 'confirmPassword' && styles.inputContainerFocused,
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color={focusedInput === 'confirmPassword' ? '#22c55e' : '#64748b'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, styles.inputWithPadding]}
                    placeholder="Ulangi kata sandi"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!confirmPasswordVisible}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    autoCapitalize="none"
                    onFocus={() => setFocusedInput('confirmPassword')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={confirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={focusedInput === 'confirmPassword' ? '#22c55e' : '#64748b'}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Register Button */}
              <Animated.View
                style={[
                  styles.buttonWrapper,
                  { transform: [{ scale: buttonScale }] },
                ]}
              >
                <Animated.View
                  style={[styles.buttonGlow, { opacity: glowOpacity }]}
                  pointerEvents="none"
                />
                <TouchableOpacity
                  style={[styles.primaryButton, loading && styles.buttonDisabled]}
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.9}
                  onPressIn={Platform.OS !== 'web' ? handleButtonActiveIn : undefined}
                  onPressOut={Platform.OS !== 'web' ? handleButtonActiveOut : undefined}
                  {...(Platform.OS === 'web'
                    ? ({
                        onMouseEnter: handleButtonActiveIn,
                        onMouseLeave: handleButtonActiveOut,
                      } as any)
                    : {})}
                >
                  <LinearGradient
                    colors={
                      isButtonActive
                        ? (['#16a34a', '#15803d'] as const)
                        : (['#22c55e', '#16a34a'] as const)
                    }
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {loading ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <>
                        <Text style={styles.buttonText}>Daftar Akun</Text>
                        <Ionicons
                          name="arrow-forward"
                          size={20}
                          color="#ffffff"
                          style={styles.buttonIcon}
                        />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>atau</Text>
                <View style={styles.divider} />
              </View>

              {/* Login Link */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Sudah memiliki akun?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
                  <Text style={styles.footerLink}>Masuk Akun</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  orbBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 999,
  },
  ecoBubble: {
    position: 'absolute',
    borderRadius: 999,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    zIndex: 0,
  },
  ecoIcon: {
    zIndex: 1,
  },
  orb1: {
    width: 88,
    height: 88,
    top: 18,
    right: width * 0.1,
  },
  orb2: {
    width: 72,
    height: 72,
    bottom: height * 0.34,
    left: width * 0.08,
  },
  orb3: {
    width: 54,
    height: 54,
    top: height * 0.2,
    right: width * 0.2,
  },
  orb4: {
    width: 60,
    height: 60,
    bottom: height * 0.13,
    right: width * 0.1,
  },
  orb5: {
    width: 46,
    height: 46,
    top: height * 0.44,
    left: width * 0.16,
  },
  orb6: {
    width: 64,
    height: 64,
    bottom: height * 0.02,
    left: width * 0.32,
  },
  orb7: {
    width: 40,
    height: 40,
    top: height * 0.08,
    left: width * 0.22,
  },
  orb8: {
    width: 50,
    height: 50,
    top: height * 0.3,
    left: width * 0.06,
  },
  orb9: {
    width: 56,
    height: 56,
    bottom: height * 0.24,
    right: width * 0.24,
  },
  fixedContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Platform.OS === 'web' ? Math.min(24, width * 0.055) : 14,
    paddingVertical: Platform.OS === 'web' ? 12 : 10,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 386,
    alignSelf: 'center',
    zIndex: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  logoGradient: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoBadge: {
    position: 'absolute',
    right: -7,
    bottom: -7,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 3,
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  appName: {
    fontSize: Platform.OS === 'web' ? 28 : 24,
    fontFamily: 'Inter-ExtraBold',
    color: '#0f172a',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 11,
    color: '#475569',
    fontFamily: 'Inter-Medium',
    letterSpacing: 0.5,
  },
  cardShadowWrapper: {
    borderRadius: 20,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 8,
    zIndex: 3,
  },
  card: {
    borderRadius: 20,
    padding: Platform.OS === 'web' ? 20 : 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  cardInnerBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  cardTitle: {
    fontSize: Platform.OS === 'web' ? 21 : 19,
    fontFamily: 'Inter-Bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 12,
  },
  inputWrapper: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#0f172a',
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    paddingHorizontal: 12,
    height: Platform.OS === 'web' ? 44 : 46,
  },
  inputContainerFocused: {
    borderColor: '#22c55e',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 9,
  },
  input: {
    flex: 1,
    color: '#0f172a',
    fontSize: Platform.OS === 'web' ? 13 : 14,
    fontFamily: 'Inter-Medium',
    paddingVertical: Platform.OS === 'ios' ? 12 : 0,
    outlineStyle: 'none' as any,
    outlineWidth: 0 as any,
  },
  inputWithPadding: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  buttonWrapper: {
    position: 'relative',
    marginBottom: 4,
  },
  buttonGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 16,
    backgroundColor: '#22c55e',
  },
  primaryButton: {
    borderRadius: 12,
    height: Platform.OS === 'web' ? 46 : 48,
    overflow: 'hidden',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 2,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(226, 232, 240, 0.8)',
  },
  dividerText: {
    color: '#64748b',
    fontSize: 13,
    paddingHorizontal: 16,
    fontFamily: 'Inter-Medium',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#475569',
    fontSize: 13,
  },
  footerLink: {
    color: '#16a34a',
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    marginLeft: 6,
  },
});
