import React, { useRef, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { API_URL } from '../../config';
import { useAuth } from '../context/AuthContext';
import { addScanPoints, fetchEcoPointData } from '../store/ecoPointSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

interface Prediction {
  label: string;
  category: string;
  confidence: number;
  points: number;
}

// ===== BACKGROUND ATAS =====
import bgImage from '../../assets/images/Walpp3.png';

export default function ScanScreen() {
  const cameraRef = useRef<CameraView>(null);
  const dispatch = useAppDispatch();
  const { userPoints } = useAppSelector((state) => state.ecoPoint);
  const { token } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);

  // Animations - hanya untuk fade in awal
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (token) {
      dispatch(fetchEcoPointData(token));
    }
  }, [dispatch, token]);

  const takePhoto = async () => {
    if (!cameraRef.current || loading || !cameraActive) return;

    try {
      setPrediction(null);
      setScanError(null);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.75,
        skipProcessing: true,
      });

      if (photo?.uri) {
        setPhotoUri(photo.uri);
        await uploadPhoto(photo.uri);
      }
    } catch (error) {
      setScanError('Tidak dapat mengambil foto sampah.');
      Alert.alert('Gagal', 'Tidak dapat mengambil foto sampah.');
    }
  };

  const uploadPhoto = async (uri: string) => {
    try {
      setLoading(true);
      setScanError(null);
      const formData = new FormData();
      const fileName = `waste-${Date.now()}.jpg`;

      if (Platform.OS === 'web') {
        const imageResponse = await fetch(uri);
        const imageBlob = await imageResponse.blob();
        formData.append('image', imageBlob, fileName);
      } else {
        formData.append('image', {
          uri,
          name: fileName,
          type: 'image/jpeg',
        } as any);
      }

      const response = await fetch(`${API_URL}/predict-waste`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const responseText = await response.text();
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') && responseText
        ? JSON.parse(responseText)
        : null;

      if (!response.ok || !data?.success) {
        const message =
          data?.detail ||
          data?.error ||
          `Server tidak mengirim JSON valid. Status: ${response.status}. Pastikan endpoint ${API_URL}/predict-waste aktif.`;
        setScanError(message);
        Alert.alert('Prediksi gagal', message);
        return;
      }

      setPrediction(data.prediction);
      dispatch(addScanPoints(Number(data.prediction.points || 0)));
    } catch (error) {
      const message = `Koneksi ke API gagal. Pastikan HP terhubung internet dan backend aktif di ${API_URL}.`;
      setScanError(message);
      Alert.alert('Koneksi gagal', message);
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator color="#10B981" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={['#dcfce7', '#f0fdf4', '#eff6ff'] as const}
          style={styles.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.permissionContainer}>
          <BlurView intensity={40} tint="light" style={styles.permissionBlur}>
            <MaterialCommunityIcons name="camera-off-outline" size={56} color="#10B981" />
            <Text style={styles.permissionTitle}>Izin Kamera Diperlukan</Text>
            <Text style={styles.permissionText}>
              Aktifkan kamera agar EcoClassify bisa mengambil foto sampah untuk diuji oleh model AI.
            </Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <LinearGradient
                colors={['#22c55e', '#16a34a'] as const}
                style={styles.permissionButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.permissionButtonText}>Aktifkan Kamera</Text>
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        </View>
      </SafeAreaView>
    );
  }

  const scanSessionActive = loading || !!photoUri || !!prediction || !!scanError;
  const cameraSize = scanSessionActive ? Math.min(width - 120, 210) : Math.min(width - 80, 280);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#eefdf3" />

      {/* Background bawah (polos) */}
      <LinearGradient
        colors={['#dcfce7', '#f0fdf4', '#eff6ff'] as const}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, scanSessionActive && styles.scrollContentCompact]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!scanSessionActive}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* ===== AREA ATAS: BACKGROUND WALPP ===== */}
          <ImageBackground
            source={bgImage}
            style={[styles.topAreaBg, scanSessionActive && styles.topAreaBgCompact]}
            imageStyle={styles.topAreaBgStyle}
            resizeMode="cover"
          >
            {/* Overlay gelap tipis agar konten terbaca */}
            <View style={styles.topAreaOverlay} />

            {/* ===== HEADER ===== */}
            <BlurView intensity={30} tint="dark" style={[styles.headerCard, scanSessionActive && styles.headerCardCompact]}>
              <View style={styles.headerContent}>
                <View style={styles.headerTextBlock}>
                  <Text style={styles.headerTitle}>📸 Scan Sampah</Text>
                  {!scanSessionActive && (
                    <Text style={styles.headerSubtitle}>Ambil foto, lalu AI akan mengenali jenis sampah dengan akurasi tinggi.</Text>
                  )}
                </View>
                <View style={styles.headerBadge}>
                  <View style={styles.headerBadgeDot} />
                  <Text style={styles.headerBadgeText}>AI Ready</Text>
                </View>
              </View>
            </BlurView>

            {/* ===== CAMERA ===== */}
            <View style={styles.cameraSection}>
              <View style={[styles.cameraWrapper, { height: cameraSize + 32 }]}>
                <View style={[styles.cameraOuterRing, { width: cameraSize + 24, height: cameraSize + 24, borderRadius: (cameraSize + 24) / 2 }]}>
                  <View style={[styles.cameraMiddleRing, { borderRadius: (cameraSize + 24) / 2 - 8 }]}>
                    <View style={[styles.cameraInnerRing, { borderRadius: (cameraSize + 24) / 2 - 14 }]}>
                      {photoUri ? (
                        <Image source={{ uri: photoUri }} style={[styles.preview, { borderRadius: (cameraSize + 24) / 2 - 14 }]} />
                      ) : !cameraActive ? (
                        <BlurView intensity={20} tint="dark" style={styles.cameraStopped}>
                          <MaterialCommunityIcons name="camera-off-outline" size={36} color="#A7F3D0" />
                          <Text style={styles.cameraStoppedTitle}>Kamera Dimatikan</Text>
                          <Text style={styles.cameraStoppedText}>Nyalakan kamera</Text>
                        </BlurView>
                      ) : (
                        <View style={styles.cameraBgContainer}>
                          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
                          
                          <View style={styles.cornerTL} />
                          <View style={styles.cornerTR} />
                          <View style={styles.cornerBL} />
                          <View style={styles.cornerBR} />
                          
                          <View style={styles.centerFocus}>
                            <View style={styles.centerFocusDot} />
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                <View style={styles.cameraStatusBadge}>
                  <BlurView intensity={30} tint="dark" style={styles.cameraStatusBlur}>
                    <View style={[styles.statusDot, !cameraActive && styles.statusDotInactive]} />
                    <Text style={[styles.cameraStatusText, !cameraActive && styles.cameraStatusTextInactive]}>
                      {cameraActive ? 'SIAP' : 'MATI'}
                    </Text>
                  </BlurView>
                </View>
              </View>
            </View>
          </ImageBackground>

          {/* ===== AREA BAWAH: BACKGROUND POLOS ===== */}
          
          {!scanSessionActive && (
          <View style={styles.statsGrid}>
            {/* BARIS 1: Eco Points */}
            <BlurView intensity={30} tint="light" style={styles.infoRow}>
              <View style={styles.infoRowTop}>
                <LinearGradient
                  colors={['#22c55e', '#16a34a'] as const}
                  style={styles.infoRowIcon}
                >
                  <MaterialCommunityIcons name="leaf" size={22} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.infoRowBadge}>
                  <Ionicons name="trending-up" size={14} color="#10B981" />
                  <Text style={styles.infoRowBadgeText}>+12</Text>
                </View>
              </View>
              <Text style={styles.infoRowLabel}>Eco Points</Text>
              <Text style={styles.infoRowValue}>{userPoints.totalPoints.toLocaleString('id-ID')}</Text>
            </BlurView>

            {/* BARIS 2: Scan Hari Ini */}
            <BlurView intensity={30} tint="light" style={styles.infoRow}>
              <View style={styles.infoRowTop}>
                <LinearGradient
                  colors={['#3B82F6', '#2563EB'] as const}
                  style={styles.infoRowIcon}
                >
                  <Ionicons name="scan-outline" size={22} color="#FFFFFF" />
                </LinearGradient>
                <View style={[styles.infoRowBadge, { backgroundColor: 'rgba(59,130,246,0.1)' }]}>
                  <Ionicons name="calendar-outline" size={14} color="#3B82F6" />
                  <Text style={[styles.infoRowBadgeText, { color: '#3B82F6' }]}>Hari ini</Text>
                </View>
              </View>
              <Text style={styles.infoRowLabel}>Scan Hari Ini</Text>
              <Text style={styles.infoRowValue}>{userPoints.itemsRecycled}</Text>
            </BlurView>
          </View>
          )}

          {/* BARIS 3: Tips Scan */}
          {!scanSessionActive && (
          <BlurView intensity={35} tint="light" style={styles.tipsRow}>
            <Text style={styles.tipsRowTitle}>💡 Tips Scan</Text>
            <View style={styles.tipsRowContent}>
              <View style={styles.tipItemHorizontal}>
                <View style={styles.tipDotHorizontal} />
                <Text style={styles.tipTextHorizontal}>Cahaya cukup</Text>
              </View>
              <View style={styles.tipItemHorizontal}>
                <View style={styles.tipDotHorizontal} />
                <Text style={styles.tipTextHorizontal}>Jarak 20-30 cm</Text>
              </View>
              <View style={styles.tipItemHorizontal}>
                <View style={styles.tipDotHorizontal} />
                <Text style={styles.tipTextHorizontal}>Fokus objek</Text>
              </View>
            </View>
          </BlurView>
          )}

          {/* Loading, Error, Result, Actions */}
          {loading && (
            <BlurView intensity={30} tint="light" style={styles.statusCard}>
              <ActivityIndicator color="#10B981" />
              <Text style={styles.statusText}>Model AI sedang menganalisis sampah...</Text>
            </BlurView>
          )}

          {scanError && !loading && (
            <BlurView intensity={30} tint="light" style={[styles.statusCard, styles.errorCard]}>
              <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
              <Text style={styles.errorText}>{scanError}</Text>
            </BlurView>
          )}

          {prediction && (
            <BlurView intensity={40} tint="light" style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View style={styles.resultIcon}>
                  <MaterialCommunityIcons name="recycle" size={24} color="#10B981" />
                </View>
                <View style={styles.resultText}>
                  <Text style={styles.resultLabel}>{prediction.label}</Text>
                  <Text style={styles.resultCategory}>{prediction.category}</Text>
                </View>
              </View>
              <View style={styles.metricRow}>
                <View style={styles.metricItem}>
                  <LinearGradient
                    colors={['rgba(16,185,129,0.08)', 'rgba(16,185,129,0.02)'] as const}
                    style={styles.metricItemGradient}
                  >
                    <Text style={styles.metricValue}>{Math.round(prediction.confidence * 100)}%</Text>
                    <Text style={styles.metricLabel}>Akurasi</Text>
                  </LinearGradient>
                </View>
                <View style={styles.metricItem}>
                  <LinearGradient
                    colors={['rgba(16,185,129,0.08)', 'rgba(16,185,129,0.02)'] as const}
                    style={styles.metricItemGradient}
                  >
                    <Text style={styles.metricValue}>+{prediction.points}</Text>
                    <Text style={styles.metricLabel}>Eco Poin</Text>
                  </LinearGradient>
                </View>
              </View>
            </BlurView>
          )}

        </Animated.View>
      </ScrollView>

      <View style={styles.actions}>
        {photoUri ? (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              setPhotoUri(null);
              setPrediction(null);
              setScanError(null);
              setCameraActive(true);
            }}
            disabled={loading}
            activeOpacity={0.8}
          >
            <BlurView intensity={30} tint="light" style={styles.secondaryButtonBlur}>
              <Ionicons name="refresh-outline" size={20} color="#10B981" />
              <Text style={styles.secondaryButtonText}>Foto Ulang</Text>
            </BlurView>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setCameraActive((current) => !current)}
            disabled={loading}
            activeOpacity={0.8}
          >
            <BlurView intensity={30} tint="light" style={styles.secondaryButtonBlur}>
              <Ionicons
                name={cameraActive ? 'stop-circle-outline' : 'camera-outline'}
                size={20}
                color={cameraActive ? '#EF4444' : '#10B981'}
              />
              <Text style={[styles.secondaryButtonText, cameraActive && styles.stopButtonText]}>
                {cameraActive ? 'Stop Scan' : 'Nyalakan Kamera'}
              </Text>
            </BlurView>
          </TouchableOpacity>
        )}

        {!photoUri && (
          <TouchableOpacity
            style={[styles.scanButton, (loading || !cameraActive) && styles.scanButtonDisabled]}
            onPress={takePhoto}
            disabled={loading || !cameraActive}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#22c55e', '#16a34a'] as const}
              style={styles.scanButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={22} color="#FFFFFF" />
                  <Text style={styles.scanButtonText}>Scan Sekarang</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6FBF7',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 232,
    paddingHorizontal: 10,
  },
  scrollContentCompact: {
    paddingBottom: 150,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6FBF7',
  },

  // Permission
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  permissionBlur: {
    width: '100%',
    maxWidth: 380,
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  permissionTitle: {
    marginTop: 18,
    fontSize: 22,
    fontFamily: 'Inter-ExtraBold',
    color: '#133B1C',
    textAlign: 'center',
  },
  permissionText: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
  },
  permissionButton: {
    marginTop: 22,
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  permissionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    paddingHorizontal: 22,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Inter-ExtraBold',
  },

  // ===== AREA ATAS =====
  topAreaBg: {
    width: width - 20,
    maxWidth: 760,
    borderRadius: 22,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 12,
    alignSelf: 'center',
    paddingHorizontal: 0,
  },
  topAreaBgCompact: {
    marginTop: 8,
    marginBottom: 8,
  },
  topAreaBgStyle: {
    borderRadius: 22,
  },
  topAreaOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 22,
  },

  // Header
  headerCard: {
    backgroundColor: 'rgba(9, 55, 27, 0.44)',
    borderRadius: 18,
    padding: 14,
    marginTop: 16,
    marginHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 3,
  },
  headerCardCompact: {
    padding: 12,
    marginTop: 12,
    marginBottom: 6,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  headerTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: width < 380 ? 20 : 22,
    fontFamily: 'Inter-ExtraBold',
    color: '#FFFFFF',
    lineHeight: width < 380 ? 25 : 28,
  },
  headerSubtitle: {
    fontSize: width < 380 ? 11 : 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    lineHeight: 17,
    maxWidth: '100%',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexShrink: 0,
    maxWidth: 88,
    backgroundColor: 'rgba(16,185,129,0.18)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.32)',
  },
  headerBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  headerBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#10B981',
    letterSpacing: 0,
  },

  // Camera
  cameraSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 10,
    paddingBottom: 18,
  },
  cameraWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cameraOuterRing: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.34)',
  },
  cameraMiddleRing: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cameraInnerRing: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  cameraBgContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  camera: {
    flex: 1,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  cameraStopped: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  cameraStoppedTitle: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Inter-ExtraBold',
    color: '#FFFFFF',
  },
  cameraStoppedText: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: '#CBD5E1',
    textAlign: 'center',
  },

  // Corner Decorations
  cornerTL: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 16,
    height: 16,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  cornerTR: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 16,
    height: 16,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  cornerBL: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 16,
    height: 16,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 16,
    height: 16,
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },

  // Center Focus
  centerFocus: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -12,
    marginTop: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerFocusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(16, 185, 129, 0.6)',
  },

  // Camera Status Badge
  cameraStatusBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  cameraStatusBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: 'rgba(6, 78, 59, 0.58)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    gap: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  statusDotInactive: {
    backgroundColor: '#EF4444',
  },
  cameraStatusText: {
    fontSize: 9,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  cameraStatusTextInactive: {
    color: '#EF4444',
  },

  // ===== AREA BAWAH =====
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  infoRow: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.68)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.78)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
    overflow: 'hidden',
  },
  infoRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoRowIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoRowLabel: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  infoRowValue: {
    fontSize: 21,
    fontFamily: 'Inter-ExtraBold',
    color: '#133B1C',
    lineHeight: 25,
  },
  infoRowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  infoRowBadgeText: {
    fontSize: 11,
    color: '#10B981',
    fontFamily: 'Inter-SemiBold',
  },

  tipsRow: {
    backgroundColor: 'rgba(255,255,255,0.68)',
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.78)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  tipsRowTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#133B1C',
    marginBottom: 10,
  },
  tipsRowContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tipItemHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexGrow: 1,
    minWidth: '30%',
  },
  tipDotHorizontal: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  tipTextHorizontal: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter-Medium',
  },

  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.68)',
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.78)',
    gap: 10,
  },
  statusText: {
    flex: 1,
    fontSize: 13,
    color: '#047857',
    fontFamily: 'Inter-SemiBold',
  },
  errorCard: {
    backgroundColor: 'rgba(254, 242, 242, 0.7)',
    borderColor: 'rgba(254, 202, 202, 0.5)',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#B91C1C',
    lineHeight: 18,
  },

  resultCard: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultText: {
    flex: 1,
    marginLeft: 10,
  },
  resultLabel: {
    fontSize: 17,
    fontFamily: 'Inter-ExtraBold',
    color: '#0F172A',
    textTransform: 'capitalize',
  },
  resultCategory: {
    marginTop: 2,
    fontSize: 12,
    color: '#10B981',
    fontFamily: 'Inter-Bold',
  },
  metricRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },
  metricItem: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  metricItemGradient: {
    padding: 12,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontFamily: 'Inter-ExtraBold',
    color: '#047857',
  },
  metricLabel: {
    marginTop: 3,
    fontSize: 11,
    color: '#64748B',
  },

  actions: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: isWeb ? 102 : 106,
    gap: 10,
    zIndex: 50,
  },
  scanButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  scanButtonDisabled: {
    opacity: 0.6,
  },
  scanButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    gap: 8,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-ExtraBold',
  },
  secondaryButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  secondaryButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.68)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.78)',
  },
  secondaryButtonText: {
    color: '#10B981',
    fontSize: 14,
    fontFamily: 'Inter-ExtraBold',
  },
  stopButtonText: {
    color: '#EF4444',
  },
});
