import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const stats = {
    totalScan: 24,
    ecoPoints: 150,
    treesSaved: 2,
  };

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Edit Profil',
      subtitle: 'Ubah data diri Anda',
      onPress: () => Alert.alert('Coming Soon', 'Fitur edit profil akan segera hadir'),
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Ubah Password',
      subtitle: 'Keamanan akun Anda',
      onPress: () => Alert.alert('Coming Soon', 'Fitur ubah password akan segera hadir'),
    },
    {
      icon: 'notifications-outline',
      title: 'Notifikasi',
      subtitle: 'Atur notifikasi Anda',
      onPress: () => Alert.alert('Coming Soon', 'Fitur notifikasi akan segera hadir'),
    },
    {
      icon: 'language-outline',
      title: 'Bahasa',
      subtitle: 'Indonesia',
      onPress: () => Alert.alert('Coming Soon', 'Fitur bahasa akan segera hadir'),
    },
    {
      icon: 'help-circle-outline',
      title: 'Bantuan',
      subtitle: 'Pusat bantuan & FAQ',
      onPress: () => Alert.alert('Coming Soon', 'Fitur bantuan akan segera hadir'),
    },
    {
      icon: 'information-circle-outline',
      title: 'Tentang Aplikasi',
      subtitle: 'Versi 1.0.0',
      onPress: () => Alert.alert('Tentang Echo Tech', 'Aplikasi klasifikasi sampah berbasis AI untuk lingkungan yang lebih baik.'),
    },
  ];

const handleLogout = () => {
  console.log('Tombol ditekan, langsung logout');
  logout();
};

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.username ? user.username[0].toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.onlineBadge} />
        </View>
        <Text style={styles.username}>{user?.username || 'Pengguna'}</Text>
        <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="scan-helper" size={28} color="#10B981" />
          <Text style={styles.statNumber}>{stats.totalScan}</Text>
          <Text style={styles.statLabel}>Total Scan</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="leaf" size={28} color="#10B981" />
          <Text style={styles.statNumber}>{stats.ecoPoints}</Text>
          <Text style={styles.statLabel}>Eco Poin</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="tree" size={28} color="#10B981" />
          <Text style={styles.statNumber}>{stats.treesSaved}</Text>
          <Text style={styles.statLabel}>Pohon Terselamatkan</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>Pengaturan Akun</Text>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress} activeOpacity={0.7}>
            <View style={styles.menuIcon}>
              <Ionicons name={item.icon as any} size={24} color="#10B981" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuItemTitle}>{item.title}</Text>
              <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#EF4444" />
        <Text style={styles.logoutText}>Keluar Akun</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>Echo Tech v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
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
    borderColor: '#FFFFFF',
  },
  username: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#64748B',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 20,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuIcon: {
    width: 40,
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: 8,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 30,
  },
});