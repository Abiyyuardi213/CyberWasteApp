import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Data Dummy
const DUMMY_HISTORY = [
  {
    id: '1',
    wasteType: 'Botol Plastik',
    category: 'Anorganik',
    points: 10,
    date: '2026-06-02T10:30:00',
  },
  {
    id: '2',
    wasteType: 'Daun Kering',
    category: 'Organik',
    points: 5,
    date: '2026-06-01T14:20:00',
  },
  {
    id: '3',
    wasteType: 'Botol Kaca',
    category: 'Anorganik',
    points: 15,
    date: '2026-05-31T09:15:00',
  },
  {
    id: '4',
    wasteType: 'Baterai Bekas',
    category: 'B3',
    points: 25,
    date: '2026-05-30T16:45:00',
  },
  {
    id: '5',
    wasteType: 'Kardus',
    category: 'Anorganik',
    points: 8,
    date: '2026-05-29T11:00:00',
  },
  {
    id: '6',
    wasteType: 'Sisa Makanan',
    category: 'Organik',
    points: 3,
    date: '2026-05-28T12:30:00',
  },
  {
    id: '7',
    wasteType: 'Kaleng Minuman',
    category: 'Anorganik',
    points: 12,
    date: '2026-05-27T08:45:00',
  },
];

// Warna berdasarkan kategori
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Organik':
      return '#4CAF50';
    case 'Anorganik':
      return '#2196F3';
    case 'B3':
      return '#F44336';
    default:
      return '#757575';
  }
};

// Icon berdasarkan kategori
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Organik':
      return 'leaf-outline';
    case 'Anorganik':
      return 'trash-outline';
    case 'B3':
      return 'warning-outline';
    default:
      return 'trash-outline';
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

// Item Card Component
const HistoryItem = ({ item }: { item: typeof DUMMY_HISTORY[0] }) => {
  const categoryColor = getCategoryColor(item.category);
  const categoryIcon = getCategoryIcon(item.category);

  return (
    <View style={styles.historyCard}>
      <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '10' }]}>
        <Ionicons name={categoryIcon as any} size={24} color={categoryColor} />
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.wasteType}>{item.wasteType}</Text>
          <Text style={[styles.points, { color: categoryColor }]}>+{item.points} Poin</Text>
        </View>
        
        <View style={styles.cardDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="pricetag-outline" size={14} color="#757575" />
            <Text style={styles.detailText}>{item.category}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color="#757575" />
            <Text style={styles.detailText}>{formatDate(item.date)}</Text>
          </View>
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
    </View>
  );
};

// Empty State Component
const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconContainer}>
      <Ionicons name="trash-outline" size={54} color="#CBD5E1" />
    </View>
    <Text style={styles.emptyTitle}>Belum Ada Riwayat</Text>
    <Text style={styles.emptySubtitle}>
      Mulai scan sampah pertamamu sekarang juga!
    </Text>
  </View>
);

export default function HistoryScreen() {
  const [history] = useState(DUMMY_HISTORY);
  const [loading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1E4E2C" />
        <Text style={styles.loadingText}>Memuat riwayat...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4FAF6" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Riwayat Scan</Text>
          <Text style={styles.headerSubtitle}>
            {history.length} item terdeteksi
          </Text>
        </View>

        {/* Statistik Ringkas */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {history.reduce((sum, item) => sum + item.points, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Poin</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{history.length}</Text>
            <Text style={styles.statLabel}>Total Scan</Text>
          </View>
        </View>

        {/* List History */}
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HistoryItem item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1E4E2C']}
              tintColor="#1E4E2C"
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
    backgroundColor: '#F4FAF6',
  },
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4FAF6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'GeistSans-Medium',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#133B1C',
    fontFamily: 'GeistSans-Bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontFamily: 'GeistSans-Regular',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EAF2EC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1.5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E4E2C',
    fontFamily: 'GeistSans-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontFamily: 'GeistSans-Medium',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#EAF2EC',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 110,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EAF2EC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  categoryBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  wasteType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'GeistSans-Bold',
  },
  points: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'GeistSans-Bold',
  },
  cardDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#757575',
    fontFamily: 'GeistSans-Regular',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  emptyIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 8,
    fontFamily: 'GeistSans-Bold',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    paddingHorizontal: 40,
    fontFamily: 'GeistSans-Regular',
  },
});