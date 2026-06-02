import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function DashboardScreen() {
  const { user } = useAuth();

  return (
    <ScrollView contentContainerStyle={styles.welcomeContainer}>
      {/* Header Dashboard */}
      <View style={styles.welcomeHeader}>
        <View style={styles.welcomeAvatarContainer}>
          <View style={styles.welcomeAvatar}>
            <Text style={styles.avatarLetter}>
              {user?.username ? user.username[0].toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.onlineBadge} />
        </View>
        <Text style={styles.welcomeGreeting}>Halo, {user?.username || 'Pengguna'}!</Text>
        <Text style={styles.welcomeSub}>Selamat datang di Dashboard Echo Tech</Text>
      </View>

      {/* Dashboard Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="recycle" size={28} color="#10B981" />
          <Text style={styles.statNumber}>0 kg</Text>
          <Text style={styles.statLabel}>Sampah Dideteksi</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="medal-outline" size={28} color="#06B6D4" />
          <Text style={styles.statNumber}>150</Text>
          <Text style={styles.statLabel}>Eco Poin</Text>
        </View>
      </View>

      <View style={styles.statCardFull}>
        <View style={styles.co2Header}>
          <MaterialCommunityIcons name="cloud-outline" size={24} color="#06B6D4" />
          <Text style={styles.co2Title}>Dampak Lingkungan Anda</Text>
        </View>
        <Text style={styles.statNumberLarge}>4.8 kg CO₂</Text>
        <Text style={styles.statLabel}>Total karbon emisi yang berhasil dicegah dari daur ulang</Text>
      </View>

      {/* Next Feature Section (Waste Detection) */}
      <View style={styles.featurePreviewCard}>
        <View style={styles.featureBadge}>
          <Text style={styles.featureBadgeText}>SEGERA HADIR</Text>
        </View>
        <View style={styles.featureHeader}>
          <Ionicons name="scan-circle" size={36} color="#10B981" />
          <Text style={styles.featureTitle}>Klasifikasi Sampah AI</Text>
        </View>
        <Text style={styles.featureDesc}>
          Gunakan kamera ponsel Anda untuk memindai sampah. Model Machine Learning Echo Tech akan otomatis mendeteksi jenis sampah (Organik, Anorganik, atau B3) menggunakan dataset Kaggle.
        </Text>
        <TouchableOpacity style={styles.disabledFeatureButton} disabled>
          <Text style={styles.disabledButtonText}>Aktifkan Kamera Deteksi</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  welcomeContainer: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40,
  },
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeAvatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  welcomeAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F9FAFB',
  },
  avatarLetter: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '800',
    fontFamily: 'GeistSans-Bold',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#F9FAFB',
  },
  welcomeGreeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    fontFamily: 'GeistSans-Bold',
  },
  welcomeSub: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    fontFamily: 'GeistSans-Medium',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 0.48,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  statCardFull: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  co2Header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  co2Title: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'GeistSans-SemiBold',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 10,
    marginBottom: 4,
    fontFamily: 'GeistSans-ExtraBold',
  },
  statNumberLarge: {
    fontSize: 32,
    fontWeight: '900',
    color: '#06B6D4',
    marginBottom: 4,
    fontFamily: 'GeistSans-ExtraBold',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'GeistSans-Medium',
  },
  featurePreviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    position: 'relative',
    marginBottom: 30,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  featureBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#06B6D4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  featureBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    fontFamily: 'GeistSans-ExtraBold',
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 10,
    fontFamily: 'GeistSans-Bold',
  },
  featureDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 16,
    fontFamily: 'GeistSans-Regular',
  },
  disabledFeatureButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
  },
  disabledButtonText: {
    color: 'rgba(16, 185, 129, 0.6)',
    fontWeight: '700',
    fontSize: 14,
    fontFamily: 'GeistSans-Bold',
  },
});