import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  ProgressBarAndroid,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchEcoPointData, finishRedeem, Reward, startRedeem } from '../store/ecoPointSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

// Level badge color
const getLevelColor = (level: string) => {
  switch (level) {
    case 'Bronze':
      return '#CD7F32';
    case 'Silver':
      return '#C0C0C0';
    case 'Gold':
      return '#FFD700';
    case 'Platinum':
      return '#E5E4E2';
    default:
      return '#10B981';
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

// Progress bar component (karena ProgressBarAndroid hanya untuk Android)
const CustomProgressBar = ({ progress, color }: { progress: number; color: string }) => {
  if (Platform.OS === 'android') {
    return (
      <ProgressBarAndroid
        styleAttr="Horizontal"
        indeterminate={false}
        progress={progress}
        color={color}
      />
    );
  }
  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
    </View>
  );
};

// Reward Card Component
const RewardCard = ({
  reward,
  isRedeeming,
  onPress,
}: {
  reward: Reward;
  isRedeeming: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.rewardCard, !reward.available && styles.rewardCardDisabled]}
    onPress={onPress}
    disabled={!reward.available || isRedeeming}
    activeOpacity={0.7}
  >
    <View style={[styles.rewardIconContainer, reward.available ? styles.rewardIconActive : styles.rewardIconDisabled]}>
      <Ionicons name={reward.icon as any} size={28} color={reward.available ? '#10B981' : '#94A3B8'} />
    </View>
    <View style={styles.rewardContent}>
      <Text style={[styles.rewardName, !reward.available && styles.rewardNameDisabled]}>{reward.name}</Text>
      <Text style={[styles.rewardDescription, !reward.available && styles.rewardDescriptionDisabled]}>{reward.description}</Text>
    </View>
    {isRedeeming ? (
      <ActivityIndicator color="#10B981" />
    ) : (
      <View style={styles.rewardPointsContainer}>
        <Text style={[styles.rewardPoints, !reward.available && styles.rewardPointsDisabled]}>{reward.points}</Text>
        <MaterialCommunityIcons name="leaf" size={14} color={reward.available ? '#10B981' : '#94A3B8'} />
      </View>
    )}
  </TouchableOpacity>
);

export default function EcoPointScreen() {
  const dispatch = useAppDispatch();
  const { userPoints, rewards, redeemingId, loading, error } = useAppSelector((state) => state.ecoPoint);

  useEffect(() => {
    dispatch(fetchEcoPointData());
  }, [dispatch]);

  const progress = userPoints.totalPoints / userPoints.nextLevelPoints;
  const levelColor = getLevelColor(userPoints.level);
  const levelIcon = getLevelIcon(userPoints.level);

  const handleRedeem = (rewardId: number, points: number) => {
    if (userPoints.totalPoints >= points) {
      dispatch(startRedeem(rewardId));
      setTimeout(() => {
        dispatch(finishRedeem(points));
        alert('Selamat! Reward berhasil ditukarkan.');
      }, 1000);
    } else {
      alert(`Poin tidak cukup. Butuh ${points - userPoints.totalPoints} poin lagi.`);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {loading && (
        <View style={styles.asyncStatus}>
          <ActivityIndicator color="#10B981" />
          <Text style={styles.asyncStatusText}>Memuat data Eco Poin...</Text>
        </View>
      )}

      {error && (
        <View style={[styles.asyncStatus, styles.asyncError]}>
          <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
          <Text style={[styles.asyncStatusText, styles.asyncErrorText]}>{error}</Text>
        </View>
      )}

      {/* Header dengan poin utama */}
      <View style={styles.pointsCard}>
        <View style={styles.pointsHeader}>
          <MaterialCommunityIcons name="leaf-circle" size={32} color="#FFFFFF" />
          <Text style={styles.pointsTitle}>Eco Poin Saya</Text>
        </View>
        <Text style={styles.pointsValue}>{userPoints.totalPoints}</Text>
        <Text style={styles.pointsSubtitle}>Total poin yang terkumpul</Text>

        {/* Level Progress */}
        <View style={styles.levelContainer}>
          <View style={styles.levelBadge}>
            <MaterialCommunityIcons name={levelIcon as any} size={18} color={levelColor} />
            <Text style={[styles.levelText, { color: levelColor }]}>{userPoints.level}</Text>
          </View>
          <View style={styles.progressWrapper}>
            <CustomProgressBar progress={Math.min(progress, 1)} color={levelColor} />
            <Text style={styles.progressText}>
              {userPoints.totalPoints} / {userPoints.nextLevelPoints} poin menuju {userPoints.nextLevelName}
            </Text>
          </View>
        </View>
      </View>

      {/* Statistik Dampak */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Dampak Lingkungan</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="cloud-outline" size={28} color="#06B6D4" />
            <Text style={styles.statValue}>{userPoints.co2Saved} kg</Text>
            <Text style={styles.statLabel}>CO₂ Terselamatkan</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="recycle" size={28} color="#10B981" />
            <Text style={styles.statValue}>{userPoints.itemsRecycled}</Text>
            <Text style={styles.statLabel}>Item Didaur Ulang</Text>
          </View>
        </View>
      </View>

      {/* Cara Mendapatkan Poin */}
      <View style={styles.tipsContainer}>
        <Text style={styles.sectionTitle}>Cara Mendapatkan Poin</Text>
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <View style={styles.tipIcon}>
              <Ionicons name="scan-outline" size={20} color="#10B981" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Scan Sampah</Text>
              <Text style={styles.tipDesc}>Scan sampah organik +5 poin, anorganik +10 poin, B3 +25 poin</Text>
            </View>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipIcon}>
              <Ionicons name="share-social-outline" size={20} color="#10B981" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Bagikan ke Teman</Text>
              <Text style={styles.tipDesc}>Ajak teman bergabung dapat +50 poin</Text>
            </View>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipIcon}>
              <Ionicons name="calendar-outline" size={20} color="#10B981" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Challenge Harian</Text>
              <Text style={styles.tipDesc}>Selesaikan misi harian dapat +20 poin</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tukar Poin */}
      <View style={styles.rewardsContainer}>
        <Text style={styles.sectionTitle}>Tukar Poin</Text>
        <Text style={styles.rewardsSubtitle}>
          Tukarkan poinmu dengan reward menarik!
        </Text>
        {rewards.map((reward) => (
          <RewardCard
            key={reward.id}
            reward={reward}
            isRedeeming={redeemingId === reward.id}
            onPress={() => handleRedeem(reward.id, reward.points)}
          />
        ))}
      </View>

      {/* Tips Tambahan */}
      <View style={styles.footerTip}>
        <Ionicons name="bulb-outline" size={20} color="#F59E0B" />
        <Text style={styles.footerTipText}>
          Scan lebih banyak sampah untuk mengumpulkan poin dan naik level!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  asyncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 10,
  },
  asyncStatusText: {
    flex: 1,
    color: '#047857',
    fontSize: 13,
    fontFamily: 'GeistSans-Medium',
  },
  asyncError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  asyncErrorText: {
    color: '#B91C1C',
  },
  pointsCard: {
    backgroundColor: '#10B981',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pointsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    fontFamily: 'GeistSans-SemiBold',
  },
  pointsValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'GeistSans-ExtraBold',
  },
  pointsSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 20,
    fontFamily: 'GeistSans-Regular',
  },
  levelContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 12,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
    fontFamily: 'GeistSans-Bold',
  },
  progressWrapper: {
    gap: 6,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'GeistSans-Regular',
  },
  statsContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
    fontFamily: 'GeistSans-Bold',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
    marginBottom: 4,
    fontFamily: 'GeistSans-ExtraBold',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'GeistSans-Medium',
  },
  tipsContainer: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  tipsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tipItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
    fontFamily: 'GeistSans-SemiBold',
  },
  tipDesc: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'GeistSans-Regular',
  },
  rewardsContainer: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  rewardsSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
    fontFamily: 'GeistSans-Regular',
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rewardCardDisabled: {
    opacity: 0.6,
  },
  rewardIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  rewardIconActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  rewardIconDisabled: {
    backgroundColor: '#F1F5F9',
  },
  rewardContent: {
    flex: 1,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    fontFamily: 'GeistSans-SemiBold',
  },
  rewardNameDisabled: {
    color: '#94A3B8',
  },
  rewardDescription: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontFamily: 'GeistSans-Regular',
  },
  rewardDescriptionDisabled: {
    color: '#CBD5E1',
  },
  rewardPointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rewardPoints: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
    fontFamily: 'GeistSans-Bold',
  },
  rewardPointsDisabled: {
    color: '#94A3B8',
  },
  footerTip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 40,
    padding: 14,
    borderRadius: 16,
    gap: 10,
  },
  footerTipText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    fontFamily: 'GeistSans-Regular',
  },
});
