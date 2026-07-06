import React, { useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  Dimensions, 
  Platform, 
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function FloatingTabBar({ state, descriptors, navigation }: any) {
  // Animated values for each tab icon
  const iconScales = useRef<{ [key: string]: Animated.Value }>({}).current;
  const iconTranslates = useRef<{ [key: string]: Animated.Value }>({}).current;

  // Initialize animated values for each route
  state.routes.forEach((route: any, index: number) => {
    if (!iconScales[route.key]) {
      const isScan = route.name === 'Scan';
      iconScales[route.key] = new Animated.Value(index === state.index ? 1.1 : 1);
      iconTranslates[route.key] = new Animated.Value(isScan ? -18 : index === state.index ? -2 : 0);
    }
  });

  // Update animations when tab changes
  useEffect(() => {
    state.routes.forEach((route: any, index: number) => {
      const isFocused = state.index === index;
      const isScan = route.name === 'Scan';
      const scale = iconScales[route.key];
      const translateY = iconTranslates[route.key];

      if (isFocused) {
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 1.1,
            friction: 5,
            tension: 60,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: isScan ? -22 : -2,
            friction: 6,
            tension: 50,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 1,
            friction: 5,
            tension: 60,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: isScan ? -18 : 0,
            friction: 6,
            tension: 50,
            useNativeDriver: true,
          }),
        ]).start();
      }
    });
  }, [state.index, state.routes]);

  // Map route names to icons
  const getIconName = (routeName: string): any => {
    const iconMap: { [key: string]: any } = {
      Beranda: 'home',
      Dashboard: 'home',
      Scan: 'scan',
      'Eco Tips': 'leaf',
      'Eco Poin': 'leaf',
      Riwayat: 'time',
      History: 'time',
      Profil: 'person',
      Profile: 'person',
    };
    return iconMap[routeName] || 'home';
  };

  // Get icon color based on focus state
  const getIconColor = (isFocused: boolean) => {
    return isFocused ? '#1E4E2C' : '#94A3B8';
  };

  // Get icon size based on focus state
  const getIconSize = (isFocused: boolean) => {
    return isFocused ? 26 : 22;
  };

  return (
    <View style={styles.tabBarContainer}>
      <BlurView 
        intensity={isWeb ? 18 : 24} 
        tint="light" 
        style={styles.floatingTabBar}
      >
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.72)', 'rgba(255, 255, 255, 0.46)']}
          style={styles.tabBarGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* Tab Icons */}
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const scale = iconScales[route.key] || new Animated.Value(1);
          const translateY = iconTranslates[route.key] || new Animated.Value(0);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const iconName = getIconName(route.name);
          const isScan = route.name === 'Scan';
          const iconColor = isScan ? '#FFFFFF' : getIconColor(isFocused);
          const iconSize = isScan ? (isWeb ? 30 : 28) : getIconSize(isFocused);

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={[styles.tabItem, isScan && styles.scanTabItem]}
              activeOpacity={isScan ? 0.82 : 0.7}
            >
              <Animated.View
                style={[
                  styles.iconContainer,
                  isScan && styles.scanIconContainer,
                  {
                    transform: [
                      { scale },
                      { translateY },
                    ],
                  },
                ]}
              >
                {isScan && (
                  <LinearGradient
                    colors={isFocused ? ['#22C55E', '#0F8F4C'] : ['#34D399', '#10B981']}
                    style={styles.scanIconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                )}
                <Ionicons name={iconName} size={iconSize} color={iconColor} />
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: isWeb ? 24 : 18,
    left: isWeb ? 24 : 8,
    right: isWeb ? 24 : 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    zIndex: 99,
  },
  floatingTabBar: {
    flexDirection: 'row',
    borderRadius: 28,
    height: isWeb ? 64 : 58,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.72)',
    backgroundColor: 'rgba(255, 255, 255, 0.58)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 8,
    overflow: 'visible',
    position: 'relative',
  },
  tabBarGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingVertical: 4,
    position: 'relative',
    zIndex: 2,
  },
  scanTabItem: {
    zIndex: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanIconContainer: {
    width: isWeb ? 72 : 66,
    height: isWeb ? 72 : 66,
    borderRadius: isWeb ? 36 : 33,
    borderWidth: 5,
    borderColor: 'rgba(240, 253, 244, 0.96)',
    backgroundColor: '#10B981',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 14,
    overflow: 'hidden',
  },
  scanIconGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: isWeb ? 36 : 33,
  },
});
