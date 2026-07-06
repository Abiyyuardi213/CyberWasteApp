import React, { useRef, useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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

export function SettingsLayout({
  title,
  subtitle,
  children,
  showBack = true,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showBack?: boolean;
}) {
  const navigation = useNavigation<any>();

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#F6FBF7', '#ECFDF3', '#EEF7F1']}
        style={styles.backgroundGradient}
      />

      {/* Background Decorations */}
      <View style={styles.decoLeaf1}>
        <MaterialCommunityIcons name="leaf" size={44} color="rgba(76, 175, 80, 0.035)" />
      </View>
      <View style={styles.decoLeaf2}>
        <MaterialCommunityIcons name="leaf-maple" size={50} color="rgba(76, 175, 80, 0.032)" />
      </View>
      <View style={styles.decoCircle1} />
      <View style={styles.decoCircle2} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <FadeInSection delay={100}>
          <BlurView intensity={isWeb ? 30 : 40} tint="light" style={styles.headerSection}>
            <LinearGradient
              colors={['rgba(30, 78, 44, 0.08)', 'rgba(76, 175, 80, 0.04)']}
              style={styles.headerGradient}
            />
            {showBack && (
              <TouchableOpacity style={styles.backButton} onPress={goBack}>
                <Ionicons name="arrow-back" size={24} color="#133B1C" />
              </TouchableOpacity>
            )}
            <View style={[styles.headerContent, !showBack && styles.headerContentNoBack]}>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
          </BlurView>
        </FadeInSection>

        {/* Content */}
        <FadeInSection delay={200}>
          <View style={styles.contentContainer}>
            {children}
          </View>
        </FadeInSection>
      </ScrollView>
    </SafeAreaView>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  icon,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  icon?: any;
}) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <BlurView 
        intensity={isWeb ? (isFocused ? 30 : 20) : (isFocused ? 35 : 25)} 
        tint="light" 
        style={[
          styles.fieldWrapper,
          isFocused && styles.fieldWrapperFocused,
        ]}
      >
        <View style={styles.fieldInner}>
          {icon && (
            <View style={styles.fieldIconContainer}>
              <MaterialCommunityIcons 
                name={icon} 
                size={20} 
                color={isFocused ? '#4CAF50' : '#94A3B8'} 
              />
            </View>
          )}
          <TextInput
            style={[styles.input, icon && styles.inputWithIcon]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#94A3B8"
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize="none"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </View>
      </BlurView>
    </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: isWeb ? 136 : 118,
    paddingTop: 12,
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
    backgroundColor: 'rgba(76,175,80,0.018)',
  },
  decoCircle2: {
    position: 'absolute',
    bottom: 150,
    left: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(59,130,246,0.018)',
  },

  // Header
  headerSection: {
    marginHorizontal: isWeb ? 40 : 8,
    marginBottom: 16,
    padding: isWeb ? 24 : 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.78)',
    backgroundColor: 'rgba(255,255,255,0.64)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
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
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.68)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 10,
  },
  headerContentNoBack: {
    marginTop: 0,
  },
  title: {
    fontSize: isWeb ? 26 : 22,
    fontFamily: 'Inter-ExtraBold',
    color: '#133B1C',
    textAlign: 'center',
    letterSpacing: 0,
  },
  subtitle: {
    fontSize: isWeb ? 13 : 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
  },

  // Content
  contentContainer: {
    marginHorizontal: isWeb ? 40 : 8,
  },

  // Field
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: isWeb ? 13 : 12,
    fontFamily: 'Inter-Bold',
    color: '#133B1C',
    marginBottom: 8,
  },
  fieldWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    backgroundColor: 'rgba(255,255,255,0.58)',
    overflow: 'hidden',
  },
  fieldWrapperFocused: {
    borderColor: 'rgba(76, 175, 80, 0.5)',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  fieldInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  fieldIconContainer: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 52,
    color: '#0F172A',
    fontSize: isWeb ? 15 : 14,
    paddingVertical: 0,
  },
  inputWithIcon: {
    paddingLeft: 0,
  },

  // Card (untuk digunakan di child components)
  card: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 16,
    padding: isWeb ? 20 : 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.76)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },

  // Switch Row (untuk digunakan di child components)
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(241, 245, 249, 0.5)',
  },
  switchText: {
    flex: 1,
    paddingRight: 12,
  },
  rowTitle: {
    fontSize: isWeb ? 15 : 14,
    fontFamily: 'Inter-ExtraBold',
    color: '#0F172A',
  },
  rowSubtitle: {
    marginTop: 3,
    fontSize: isWeb ? 12 : 11,
    color: '#64748B',
  },

  // Option Row (untuk digunakan di child components)
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isWeb ? 16 : 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.5)',
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  optionRowActive: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
  },

  // Static Text (untuk digunakan di child components)
  staticTitle: {
    fontSize: isWeb ? 16 : 15,
    fontFamily: 'Inter-ExtraBold',
    color: '#133B1C',
    marginBottom: 6,
  },
  staticText: {
    fontSize: isWeb ? 14 : 13,
    lineHeight: 21,
    color: '#475569',
    marginBottom: 16,
  },

  // Primary Button
  primaryButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: isWeb ? 15 : 14,
    fontFamily: 'Inter-ExtraBold',
  },
});

export const settingsStyles = styles;
