import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { fetchEcoPointData, redeemReward, Reward, startRedeem } from '../store/ecoPointSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

// ============ CROSS-PLATFORM CONFIG ============
const isWeb = Platform.OS === 'web';
const isIOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';

// Level badge color
const getLevelColor = (level: string) => {
  switch (level) {
    case 'Bronze':
      return '#CD7F32';
    case 'Silver':
      return '#A0A0A0';
    case 'Gold':
      return '#FFB300';
    case 'Platinum':
      return '#78909C';
    default:
      return '#4CAF50';
  }
};

// Level icon
const getLevelIcon = (level: string) => {
  switch (level) {
    case 'Bronze':
      return 'medal-outline';
    case 'Silver':
      return 'medal-outline';
    case 'Gold':
      return 'medal-outline';
    default:
      return 'star-outline';
  }
};

// Progress bar component dengan animasi
const CustomProgressBar = ({ progress, color }: { progress: number; color: string }) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: Math.min(progress * 100, 100),
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={styles.progressBarContainer}>
      <Animated.View 
        style={[
          styles.progressBarFill, 
          { 
            width: animatedWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%']
            }),
            backgroundColor: color 
          }
        ]} 
      />
    </View>
  );
};

// Reward Card Component dengan Animasi Smooth
const RewardCard = ({
  reward,
  isRedeeming,
  onPress,
}: {
  reward: Reward;
  isRedeeming: boolean;
  onPress: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isHovered && isWeb) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.02,
          friction: 4,
          tension: 200,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 200,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isHovered]);

  return (
    <Animated.View style={[
      styles.rewardCardWrapper,
      {
        transform: [{ scale: scaleAnim }],
      }
    ]}>
      <Pressable
        style={[
          styles.rewardCard,
          !reward.available && styles.rewardCardDisabled,
        ]}
        onPress={onPress}
        disabled={!reward.available || isRedeeming}
        onHoverIn={isWeb ? () => setIsHovered(true) : undefined}
        onHoverOut={isWeb ? () => setIsHovered(false) : undefined}
      >
        <BlurView 
          intensity={isWeb ? (isHovered ? 40 : 20) : 30} 
          tint="light" 
          style={[
            styles.rewardBlur,
            isHovered && styles.rewardBlurHovered,
          ]}
        >
          {isHovered && isWeb && (
            <Animated.View 
              style={[
                styles.rewardGlow,
                {
                  opacity: glowAnim,
                  transform: [
                    {
                      scale: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1.2]
                      })
                    }
                  ]
                }
              ]} 
            />
          )}
          
          <Animated.View style={[
            styles.rewardIconContainer, 
            reward.available ? styles.rewardIconActive : styles.rewardIconDisabled,
            {
              transform: [
                {
                  scale: isHovered ? 1.1 : 1
                }
              ]
            }
          ]}>
            <Ionicons name={reward.icon as any} size={isWeb ? 24 : 22} color={reward.available ? '#4CAF50' : '#94A3B8'} />
          </Animated.View>
          <View style={styles.rewardContent}>
            <Text style={[styles.rewardName, !reward.available && styles.rewardNameDisabled]}>{reward.name}</Text>
            <Text style={[styles.rewardDescription, !reward.available && styles.rewardDescriptionDisabled]}>{reward.description}</Text>
          </View>
          {isRedeeming ? (
            <ActivityIndicator color="#4CAF50" />
          ) : (
            <Animated.View style={[
              styles.rewardPointsContainer, 
              reward.available ? styles.rewardPointsActive : styles.rewardPointsDisabled,
              {
                transform: [
                  {
                    scale: isHovered ? 1.05 : 1
                  }
                ]
              }
            ]}>
              <Text style={[styles.rewardPoints, !reward.available && styles.rewardPointsTextDisabled]}>{reward.points}</Text>
              <MaterialCommunityIcons name="leaf" size={isWeb ? 12 : 11} color={reward.available ? '#4CAF50' : '#94A3B8'} />
            </Animated.View>
          )}
        </BlurView>
      </Pressable>
    </Animated.View>
  );
};

// Points Counter dengan Animasi
const AnimatedNumber = ({ value }: { value: number }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration: 1500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [value]);

  return (
    <Animated.Text style={styles.pointsValue}>
      {animatedValue.interpolate({
        inputRange: [0, value],
        outputRange: ['0', value.toString()],
      })}
    </Animated.Text>
  );
};

// Fade In Animation untuk Section
const FadeInSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        delay,
        easing: Easing.out(Easing.cubic),
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

export default function EcoPointScreen() {
  const dispatch = useAppDispatch();
  const { token } = useAuth();
  const { userPoints, rewards, redeemingId, loading, error } = useAppSelector((state) => state.ecoPoint);
  const [prevPoints, setPrevPoints] = useState(userPoints.totalPoints);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchEcoPointData(token));
    }, [dispatch, token])
  );

  // Animasi untuk poin berubah
  useEffect(() => {
    if (userPoints.totalPoints !== prevPoints) {
      setPrevPoints(userPoints.totalPoints);
    }
  }, [userPoints.totalPoints]);

  const progress = userPoints.totalPoints / userPoints.nextLevelPoints;
  const levelColor = getLevelColor(userPoints.level);
  const levelIcon = getLevelIcon(userPoints.level);

  const handleRedeem = async (rewardId: number, points: number) => {
    if (userPoints.totalPoints >= points) {
      try {
        dispatch(startRedeem(rewardId));
        const result = await dispatch(redeemReward({ token, rewardId })).unwrap();
        alert(result.message || 'Selamat! Reward berhasil ditukarkan.');
      } catch (redeemError) {
        alert(typeof redeemError === 'string' ? redeemError : 'Gagal menukarkan reward.');
      }
    } else {
      alert(`Poin tidak cukup. Butuh ${points - userPoints.totalPoints} poin lagi.`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0fdf4" />
      
      <LinearGradient
        colors={['#f0fdf4', '#dcfce7', '#eef2ff']}
        style={styles.backgroundGradient}
      />

      {/* Dekorasi Latar Belakang dengan Animasi */}
      <Animated.View style={[styles.decoLeafTopLeft]}>
        <MaterialCommunityIcons name="leaf" size={50} color="rgba(76, 175, 80, 0.06)" />
      </Animated.View>
      <Animated.View style={[styles.decoLeafBottomRight]}>
        <MaterialCommunityIcons name="leaf-maple" size={60} color="rgba(76, 175, 80, 0.05)" />
      </Animated.View>
      <Animated.View style={[styles.decoRecycle]}>
        <MaterialCommunityIcons name="recycle" size={40} color="rgba(59, 130, 246, 0.04)" />
      </Animated.View>
      <View style={styles.decoCircle1} />
      <View style={styles.decoCircle2} />
      <View style={styles.decoCircle3} />

      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContainer}
      >
        {loading && (
          <BlurView intensity={isWeb ? 20 : 30} tint="light" style={styles.asyncStatus}>
            <ActivityIndicator color="#10B981" size="small" />
            <Text style={styles.asyncStatusText}>Memuat data Eco Poin...</Text>
          </BlurView>
        )}

        {error && (
          <BlurView intensity={isWeb ? 20 : 30} tint="light" style={[styles.asyncStatus, styles.asyncError]}>
            <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
            <Text style={[styles.asyncStatusText, styles.asyncErrorText]}>{error}</Text>
          </BlurView>
        )}

        {/* Header dengan Animasi */}
        <FadeInSection delay={100}>
          <BlurView intensity={isWeb ? 40 : 50} tint="light" style={styles.header}>
            <LinearGradient
              colors={['rgba(30, 78, 44, 0.15)', 'rgba(76, 175, 80, 0.10)']}
              style={styles.headerGradient}
            />
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>🌿 Eco Poin</Text>
              <Text style={styles.headerSubtitle}>Kumpulkan poin dan tukarkan reward!</Text>
            </View>
          </BlurView>
        </FadeInSection>

        {/* Points Card dengan Animasi */}
        <FadeInSection delay={200}>
          <BlurView intensity={isWeb ? 30 : 40} tint="light" style={styles.pointsCard}>
            <LinearGradient
              colors={['#1E4E2C', '#2E7D32', '#1B5E20']}
              style={styles.pointsGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.pointsGlow} />
            
            <View style={styles.pointsHeader}>
              <MaterialCommunityIcons name="leaf" size={isWeb ? 28 : 24} color="#FFFFFF" />
              <Text style={styles.pointsTitle}>Eco Poin Saya</Text>
            </View>
            
            <View style={styles.pointsValueContainer}>
              <AnimatedNumber value={userPoints.totalPoints} />
              <View style={styles.pointsValueBadge}>
                <MaterialCommunityIcons name="star" size={12} color="#FFD700" />
                <Text style={styles.pointsValueBadgeText}>POIN</Text>
              </View>
            </View>
            
            <Text style={styles.pointsSubtitle}>Total poin yang terkumpul</Text>

            {/* Level Progress dengan Animasi */}
            <View style={styles.levelContainer}>
              <View style={styles.levelBadge}>
                <View style={styles.levelIconContainer}>
                  <Ionicons name={levelIcon as any} size={isWeb ? 18 : 16} color={levelColor} />
                </View>
                <Text style={[styles.levelText, { color: levelColor }]}>{userPoints.level}</Text>
                <View style={styles.levelProgressLabel}>
                  <Text style={styles.levelProgressText}>
                    {Math.round(progress * 100)}%
                  </Text>
                </View>
              </View>
              <View style={styles.progressWrapper}>
                <CustomProgressBar progress={Math.min(progress, 1)} color={levelColor} />
                <Text style={styles.progressText}>
                  {userPoints.totalPoints} / {userPoints.nextLevelPoints} poin menuju {userPoints.nextLevelName}
                </Text>
              </View>
            </View>
          </BlurView>
        </FadeInSection>

        {/* Statistik Dampak */}
        <FadeInSection delay={300}>
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>🌍 Dampak Lingkungan</Text>
            <View style={styles.statsRow}>
              <BlurView intensity={isWeb ? 25 : 35} tint="light" style={[styles.statCard, styles.statCardCO2]}>
                <LinearGradient
                  colors={['rgba(33, 150, 243, 0.10)', 'rgba(33, 150, 243, 0.05)']}
                  style={styles.statGradient}
                />
                <View style={styles.statIconContainer}>
                  <Ionicons name="cloud-outline" size={isWeb ? 26 : 22} color="#2196F3" />
                </View>
                <Text style={styles.statValue}>{userPoints.co2Saved} kg</Text>
                <Text style={styles.statLabel}>CO₂ Dicegah</Text>
              </BlurView>
              <BlurView intensity={isWeb ? 25 : 35} tint="light" style={[styles.statCard, styles.statCardRecycle]}>
                <LinearGradient
                  colors={['rgba(76, 175, 80, 0.10)', 'rgba(76, 175, 80, 0.05)']}
                  style={styles.statGradient}
                />
                <View style={styles.statIconContainer}>
                  <Ionicons name="leaf-outline" size={isWeb ? 26 : 22} color="#4CAF50" />
                </View>
                <Text style={styles.statValue}>{userPoints.itemsRecycled}</Text>
                <Text style={styles.statLabel}>Didaur Ulang</Text>
              </BlurView>
            </View>
          </View>
        </FadeInSection>

        {/* Cara Mendapatkan Poin */}
        <FadeInSection delay={400}>
          <View style={styles.tipsSection}>
            <Text style={styles.sectionTitle}>💡 Cara Mendapatkan Poin</Text>
            <BlurView intensity={isWeb ? 20 : 30} tint="light" style={styles.tipsList}>
              <View style={styles.tipItem}>
                <View style={styles.tipIcon}>
                  <Ionicons name="scan-outline" size={isWeb ? 18 : 16} color="#4CAF50" />
                </View>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Scan Sampah</Text>
                  <Text style={styles.tipDesc}>Organik +5 poin • Anorganik +10 poin • B3 +25 poin</Text>
                </View>
              </View>
              <View style={styles.tipItem}>
                <View style={styles.tipIcon}>
                  <Ionicons name="share-social-outline" size={isWeb ? 18 : 16} color="#4CAF50" />
                </View>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Bagikan ke Teman</Text>
                  <Text style={styles.tipDesc}>Ajak teman bergabung dapat +50 poin</Text>
                </View>
              </View>
              <View style={[styles.tipItem, styles.noBorder]}>
                <View style={styles.tipIcon}>
                  <Ionicons name="calendar-outline" size={isWeb ? 18 : 16} color="#4CAF50" />
                </View>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Challenge Harian</Text>
                  <Text style={styles.tipDesc}>Selesaikan misi harian dapat +20 poin</Text>
                </View>
              </View>
            </BlurView>
          </View>
        </FadeInSection>

        {/* Tukar Poin */}
        <FadeInSection delay={500}>
          <View style={styles.rewardsSection}>
            <Text style={styles.sectionTitle}>🎁 Tukar Poin</Text>
            <Text style={styles.rewardsSubtitle}>
              Tukarkan poinmu dengan reward menarik!
            </Text>
            {rewards.map((reward, index) => (
              <FadeInSection key={reward.id} delay={600 + index * 100}>
                <RewardCard
                  reward={reward}
                  isRedeeming={redeemingId === reward.id}
                  onPress={() => handleRedeem(reward.id, reward.points)}
                />
              </FadeInSection>
            ))}
          </View>
        </FadeInSection>

        {/* Tips Tambahan */}
        <FadeInSection delay={800}>
          <BlurView intensity={isWeb ? 20 : 30} tint="light" style={styles.footerTip}>
            <Ionicons name="bulb-outline" size={isWeb ? 18 : 16} color="#1E4E2C" />
            <Text style={styles.footerTipText}>
              Scan lebih banyak sampah untuk mengumpulkan poin dan naik level!
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
    backgroundColor: '#f0fdf4',
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
    paddingBottom: isWeb ? 120 : 90,
  },

  // Dekorasi
  decoLeafTopLeft: {
    position: 'absolute',
    top: 40,
    left: 10,
    zIndex: 0,
  },
  decoLeafBottomRight: {
    position: 'absolute',
    bottom: 60,
    right: 10,
    zIndex: 0,
  },
  decoRecycle: {
    position: 'absolute',
    top: 180,
    right: 20,
    zIndex: 0,
  },
  decoCircle1: {
    position: 'absolute',
    top: 100,
    right: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(76,175,80,0.03)',
  },
  decoCircle2: {
    position: 'absolute',
    bottom: 180,
    left: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(59,130,246,0.03)',
  },
  decoCircle3: {
    position: 'absolute',
    top: '40%',
    right: -30,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(139,92,246,0.03)',
  },

  // Header dengan highlight
  header: {
    marginHorizontal: isWeb ? 40 : 16,
    marginTop: isWeb ? 20 : 12,
    marginBottom: 10,
    padding: isWeb ? 20 : 14,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.3)',
    backgroundColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
    zIndex: 1,
    overflow: 'hidden',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 6,
    gap: 4,
  },
  headerBadgeText: {
    fontSize: isWeb ? 12 : 11,
    fontWeight: '700',
    color: '#1E4E2C',
  },
  headerTitle: {
    fontSize: isWeb ? 26 : 22,
    fontWeight: '900',
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

  // Async Status
  asyncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: isWeb ? 40 : 16,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.4)',
    gap: 8,
  },
  asyncStatusText: {
    flex: 1,
    color: '#133B1C',
    fontSize: 12,
    fontWeight: '500',
  },
  asyncError: {
    borderColor: 'rgba(254, 202, 202, 0.5)',
    backgroundColor: 'rgba(254, 242, 242, 0.7)',
  },
  asyncErrorText: {
    color: '#EF4444',
  },

  // Points Card dengan desain lebih menonjol
  pointsCard: {
    marginHorizontal: isWeb ? 40 : 16,
    marginTop: 10,
    marginBottom: 6,
    padding: isWeb ? 24 : 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#1E4E2C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  pointsGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  pointsGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    zIndex: 1,
  },
  pointsTitle: {
    fontSize: isWeb ? 15 : 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
    letterSpacing: 0.2,
  },
  pointsValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 1,
  },
  pointsValue: {
    fontSize: isWeb ? 48 : 40,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  pointsValueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
    marginBottom: 4,
  },
  pointsValueBadgeText: {
    fontSize: isWeb ? 10 : 9,
    fontWeight: '800',
    color: '#FFD700',
    letterSpacing: 0.3,
  },
  pointsSubtitle: {
    fontSize: isWeb ? 13 : 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
    zIndex: 1,
    fontWeight: '500',
  },
  levelContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: isWeb ? 14 : 12,
    zIndex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  levelIconContainer: {
    width: isWeb ? 32 : 28,
    height: isWeb ? 32 : 28,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    fontSize: isWeb ? 15 : 14,
    fontWeight: '800',
    marginLeft: 2,
  },
  levelProgressLabel: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  levelProgressText: {
    fontSize: isWeb ? 11 : 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressWrapper: {
    gap: 6,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: isWeb ? 12 : 11,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '500',
  },

  // Stats Section
  statsSection: {
    marginHorizontal: isWeb ? 40 : 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: isWeb ? 17 : 16,
    fontWeight: '800',
    color: '#133B1C',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: isWeb ? 16 : 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  statCardCO2: {
    borderColor: 'rgba(33, 150, 243, 0.2)',
  },
  statCardRecycle: {
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  statGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  statIconContainer: {
    marginBottom: 4,
  },
  statValue: {
    fontSize: isWeb ? 20 : 18,
    fontWeight: '900',
    color: '#133B1C',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: isWeb ? 11 : 10,
    color: '#64748B',
    fontWeight: '600',
  },

  // Tips Section
  tipsSection: {
    marginHorizontal: isWeb ? 40 : 16,
    marginTop: 16,
  },
  tipsList: {
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1.5,
  },
  tipItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  tipIcon: {
    width: isWeb ? 34 : 30,
    height: isWeb ? 34 : 30,
    borderRadius: 17,
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: isWeb ? 14 : 13,
    fontWeight: '700',
    color: '#133B1C',
    marginBottom: 1,
  },
  tipDesc: {
    fontSize: isWeb ? 12 : 11,
    color: '#64748B',
    lineHeight: 16,
  },

  // Rewards Section
  rewardsSection: {
    marginHorizontal: isWeb ? 40 : 16,
    marginTop: 16,
  },
  rewardsSubtitle: {
    fontSize: isWeb ? 12 : 11,
    color: '#64748B',
    marginBottom: 10,
  },
  rewardCardWrapper: {
    marginBottom: 8,
  },
  rewardCard: {
    borderRadius: 16,
  },
  rewardCardDisabled: {
    opacity: 0.6,
  },
  rewardBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isWeb ? 14 : 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  rewardBlurHovered: {
    borderColor: 'rgba(76, 175, 80, 0.5)',
    backgroundColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  rewardGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
  },
  rewardIconContainer: {
    width: isWeb ? 44 : 40,
    height: isWeb ? 44 : 40,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rewardIconActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
  },
  rewardIconDisabled: {
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  rewardContent: {
    flex: 1,
  },
  rewardName: {
    fontSize: isWeb ? 14 : 13,
    fontWeight: '700',
    color: '#133B1C',
  },
  rewardNameDisabled: {
    color: '#94A3B8',
  },
  rewardDescription: {
    fontSize: isWeb ? 11 : 10,
    color: '#64748B',
    marginTop: 1,
  },
  rewardDescriptionDisabled: {
    color: '#CBD5E1',
  },
  rewardPointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  rewardPointsActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
  },
  rewardPointsDisabled: {
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  rewardPoints: {
    fontSize: isWeb ? 12 : 11,
    fontWeight: '700',
    color: '#4CAF50',
  },
  rewardPointsTextDisabled: {
    color: '#94A3B8',
  },

  // Footer Tip
  footerTip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: isWeb ? 40 : 16,
    marginTop: 16,
    marginBottom: 30,
    padding: isWeb ? 14 : 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.4)',
    gap: 8,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1.5,
  },
  footerTipText: {
    flex: 1,
    fontSize: isWeb ? 12 : 11,
    color: '#133B1C',
    fontWeight: '500',
  },
});