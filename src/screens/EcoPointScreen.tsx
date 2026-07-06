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
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { fetchEcoPointData, redeemReward, RedeemHistoryItem, Reward, startRedeem } from '../store/ecoPointSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

// ============ CROSS-PLATFORM CONFIG ============
const isWeb = Platform.OS === 'web';
const isIOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';
const SCREEN_PADDING = 10;

type RedeemToastType = 'loading' | 'success' | 'error';

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

const formatRedeemDate = (dateString: string) => {
  const date = new Date(dateString);

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getVoucherCode = (item: RedeemHistoryItem) => {
  if (item.voucherCode) return item.voucherCode;
  return `ECO-${String(item.rewardId).padStart(2, '0')}-${String(item.id).padStart(6, '0')}`;
};

const MyVoucherCard = ({
  item,
  onPress,
}: {
  item: RedeemHistoryItem;
  onPress: () => void;
}) => (
  <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={styles.voucherTouchable}>
    <LinearGradient
      colors={['#14532D', '#16A34A', '#22C55E'] as const}
      style={styles.voucherCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.voucherPatternCircleTop} />
      <View style={styles.voucherPatternCircleBottom} />

      <View style={styles.voucherHeader}>
        <View style={styles.voucherIconWrap}>
          <Ionicons name={item.icon as any} size={22} color="#16A34A" />
        </View>
        <View style={styles.voucherStatusBadge}>
          <View style={styles.voucherStatusDot} />
          <Text style={styles.voucherStatusText}>Aktif</Text>
        </View>
      </View>

      <Text style={styles.voucherName} numberOfLines={1}>{item.rewardName}</Text>
      <Text style={styles.voucherDescription} numberOfLines={2}>{item.rewardDescription}</Text>

      <View style={styles.voucherDivider}>
        <View style={styles.voucherDash} />
      </View>

      <View style={styles.voucherCodeRow}>
        <View>
          <Text style={styles.voucherCodeLabel}>Kode Referensi</Text>
          <Text style={styles.voucherCode}>{getVoucherCode(item)}</Text>
        </View>
        <View style={styles.voucherPointsBadge}>
          <Text style={styles.voucherPointsText}>-{item.points}</Text>
          <MaterialCommunityIcons name="leaf" size={11} color="#FFFFFF" />
        </View>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const RedeemHistoryCard = ({
  item,
  onPress,
}: {
  item: RedeemHistoryItem;
  onPress: () => void;
}) => (
  <TouchableOpacity activeOpacity={0.86} onPress={onPress} style={styles.redeemHistoryTouchable}>
    <BlurView intensity={isWeb ? 20 : 30} tint="light" style={styles.redeemHistoryCard}>
      <View style={styles.redeemHistoryIcon}>
        <Ionicons name={item.icon as any} size={isWeb ? 20 : 18} color="#10B981" />
      </View>
      <View style={styles.redeemHistoryContent}>
        <Text style={styles.redeemHistoryName}>{item.rewardName}</Text>
        <Text style={styles.redeemHistoryDate}>{formatRedeemDate(item.redeemedAt)}</Text>
      </View>
      <View style={styles.redeemHistoryPoints}>
        <Text style={styles.redeemHistoryPointsText}>-{item.points}</Text>
        <MaterialCommunityIcons name="leaf" size={11} color="#EF4444" />
      </View>
      <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
    </BlurView>
  </TouchableOpacity>
);

export default function EcoPointScreen() {
  const dispatch = useAppDispatch();
  const { token } = useAuth();
  const { userPoints, rewards, redeemHistory, redeemingId, loading, error } = useAppSelector((state) => state.ecoPoint);
  const [prevPoints, setPrevPoints] = useState(userPoints.totalPoints);
  const [selectedRedeemHistory, setSelectedRedeemHistory] = useState<RedeemHistoryItem | null>(null);
  const [redeemToast, setRedeemToast] = useState<{
    visible: boolean;
    message: string;
    type: RedeemToastType;
  }>({
    visible: false,
    message: '',
    type: 'loading',
  });
  const redeemToastY = useRef(new Animated.Value(-24)).current;
  const redeemToastOpacity = useRef(new Animated.Value(0)).current;
  const redeemToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    return () => {
      if (redeemToastTimer.current) {
        clearTimeout(redeemToastTimer.current);
      }
    };
  }, []);

  const hideRedeemToast = () => {
    Animated.parallel([
      Animated.timing(redeemToastY, {
        toValue: -24,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(redeemToastOpacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setRedeemToast((current) => ({ ...current, visible: false }));
    });
  };

  const showRedeemToast = (message: string, type: RedeemToastType, duration = 2600) => {
    if (redeemToastTimer.current) {
      clearTimeout(redeemToastTimer.current);
      redeemToastTimer.current = null;
    }

    setRedeemToast({ visible: true, message, type });
    Animated.parallel([
      Animated.spring(redeemToastY, {
        toValue: 0,
        friction: 7,
        tension: 90,
        useNativeDriver: true,
      }),
      Animated.timing(redeemToastOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    if (duration > 0) {
      redeemToastTimer.current = setTimeout(hideRedeemToast, duration);
    }
  };

  const progress = userPoints.totalPoints / userPoints.nextLevelPoints;
  const levelColor = getLevelColor(userPoints.level);
  const levelIcon = getLevelIcon(userPoints.level);

  const handleRedeem = async (rewardId: number, points: number) => {
    if (userPoints.totalPoints >= points) {
      try {
        showRedeemToast('Memproses penukaran poin...', 'loading', 0);
        dispatch(startRedeem(rewardId));
        const result = await dispatch(redeemReward({ token, rewardId })).unwrap();
        dispatch(fetchEcoPointData(token));
        showRedeemToast(result.message || 'Reward berhasil ditukarkan.', 'success');
      } catch (redeemError) {
        showRedeemToast(
          typeof redeemError === 'string' ? redeemError : 'Gagal menukarkan reward.',
          'error'
        );
      }
    } else {
      showRedeemToast(`Poin tidak cukup. Butuh ${points - userPoints.totalPoints} poin lagi.`, 'error');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEFDF3" />
      
      <LinearGradient
        colors={['#dcfce7', '#f0fdf4', '#eff6ff'] as const}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
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

        {/* Voucher Saya */}
        <FadeInSection delay={650}>
          <View style={styles.myVoucherSection}>
            <View style={styles.myVoucherHeader}>
              <Text style={styles.sectionTitle}>🎟️ Voucher Saya</Text>
              <Text style={styles.myVoucherCount}>{redeemHistory.length} voucher</Text>
            </View>
            <Text style={styles.myVoucherSubtitle}>
              Reward yang berhasil ditukar akan muncul sebagai voucher aktif.
            </Text>

            {redeemHistory.length > 0 ? (
              redeemHistory.map((voucher) => (
                <MyVoucherCard
                  key={`voucher-${voucher.id}`}
                  item={voucher}
                  onPress={() => setSelectedRedeemHistory(voucher)}
                />
              ))
            ) : (
              <BlurView intensity={isWeb ? 20 : 30} tint="light" style={styles.myVoucherEmpty}>
                <Ionicons name="ticket-outline" size={22} color="#94A3B8" />
                <Text style={styles.myVoucherEmptyText}>
                  Belum ada voucher. Tukarkan poin untuk mendapatkan voucher pertama.
                </Text>
              </BlurView>
            )}
          </View>
        </FadeInSection>

        {/* Riwayat Tukar Poin */}
        <FadeInSection delay={800}>
          <View style={styles.redeemHistorySection}>
            <View style={styles.redeemHistoryHeader}>
              <Text style={styles.sectionTitle}>🧾 Riwayat Tukar Poin</Text>
              <Text style={styles.redeemHistoryCount}>{redeemHistory.length} transaksi</Text>
            </View>

            {redeemHistory.length > 0 ? (
              redeemHistory.map((historyItem) => (
                <RedeemHistoryCard
                  key={historyItem.id}
                  item={historyItem}
                  onPress={() => setSelectedRedeemHistory(historyItem)}
                />
              ))
            ) : (
              <BlurView intensity={isWeb ? 20 : 30} tint="light" style={styles.redeemHistoryEmpty}>
                <Ionicons name="receipt-outline" size={22} color="#94A3B8" />
                <Text style={styles.redeemHistoryEmptyText}>
                  Belum ada penukaran poin.
                </Text>
              </BlurView>
            )}
          </View>
        </FadeInSection>

        {/* Tips Tambahan */}
        <FadeInSection delay={1000}>
          <BlurView intensity={isWeb ? 20 : 30} tint="light" style={styles.footerTip}>
            <Ionicons name="bulb-outline" size={isWeb ? 18 : 16} color="#1E4E2C" />
            <Text style={styles.footerTipText}>
              Scan lebih banyak sampah untuk mengumpulkan poin dan naik level!
            </Text>
          </BlurView>
        </FadeInSection>
      </ScrollView>

      {redeemToast.visible && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.redeemToast,
            {
              opacity: redeemToastOpacity,
              transform: [{ translateY: redeemToastY }],
            },
          ]}
        >
          <BlurView intensity={isWeb ? 30 : 40} tint="light" style={styles.redeemToastBlur}>
            {redeemToast.type === 'loading' ? (
              <ActivityIndicator color="#10B981" size="small" />
            ) : (
              <Ionicons
                name={redeemToast.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
                size={20}
                color={redeemToast.type === 'success' ? '#10B981' : '#EF4444'}
              />
            )}
            <Text
              style={[
                styles.redeemToastText,
                redeemToast.type === 'error' && styles.redeemToastTextError,
              ]}
            >
              {redeemToast.message}
            </Text>
          </BlurView>
        </Animated.View>
      )}

      <Modal
        visible={!!selectedRedeemHistory}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedRedeemHistory(null)}
      >
        <View style={styles.redeemDetailOverlay}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.redeemDetailBackdrop}
            onPress={() => setSelectedRedeemHistory(null)}
          />

          {selectedRedeemHistory && (
            <BlurView intensity={isWeb ? 35 : 45} tint="light" style={styles.redeemDetailModal}>
              <View style={styles.redeemDetailHeader}>
                <View style={styles.redeemDetailIcon}>
                  <Ionicons name={selectedRedeemHistory.icon as any} size={30} color="#10B981" />
                </View>
                <View style={styles.redeemDetailHeaderText}>
                  <Text style={styles.redeemDetailEyebrow}>Detail Penukaran</Text>
                  <Text style={styles.redeemDetailTitle}>{selectedRedeemHistory.rewardName}</Text>
                  <Text style={styles.redeemDetailSubtitle}>{selectedRedeemHistory.rewardDescription}</Text>
                </View>
                <TouchableOpacity style={styles.redeemDetailCloseButton} onPress={() => setSelectedRedeemHistory(null)}>
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.redeemDetailPointCard}>
                <Text style={styles.redeemDetailPointLabel}>Poin Ditukar</Text>
                <View style={styles.redeemDetailPointValueWrap}>
                  <Text style={styles.redeemDetailPointValue}>-{selectedRedeemHistory.points}</Text>
                  <MaterialCommunityIcons name="leaf" size={18} color="#EF4444" />
                </View>
              </View>

              <View style={styles.redeemDetailRows}>
                <View style={styles.redeemDetailRow}>
                  <Text style={styles.redeemDetailRowLabel}>Kode Referensi</Text>
                  <Text style={styles.redeemDetailRowValue} numberOfLines={1}>{getVoucherCode(selectedRedeemHistory)}</Text>
                </View>
                <View style={styles.redeemDetailRow}>
                  <Text style={styles.redeemDetailRowLabel}>Tanggal</Text>
                  <Text style={styles.redeemDetailRowValue}>{formatRedeemDate(selectedRedeemHistory.redeemedAt)}</Text>
                </View>
                <View style={styles.redeemDetailRow}>
                  <Text style={styles.redeemDetailRowLabel}>Reward ID</Text>
                  <Text style={styles.redeemDetailRowValue}>{selectedRedeemHistory.rewardId}</Text>
                </View>
                <View style={styles.redeemDetailRow}>
                  <Text style={styles.redeemDetailRowLabel}>Transaksi ID</Text>
                  <Text style={styles.redeemDetailRowValue} numberOfLines={1}>{selectedRedeemHistory.id}</Text>
                </View>
                <View style={styles.redeemDetailRow}>
                  <Text style={styles.redeemDetailRowLabel}>Status</Text>
                  <Text style={[styles.redeemDetailRowValue, styles.redeemDetailStatus]}>Berhasil</Text>
                </View>
              </View>
            </BlurView>
          )}
        </View>
      </Modal>
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
    paddingHorizontal: SCREEN_PADDING,
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
    marginTop: isWeb ? 20 : 12,
    marginBottom: 10,
    padding: isWeb ? 20 : 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    backgroundColor: 'rgba(255,255,255,0.62)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
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
    fontFamily: 'Inter-Bold',
    color: '#1E4E2C',
  },
  headerTitle: {
    fontSize: isWeb ? 26 : 22,
    fontFamily: 'Inter-ExtraBold',
    color: '#133B1C',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: isWeb ? 13 : 12,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
  },

  // Async Status
  asyncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    backgroundColor: 'rgba(255,255,255,0.62)',
    gap: 8,
  },
  asyncStatusText: {
    flex: 1,
    color: '#133B1C',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
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
    marginTop: 10,
    marginBottom: 6,
    padding: isWeb ? 24 : 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    backgroundColor: 'rgba(255,255,255,0.54)',
    shadowColor: '#1E4E2C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.11,
    shadowRadius: 22,
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
    fontFamily: 'Inter-Bold',
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
    fontFamily: 'Inter-ExtraBold',
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
    fontFamily: 'Inter-ExtraBold',
    color: '#FFD700',
    letterSpacing: 0.3,
  },
  pointsSubtitle: {
    fontSize: isWeb ? 13 : 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
    zIndex: 1,
    fontFamily: 'Inter-Medium',
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
    fontFamily: 'Inter-ExtraBold',
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
    fontFamily: 'Inter-Bold',
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
    fontFamily: 'Inter-Medium',
  },

  // Stats Section
  statsSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: isWeb ? 17 : 16,
    fontFamily: 'Inter-ExtraBold',
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
    borderColor: 'rgba(255,255,255,0.82)',
    backgroundColor: 'rgba(255,255,255,0.62)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
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
    fontFamily: 'Inter-ExtraBold',
    color: '#133B1C',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: isWeb ? 11 : 10,
    color: '#64748B',
    fontFamily: 'Inter-SemiBold',
  },

  // Tips Section
  tipsSection: {
    marginTop: 16,
  },
  tipsList: {
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    backgroundColor: 'rgba(255,255,255,0.62)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
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
    fontFamily: 'Inter-Bold',
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
    borderColor: 'rgba(255,255,255,0.82)',
    backgroundColor: 'rgba(255,255,255,0.62)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
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
    fontFamily: 'Inter-Bold',
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
    fontFamily: 'Inter-Bold',
    color: '#4CAF50',
  },
  rewardPointsTextDisabled: {
    color: '#94A3B8',
  },

  // My Vouchers
  myVoucherSection: {
    marginTop: 16,
  },
  myVoucherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  myVoucherCount: {
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(16,185,129,0.1)',
    color: '#10B981',
    fontSize: isWeb ? 11 : 10,
    fontFamily: 'Inter-Bold',
  },
  myVoucherSubtitle: {
    marginTop: -4,
    marginBottom: 10,
    fontSize: isWeb ? 12 : 11,
    color: '#64748B',
    fontFamily: 'Inter-Medium',
  },
  voucherTouchable: {
    borderRadius: 20,
    marginBottom: 10,
  },
  voucherCard: {
    minHeight: isWeb ? 178 : 168,
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 7,
  },
  voucherPatternCircleTop: {
    position: 'absolute',
    top: -34,
    right: -28,
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  voucherPatternCircleBottom: {
    position: 'absolute',
    bottom: -44,
    left: -38,
    width: 126,
    height: 126,
    borderRadius: 63,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  voucherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  voucherIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  voucherStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  voucherStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#BBF7D0',
  },
  voucherStatusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Inter-ExtraBold',
  },
  voucherName: {
    color: '#FFFFFF',
    fontSize: isWeb ? 20 : 18,
    fontFamily: 'Inter-ExtraBold',
  },
  voucherDescription: {
    marginTop: 4,
    minHeight: 34,
    color: 'rgba(255,255,255,0.86)',
    fontSize: isWeb ? 13 : 12,
    lineHeight: 17,
    fontFamily: 'Inter-Medium',
  },
  voucherDivider: {
    marginVertical: 12,
    height: 1,
    overflow: 'hidden',
  },
  voucherDash: {
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
  },
  voucherCodeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
  },
  voucherCodeLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  voucherCode: {
    color: '#FFFFFF',
    fontSize: isWeb ? 15 : 13,
    fontFamily: 'Inter-ExtraBold',
    letterSpacing: 0,
  },
  voucherPointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  voucherPointsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-ExtraBold',
  },
  myVoucherEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    backgroundColor: 'rgba(255,255,255,0.62)',
  },
  myVoucherEmptyText: {
    flex: 1,
    fontSize: isWeb ? 13 : 12,
    color: '#64748B',
    lineHeight: 18,
    fontFamily: 'Inter-Medium',
  },

  // Redeem History
  redeemHistorySection: {
    marginTop: 16,
  },
  redeemHistoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  redeemHistoryCount: {
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(16,185,129,0.1)',
    color: '#10B981',
    fontSize: isWeb ? 11 : 10,
    fontFamily: 'Inter-Bold',
  },
  redeemHistoryTouchable: {
    borderRadius: 16,
    marginBottom: 8,
  },
  redeemHistoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isWeb ? 14 : 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    backgroundColor: 'rgba(255,255,255,0.62)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 1,
    gap: 10,
    overflow: 'hidden',
  },
  redeemHistoryIcon: {
    width: isWeb ? 42 : 38,
    height: isWeb ? 42 : 38,
    borderRadius: isWeb ? 14 : 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16,185,129,0.1)',
  },
  redeemHistoryContent: {
    flex: 1,
    minWidth: 0,
  },
  redeemHistoryName: {
    fontSize: isWeb ? 14 : 13,
    color: '#133B1C',
    fontFamily: 'Inter-Bold',
  },
  redeemHistoryDate: {
    marginTop: 2,
    fontSize: isWeb ? 12 : 11,
    color: '#64748B',
    fontFamily: 'Inter-Medium',
  },
  redeemHistoryPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  redeemHistoryPointsText: {
    fontSize: isWeb ? 12 : 11,
    color: '#EF4444',
    fontFamily: 'Inter-ExtraBold',
  },
  redeemHistoryEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    backgroundColor: 'rgba(255,255,255,0.62)',
  },
  redeemHistoryEmptyText: {
    flex: 1,
    fontSize: isWeb ? 13 : 12,
    color: '#64748B',
    fontFamily: 'Inter-Medium',
  },
  redeemDetailOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  redeemDetailBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.42)',
  },
  redeemDetailModal: {
    width: '100%',
    maxWidth: 460,
    borderRadius: 24,
    padding: isWeb ? 24 : 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    backgroundColor: 'rgba(255,255,255,0.74)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 10,
    overflow: 'hidden',
  },
  redeemDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  redeemDetailIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16,185,129,0.12)',
  },
  redeemDetailHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  redeemDetailEyebrow: {
    fontSize: 11,
    color: '#16A34A',
    fontFamily: 'Inter-ExtraBold',
    marginBottom: 2,
  },
  redeemDetailTitle: {
    fontSize: isWeb ? 23 : 20,
    color: '#133B1C',
    fontFamily: 'Inter-ExtraBold',
  },
  redeemDetailSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter-Medium',
  },
  redeemDetailCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.58)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  redeemDetailPointCard: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    backgroundColor: 'rgba(239,68,68,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.12)',
  },
  redeemDetailPointLabel: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  redeemDetailPointValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  redeemDetailPointValue: {
    fontSize: 28,
    color: '#EF4444',
    fontFamily: 'Inter-ExtraBold',
  },
  redeemDetailRows: {
    gap: 10,
  },
  redeemDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.46)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
  },
  redeemDetailRowLabel: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter-Bold',
  },
  redeemDetailRowValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    color: '#133B1C',
    fontFamily: 'Inter-ExtraBold',
  },
  redeemDetailStatus: {
    color: '#16A34A',
  },

  // Footer Tip
  footerTip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 30,
    padding: isWeb ? 14 : 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    backgroundColor: 'rgba(255,255,255,0.62)',
    gap: 8,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 1.5,
  },
  footerTipText: {
    flex: 1,
    fontSize: isWeb ? 12 : 11,
    color: '#133B1C',
    fontFamily: 'Inter-Medium',
  },
  redeemToast: {
    position: 'absolute',
    left: SCREEN_PADDING,
    right: SCREEN_PADDING,
    bottom: isWeb ? 112 : 118,
    zIndex: 80,
    alignItems: 'center',
  },
  redeemToastBlur: {
    width: '100%',
    maxWidth: 460,
    minHeight: 54,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.86)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 10,
    overflow: 'hidden',
  },
  redeemToastText: {
    flex: 1,
    color: '#133B1C',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Inter-Bold',
  },
  redeemToastTextError: {
    color: '#B91C1C',
  },
});
