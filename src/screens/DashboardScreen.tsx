import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

const organicWaste = [
  { icon: 'food-apple-outline', label: 'Buah' },
  { icon: 'flower-outline', label: 'Bunga' },
  { icon: 'sprout-outline', label: 'Campuran' },
  { icon: 'food-steak', label: 'Daging' },
  { icon: 'leaf', label: 'Daun' },
  { icon: 'silverware-fork-knife', label: 'Makanan' },
];

const inorganicWaste = [
  { icon: 'archive-outline', label: 'Kardus' },
  { icon: 'file-document-outline', label: 'Kertas' },
  { icon: 'bottle-soda-outline', label: 'Plastik' },
  { icon: 'glass-fragile', label: 'Kaca' },
  { icon: 'cog-outline', label: 'Logam' },
];

export default function DashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();

  const isWide = width >= 720;
  const contentWidth = Math.min(width, 760);
  const horizontalPadding = width < 380 ? 10 : 12;
  const gap = 12;
  const wasteColumns = isWide ? 4 : 3;
  const wasteCardWidth =
    (contentWidth - horizontalPadding * 2 - gap * (wasteColumns - 1)) / wasteColumns;

  const goToScan = () => navigation.navigate('Scan');
  const firstName = user?.username ? user.username.split(' ')[0] : 'Pengguna';

  const renderWasteGroup = (
    title: string,
    count: number,
    color: string,
    items: { icon: string; label: string }[]
  ) => (
    <View style={styles.wasteGroup}>
      <View style={styles.sectionTitleRow}>
        <View style={[styles.sectionAccent, { backgroundColor: color }]} />
        <Text style={styles.sectionSubTitle}>{title}</Text>
        <View style={[styles.countBadge, { backgroundColor: `${color}16` }]}>
          <Text style={[styles.countBadgeText, { color }]}>{count} jenis</Text>
        </View>
      </View>

      <View style={[styles.wasteGrid, { gap }]}>
        {items.map((item) => (
          <View key={item.label} style={[styles.wasteCard, { width: wasteCardWidth }]}>
            <View style={[styles.wasteIconWrap, { backgroundColor: `${color}14` }]}>
              <MaterialCommunityIcons name={item.icon as any} size={22} color={color} />
            </View>
            <Text style={styles.wasteLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEFDF3" />
      <LinearGradient
        colors={['#DCFCE7', '#F0FDF4', '#EFF6FF'] as const}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.decorTop} />
      <View style={styles.decorBottom} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: horizontalPadding,
            alignItems: 'center',
          },
        ]}
      >
        <View style={[styles.content, { width: contentWidth - horizontalPadding * 2 }]}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>Selamat datang kembali,</Text>
              <Text numberOfLines={1} adjustsFontSizeToFit style={styles.userName}>
                {firstName}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Profil')}
              style={styles.profileButton}
            >
              <Ionicons name="person-outline" size={21} color="#1F5132" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity activeOpacity={0.9} onPress={goToScan} style={styles.heroPressable}>
            <LinearGradient
              colors={['#103C28', '#1BAA59'] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroText}>
                <View style={styles.pill}>
                  <Ionicons name="sparkles-outline" size={13} color="#E8FFF0" />
                  <Text style={styles.pillText}>Model siap mengenali 11 jenis sampah</Text>
                </View>
                <Text style={styles.heroTitle}>Klasifikasi Sampah dengan AI</Text>
                <Text style={styles.heroSubtitle}>
                  Ambil foto sampah, lalu sistem akan membaca kategori dan akurasinya.
                </Text>
                <View style={styles.heroCta}>
                  <Text style={styles.heroCtaText}>Mulai scan</Text>
                  <View style={styles.heroCtaIcon}>
                    <Ionicons name="arrow-forward" size={16} color="#103C28" />
                  </View>
                </View>
              </View>
              <View style={styles.heroIconOuter}>
                <View style={styles.heroIconInner}>
                  <Ionicons name="camera-outline" size={33} color="#FFFFFF" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="leaf-outline" size={22} color="#2BAE57" />
              </View>
              <Text style={styles.statValue}>6</Text>
              <Text style={styles.statLabel}>Organik</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: '65%', backgroundColor: '#2BAE57' }]} />
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="trash-outline" size={22} color="#1D8CE0" />
              </View>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Anorganik</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: '55%', backgroundColor: '#1D8CE0' }]} />
              </View>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Jenis Sampah yang Didukung</Text>
            <Text style={styles.sectionDescription}>
              Dataset model dikelompokkan agar proses klasifikasi lebih mudah dipahami.
            </Text>
          </View>

          {renderWasteGroup('Organik', organicWaste.length, '#2BAE57', organicWaste)}
          {renderWasteGroup('Anorganik', inorganicWaste.length, '#1D8CE0', inorganicWaste)}

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons name="bulb-outline" size={20} color="#1F5132" />
            </View>
            <View style={styles.infoCopy}>
              <Text style={styles.infoTitle}>Tips scan</Text>
              <Text style={styles.infoText}>
                Letakkan objek di tengah kamera dan pastikan pencahayaan cukup agar hasil prediksi lebih stabil.
              </Text>
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.9} onPress={goToScan} style={styles.primaryButton}>
            <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Klasifikasi Sekarang</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EEFDF3',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorTop: {
    position: 'absolute',
    top: -44,
    right: -54,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(16,185,129,0.09)',
  },
  decorBottom: {
    position: 'absolute',
    bottom: 120,
    left: -58,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(59,130,246,0.06)',
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 142,
  },
  content: {
    maxWidth: 720,
  },
  header: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerCopy: {
    flex: 1,
    paddingRight: 12,
  },
  eyebrow: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64746A',
  },
  userName: {
    marginTop: 2,
    fontFamily: 'Inter-ExtraBold',
    fontSize: 28,
    lineHeight: 34,
    color: '#0F2F1D',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  heroPressable: {
    marginBottom: 16,
  },
  heroCard: {
    minHeight: 208,
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    shadowColor: '#052E16',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 26,
    elevation: 6,
  },
  heroText: {
    flex: 1,
    paddingRight: 10,
    justifyContent: 'space-between',
  },
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: 'rgba(16,185,129,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.32)',
  },
  pillText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: '#E8FFF0',
  },
  heroTitle: {
    marginTop: 16,
    fontFamily: 'Inter-ExtraBold',
    fontSize: 26,
    lineHeight: 31,
    color: '#FFFFFF',
  },
  heroSubtitle: {
    marginTop: 8,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.82)',
  },
  heroCta: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroCtaText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  heroCtaIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  heroIconOuter: {
    width: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIconInner: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.34)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },
  statCard: {
    flex: 1,
    minHeight: 126,
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.68)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
    overflow: 'hidden',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    position: 'absolute',
    top: 22,
    right: 16,
    fontFamily: 'Inter-ExtraBold',
    fontSize: 22,
    color: '#111C15',
  },
  statLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: '#18231C',
    marginBottom: 12,
  },
  progressTrack: {
    height: 5,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(100,116,139,0.14)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: 'Inter-ExtraBold',
    fontSize: 20,
    lineHeight: 25,
    color: '#101A14',
  },
  sectionDescription: {
    marginTop: 6,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    lineHeight: 19,
    color: '#64746A',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionAccent: {
    width: 4,
    height: 16,
    borderRadius: 2,
    marginRight: 8,
  },
  sectionSubTitle: {
    flex: 1,
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#25352B',
  },
  countBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  countBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
  },
  wasteGroup: {
    marginBottom: 18,
  },
  wasteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  wasteCard: {
    minHeight: 104,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  wasteIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  wasteLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#25352B',
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.66)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    marginBottom: 16,
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  infoCopy: {
    flex: 1,
  },
  infoTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#183822',
  },
  infoText: {
    marginTop: 3,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    lineHeight: 18,
    color: '#54665B',
  },
  primaryButton: {
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#16A34A',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 5,
  },
  primaryButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});
