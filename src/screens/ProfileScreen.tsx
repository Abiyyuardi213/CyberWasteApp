import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Animated,
  Easing,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { fetchEcoPointData } from '../store/ecoPointSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const SCREEN_PADDING = 10;

// ============ COLOR CONFIG ============
const COLORS = {
  primary: '#1E4E2C',
  primaryLight: '#4CAF50',
  primaryDark: '#133B1C',
  glassBg: 'rgba(255,255,255,0.6)',
  glassBorder: 'rgba(255,255,255,0.3)',
  shadow: 'rgba(30, 78, 44, 0.1)',
  text: '#133B1C',
  textSecondary: '#64748B',
};

// Fade In Animation dengan Glassmorphism
const FadeInSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
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

// Menu Item dengan Magic UI & Glassmorphism
const MenuItem = ({ item, index }: { item: any; index: number }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        friction: 5,
        tension: 200,
        useNativeDriver: true,
      }),
      Animated.spring(translateX, {
        toValue: 5,
        friction: 5,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 200,
        useNativeDriver: true,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        friction: 5,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleHoverIn = () => {
    setIsHovered(true);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1.03,
        friction: 4,
        tension: 200,
        useNativeDriver: true,
      }),
      Animated.timing(glowOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleHoverOut = () => {
    setIsHovered(false);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 200,
        useNativeDriver: true,
      }),
      Animated.timing(glowOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    if (item.onPress) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 0.92,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        item.onPress();
      });
    }
  };

  return (
    <Animated.View 
      style={{ 
        transform: [{ scale: scaleAnim }],
        marginHorizontal: 4,
        marginVertical: 2,
        borderRadius: 16,
      }}
    >
      <Pressable
        style={({ pressed }) => [
          styles.menuItem,
          pressed && styles.menuItemPressed,
          isHovered && styles.menuItemHovered,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onHoverIn={isWeb ? handleHoverIn : undefined}
        onHoverOut={isWeb ? handleHoverOut : undefined}
      >
        <BlurView 
          intensity={isWeb ? (isHovered ? 40 : 20) : 30} 
          tint="light" 
          style={[
            styles.menuBlur,
            isHovered && styles.menuBlurHovered,
          ]}
        >
          {isHovered && isWeb && (
            <Animated.View 
              style={[
                styles.menuGlow,
                { opacity: glowOpacity }
              ]} 
            />
          )}
          
          <Animated.View 
            style={[
              styles.menuIcon,
              { transform: [{ translateX }] }
            ]}
          >
            <LinearGradient
              colors={['rgba(76, 175, 80, 0.15)', 'rgba(76, 175, 80, 0.05)']}
              style={styles.menuIconGradient}
            />
            <View style={[styles.menuIconCircle, isPressed && styles.menuIconCirclePressed]}>
              <Ionicons name={item.icon as any} size={22} color={COLORS.primaryLight} />
            </View>
          </Animated.View>
          
          <View style={styles.menuContent}>
            <Text style={[styles.menuItemTitle, isPressed && styles.menuItemTitlePressed]}>
              {item.title}
            </Text>
            <Text style={[styles.menuItemSubtitle, isPressed && styles.menuItemSubtitlePressed]}>
              {item.subtitle}
            </Text>
          </View>
          
          <Animated.View 
            style={{ 
              transform: [
                { scale: isPressed ? 0.8 : 1 },
                { translateX: isPressed ? -5 : 0 }
              ] 
            }}
          >
            <Ionicons 
              name="chevron-forward" 
              size={18} 
              color={isPressed ? COLORS.primaryLight : '#CBD5E1'} 
            />
          </Animated.View>
        </BlurView>
      </Pressable>
    </Animated.View>
  );
};

// Stat Card dengan Magic UI & Glassmorphism
const StatCard = ({ icon, value, label, delay }: { 
  icon: string; 
  value: number; 
  label: string; 
  delay?: number;
}) => {
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        delay: delay || 0,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: delay || 0,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(rotateAnim, {
        toValue: 1,
        friction: 6,
        tension: 50,
        delay: delay || 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['-10deg', '5deg', '0deg'],
  });

  const handleHoverIn = () => {
    setIsHovered(true);
    Animated.spring(scaleAnim, {
      toValue: 1.05,
      friction: 4,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleHoverOut = () => {
    setIsHovered(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      style={styles.statCardWrapper}
      onHoverIn={isWeb ? handleHoverIn : undefined}
      onHoverOut={isWeb ? handleHoverOut : undefined}
    >
      <Animated.View 
        style={[
          styles.statCard,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { rotate: rotate }
            ],
          },
          isHovered && styles.statCardHovered,
        ]}
      >
        <BlurView 
          intensity={isWeb ? (isHovered ? 40 : 20) : 30} 
          tint="light" 
          style={styles.statBlur}
        >
          {isHovered && isWeb && (
            <View style={styles.statGlow} />
          )}
          
          <Animated.View 
            style={[
              styles.statIconWrapper,
              {
                transform: [
                  { scale: isHovered ? 1.15 : 1 }
                ]
              }
            ]}
          >
            <LinearGradient
              colors={['rgba(76, 175, 80, 0.15)', 'rgba(76, 175, 80, 0.05)']}
              style={styles.statIconGradient}
            />
            <Ionicons name={icon as any} size={24} color={COLORS.primaryLight} />
          </Animated.View>
          
          <Animated.Text style={[styles.statNumber, isHovered && styles.statNumberHovered]}>
            {value}
          </Animated.Text>
          <Text style={[styles.statLabel, isHovered && styles.statLabelHovered]}>
            {label}
          </Text>
        </BlurView>
      </Animated.View>
    </Pressable>
  );
};

// User Card dengan Magic UI & Glassmorphism
const UserCard = ({ user, t }: { user: any; t: any }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 70,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleHoverIn = () => {
    setIsHovered(true);
    Animated.spring(scaleAnim, {
      toValue: 1.02,
      friction: 4,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleHoverOut = () => {
    setIsHovered(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      style={styles.userCardWrapper}
      onHoverIn={isWeb ? handleHoverIn : undefined}
      onHoverOut={isWeb ? handleHoverOut : undefined}
    >
      <Animated.View 
        style={[
          styles.userCard,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
          isHovered && styles.userCardHovered,
        ]}
      >
        <BlurView 
          intensity={isWeb ? (isHovered ? 40 : 20) : 30} 
          tint="light" 
          style={styles.userCardBlur}
        >
          <LinearGradient
            colors={['rgba(30, 78, 44, 0.08)', 'rgba(76, 175, 80, 0.03)']}
            style={styles.userCardGradient}
          />
          
          {isHovered && isWeb && (
            <View style={styles.userCardGlow} />
          )}
          
          <View style={styles.avatarContainer}>
            <Animated.View 
              style={[
                styles.avatar,
                {
                  transform: [
                    { scale: isHovered ? 1.05 : 1 }
                  ]
                }
              ]}
            >
              <LinearGradient
                colors={['#1E4E2C', '#2E7D32']}
                style={styles.avatarGradient}
              />
              <Text style={styles.avatarText}>
                {user?.username ? user.username[0].toUpperCase() : 'U'}
              </Text>
            </Animated.View>
            <View style={styles.onlineBadge} />
          </View>
          
          <Text style={[styles.username, isHovered && styles.usernameHovered]}>
            {user?.username || t('profile.defaultUser')}
          </Text>
          <Text style={[styles.email, isHovered && styles.emailHovered]}>
            {user?.email || 'email@example.com'}
          </Text>
          
          <View style={styles.userCardBadge}>
            <MaterialCommunityIcons name="leaf" size={14} color={COLORS.primaryLight} />
            <Text style={styles.userCardBadgeText}>Eco Warrior</Text>
          </View>
        </BlurView>
      </Animated.View>
    </Pressable>
  );
};

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, token, logout } = useAuth();
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const { userPoints } = useAppSelector((state) => state.ecoPoint);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logoutScale = useRef(new Animated.Value(1)).current;
  const logoutFade = useRef(new Animated.Value(1)).current;

  // Gunakan useFocusEffect untuk debug - PASTIKAN TIDAK ADA NAVIGASI OTOMATIS
  useFocusEffect(
    React.useCallback(() => {
      console.log('✅ ProfileScreen focused - Halaman Profil aktif');
      if (token) {
        dispatch(fetchEcoPointData(token));
      }
      return () => {
        console.log('❌ ProfileScreen unfocused');
      };
    }, [dispatch, token])
  );

  const stats = {
    totalScan: userPoints.itemsRecycled,
    ecoPoints: userPoints.totalPoints,
    treesSaved: Math.floor(userPoints.itemsRecycled / 10),
  };

  const menuItems = [
    {
      icon: 'person-outline',
      title: t('profile.editProfile'),
      subtitle: t('profile.editProfileSubtitle'),
      onPress: () => {
        console.log('📝 Navigasi ke EditProfile');
        navigation.navigate('EditProfile');
      },
    },
    {
      icon: 'shield-checkmark-outline',
      title: t('profile.changePassword'),
      subtitle: t('profile.changePasswordSubtitle'),
      onPress: () => {
        console.log('🔑 Navigasi ke ChangePassword');
        navigation.navigate('ChangePassword');
      },
    },
    {
      icon: 'notifications-outline',
      title: t('profile.notifications'),
      subtitle: t('profile.notificationsSubtitle'),
      onPress: () => {
        console.log('🔔 Navigasi ke NotificationSettings');
        navigation.navigate('NotificationSettings');
      },
    },
    {
      icon: 'language-outline',
      title: t('profile.language'),
      subtitle: t('profile.languageSubtitle'),
      onPress: () => {
        console.log('🌐 Navigasi ke LanguageSettings');
        navigation.navigate('LanguageSettings');
      },
    },
    {
      icon: 'help-circle-outline',
      title: t('profile.help'),
      subtitle: t('profile.helpSubtitle'),
      onPress: () => {
        console.log('❓ Navigasi ke Help');
        navigation.navigate('Help');
      },
    },
    {
      icon: 'information-circle-outline',
      title: t('profile.about'),
      subtitle: t('profile.aboutSubtitle'),
      onPress: () => {
        console.log('ℹ️ Navigasi ke AboutApp - HARUSNYA ke AboutApp');
        navigation.navigate('AboutApp');
      },
    },
  ];

  const handleLogout = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.spring(logoutScale, {
          toValue: 0.95,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.spring(logoutScale, {
          toValue: 0.9,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.spring(logoutScale, {
          toValue: 1,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(logoutFade, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(logoutFade, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setIsLoggingOut(true);
      setTimeout(() => {
        logout();
        setIsLoggingOut(false);
      }, 400);
    });
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
        <MaterialCommunityIcons name="leaf" size={60} color="rgba(76, 175, 80, 0.06)" />
      </View>
      <View style={styles.decoLeaf2}>
        <MaterialCommunityIcons name="leaf-maple" size={80} color="rgba(76, 175, 80, 0.05)" />
      </View>
      <View style={styles.decoCircle1} />
      <View style={styles.decoCircle2} />
      <View style={styles.decoCircle3} />
      
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Header Title */}
        <FadeInSection delay={100}>
          <BlurView intensity={isWeb ? 30 : 40} tint="light" style={styles.headerSection}>
            <LinearGradient
              colors={['rgba(30, 78, 44, 0.08)', 'rgba(76, 175, 80, 0.04)']}
              style={styles.headerGradient}
            />
            <View style={styles.headerBadge}>
              <MaterialCommunityIcons name="crown" size={20} color="#FFD700" />
              <Text style={styles.headerBadgeText}>Premium</Text>
            </View>
            <Text style={styles.headerTitle}>{t('profile.title')}</Text>
            <Text style={styles.headerSubtitle}>Kelola akun dan pengaturanmu</Text>
          </BlurView>
        </FadeInSection>

        {/* User Card */}
        <FadeInSection delay={200}>
          <UserCard user={user} t={t} />
        </FadeInSection>

        {/* Stats Grid */}
        <FadeInSection delay={300}>
          <Text style={styles.sectionTitle}>📊 Statistik</Text>
          <View style={styles.statsContainer}>
            <StatCard 
              icon="scan-outline" 
              value={stats.totalScan} 
              label={t('profile.totalScan')}
              delay={100}
            />
            <View style={styles.statDivider} />
            <StatCard 
              icon="leaf-outline" 
              value={stats.ecoPoints} 
              label={t('profile.ecoPoints')}
              delay={200}
            />
            <View style={styles.statDivider} />
            <StatCard 
              icon="rose-outline" 
              value={stats.treesSaved} 
              label={t('profile.tree')}
              delay={300}
            />
          </View>
        </FadeInSection>

        {/* Menu List */}
        <FadeInSection delay={400}>
          <Text style={styles.sectionTitle}>⚙️ Pengaturan</Text>
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <MenuItem key={index} item={item} index={index} />
            ))}
          </View>
        </FadeInSection>

        {/* Logout Button */}
        <FadeInSection delay={600}>
          <Animated.View 
            style={{ 
              transform: [{ scale: logoutScale }],
              opacity: logoutFade,
            }}
          >
            <TouchableOpacity 
              style={[styles.logoutButton, isLoggingOut && styles.logoutButtonPressed]} 
              onPress={handleLogout} 
              activeOpacity={0.8}
              disabled={isLoggingOut}
            >
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={styles.logoutText}>
                {isLoggingOut ? 'Logging out...' : t('profile.logout')}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </FadeInSection>

        {/* Version */}
        <FadeInSection delay={700}>
          <Text style={styles.versionText}>Echo Tech v1.0.0</Text>
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
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: isWeb ? 150 : 128,
  },

  // Background Decorations
  decoLeaf1: {
    position: 'absolute',
    top: 60,
    left: 10,
    zIndex: 0,
  },
  decoLeaf2: {
    position: 'absolute',
    bottom: 80,
    right: 10,
    zIndex: 0,
  },
  decoCircle1: {
    position: 'absolute',
    top: 120,
    right: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(76,175,80,0.03)',
  },
  decoCircle2: {
    position: 'absolute',
    bottom: 200,
    left: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59,130,246,0.03)',
  },
  decoCircle3: {
    position: 'absolute',
    top: '40%',
    right: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(139,92,246,0.03)',
  },

  // Header
  headerSection: {
    marginHorizontal: SCREEN_PADDING,
    marginTop: isWeb ? 20 : 12,
    marginBottom: 12,
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
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 8,
    gap: 6,
  },
  headerBadgeText: {
    fontSize: isWeb ? 12 : 11,
    fontFamily: 'Inter-Bold',
    color: '#B8860B',
  },
  headerTitle: {
    fontSize: isWeb ? 28 : 24,
    fontFamily: 'Inter-ExtraBold',
    color: '#133B1C',
    textAlign: 'center',
    letterSpacing: 0,
  },
  headerSubtitle: {
    fontSize: isWeb ? 14 : 13,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
  },

  // Section Title
  sectionTitle: {
    fontSize: isWeb ? 18 : 16,
    fontFamily: 'Inter-ExtraBold',
    color: '#133B1C',
    marginHorizontal: SCREEN_PADDING,
    marginTop: 20,
    marginBottom: 12,
    letterSpacing: 0,
  },

  // User Card
  userCardWrapper: {
    marginHorizontal: SCREEN_PADDING,
    marginTop: 4,
    marginBottom: 8,
    borderRadius: 18,
  },
  userCard: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  userCardHovered: {
    transform: [{ scale: 1.02 }],
  },
  userCardBlur: {
    padding: isWeb ? 28 : 22,
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
    alignItems: 'center',
  },
  userCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  userCardGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 14,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  avatarGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  avatarText: {
    fontSize: 36,
    fontFamily: 'Inter-ExtraBold',
    color: '#FFFFFF',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  username: {
    fontSize: isWeb ? 22 : 20,
    fontFamily: 'Inter-ExtraBold',
    color: '#133B1C',
    marginBottom: 4,
  },
  usernameHovered: {
    color: '#1E4E2C',
  },
  email: {
    fontSize: isWeb ? 14 : 13,
    color: '#64748B',
    marginBottom: 12,
  },
  emailHovered: {
    color: '#4CAF50',
  },
  userCardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  userCardBadgeText: {
    fontSize: isWeb ? 12 : 11,
    fontFamily: 'Inter-SemiBold',
    color: '#4CAF50',
  },

  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: SCREEN_PADDING,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    backgroundColor: 'rgba(255,255,255,0.62)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  statCardWrapper: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
  },
  statCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  statCardHovered: {
    transform: [{ scale: 1.05 }],
  },
  statBlur: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  statGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
  },
  statIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  statIconGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  statNumber: {
    fontSize: isWeb ? 22 : 20,
    fontFamily: 'Inter-ExtraBold',
    color: '#133B1C',
    marginBottom: 2,
  },
  statNumberHovered: {
    color: '#1E4E2C',
  },
  statLabel: {
    fontSize: isWeb ? 11 : 10,
    color: '#64748B',
    fontFamily: 'Inter-Medium',
  },
  statLabelHovered: {
    color: '#4CAF50',
  },
  statDivider: {
    width: 1,
    height: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },

  // Menu Container
  menuContainer: {
    marginHorizontal: SCREEN_PADDING,
    borderRadius: 20,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    backgroundColor: 'rgba(255,255,255,0.62)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  menuItem: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  menuBlurHovered: {
    borderColor: 'rgba(76, 175, 80, 0.3)',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  menuItemPressed: {
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
  },
  menuItemHovered: {
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
  },
  menuGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
  },
  menuIcon: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  menuIconGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIconCirclePressed: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
  },
  menuContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: isWeb ? 15 : 14,
    fontFamily: 'Inter-Bold',
    color: '#133B1C',
  },
  menuItemTitlePressed: {
    color: '#1E4E2C',
  },
  menuItemSubtitle: {
    fontSize: isWeb ? 12 : 11,
    color: '#64748B',
    marginTop: 2,
  },
  menuItemSubtitlePressed: {
    color: '#4CAF50',
  },

  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    marginHorizontal: SCREEN_PADDING,
    marginTop: 24,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  logoutButtonPressed: {
    backgroundColor: '#FEE2E2',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: isWeb ? 15 : 14,
    fontFamily: 'Inter-Bold',
    marginLeft: 8,
  },

  // Version
  versionText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: isWeb ? 12 : 11,
    marginTop: 8,
    marginBottom: 20,
  },
});
