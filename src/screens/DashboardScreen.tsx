import React, { useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  StatusBar,
  Animated,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';

const WASTE_TYPES: Record<'organik' | 'anorganik', { emoji: string; label: string }[]> = {
  organik: [
    { emoji: '🍎', label: 'Buah' },
    { emoji: '🌸', label: 'Bunga' },
    { emoji: '🌿', label: 'Campuran' },
    { emoji: '🥩', label: 'Daging' },
    { emoji: '🍃', label: 'Daun' },
    { emoji: '🍴', label: 'Makanan' },
  ],
  anorganik: [
    { emoji: '📦', label: 'Kardus' },
    { emoji: '📄', label: 'Kertas' },
    { emoji: '🍼', label: 'Plastik' },
    { emoji: '🥛', label: 'Kaca' },
    { emoji: '🔋', label: 'Logam' },
  ],
};

function getResponsiveConfig(windowWidth: number) {
  const isTablet = windowWidth >= 600 && windowWidth < 900;
  const isDesktop = windowWidth >= 900;

  const maxContentWidth = isDesktop ? 900 : isTablet ? 700 : windowWidth;
  const contentWidth = Math.min(windowWidth, maxContentWidth);

  const horizontalPadding = 20;
  const gridGap = 10;

  const wasteColumns = isDesktop ? 5 : isTablet ? 4 : 3;
  const wasteBoxWidth =
    (contentWidth - horizontalPadding * 2 - gridGap * (wasteColumns - 1)) / wasteColumns;

  const fontScale = isDesktop ? 1.08 : isTablet ? 1.04 : 1;

  return {
    isTablet,
    isDesktop,
    contentWidth,
    horizontalPadding,
    gridGap,
    wasteColumns,
    wasteBoxWidth,
    fontScale,
    heroMinHeight: isDesktop ? 190 : isTablet ? 180 : 170,
  };
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const { width, height } = useWindowDimensions();
  const responsive = getResponsiveConfig(width);

  const scrollViewRef = useRef<ScrollView>(null);
  const tipsSectionRef = useRef<View>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;
  const float4 = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(1)).current;

  // Sidebar Animations
  const leftSidebarAnim = useRef(new Animated.Value(-80)).current;
  const rightSidebarAnim = useRef(new Animated.Value(80)).current;
  const leftItemsAnim = useRef(new Animated.Value(0)).current;
  const rightItemsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
      Animated.timing(leftSidebarAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.timing(rightSidebarAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.timing(leftItemsAnim, { toValue: 1, duration: 800, delay: 300, useNativeDriver: true }),
      Animated.timing(rightItemsAnim, { toValue: 1, duration: 800, delay: 400, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 26000, useNativeDriver: true })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float1, { toValue: 1, duration: 3200, useNativeDriver: true }),
        Animated.timing(float1, { toValue: 0, duration: 3200, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float2, { toValue: 1, duration: 3800, useNativeDriver: true }),
        Animated.timing(float2, { toValue: 0, duration: 3800, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float3, { toValue: 1, duration: 2800, useNativeDriver: true }),
        Animated.timing(float3, { toValue: 0, duration: 2800, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float4, { toValue: 1, duration: 3500, useNativeDriver: true }),
        Animated.timing(float4, { toValue: 0, duration: 3500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const goToScan = () => navigation.navigate('Scan');

  const handleFabIn = () => Animated.spring(fabScale, { toValue: 0.97, friction: 6, useNativeDriver: true }).start();
  const handleFabOut = () => Animated.spring(fabScale, { toValue: 1, friction: 6, useNativeDriver: true }).start();

  const rotateInterpolate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const float1Interpolate = float1.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
  const float2Interpolate = float2.interpolate({ inputRange: [0, 1], outputRange: [0, 14] });
  const float3Interpolate = float3.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const float4Interpolate = float4.interpolate({ inputRange: [0, 1], outputRange: [0, 16] });

  const firstName = (user?.username || 'Eco Warrior').split(' ')[0];

  // Tips Data
  const tips = [
    { emoji: '♻️', title: 'Kurangi Plastik', desc: 'Gunakan tas belanja sendiri' },
    { emoji: '🌱', title: 'Kompos', desc: 'Olah sampah organik' },
    { emoji: '💧', title: 'Hemat Air', desc: 'Matikan keran saat tidak digunakan' },
    { emoji: '🌳', title: 'Tanam Pohon', desc: 'Setiap 10 botol = 1 pohon' },
  ];

  // Left Sidebar Tips
  const leftSidebarTips = [
    { icon: 'water-outline', label: 'Hemat Air', desc: 'Kurangi 20%', color: '#2196F3' },
    { icon: 'flash-outline', label: 'Hemat Listrik', desc: 'Matikan lampu', color: '#F59E0B' },
    { icon: 'leaf-outline', label: 'Kompos', desc: 'Sampah organik', color: '#22C55E' },
  ];

  const dailyWisdom = [
    { quote: 'Bumi bukan warisan nenek moyang, tapi pinjaman cucu kita.', author: 'Pepatah' },
    { quote: 'Satu pohon kecil hari ini, hutan besar esok hari.', author: 'Eco Wisdom' },
    { quote: 'Daur ulang bukan pilihan, tapi tanggung jawab.', author: 'Green Life' },
  ];

  // Scroll ke tips section
  const scrollToTips = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: 800,
        animated: true,
      });
    }
  };

  // Navigate ke Profile
  const goToProfile = () => {
    navigation.navigate('Profil');
  };

  // === RIGHT SIDEBAR: Leaf Navigation ===
  const navItems = [
    { icon: 'home', label: 'Beranda', screen: 'Dashboard', active: true, action: null },
    { icon: 'scan', label: 'Scan', screen: 'Scan', active: false, action: null },
    { icon: 'leaf', label: 'Eco Tips', screen: 'Tips', active: false, action: scrollToTips },
    { icon: 'person', label: 'Profil', screen: 'Profile', active: false, action: goToProfile },
  ];

  const handleNavPress = (item: typeof navItems[0]) => {
    if (item.screen === 'Dashboard') return;
    if (item.action) {
      item.action();
    } else {
      navigation.navigate(item.screen);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#eefdf3" />

      <LinearGradient
        colors={['#dcfce7', '#f0fdf4', '#eff6ff'] as const}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* === LEFT SIDEBAR: Eco Tips & Wisdom === */}
      {responsive.isDesktop && (
        <Animated.View
          style={[
            styles.leftSidebar,
            { transform: [{ translateX: leftSidebarAnim }], opacity: leftItemsAnim },
          ]}
        >
          <BlurView intensity={40} tint="light" style={styles.leftSidebarBlur}>
            {/* Daily Wisdom Card */}
            <View style={styles.wisdomCard}>
              <MaterialCommunityIcons name="format-quote-open" size={20} color="#1E4E2C" />
              <Text style={styles.wisdomQuote}>{dailyWisdom[0].quote}</Text>
              <Text style={styles.wisdomAuthor}>— {dailyWisdom[0].author}</Text>
            </View>

            {/* Tips List */}
            <Text style={styles.sidebarSectionTitle}>💡 Eco Tips</Text>
            {leftSidebarTips.map((tip, index) => (
              <View key={index} style={styles.sidebarTipItem}>
                <View style={[styles.sidebarTipIcon, { backgroundColor: `${tip.color}15` }]}>
                  <Ionicons name={tip.icon as any} size={16} color={tip.color} />
                </View>
                <View style={styles.sidebarTipText}>
                  <Text style={styles.sidebarTipLabel}>{tip.label}</Text>
                  <Text style={styles.sidebarTipDesc}>{tip.desc}</Text>
                </View>
              </View>
            ))}

            {/* Impact Counter */}
            <View style={styles.impactCard}>
              <Text style={styles.impactTitle}>🌍 Dampak Anda</Text>
              <View style={styles.impactRow}>
                <View style={styles.impactItem}>
                  <Text style={styles.impactValue}>47</Text>
                  <Text style={styles.impactLabel}>Scan</Text>
                </View>
                <View style={styles.impactDivider} />
                <View style={styles.impactItem}>
                  <Text style={styles.impactValue}>12kg</Text>
                  <Text style={styles.impactLabel}>Sampah</Text>
                </View>
                <View style={styles.impactDivider} />
                <View style={styles.impactItem}>
                  <Text style={styles.impactValue}>3</Text>
                  <Text style={styles.impactLabel}>Pohon</Text>
                </View>
              </View>
            </View>

            {/* Weather-like Eco Status */}
            <View style={styles.ecoStatusCard}>
              <View style={styles.ecoStatusHeader}>
                <Ionicons name="sunny" size={18} color="#F59E0B" />
                <Text style={styles.ecoStatusTitle}>Kualitas Udara</Text>
              </View>
              <Text style={styles.ecoStatusValue}>Baik</Text>
              <Text style={styles.ecoStatusDesc}>Indeks: 42 AQI</Text>
              <View style={styles.ecoStatusBar}>
                <View style={[styles.ecoStatusFill, { width: '42%', backgroundColor: '#22C55E' }]} />
              </View>
            </View>
          </BlurView>
        </Animated.View>
      )}

      {/* === RIGHT SIDEBAR: Leaf Navigation === */}
      {responsive.isDesktop && (
        <Animated.View
          style={[
            styles.rightSidebar,
            { transform: [{ translateX: rightSidebarAnim }], opacity: rightItemsAnim },
          ]}
        >
          <BlurView intensity={40} tint="light" style={styles.rightSidebarBlur}>
            {/* Leaf Decoration Top */}
            <View style={styles.leafDecoration}>
              <Animated.View style={{ transform: [{ translateY: float1Interpolate }, { rotate: rotateInterpolate }] }}>
                <MaterialCommunityIcons name="leaf" size={32} color="rgba(34, 197, 94, 0.2)" />
              </Animated.View>
            </View>

            {/* Nav Items */}
            <View style={styles.navContainer}>
              {navItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.navItem, item.active && styles.navItemActive]}
                  onPress={() => handleNavPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.navIconCircle, item.active && styles.navIconCircleActive]}>
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={item.active ? '#FFFFFF' : '#2D6A4F'}
                    />
                  </View>
                  <Text style={[styles.navLabel, item.active && styles.navLabelActive]}>
                    {item.label}
                  </Text>
                  {item.active && <View style={styles.navActiveIndicator} />}
                </TouchableOpacity>
              ))}
            </View>

            {/* Leaf Decoration Bottom */}
            <View style={styles.leafDecorationBottom}>
              <Animated.View style={{ transform: [{ translateY: float2Interpolate }, { rotate: rotateInterpolate }] }}>
                <MaterialCommunityIcons name="tree" size={28} color="rgba(34, 197, 94, 0.15)" />
              </Animated.View>
            </View>

            {/* Mini Calendar */}
            <View style={styles.miniCalendar}>
              <Text style={styles.miniCalendarMonth}>Juli 2026</Text>
              <View style={styles.miniCalendarGrid}>
                {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((d, i) => (
                  <Text key={i} style={styles.miniCalendarDayHeader}>{d}</Text>
                ))}
                {Array.from({ length: 31 }, (_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.miniCalendarDay,
                      i + 1 === 5 && styles.miniCalendarDayActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.miniCalendarDayText,
                        i + 1 === 5 && styles.miniCalendarDayTextActive,
                      ]}
                    >
                      {i + 1}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </BlurView>
        </Animated.View>
      )}

      {/* --- DECORATIVE FLOATING ELEMENTS --- */}
      <Animated.View
        style={[
          styles.floatingIcon,
          {
            top: height * 0.08,
            left: width * 0.02,
            transform: [{ translateY: float1Interpolate }, { rotate: rotateInterpolate }],
          },
        ]}
        pointerEvents="none"
      >
        <MaterialCommunityIcons name="leaf" size={28} color="rgba(34, 197, 94, 0.12)" />
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingIcon,
          {
            top: height * 0.25,
            right: width * 0.02,
            transform: [{ translateY: float2Interpolate }, { rotate: rotateInterpolate }],
          },
        ]}
        pointerEvents="none"
      >
        <MaterialCommunityIcons name="recycle" size={32} color="rgba(34, 197, 94, 0.10)" />
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingIcon,
          {
            bottom: height * 0.35,
            left: width * 0.01,
            transform: [{ translateY: float3Interpolate }, { rotate: rotateInterpolate }],
          },
        ]}
        pointerEvents="none"
      >
        <MaterialCommunityIcons name="trash-can-outline" size={24} color="rgba(34, 197, 94, 0.10)" />
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingIcon,
          {
            bottom: height * 0.15,
            right: width * 0.01,
            transform: [{ translateY: float4Interpolate }, { rotate: rotateInterpolate }],
          },
        ]}
        pointerEvents="none"
      >
        <MaterialCommunityIcons name="tree" size={30} color="rgba(34, 197, 94, 0.08)" />
      </Animated.View>

      {/* Decorative eco glass bubbles */}
      <Animated.View
        style={[
          styles.ecoBubble,
          { width: 40, height: 40, top: 2, right: width * 0.28 },
          { transform: [{ translateY: float1Interpolate }, { rotate: rotateInterpolate }] },
        ]}
        pointerEvents="none"
      >
        <BlurView intensity={30} tint="light" style={styles.orbBlur} />
        <MaterialCommunityIcons name="leaf" size={16} color="rgba(22, 163, 74, 0.4)" />
      </Animated.View>
      <Animated.View
        style={[
          styles.ecoBubble,
          { width: 32, height: 32, top: height * 0.1, left: width * 0.12 },
          { transform: [{ translateY: float2Interpolate }, { rotate: rotateInterpolate }] },
        ]}
        pointerEvents="none"
      >
        <BlurView intensity={26} tint="light" style={styles.orbBlur} />
        <MaterialCommunityIcons name="recycle" size={16} color="rgba(34, 197, 94, 0.35)" />
      </Animated.View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.scrollContainer,
          {
            paddingHorizontal: responsive.horizontalPadding,
            alignItems: 'center',
            paddingLeft: responsive.isDesktop ? 280 : responsive.horizontalPadding,
            paddingRight: responsive.isDesktop ? 280 : responsive.horizontalPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            { width: responsive.contentWidth, opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >

          {/* --- TOP BAR --- */}
          <View style={styles.topBar}>
            <View>
              <Text style={[styles.greetingSmall, { fontSize: 13 * responsive.fontScale }]}>
                Selamat datang kembali,
              </Text>
              <Text style={[styles.greetingName, { fontSize: 22 * responsive.fontScale }]}>
                {firstName} 🌿
              </Text>
            </View>
            <View style={styles.avatarShadow}>
              <BlurView intensity={45} tint="light" style={styles.avatarButton}>
                <TouchableOpacity
                  style={styles.avatarTouchable}
                  activeOpacity={0.8}
                  onPress={() =>
                    Alert.alert('EcoClassify', `Halo ${user?.username || 'Pengguna'}! Model klasifikasi sampah AI siap digunakan.`)
                  }
                >
                  <Ionicons name="leaf" size={20} color="#1E4E2C" />
                </TouchableOpacity>
              </BlurView>
            </View>
          </View>

          {/* --- HERO CTA --- */}
          <TouchableOpacity style={styles.heroShadow} activeOpacity={0.93} onPress={goToScan}>
            <LinearGradient
              colors={['#1E4E2C', '#16a34a'] as const}
              style={[styles.heroCard, { minHeight: responsive.heroMinHeight }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.heroSheen} />

              <View style={styles.heroTextBlock}>
                <View style={styles.heroPill}>
                  <Ionicons name="bulb-outline" size={12} color="#FFF" />
                  <Text style={styles.heroPillText}>11 jenis sampah</Text>
                </View>
                <Text style={[styles.heroTitle, { fontSize: 21 * responsive.fontScale }]}>
                  Klasifikasi Sampah{'\n'}dengan AI
                </Text>
                <Text style={[styles.heroSubtitle, { fontSize: 12.5 * responsive.fontScale }]}>
                  Arahkan kamera, biar AI yang mengenali jenisnya
                </Text>

                <View style={styles.heroCtaRow}>
                  <Text style={styles.heroCtaText}>Mulai Scan</Text>
                  <View style={styles.heroCtaArrow}>
                    <Ionicons name="arrow-forward" size={14} color="#1E4E2C" />
                  </View>
                </View>
              </View>

              <View style={styles.heroIllustration}>
                <View style={styles.heroIllustrationRing} />
                <View style={styles.heroIllustrationCircle}>
                  <Ionicons name="camera" size={30} color="#FFF" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* --- CATEGORY CARDS --- */}
          <View style={[styles.gridContainer, { gap: responsive.gridGap }]}>
            <View style={styles.categoryCardShadow}>
              <BlurView intensity={45} tint="light" style={styles.categoryCard}>
                <View style={styles.categoryTopRow}>
                  <View style={[styles.iconCircle, { backgroundColor: 'rgba(76, 175, 80, 0.16)' }]}>
                    <Ionicons name="leaf-outline" size={18} color="#4CAF50" />
                  </View>
                  <Text style={styles.categoryCount}>6</Text>
                </View>
                <Text style={styles.categoryTitle}>Organik</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: '55%', backgroundColor: '#4CAF50' }]} />
                </View>
              </BlurView>
            </View>

            <View style={styles.categoryCardShadow}>
              <BlurView intensity={45} tint="light" style={styles.categoryCard}>
                <View style={styles.categoryTopRow}>
                  <View style={[styles.iconCircle, { backgroundColor: 'rgba(33, 150, 243, 0.16)' }]}>
                    <Ionicons name="trash-outline" size={18} color="#2196F3" />
                  </View>
                  <Text style={styles.categoryCount}>5</Text>
                </View>
                <Text style={styles.categoryTitle}>Anorganik</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: '45%', backgroundColor: '#2196F3' }]} />
                </View>
              </BlurView>
            </View>
          </View>

          {/* --- WASTE TYPES --- */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeader, { fontSize: 17 * responsive.fontScale }]}>
              Jenis Sampah yang Didukung
            </Text>
          </View>

          <View style={styles.wasteGroupBlock}>
            <View style={styles.wasteGroupHeaderRow}>
              <View style={[styles.indicatorBar, { backgroundColor: '#4CAF50' }]} />
              <Text style={[styles.wasteGroupLabel, { color: '#4CAF50' }]}>Organik</Text>
              <View style={[styles.wasteGroupCountBadge, { backgroundColor: 'rgba(76, 175, 80, 0.14)' }]}>
                <Text style={[styles.wasteGroupCountText, { color: '#4CAF50' }]}>{WASTE_TYPES.organik.length} jenis</Text>
              </View>
            </View>
            <View style={[styles.wasteGrid, { gap: responsive.gridGap }]}>
              {WASTE_TYPES.organik.map((item, index) => (
                <View key={index} style={[styles.wasteBoxShadow, { width: responsive.wasteBoxWidth }]}>
                  <BlurView intensity={35} tint="light" style={[styles.wasteBox, { borderColor: 'rgba(76, 175, 80, 0.3)' }]}>
                    <View style={[styles.wasteBoxIconCircle, { backgroundColor: 'rgba(76, 175, 80, 0.14)' }]}>
                      <Text style={styles.wasteBoxEmoji}>{item.emoji}</Text>
                    </View>
                    <Text style={styles.wasteBoxLabel}>{item.label}</Text>
                  </BlurView>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.wasteGroupBlock}>
            <View style={styles.wasteGroupHeaderRow}>
              <View style={[styles.indicatorBar, { backgroundColor: '#2196F3' }]} />
              <Text style={[styles.wasteGroupLabel, { color: '#2196F3' }]}>Anorganik</Text>
              <View style={[styles.wasteGroupCountBadge, { backgroundColor: 'rgba(33, 150, 243, 0.14)' }]}>
                <Text style={[styles.wasteGroupCountText, { color: '#2196F3' }]}>{WASTE_TYPES.anorganik.length} jenis</Text>
              </View>
            </View>
            <View style={[styles.wasteGrid, { gap: responsive.gridGap }]}>
              {WASTE_TYPES.anorganik.map((item, index) => (
                <View key={index} style={[styles.wasteBoxShadow, { width: responsive.wasteBoxWidth }]}>
                  <BlurView intensity={35} tint="light" style={[styles.wasteBox, { borderColor: 'rgba(33, 150, 243, 0.3)' }]}>
                    <View style={[styles.wasteBoxIconCircle, { backgroundColor: 'rgba(33, 150, 243, 0.14)' }]}>
                      <Text style={styles.wasteBoxEmoji}>{item.emoji}</Text>
                    </View>
                    <Text style={styles.wasteBoxLabel}>{item.label}</Text>
                  </BlurView>
                </View>
              ))}
            </View>
          </View>

          {/* --- ECO TIPS CAROUSEL (dengan ref untuk scroll) --- */}
          <View ref={tipsSectionRef} style={styles.tipsCarouselContainer}>
            <Text style={[styles.tipsCarouselTitle, { fontSize: 17 * responsive.fontScale }]}>
              💡 Eco Tips
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tipsScroll}>
              {tips.map((item, index) => (
                <View key={index} style={styles.tipsCard}>
                  <Text style={styles.tipsEmoji}>{item.emoji}</Text>
                  <Text style={styles.tipsCardTitle}>{item.title}</Text>
                  <Text style={styles.tipsCardDesc}>{item.desc}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* --- TIP OF THE DAY --- */}
          <View style={styles.tipShadow}>
            <BlurView intensity={35} tint="light" style={styles.tipCard}>
              <View style={styles.tipIconCircle}>
                <Ionicons name="leaf" size={16} color="#16a34a" />
              </View>
              <View style={styles.tipTextBlock}>
                <Text style={styles.tipTitle}>Tips Hari Ini</Text>
                <Text style={styles.tipBody}>Bilas kemasan plastik sebelum dibuang agar lebih mudah didaur ulang.</Text>
              </View>
            </BlurView>
          </View>

        </Animated.View>
      </ScrollView>

      {/* --- FLOATING ACTION BUTTON --- */}
      <View style={styles.floatingButtonContainer}>
        <Animated.View style={{ transform: [{ scale: fabScale }] }}>
          <TouchableOpacity
            style={styles.floatingButton}
            activeOpacity={0.9}
            onPress={goToScan}
            onPressIn={Platform.OS !== 'web' ? handleFabIn : undefined}
            onPressOut={Platform.OS !== 'web' ? handleFabOut : undefined}
            {...(Platform.OS === 'web' ? ({ onMouseEnter: handleFabIn, onMouseLeave: handleFabOut } as any) : {})}
          >
            <LinearGradient colors={['#22c55e', '#1E4E2C'] as const} style={styles.floatingButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="camera" size={20} color="#FFF" style={styles.floatingButtonIcon} />
              <Text style={styles.floatingButtonText}>Klasifikasi Sekarang</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#eefdf3' },
  background: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },

  // === LEFT SIDEBAR STYLES ===
  leftSidebar: {
    position: 'absolute',
    left: 12,
    top: 70,
    bottom: 100,
    width: 240,
    zIndex: 5,
    borderRadius: 24,
    overflow: 'hidden',
  },
  leftSidebarBlur: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 24,
    padding: 16,
  },
  wisdomCard: {
    backgroundColor: 'rgba(30, 78, 44, 0.06)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#1E4E2C',
  },
  wisdomQuote: {
    fontSize: 13,
    color: '#1A3B2E',
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 6,
  },
  wisdomAuthor: {
    fontSize: 11,
    color: '#6B8A7A',
    fontWeight: '600',
  },
  sidebarSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A3B2E',
    marginBottom: 10,
  },
  sidebarTipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  sidebarTipIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sidebarTipText: {
    flex: 1,
  },
  sidebarTipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1C1C',
  },
  sidebarTipDesc: {
    fontSize: 11,
    color: '#6B8A7A',
  },
  impactCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.06)',
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.15)',
  },
  impactTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A3B2E',
    marginBottom: 10,
  },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  impactItem: {
    alignItems: 'center',
  },
  impactValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E4E2C',
  },
  impactLabel: {
    fontSize: 10,
    color: '#6B8A7A',
    marginTop: 2,
  },
  impactDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  ecoStatusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  ecoStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  ecoStatusTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B8A7A',
  },
  ecoStatusValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#22C55E',
  },
  ecoStatusDesc: {
    fontSize: 11,
    color: '#6B8A7A',
    marginTop: 2,
    marginBottom: 8,
  },
  ecoStatusBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  ecoStatusFill: {
    height: '100%',
    borderRadius: 3,
  },

  // === RIGHT SIDEBAR STYLES ===
  rightSidebar: {
    position: 'absolute',
    right: 12,
    top: 70,
    bottom: 100,
    width: 240,
    zIndex: 5,
    borderRadius: 24,
    overflow: 'hidden',
  },
  rightSidebarBlur: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 24,
    padding: 16,
  },
  leafDecoration: {
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 8,
  },
  leafDecorationBottom: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  navContainer: {
    gap: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: 'rgba(30, 78, 44, 0.08)',
  },
  navIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(45, 106, 79, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  navIconCircleActive: {
    backgroundColor: '#1E4E2C',
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5b6b60',
    flex: 1,
  },
  navLabelActive: {
    color: '#1E4E2C',
    fontWeight: '700',
  },
  navActiveIndicator: {
    position: 'absolute',
    left: 0,
    top: '25%',
    bottom: '25%',
    width: 3,
    borderRadius: 2,
    backgroundColor: '#22C55E',
  },
  miniCalendar: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  miniCalendarMonth: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A3B2E',
    marginBottom: 8,
    textAlign: 'center',
  },
  miniCalendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  miniCalendarDayHeader: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    color: '#6B8A7A',
    marginBottom: 4,
  },
  miniCalendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    marginBottom: 2,
  },
  miniCalendarDayActive: {
    backgroundColor: '#1E4E2C',
  },
  miniCalendarDayText: {
    fontSize: 11,
    color: '#5b6b60',
  },
  miniCalendarDayTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Floating Elements
  floatingIcon: {
    position: 'absolute',
    zIndex: 0,
    opacity: 0.8,
  },
  orbBlur: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 999 },
  ecoBubble: {
    position: 'absolute',
    borderRadius: 999,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    zIndex: 0,
  },

  scrollContainer: { paddingTop: 12, paddingBottom: 180, zIndex: 2 },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 6,
  },
  greetingSmall: {
    color: '#5b6b60',
  },
  greetingName: {
    fontWeight: '800',
    color: '#133B1C',
    marginTop: 2,
  },
  avatarShadow: {
    borderRadius: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  avatarTouchable: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Hero CTA
  heroShadow: {
    borderRadius: 26,
    marginBottom: 18,
    shadowColor: '#1E4E2C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 5,
  },
  heroCard: {
    borderRadius: 26,
    padding: 22,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  heroTextBlock: { flex: 1, paddingRight: 8, justifyContent: 'space-between' },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },
  heroPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    lineHeight: 26,
    marginTop: 12,
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 17,
    marginTop: 6,
  },
  heroCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 8,
  },
  heroCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  heroCtaArrow: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroIllustration: {
    width: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIllustrationRing: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  heroIllustrationCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Category Grid
  gridContainer: { flexDirection: 'row', marginBottom: 22 },
  categoryCardShadow: {
    flex: 1,
    borderRadius: 20,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  categoryCard: {
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  categoryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryCount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1C',
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 10,
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Section Header
  sectionHeaderRow: { marginBottom: 12 },
  sectionHeader: {
    fontWeight: '800',
    color: '#1C1C1C',
  },

  // Waste Type Grid
  wasteGroupBlock: { marginBottom: 18 },
  wasteGroupHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  indicatorBar: { width: 4, height: 14, borderRadius: 2, marginRight: 8 },
  wasteGroupLabel: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  wasteGroupCountBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  wasteGroupCountText: {
    fontSize: 11,
    fontWeight: '700',
  },
  wasteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  wasteBoxShadow: {
    borderRadius: 18,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1.5,
  },
  wasteBox: {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 8,
    overflow: 'hidden',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
  },
  wasteBoxIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  wasteBoxEmoji: { fontSize: 18 },
  wasteBoxLabel: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Eco Tips Carousel
  tipsCarouselContainer: {
    marginBottom: 16,
  },
  tipsCarouselTitle: {
    fontWeight: '700',
    color: '#1A3B2E',
    marginBottom: 12,
  },
  tipsScroll: {
    flexDirection: 'row',
  },
  tipsCard: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 16,
    padding: 14,
    marginRight: 12,
    width: 140,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
  },
  tipsEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  tipsCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A3B2E',
    textAlign: 'center',
  },
  tipsCardDesc: {
    fontSize: 12,
    color: '#6B8A7A',
    textAlign: 'center',
    marginTop: 4,
  },

  // Tip of the Day
  tipShadow: {
    borderRadius: 20,
    marginTop: 4,
    marginBottom: 10,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    gap: 12,
  },
  tipIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipTextBlock: { flex: 1 },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 3,
  },
  tipBody: {
    fontSize: 12.5,
    color: '#5b6b60',
    lineHeight: 17,
  },

  // FAB
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  floatingButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#1E4E2C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  floatingButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  floatingButtonIcon: { marginRight: 8 },
  floatingButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});