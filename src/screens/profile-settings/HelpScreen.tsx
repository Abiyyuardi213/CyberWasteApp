import React, { useRef, useEffect } from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  Dimensions, 
  Platform, 
  Animated, 
  Easing,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
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
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
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

// Help Card Component dengan Glassmorphism
const HelpCard = ({ 
  icon, 
  title, 
  description,
  delay = 0,
}: { 
  icon: any; 
  title: string; 
  description: string;
  delay?: number;
}) => {
  return (
    <FadeInSection delay={delay}>
      <BlurView intensity={isWeb ? 30 : 40} tint="light" style={styles.helpCard}>
        <LinearGradient
          colors={['rgba(30, 78, 44, 0.05)', 'rgba(76, 175, 80, 0.02)']}
          style={styles.cardGradient}
        />
        <View style={styles.cardIconContainer}>
          <LinearGradient
            colors={['#1E4E2C', '#2E7D32']}
            style={styles.cardIconGradient}
          >
            <MaterialCommunityIcons name={icon} size={24} color="#FFFFFF" />
          </LinearGradient>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>
      </BlurView>
    </FadeInSection>
  );
};

export default function HelpScreen() {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();

  const goBack = () => {
    navigation.goBack();
  };

  // Data bantuan dengan icon yang valid
  const helpItems = [
    {
      icon: 'cellphone',
      title: 'Cara memakai aplikasi',
      description: 'Masuk ke akun Anda, buka dashboard, lalu gunakan fitur scan saat sudah tersedia untuk mencatat jenis sampah dan mendapatkan Eco Poin.',
    },
    {
      icon: 'lock',
      title: 'Masalah login',
      description: 'Pastikan email atau username benar, password sesuai, dan backend lokal berjalan di port 5000.',
    },
    {
      icon: 'star',
      title: 'Poin dan reward',
      description: 'Eco Poin akan bertambah dari aktivitas ramah lingkungan dan dapat ditukarkan melalui halaman Eco Poin.',
    },
    {
      icon: 'information',
      title: 'Informasi lainnya',
      description: 'Untuk pertanyaan lebih lanjut, silakan hubungi tim support melalui email: support@cyberwaste.com',
    },
  ];

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
      <View style={styles.decoCircle1} />
      <View style={styles.decoCircle2} />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Header */}
        <FadeInSection delay={100}>
          <BlurView intensity={isWeb ? 30 : 40} tint="light" style={styles.headerSection}>
            <LinearGradient
              colors={['rgba(30, 78, 44, 0.08)', 'rgba(76, 175, 80, 0.04)']}
              style={styles.headerGradient}
            />
            <TouchableOpacity 
              style={styles.backButton}
              onPress={goBack}
            >
              <Ionicons name="arrow-back" size={24} color="#133B1C" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <View style={styles.headerBadge}>
                <MaterialCommunityIcons name="help-circle" size={18} color="#4CAF50" />
                <Text style={styles.headerBadgeText}>Bantuan</Text>
              </View>
              <Text style={styles.headerTitle}>Pusat Bantuan</Text>
              <Text style={styles.headerSubtitle}>Panduan dan informasi untuk pengguna</Text>
            </View>
          </BlurView>
        </FadeInSection>

        {/* Help Cards */}
        <View style={styles.cardsContainer}>
          {helpItems.map((item, index) => (
            <HelpCard
              key={index}
              icon={item.icon}
              title={item.title}
              description={item.description}
              delay={150 + (index * 100)}
            />
          ))}
        </View>

        {/* Footer Info */}
        <FadeInSection delay={500}>
          <BlurView intensity={isWeb ? 20 : 30} tint="light" style={styles.footerSection}>
            <LinearGradient
              colors={['rgba(30, 78, 44, 0.03)', 'rgba(76, 175, 80, 0.01)']}
              style={styles.footerGradient}
            />
            <MaterialCommunityIcons name="shield-check" size={24} color="#4CAF50" />
            <Text style={styles.footerText}>
              Butuh bantuan lebih lanjut? Hubungi kami di support@cyberwaste.com
            </Text>
          </BlurView>
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
    paddingTop: 8,
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
  decoCircle1: {
    position: 'absolute',
    top: 150,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(76,175,80,0.03)',
  },
  decoCircle2: {
    position: 'absolute',
    bottom: 150,
    left: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(59,130,246,0.03)',
  },

  // Header
  headerSection: {
    marginHorizontal: SCREEN_PADDING,
    marginBottom: 16,
    padding: isWeb ? 24 : 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    backgroundColor: 'rgba(255,255,255,0.62)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backButton: {
    position: 'absolute',
    top: isWeb ? 16 : 12,
    left: isWeb ? 16 : 12,
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
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 8,
    gap: 6,
  },
  headerBadgeText: {
    fontSize: isWeb ? 12 : 11,
    fontFamily: 'Inter-Bold',
    color: '#4CAF50',
  },
  headerTitle: {
    fontSize: isWeb ? 26 : 22,
    fontFamily: 'Inter-ExtraBold',
    color: '#133B1C',
    textAlign: 'center',
    letterSpacing: 0,
  },
  headerSubtitle: {
    fontSize: isWeb ? 13 : 12,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
  },

  // Cards Container
  cardsContainer: {
    marginHorizontal: SCREEN_PADDING,
    gap: 16,
  },

  // Help Card
  helpCard: {
    padding: isWeb ? 20 : 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    backgroundColor: 'rgba(255,255,255,0.62)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 14,
    flexShrink: 0,
  },
  cardIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: isWeb ? 16 : 15,
    fontFamily: 'Inter-Bold',
    color: '#133B1C',
  },
  cardDescription: {
    fontSize: isWeb ? 13 : 12,
    color: '#64748B',
    lineHeight: 20,
  },

  // Footer
  footerSection: {
    marginHorizontal: SCREEN_PADDING,
    marginTop: 20,
    padding: isWeb ? 16 : 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    backgroundColor: 'rgba(255,255,255,0.58)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  footerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  footerText: {
    flex: 1,
    fontSize: isWeb ? 12 : 11,
    color: '#64748B',
    lineHeight: 18,
    fontFamily: 'Inter-Medium',
  },
});
