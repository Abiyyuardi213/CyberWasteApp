import React, { useState, useRef, useEffect } from 'react';
import { 
  ActivityIndicator, 
  Alert, 
  Text, 
  TouchableOpacity, 
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  Animated,
  Easing,
  ScrollView,
  TextInput,
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

// Field Component dengan Glassmorphism
const Field = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  keyboardType,
  icon,
  secureTextEntry,
}: { 
  label: string; 
  value: string; 
  onChangeText: (text: string) => void; 
  placeholder: string; 
  keyboardType?: string;
  icon?: any;
  secureTextEntry?: boolean;
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <BlurView 
        intensity={isWeb ? (isFocused ? 30 : 20) : 25} 
        tint="light" 
        style={[
          styles.fieldWrapper,
          isFocused && styles.fieldWrapperFocused,
        ]}
      >
        <View style={styles.fieldIconContainer}>
          <Ionicons name={icon} size={20} color={isFocused ? '#4CAF50' : '#94A3B8'} />
        </View>
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          keyboardType={keyboardType as any}
          secureTextEntry={secureTextEntry}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </BlurView>
    </View>
  );
};

export default function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, token, checkSession } = useAuth();
  const { t } = useLanguage();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!username.trim() || !email.trim()) {
      Alert.alert('Data belum lengkap', 'Username dan email wajib diisi.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, email }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        Alert.alert('Gagal', data.error || 'Profil gagal diperbarui.');
        return;
      }

      await checkSession();
      Alert.alert('Berhasil', 'Profil berhasil diperbarui.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Gagal', 'Tidak dapat terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

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
                <MaterialCommunityIcons name="account" size={18} color="#4CAF50" />
                <Text style={styles.headerBadgeText}>Profil</Text>
              </View>
              <Text style={styles.headerTitle}>Edit Profil</Text>
              <Text style={styles.headerSubtitle}>Perbarui informasi akunmu</Text>
            </View>
          </BlurView>
        </FadeInSection>

        {/* Form Card */}
        <FadeInSection delay={200}>
          <BlurView intensity={isWeb ? 30 : 40} tint="light" style={styles.formCard}>
            <LinearGradient
              colors={['rgba(30, 78, 44, 0.05)', 'rgba(76, 175, 80, 0.02)']}
              style={styles.formGradient}
            />
            
            {/* Avatar Preview */}
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#1E4E2C', '#2E7D32']}
                style={styles.avatarGradient}
              />
              <Text style={styles.avatarText}>
                {username ? username[0].toUpperCase() : 'U'}
              </Text>
            </View>

            <View style={styles.fieldsContainer}>
              <Field
                label="Username"
                value={username}
                onChangeText={setUsername}
                placeholder="Masukkan username"
                icon="person-outline"
              />

              <Field
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="email@example.com"
                keyboardType="email-address"
                icon="mail-outline"
              />
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
              onPress={handleSave} 
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#1E4E2C', '#2E7D32']}
                style={styles.saveButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Simpan Profil</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.infoHint}>
              <Ionicons name="information-circle-outline" size={16} color="#94A3B8" />
              <Text style={styles.infoHintText}>
                Perubahan akan langsung berlaku setelah disimpan
              </Text>
            </View>
          </BlurView>
        </FadeInSection>
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

  // Form Card
  formCard: {
    marginHorizontal: isWeb ? 40 : 16,
    marginBottom: 20,
    padding: isWeb ? 28 : 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  formGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Avatar
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    justifyContent: 'center', 
    alignItems: 'center',     
  },
  avatarGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 80,
  },

  // Fields
  fieldsContainer: {
    gap: 16,
  },
  fieldContainer: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: isWeb ? 13 : 12,
    fontWeight: '600',
    color: '#133B1C',
  },
  fieldWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  fieldWrapperFocused: {
    borderColor: 'rgba(76, 175, 80, 0.5)',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  fieldIconContainer: {
    marginRight: 10,
  },
  fieldInput: {
    flex: 1,
    fontSize: isWeb ? 15 : 14,
    color: '#133B1C',
    paddingVertical: 12,
  },

  // Save Button
  saveButton: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: isWeb ? 16 : 14,
    fontWeight: '700',
    marginLeft: 8,
  },

  // Info Hint
  infoHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  infoHintText: {
    flex: 1,
    fontSize: isWeb ? 12 : 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
});