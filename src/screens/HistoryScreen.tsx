import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { API_URL } from '../../config';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

// ============ CROSS-PLATFORM RESPONSIVE CONFIG ============
const isWeb = Platform.OS === 'web';
const isIOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';

// ============ UKURAN BERBEDA PER PLATFORM ============
// Web: card BESAR/PANJANG dengan font SEDANG
// HP: card KECIL/PENDEK dengan font KECIL

// Web: padding dan gap lebih besar
const GRID_PADDING = isWeb ? 40 : 16;
const GRID_GAP = isWeb ? 28 : 12;

// Hitung lebar card
const getCardWidth = () => {
  if (isWeb) {
    // Web: 2 kolom dengan lebar BESAR
    const calculated = (width - GRID_PADDING * 2 - GRID_GAP) / 2;
    return Math.max(calculated, 340);
  } else {
    // HP: 2 kolom dengan lebar kecil
    return (width - GRID_PADDING * 2 - GRID_GAP) / 2;
  }
};

const CARD_WIDTH = getCardWidth();

// TINGGI CARD - Web TINGGI/BESAR, HP PENDEK/KECIL
const CARD_HEIGHT = isWeb ? 260 : 175;

interface ScanHistoryItem {
  id: string;
  wasteType: string;
  category: string;
  confidence: number;
  points: number;
  date: string;
}

// Warna berdasarkan JENIS sampah spesifik
const TYPE_COLOR_MAP: Record<string, string> = {
  kardus: '#D97706',
  karton: '#D97706',
  kertas: '#F59E0B',
  kaca: '#06B6D4',
  'botol kaca': '#06B6D4',
  'botol plastik': '#8B5CF6',
  plastik: '#8B5CF6',
  'kantong plastik': '#8B5CF6',
  logam: '#64748B',
  kaleng: '#94A3B8',
  organik: '#4CAF50',
  'sisa makanan': '#4CAF50',
  daun: '#22C55E',
  elektronik: '#EF4444',
  b3: '#EF4444',
};

const TYPE_COLOR_PALETTE = ['#8B5CF6', '#06B6D4', '#F59E0B', '#EC4899', '#10B981', '#F97316', '#D97706', '#3B82F6'];

const getWasteTypeColor = (wasteType: string) => {
  const key = wasteType.trim().toLowerCase();
  if (TYPE_COLOR_MAP[key]) return TYPE_COLOR_MAP[key];
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return TYPE_COLOR_PALETTE[hash % TYPE_COLOR_PALETTE.length];
};

// Icon berdasarkan kategori
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Organik':
      return 'leaf';
    case 'Anorganik':
      return 'trash-can';
    case 'B3':
      return 'alert';
    default:
      return 'recycle';
  }
};

// Format tanggal
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hari ini';
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari lalu`;

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

// ============ GRID CARD ============
const HistoryGridItem = ({ item }: { item: ScanHistoryItem }) => {
  const accentColor = getWasteTypeColor(item.wasteType);
  const categoryIcon = getCategoryIcon(item.category);
  const confidencePct = Math.round(item.confidence * 100);

  // ===== UKURAN WEB = BESAR, HP = KECIL =====
  const isWebSize = isWeb;
  
  // Web: ukuran SEDANG (tidak terlalu besar), HP: ukuran KECIL
  const iconSize = isWebSize ? 26 : 22;
  const iconCircleSize = isWebSize ? 54 : 42;
  const fontSizeTitle = isWebSize ? 18 : 15;
  const fontSizePoints = isWebSize ? 15 : 12;
  const fontSizeCategory = isWebSize ? 13 : 10;
  const fontSizeConfidence = isWebSize ? 13 : 10;
  const fontSizeFooter = isWebSize ? 13 : 11;
  const paddingCard = isWebSize ? 22 : 14;
  const barHeight = isWebSize ? 6 : 5;
  const gapSize = isWebSize ? 8 : 6;

  return (
    <BlurView 
      intensity={isWebSize ? 20 : 30} 
      tint="light" 
      style={[
        styles.gridCard, 
        { 
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          padding: paddingCard,
          borderRadius: isWebSize ? 22 : 18,
        }
      ]}
    >
      <View style={[styles.gridCardTop, { marginBottom: gapSize }]}>
        <View style={[styles.gridIconCircle, { 
          backgroundColor: accentColor + '18',
          width: iconCircleSize,
          height: iconCircleSize,
          borderRadius: isWebSize ? 18 : 16,
        }]}>
          <MaterialCommunityIcons name={categoryIcon as any} size={iconSize} color={accentColor} />
        </View>
        <View style={[styles.gridPointsBadge, { 
          backgroundColor: accentColor + '14', 
          paddingHorizontal: isWebSize ? 12 : 9, 
          paddingVertical: isWebSize ? 5 : 4, 
          borderRadius: isWebSize ? 12 : 10 
        }]}>
          <Text style={[styles.gridPointsText, { color: accentColor, fontSize: fontSizePoints }]}>+{item.points}</Text>
        </View>
      </View>

      <Text style={[styles.gridWasteType, { fontSize: fontSizeTitle, marginBottom: gapSize }]} numberOfLines={1}>
        {item.wasteType}
      </Text>

      <View style={[styles.gridCategoryTag, { 
        backgroundColor: accentColor + '10', 
        paddingHorizontal: isWebSize ? 10 : 8, 
        paddingVertical: isWebSize ? 4 : 3, 
        borderRadius: isWebSize ? 10 : 8, 
        gap: isWebSize ? 6 : 5, 
        marginBottom: gapSize 
      }]}>
        <View style={[styles.gridCategoryDot, { 
          backgroundColor: accentColor, 
          width: isWebSize ? 6 : 5, 
          height: isWebSize ? 6 : 5, 
          borderRadius: isWebSize ? 3 : 2.5 
        }]} />
        <Text style={[styles.gridCategoryText, { color: accentColor, fontSize: fontSizeCategory }]}>{item.category}</Text>
      </View>

      <View style={[styles.gridConfidenceRow, { gap: isWebSize ? 8 : 6, marginBottom: gapSize }]}>
        <View style={[styles.gridConfidenceBarBg, { height: barHeight, borderRadius: isWebSize ? 4 : 3 }]}>
          <View
            style={[
              styles.gridConfidenceBarFill,
              { width: `${confidencePct}%`, backgroundColor: accentColor, borderRadius: isWebSize ? 4 : 3 },
            ]}
          />
        </View>
        <Text style={[styles.gridConfidenceText, { fontSize: fontSizeConfidence, minWidth: isWebSize ? 34 : 28 }]}>{confidencePct}%</Text>
      </View>

      <View style={[styles.gridFooter, { paddingTop: isWebSize ? 8 : 6, gap: isWebSize ? 5 : 4 }]}>
        <Ionicons name="time-outline" size={isWebSize ? 14 : 11} color="#94A3B8" />
        <Text style={[styles.gridFooterText, { fontSize: fontSizeFooter }]}>{formatDate(item.date)}</Text>
      </View>
    </BlurView>
  );
};

// Empty State Component
const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <BlurView intensity={isWeb ? 20 : 30} tint="light" style={styles.emptyBlur}>
      <View style={styles.emptyIconContainer}>
        <MaterialCommunityIcons name="scan-helper" size={isWeb ? 70 : 54} color="#10B981" />
      </View>
      <Text style={styles.emptyTitle}>Belum Ada Riwayat</Text>
      <Text style={styles.emptySubtitle}>
        Mulai scan sampah pertamamu sekarang juga!
      </Text>
    </BlurView>
  </View>
);

// ============ DEKORASI KONFIGURASI ============
type DecorConfig = {
  icon: any;
  size: number;
  color: string;
  top?: number | string;
  bottom?: number | string;
  left?: number | string;
  right?: number | string;
  duration: number;
  delay: number;
  range: number;
  spin?: boolean;
};

const DECOR_CONFIGS: DecorConfig[] = [
  { icon: 'leaf', size: 30, color: 'rgba(34,197,94,0.13)', top: '1%', left: '2%', duration: 3200, delay: 0, range: -18, spin: true },
  { icon: 'recycle', size: 26, color: 'rgba(59,130,246,0.12)', top: '3%', right: '3%', duration: 3600, delay: 400, range: 20 },
  { icon: 'bottle-soda-classic-outline', size: 24, color: 'rgba(139,92,246,0.13)', top: '17%', left: '1%', duration: 3000, delay: 800, range: -16 },
  { icon: 'trash-can-outline', size: 24, color: 'rgba(100,116,139,0.13)', top: '32%', right: '2%', duration: 3400, delay: 300, range: 18 },
  { icon: 'leaf-maple', size: 22, color: 'rgba(34,197,94,0.11)', top: '46%', left: '2%', duration: 3300, delay: 700, range: -16, spin: true },
  { icon: 'water-outline', size: 20, color: 'rgba(6,182,212,0.13)', top: '58%', right: '1%', duration: 3000, delay: 200, range: 16 },
  { icon: 'sprout', size: 26, color: 'rgba(34,197,94,0.11)', bottom: '38%', left: '3%', duration: 3400, delay: 900, range: 18, spin: true },
  { icon: 'newspaper-variant-outline', size: 22, color: 'rgba(217,119,6,0.13)', bottom: '30%', right: '3%', duration: 3100, delay: 500, range: -14 },
  { icon: 'bottle-wine-outline', size: 20, color: 'rgba(6,182,212,0.11)', bottom: '22%', left: '1%', duration: 3200, delay: 1100, range: 14 },
  { icon: 'star-four-points-outline', size: 18, color: 'rgba(16,185,129,0.16)', bottom: '15%', right: '5%', duration: 2600, delay: 1000, range: -14 },
  { icon: 'earth', size: 24, color: 'rgba(34,197,94,0.11)', bottom: '6%', left: '5%', duration: 3800, delay: 600, range: 16 },
  { icon: 'recycle-variant', size: 22, color: 'rgba(59,130,246,0.12)', bottom: '2%', right: '10%', duration: 3500, delay: 300, range: 18, spin: true },
];

export default function HistoryScreen() {
  const { token } = useAuth();
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animasi entrance
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Animasi dekorasi mengambang
  const decorAnims = useRef(
    Array.from({ length: DECOR_CONFIGS.length }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 22000, useNativeDriver: true })
    ).start();

    decorAnims.forEach((anim, index) => {
      const { duration, delay } = DECOR_CONFIGS[index];
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true, delay }),
          Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const fetchHistory = useCallback(async (showInitialLoading = false) => {
    if (!token) {
      setHistory([]);
      setError('Silakan login untuk melihat riwayat scan.');
      setLoading(false);
      return;
    }

    try {
      if (showInitialLoading) {
        setLoading(true);
      }
      setError(null);

      const response = await fetch(`${API_URL}/scan-history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const responseText = await response.text();
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') && responseText
        ? JSON.parse(responseText)
        : null;

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.error ||
          'Endpoint riwayat belum aktif. Restart backend, lalu buka ulang halaman History.'
        );
      }

      setHistory(data.history || []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Gagal memuat riwayat scan');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchHistory(true);
    }, [fetchHistory])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory(false);
    setRefreshing(false);
  };

  const totalPoints = history.reduce((sum, item) => sum + item.points, 0);

  // Komponen dekorasi mengambang
  const FloatingDecor = () => (
    <>
      {DECOR_CONFIGS.map((cfg, index) => {
        const translateY = decorAnims[index].interpolate({
          inputRange: [0, 1],
          outputRange: [0, cfg.range],
        });
        
        const decorStyle: any = {
          position: 'absolute',
          zIndex: 0,
          transform: [
            { translateY },
            { rotate: cfg.spin ? rotateInterpolate : '0deg' },
          ],
        };
        
        if (cfg.top !== undefined) decorStyle.top = cfg.top;
        if (cfg.bottom !== undefined) decorStyle.bottom = cfg.bottom;
        if (cfg.left !== undefined) decorStyle.left = cfg.left;
        if (cfg.right !== undefined) decorStyle.right = cfg.right;
        
        return (
          <Animated.View
            key={index}
            style={decorStyle}
            pointerEvents="none"
          >
            <MaterialCommunityIcons name={cfg.icon} size={cfg.size} color={cfg.color} />
          </Animated.View>
        );
      })}
    </>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={['#dcfce7', '#f0fdf4', '#eff6ff'] as const}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <FloatingDecor />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Memuat riwayat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#eefdf3" />

      <LinearGradient
        colors={['#dcfce7', '#f0fdf4', '#eff6ff'] as const}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Blob dekoratif blur berwarna */}
      <View style={styles.blobTopLeft} pointerEvents="none" />
      <View style={styles.blobTopRight} pointerEvents="none" />
      <View style={styles.blobMidLeft} pointerEvents="none" />
      <View style={styles.blobMidRight} pointerEvents="none" />
      <View style={styles.blobBottomLeft} pointerEvents="none" />
      <View style={styles.blobBottomRight} pointerEvents="none" />

      {/* Dekorasi mengambang */}
      <FloatingDecor />

      <View style={styles.container}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Header */}
          <BlurView intensity={isWeb ? 30 : 40} tint="light" style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>📋 Riwayat Scan</Text>
              <Text style={styles.headerSubtitle}>
                {history.length} item terdeteksi
              </Text>
            </View>
            <Animated.View
              style={[styles.headerIcon, { transform: [{ rotate: rotateInterpolate }] }]}
            >
              <MaterialCommunityIcons name="recycle" size={isWeb ? 28 : 26} color="#10B981" />
            </Animated.View>
          </BlurView>

          {error && (
            <BlurView intensity={isWeb ? 20 : 30} tint="light" style={styles.errorCard}>
              <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </BlurView>
          )}

          {/* Statistik Ringkas */}
          <BlurView intensity={isWeb ? 25 : 35} tint="light" style={styles.statsContainer}>
            <View style={styles.statItem}>
              <LinearGradient
                colors={['#22c55e', '#16a34a'] as const}
                style={[styles.statIconGradient, { 
                  width: isWeb ? 48 : 36,
                  height: isWeb ? 48 : 36,
                  borderRadius: isWeb ? 16 : 12,
                }]}
              >
                <Ionicons name="trophy-outline" size={isWeb ? 24 : 20} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.statNumber, { fontSize: isWeb ? 24 : 20 }]}>{totalPoints}</Text>
              <Text style={[styles.statLabel, { fontSize: isWeb ? 14 : 11 }]}>Total Poin</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <LinearGradient
                colors={['#3B82F6', '#2563EB'] as const}
                style={[styles.statIconGradient, { 
                  width: isWeb ? 48 : 36,
                  height: isWeb ? 48 : 36,
                  borderRadius: isWeb ? 16 : 12,
                }]}
              >
                <Ionicons name="scan-outline" size={isWeb ? 24 : 20} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.statNumber, { fontSize: isWeb ? 24 : 20 }]}>{history.length}</Text>
              <Text style={[styles.statLabel, { fontSize: isWeb ? 14 : 11 }]}>Total Scan</Text>
            </View>
          </BlurView>
        </Animated.View>

        {/* List History - Grid 2 kolom untuk semua platform */}
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HistoryGridItem item={item} />}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={true}
          horizontal={false}
          scrollEnabled={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#10B981']}
              tintColor="#10B981"
            />
          }
          ListEmptyComponent={EmptyState}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eefdf3',
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
    overflow: 'hidden',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },

  // Dekorasi Blob
  blobTopLeft: {
    position: 'absolute',
    top: -50,
    left: -60,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(217,119,6,0.07)',
  },
  blobTopRight: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(16,185,129,0.07)',
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: -50,
    left: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(59,130,246,0.06)',
  },
  blobBottomRight: {
    position: 'absolute',
    bottom: -70,
    right: -50,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(139,92,246,0.06)',
  },
  blobMidLeft: {
    position: 'absolute',
    top: '42%',
    left: -55,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(34,197,94,0.06)',
  },
  blobMidRight: {
    position: 'absolute',
    top: '55%',
    right: -55,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(6,182,212,0.06)',
  },

  // Header
  header: {
    marginHorizontal: isWeb ? 40 : 16,
    marginTop: isWeb ? 24 : 16,
    marginBottom: 12,
    padding: isWeb ? 24 : 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    position: 'relative',
  },
  headerContent: {
    width: '100%',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: isWeb ? 30 : 24,
    fontWeight: '800',
    color: '#133B1C',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: isWeb ? 16 : 13,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  headerIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -28,
    width: isWeb ? 56 : 48,
    height: isWeb ? 56 : 48,
    borderRadius: 16,
    backgroundColor: 'rgba(16,185,129,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Error Card
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: isWeb ? 40 : 16,
    marginTop: 4,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(254, 242, 242, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(254, 202, 202, 0.5)',
    gap: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#B91C1C',
    lineHeight: 18,
    fontWeight: '500',
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: isWeb ? 40 : 16,
    marginBottom: 16,
    paddingVertical: isWeb ? 24 : 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statNumber: {
    fontWeight: '800',
    color: '#133B1C',
  },
  statLabel: {
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },

  // List / Grid - 2 kolom untuk semua platform
  listContent: {
    paddingHorizontal: isWeb ? 40 : GRID_PADDING,
    paddingTop: 4,
    paddingBottom: isWeb ? 160 : 110,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: GRID_GAP,
    flexWrap: 'wrap',
  },

  // Grid Card
  gridCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
    height: CARD_HEIGHT,
    justifyContent: 'space-between',
  },
  gridCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridIconCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridPointsBadge: {
    borderRadius: 10,
  },
  gridPointsText: {
    fontWeight: '800',
  },
  gridWasteType: {
    fontWeight: '800',
    color: '#133B1C',
    textTransform: 'capitalize',
  },
  gridCategoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  gridCategoryDot: {
    borderRadius: 2.5,
  },
  gridCategoryText: {
    fontWeight: '700',
  },
  gridConfidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridConfidenceBarBg: {
    flex: 1,
    backgroundColor: 'rgba(100,116,139,0.15)',
    overflow: 'hidden',
  },
  gridConfidenceBarFill: {
    height: '100%',
  },
  gridConfidenceText: {
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'right',
  },
  gridFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    marginTop: 'auto',
  },
  gridFooterText: {
    color: '#94A3B8',
    fontWeight: '500',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: isWeb ? 100 : 60,
    paddingBottom: 40,
    width: '100%',
  },
  emptyBlur: {
    padding: isWeb ? 48 : 30,
    borderRadius: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    width: isWeb ? '70%' : '100%',
    maxWidth: isWeb ? 600 : undefined,
  },
  emptyIconContainer: {
    width: isWeb ? 100 : 80,
    height: isWeb ? 100 : 80,
    borderRadius: isWeb ? 50 : 40,
    backgroundColor: 'rgba(16,185,129,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: isWeb ? 24 : 18,
    fontWeight: '700',
    color: '#133B1C',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: isWeb ? 16 : 13,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});