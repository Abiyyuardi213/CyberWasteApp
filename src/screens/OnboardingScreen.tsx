import React, { useRef, useState, useEffect } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface Slide {
  title: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

const SLIDES: Slide[] = [
  {
    title: "Selamat Datang di EcoClassify",
    description: "Aplikasi pintar untuk membantu Anda mengklasifikasikan sampah dengan teknologi AI yang canggih.",
    icon: "leaf",
  },
  {
    title: "Klasifikasi Sampah Cepat",
    description: "Cukup ambil foto sampah Anda dan model AI akan memilahnya secara cepat dan akurat.",
    icon: "image-filter-center-focus",
  },
  {
    title: "Selamatkan Lingkungan",
    description: "Kurangi jejak karbon bumi kita dengan memastikan setiap sampah masuk ke jalur daur ulang yang tepat.",
    icon: "earth",
  },
  {
    title: "Dapatkan Eco Poin",
    description: "Raih poin ramah lingkungan untuk setiap pemilahan sampah yang berhasil dan tukarkan dengan reward.",
    icon: "gift-outline",
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const slideX = useRef(new Animated.Value(0)).current;
  const slideOpacity = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const animateToLogin = () => {
    setIsAnimating(true);
    Animated.parallel([
      Animated.timing(slideX, {
        toValue: -SCREEN_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsAnimating(false);
      navigation.navigate('Login');
    });
  };

  const goToNextSlide = () => {
    if (isAnimating) return;

    if (currentSlide === SLIDES.length - 1) {
      animateToLogin();
      return;
    }

    setIsAnimating(true);
    
    Animated.parallel([
      Animated.timing(slideOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentSlide((prev) => prev + 1);
      slideX.setValue(SCREEN_WIDTH);
      scaleAnim.setValue(0.95);

      Animated.parallel([
        Animated.timing(slideX, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(slideOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setIsAnimating(false));
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Background */}
      <View style={styles.background}>
        <LinearGradient
          colors={['#f0fdf4', '#ffffff'] as const}
          style={styles.gradientBackground}
        />
      </View>

      {/* Decorative Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={animateToLogin} 
          style={styles.skipBtn} 
          disabled={isAnimating}
        >
          <Text style={styles.skipBtnText}>Lewati</Text>
          <Ionicons name="arrow-forward" size={16} color="#22c55e" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <Animated.View
        style={[
          styles.middleContent,
          {
            opacity: slideOpacity,
            transform: [
              { translateX: slideX },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        {/* Icon Container */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <LinearGradient
              colors={['#22c55e', '#16a34a'] as const}
              style={styles.iconGradient}
            >
              <MaterialCommunityIcons 
                name={SLIDES[currentSlide].icon} 
                size={64} 
                color="#ffffff" 
              />
            </LinearGradient>
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{SLIDES[currentSlide].title}</Text>
          <Text style={styles.description}>{SLIDES[currentSlide].description}</Text>
        </View>
      </Animated.View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Indicators */}
        <View style={styles.indicatorRow}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicatorDot,
                currentSlide === index && styles.indicatorDotActive,
              ]}
            />
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={styles.onboardingButton}
          onPress={goToNextSlide}
          disabled={isAnimating}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#22c55e', '#16a34a'] as const}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.onboardingButtonText}>
              {currentSlide === SLIDES.length - 1 ? 'Mulai Sekarang' : 'Selanjutnya'}
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={20} 
              color="#ffffff" 
              style={styles.buttonIcon} 
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientBackground: {
    flex: 1,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#dcfce7',
    top: -100,
    right: -80,
    opacity: 0.5,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#bbf7d0',
    bottom: 100,
    left: -60,
    opacity: 0.4,
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#86efac',
    top: '40%',
    right: -40,
    opacity: 0.2,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    height: 60,
    alignItems: 'flex-end',
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  skipBtnText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 2,
  },
  middleContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    shadowColor: '#22c55e',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  iconGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },
  description: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    gap: 32,
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  indicatorDotActive: {
    backgroundColor: '#22c55e',
    width: 24,
    height: 8,
    borderRadius: 4,
  },
  onboardingButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#22c55e',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onboardingButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  buttonIcon: {
    marginLeft: 8,
  },
});