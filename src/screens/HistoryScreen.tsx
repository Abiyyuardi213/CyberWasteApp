import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Data Dummy (nanti diganti dengan fetch API dari backend)
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
      return '#10B981'; // hijau
    case 'Anorganik':
      return '#3B82F6'; // biru
    case 'B3':
      return '#EF4444'; // merah
    default:
      return '#6B7280';
  }
};

// Icon berdasarkan kategori
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Organik':
      return 'leaf';
    case 'Anorganik':
      return 'recycle';
    case 'B3':
      return 'skull-outline';
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
      <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '15' }]}>
        <MaterialCommunityIcons name={categoryIcon as any} size={24} color={categoryColor} />
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.wasteType}>{item.wasteType}</Text>
          <Text style={[styles.points, { color: categoryColor }]}>+{item.points} Poin</Text>
        </View>
        
        <View style={styles.cardDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="pricetag-outline" size={14} color="#94A3B8" />
            <Text style={styles.detailText}>{item.category}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color="#94A3B8" />
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
      <MaterialCommunityIcons name="recycle-variant" size={64} color="#CBD5E1" />
    </View>
    <Text style={styles.emptyTitle}>Belum Ada Riwayat</Text>
    <Text style={styles.emptySubtitle}>
      Mulai scan sampah pertamamu sekarang juga!
    </Text>
  </View>
);

export default function HistoryScreen() {
  const [history, setHistory] = useState(DUMMY_HISTORY);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // TODO: Nanti ganti dengan fetch API dari backend
  // const { token } = useAuth();
  // const [loading, setLoading] = useState(true);
  //
  // useEffect(() => {
  //   fetchHistory();
  // }, []);
  //
  // const fetchHistory = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await fetch(`${API_URL}/history`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     const data = await response.json();
  //     if (response.ok) setHistory(data.history);
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Nanti ganti dengan fetch ulang data
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Memuat riwayat...</Text>
      </View>
    );
  }

  return (
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
            colors={['#10B981']}
            tintColor="#10B981"
          />
        }
        ListEmptyComponent={EmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'GeistSans-ExtraBold',
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
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#10B981',
    fontFamily: 'GeistSans-ExtraBold',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontFamily: 'GeistSans-Medium',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  categoryBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    marginBottom: 8,
  },
  wasteType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
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
    color: '#64748B',
    fontFamily: 'GeistSans-Regular',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    fontFamily: 'GeistSans-Bold',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 40,
    fontFamily: 'GeistSans-Regular',
  },
});