import React, { useEffect, useState, useRef } from 'react';
import { 
  ActivityIndicator, 
  Alert, 
  Switch, 
  Text, 
  View,
  StyleSheet,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { API_URL } from '../../../config';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

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

type SettingsKey = 'scanReminders' | 'rewardUpdates' | 'ecoTips' | 'appUpdates';

interface NotificationSettings {
  scanReminders: boolean;
  rewardUpdates: boolean;
  ecoTips: boolean;
  appUpdates: boolean;
}

// Notification Option Component dengan Glassmorphism
const NotificationOption = ({ 
  settingKey,
  title, 
  subtitle,
  icon,
  value,
  onValueChange,
  disabled,
  delay = 0,
}: { 
  settingKey: SettingsKey;
  title: string; 
  subtitle: string;
  icon: any;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled: boolean;
  delay?: number;
}) => {
  return (
    <FadeInSection delay={delay}>
      <BlurView 
        intensity={isWeb ? (value ? 30 : 20) : (value ? 35 : 25)} 
        tint="light" 
        style={[
          styles.notificationOption,
          value && styles.notificationOptionActive,
        ]}
      >
        <LinearGradient
          colors={value ? ['rgba(30, 78, 44, 0.08)', 'rgba(76, 175, 80, 0.04)'] : ['transparent', 'transparent']}
          style={styles.optionGradient}
        />
        <View style={styles.optionContent}>
          <View style={styles.optionLeft}>
            <View style={[styles.optionIconContainer, value && styles.optionIconContainerActive]}>
              <LinearGradient
                colors={value ? ['#1E4E2C', '#2E7D32'] : ['#94A3B8', '#94A3B8']}
                style={styles.optionIconGradient}
              >
                <MaterialCommunityIcons name={icon} size={20} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionTitle, value && styles.optionTitleActive]}>
                {title}
              </Text>
              <Text style={[styles.optionSubtitle, value && styles.optionSubtitleActive]}>
                {subtitle}
              </Text>
            </View>
          </View>
          <Switch
            value={value}
            onValueChange={onValueChange}
            disabled={disabled}
            thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
            trackColor={{ false: '#CBD5E1', true: '#4CAF50' }}
            ios_backgroundColor="#CBD5E1"
          />
        </View>
      </BlurView>
    </FadeInSection>
  );
};

export default function NotificationSettingsScreen() {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const { t } = useLanguage();
  const [settings, setSettings] = useState<NotificationSettings>({
    scanReminders: true,
    rewardUpdates: true,
    ecoTips: true,
    appUpdates: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/notification-settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setSettings(data.settings);
        }
      } catch (error) {
        Alert.alert('Gagal', 'Tidak dapat memuat pengaturan notifikasi.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [token]);

  const updateSetting = async (key: SettingsKey, value: boolean) => {
    const previousSettings = settings;
    const nextSettings = { ...settings, [key]: value };
    setSettings(nextSettings);

    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/notification-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nextSettings),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        Alert.alert('Gagal', data.error || 'Pengaturan gagal disimpan.');
        setSettings(previousSettings);
      }
    } catch (error) {
      Alert.alert('Gagal', 'Tidak dapat menyimpan pengaturan notifikasi.');
      setSettings(previousSettings);
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  const rows: Array<{ key: SettingsKey; title: string; subtitle: string; icon: any }> = [
    { 
      key: 'scanReminders', 
      title: 'Pengingat Scan', 
      subtitle: 'Ingatkan untuk scan sampah harian.',
      icon: 'barcode-scan'
    },
    { 
      key: 'rewardUpdates', 
      title: 'Update Reward', 
      subtitle: 'Kabar reward dan penukaran poin.',
      icon: 'gift'
    },
    { 
      key: 'ecoTips', 
      title: 'Tips Lingkungan', 
      subtitle: 'Tips singkat pengelolaan sampah.',
      icon: 'leaf'
    },
    { 
      key: 'appUpdates', 
      title: 'Update Aplikasi', 
      subtitle: 'Informasi fitur dan perbaikan aplikasi.',
      icon: 'cellphone'
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0fdf4" />
      
      <LinearGradient
        colors={['#f0fdf4', '#dcfce7', '#eef2ff']}
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
                <MaterialCommunityIcons name="bell" size={18} color="#4CAF50" />
                <Text style={styles.headerBadgeText}>Notifikasi</Text>
              </View>
              <Text style={styles.headerTitle}>Pengaturan Notifikasi</Text>
              <Text style={styles.headerSubtitle}>Atur preferensi notifikasi Anda</Text>
            </View>
          </BlurView>
        </FadeInSection>

        {/* Notification Settings */}
        <View style={styles.settingsContainer}>
          {loading ? (
            <BlurView intensity={isWeb ? 20 : 30} tint="light" style={styles.loadingContainer}>
              <ActivityIndicator color="#4CAF50" size="large" />
              <Text style={styles.loadingText}>Memuat pengaturan...</Text>
            </BlurView>
          ) : (
            <>
              {rows.map((row, index) => (
                <NotificationOption
                  key={row.key}
                  settingKey={row.key}
                  title={row.title}
                  subtitle={row.subtitle}
                  icon={row.icon}
                  value={settings[row.key]}
                  onValueChange={(value) => updateSetting(row.key, value)}
                  disabled={saving}
                  delay={150 + (index * 80)}
                />
              ))}

              {/* Info Section */}
              <FadeInSection delay={150 + (rows.length * 80)}>
                <BlurView intensity={isWeb ? 20 : 30} tint="light" style={styles.infoSection}>
                  <LinearGradient
                    colors={['rgba(30, 78, 44, 0.03)', 'rgba(76, 175, 80, 0.01)']}
                    style={styles.infoGradient}
                  />
                  <MaterialCommunityIcons name="information" size={20} color="#4CAF50" />
                  <Text style={styles.infoText}>
                    Perubahan pengaturan akan langsung berlaku
                  </Text>
                </BlurView>
              </FadeInSection>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0fdf4',
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
    paddingBottom: isWeb ? 120 : 90,
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
    marginHorizontal: isWeb ? 40 : 16,
    marginBottom: 16,
    padding: isWeb ? 24 : 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.5)',
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
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
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
    fontWeight: '700',
    color: '#4CAF50',
  },
  headerTitle: {
    fontSize: isWeb ? 26 : 22,
    fontWeight: '800',
    color: '#133B1C',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: isWeb ? 13 : 12,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Settings Container
  settingsContainer: {
    marginHorizontal: isWeb ? 40 : 16,
    gap: 12,
  },

  // Loading
  loadingContainer: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  loadingText: {
    fontSize: isWeb ? 14 : 13,
    color: '#64748B',
    fontWeight: '500',
  },

  // Notification Option
  notificationOption: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  notificationOptionActive: {
    borderColor: 'rgba(76, 175, 80, 0.5)',
    backgroundColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  optionGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isWeb ? 16 : 14,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  optionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  optionIconContainerActive: {
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTextContainer: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    fontSize: isWeb ? 15 : 14,
    fontWeight: '700',
    color: '#133B1C',
  },
  optionTitleActive: {
    color: '#1E4E2C',
  },
  optionSubtitle: {
    fontSize: isWeb ? 12 : 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  optionSubtitleActive: {
    color: '#4CAF50',
  },

  // Info Section
  infoSection: {
    marginTop: 20,
    padding: isWeb ? 16 : 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  infoGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  infoText: {
    flex: 1,
    fontSize: isWeb ? 12 : 11,
    color: '#64748B',
    lineHeight: 18,
    fontWeight: '500',
  },
});