import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Animated,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { Provider } from 'react-redux';
import AppNavigator from './navigation/AppNavigation';

// Import AuthContext
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { store } from './store/store';

function getInterFamilyFromStyle(style: any) {
  const flattened = StyleSheet.flatten(style) || {};
  const weight = String(flattened.fontWeight || '400').toLowerCase();

  if (weight === '900' || weight === '800' || weight === 'bold') {
    return 'Inter-ExtraBold';
  }

  if (weight === '700') {
    return 'Inter-Bold';
  }

  if (weight === '600') {
    return 'Inter-SemiBold';
  }

  if (weight === '500') {
    return 'Inter-Medium';
  }

  return 'Inter-Regular';
}

function withSupabaseFont(style: any) {
  return [
    style,
    {
      fontFamily: getInterFamilyFromStyle(style),
      fontWeight: '400',
      letterSpacing: 0,
    },
  ];
}

function applySupabaseFont() {
  const textComponent = Text as any;
  if (!textComponent.__cyberWasteSupabaseDefaultPatched) {
    textComponent.defaultProps = textComponent.defaultProps || {};
    textComponent.defaultProps.style = withSupabaseFont(textComponent.defaultProps.style);
    textComponent.__cyberWasteSupabaseDefaultPatched = true;
  }

  if (!textComponent.__cyberWasteSupabaseFontPatched && textComponent.render) {
    const originalRender = textComponent.render;
    textComponent.render = function renderWithSupabaseFont(...args: any[]) {
      const element = originalRender.apply(this, args);
      if (!React.isValidElement(element)) {
        return element;
      }

      const elementProps = element.props as any;
      const style = elementProps.style;

      return React.cloneElement(element, {
        ...elementProps,
        style: withSupabaseFont(style),
      });
    };
    textComponent.__cyberWasteSupabaseFontPatched = true;
  }

  const inputComponent = TextInput as any;
  if (!inputComponent.__cyberWasteSupabaseDefaultPatched) {
    inputComponent.defaultProps = inputComponent.defaultProps || {};
    inputComponent.defaultProps.style = [
      inputComponent.defaultProps.style,
      { fontFamily: 'Inter-Regular', fontWeight: '400', letterSpacing: 0 },
    ];
    inputComponent.__cyberWasteSupabaseDefaultPatched = true;
  }
}

// Komponen utama yang berisi logika aplikasi
function AppContent() {
  const { isLoading } = useAuth();

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Inter-ExtraBold': Inter_800ExtraBold,
    'GeistSans-Regular': Inter_400Regular,
    'GeistSans-Medium': Inter_500Medium,
    'GeistSans-SemiBold': Inter_600SemiBold,
    'GeistSans-Bold': Inter_700Bold,
    'GeistSans-ExtraBold': Inter_800ExtraBold,
  });

  if (fontsLoaded) {
    applySupabaseFont();
  }

  // Animations & Toast
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'error',
  });
  const toastY = useRef(new Animated.Value(-120)).current;

  const showToast = (message: string, type: 'success' | 'error' = 'error') => {
    setToast({ visible: true, message, type });
    Animated.sequence([
      Animated.timing(toastY, {
        toValue: 50,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(toastY, {
        toValue: -120,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    });
  };

  if (isLoading || !fontsLoaded) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Memuat Echo Tech...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <AppNavigator showToast={showToast} />
      
      {toast.visible && (
        <Animated.View
          style={[
            styles.toast,
            {
              transform: [{ translateY: toastY }],
              backgroundColor: toast.type === 'success' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
            },
          ]}
        >
          <Ionicons
            name={toast.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
            size={22}
            color="#fff"
          />
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
      )}
    </View>
  );
}

// App utama dibungkus dengan AuthProvider
export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </AuthProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  flex1: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 14,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.5,
    fontFamily: 'Inter-Medium',
  },
  toast: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 999,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
    fontFamily: 'Inter-SemiBold',
  },
});
