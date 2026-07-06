import React, { useRef, useEffect } from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar,
  Dimensions,
  Platform,
  Animated,
  Easing,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const SCREEN_PADDING = 10;

// Fade In Animation
const FadeInSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
};

export default function AboutAppScreen() {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();

  const features = [
    {
      icon: 'scan-outline',
      title: 'Klasifikasi Sampah AI',
      description: 'Identifikasi jenis sampah otomatis',
    },
    {
      icon: 'leaf-outline',
      title: 'Eco Poin & Reward',
      description: 'Kumpulkan poin & tukarkan reward',
    },
    {
      icon: 'bar-chart-outline',
      title: 'Dashboard & Statistik',
      description: 'Pantau dampak lingkungan',
    },
    {
      icon: 'recycle-outline',
      title: 'Panduan Daur Ulang',
      description: 'Informasi lengkap daur ulang',
    },
  ];

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEFDF3" />
      
      <LinearGradient
        colors={['#dcfce7', '#f0fdf4', '#eff6ff'] as const}
        style={styles.backgroundGradient}
      />

      {/* Background Decorations */}
      <View style={styles.decoLeaf1}>
        <MaterialCommunityIcons name="leaf" size={50} color="rgba(76, 175, 80, 0.06)" />
      </View>
      <View style={styles.decoLeaf2}>
        <MaterialCommunityIcons name="leaf-maple" size={60} color="rgba(76, 175, 80, 0.05)" />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header */}
        <FadeInSection delay={100}>
          <View style={styles.headerSection}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={goBack}
            >
              <Ionicons name="arrow-back" size={24} color="#133B1C" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Echo Tech</Text>
              <Text style={styles.headerSubtitle}>v1.0.0</Text>
            </View>
          </View>
        </FadeInSection>

        {/* Description */}
        <FadeInSection delay={150}>
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionTitle}>Aplikasi Klasifikasi Sampah</Text>
            <Text style={styles.descriptionText}>
              Echo Tech membantu pengguna memahami jenis sampah, mengukur dampak lingkungan, dan membangun kebiasaan daur ulang.
            </Text>
          </View>
        </FadeInSection>

        {/* Divider */}
        <FadeInSection delay={200}>
          <View style={styles.divider} />
        </FadeInSection>

        {/* Features */}
        <FadeInSection delay={250}>
          <Text style={styles.sectionTitle}>Fitur</Text>
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <FadeInSection key={index} delay={300 + index * 50}>
                <View style={styles.featureItem}>
                  <View style={styles.featureIconContainer}>
                    <Ionicons name={feature.icon as any} size={22} color="#4CAF50" />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                </View>
              </FadeInSection>
            ))}
          </View>
        </FadeInSection>

        {/* Divider */}
        <FadeInSection delay={450}>
          <View style={styles.divider} />
        </FadeInSection>

        {/* Tech Stack */}
        <FadeInSection delay={500}>
          <Text style={styles.sectionTitle}>Teknologi</Text>
          <View style={styles.techContainer}>
            <View style={styles.techTag}>
              <Text style={styles.techTagText}>React Native</Text>
            </View>
            <View style={styles.techTag}>
              <Text style={styles.techTagText}>TypeScript</Text>
            </View>
            <View style={styles.techTag}>
              <Text style={styles.techTagText}>Redux</Text>
            </View>
            <View style={styles.techTag}>
              <Text style={styles.techTagText}>Expo</Text>
            </View>
          </View>
        </FadeInSection>

        {/* Footer */}
        <FadeInSection delay={550}>
          <View style={styles.footer}>
            <Text style={styles.footerText}>Made with ❤️</Text>
            <Text style={styles.footerVersion}>© 2024 Echo Tech</Text>
          </View>
        </FadeInSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6FBF7',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: isWeb ? 150 : 128,
    paddingTop: 10,
    justifyContent: 'center',
  },

  // Background Decorations
  decoLeaf1: {
    position: 'absolute',
    top: 50,
    left: 15,
    zIndex: 0,
  },
  decoLeaf2: {
    position: 'absolute',
    bottom: 50,
    right: 15,
    zIndex: 0,
  },

  // Header
  headerSection: {
    marginHorizontal: SCREEN_PADDING,
    marginBottom: 20,
    paddingVertical: 10,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 0,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.62)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 10,
  },
  headerTitle: {
    fontSize: isWeb ? 38 : 32,
    fontFamily: 'Inter-ExtraBold',
    color: '#133B1C',
    letterSpacing: 0,
  },
  headerSubtitle: {
    fontSize: isWeb ? 16 : 14,
    color: '#64748B',
    marginTop: 4,
    fontFamily: 'Inter-Medium',
  },

  // Description
  descriptionCard: {
    marginHorizontal: SCREEN_PADDING,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1.5,
  },
  descriptionTitle: {
    fontSize: isWeb ? 18 : 16,
    fontFamily: 'Inter-Bold',
    color: '#133B1C',
    textAlign: 'center',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: isWeb ? 14 : 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },

  // Divider
  divider: {
    height: 1,
    marginHorizontal: SCREEN_PADDING,
    marginVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },

  // Section Title
  sectionTitle: {
    fontSize: isWeb ? 17 : 15,
    fontFamily: 'Inter-Bold',
    color: '#133B1C',
    marginHorizontal: SCREEN_PADDING,
    marginBottom: 12,
  },

  // Features
  featuresContainer: {
    marginHorizontal: SCREEN_PADDING,
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.58)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: isWeb ? 14 : 13,
    fontFamily: 'Inter-SemiBold',
    color: '#133B1C',
  },
  featureDescription: {
    fontSize: isWeb ? 12 : 11,
    color: '#64748B',
    marginTop: 1,
  },

  // Tech Stack
  techContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: SCREEN_PADDING,
    gap: 8,
  },
  techTag: {
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.1)',
  },
  techTagText: {
    fontSize: isWeb ? 13 : 12,
    color: '#4CAF50',
    fontFamily: 'Inter-SemiBold',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 4,
  },
  footerText: {
    fontSize: isWeb ? 14 : 13,
    color: '#64748B',
    fontFamily: 'Inter-Medium',
  },
  footerVersion: {
    fontSize: isWeb ? 12 : 11,
    color: '#94A3B8',
    marginTop: 4,
  },
});
