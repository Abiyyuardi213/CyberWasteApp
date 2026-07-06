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

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function FloatingTabBar({ state, descriptors, navigation }: any) {
  // Animated values for each tab icon
  const iconScales = useRef<{ [key: string]: Animated.Value }>({}).current;
  const iconTranslates = useRef<{ [key: string]: Animated.Value }>({}).current;

  // Initialize animated values for each route
  state.routes.forEach((route: any, index: number) => {
    if (!iconScales[route.key]) {
      iconScales[route.key] = new Animated.Value(index === state.index ? 1.1 : 1);
      iconTranslates[route.key] = new Animated.Value(index === state.index ? -2 : 0);
    }
  });

  // Update animations when tab changes
  useEffect(() => {
    state.routes.forEach((route: any, index: number) => {
      const isFocused = state.index === index;
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
            toValue: -2,
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
            toValue: 0,
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
        intensity={isWeb ? 30 : 40} 
        tint="light" 
        style={styles.floatingTabBar}
      >
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.3)']}
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
          const iconColor = getIconColor(isFocused);
          const iconSize = getIconSize(isFocused);

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.iconContainer,
                  {
                    transform: [
                      { scale },
                      { translateY },
                    ],
                  },
                ]}
              >
                <Ionicons
                  name={iconName}
                  size={iconSize}
                  color={iconColor}
                />
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
    bottom: isWeb ? 30 : 24,
    left: isWeb ? 40 : 20,
    right: isWeb ? 40 : 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    zIndex: 99,
  },
  floatingTabBar: {
    flexDirection: 'row',
    borderRadius: 30,
    height: isWeb ? 65 : 60,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  tabBarGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 30,
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
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});