import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import FloatingTabBar from '../components/FloatingTabBar';
import { StatusBar } from 'react-native';
import { TransitionPresets } from '@react-navigation/stack';

// Import screens (hanya yang dipakai di bottom tab)
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HistoryScreen from '../screens/HistoryScreen';
import EcoPointScreen from '../screens/EcoPointScreen';
import ScanScreen from '../screens/ScanScreen';
import LoginScreen from '../screens/LoginScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AboutAppScreen from '../screens/profile-settings/AboutAppScreen';
import ChangePasswordScreen from '../screens/profile-settings/ChangePasswordScreen';
import EditProfileScreen from '../screens/profile-settings/EditProfileScreen';
import HelpScreen from '../screens/profile-settings/HelpScreen';
import LanguageSettingsScreen from '../screens/profile-settings/LanguageSettingsScreen';
import NotificationSettingsScreen from '../screens/profile-settings/NotificationSettingsScreen';

interface AppNavigatorProps {
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Magic UI Theme dengan Glassmorphism
const MagicUITheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f0fdf4',
    card: 'rgba(255, 255, 255, 0.7)',
    primary: '#1E4E2C',
    text: '#133B1C',
    border: 'rgba(255, 255, 255, 0.3)',
  },
};

const stackScreenOptions = {
  headerShown: false,
  cardStyle: { 
    backgroundColor: '#f0fdf4',
  },
  ...TransitionPresets.SlideFromRightIOS,
  cardOverlayEnabled: true,
  cardStyleInterpolator: ({ current: { progress } }: any) => ({
    cardStyle: {
      opacity: progress,
      transform: [
        {
          scale: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.95, 1],
          }),
        },
      ],
    },
    overlayStyle: {
      opacity: progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.3],
      }),
    },
  }),
};

// Konfigurasi Linking yang diperbaiki
const linking = {
  prefixes: ['http://localhost:8081', 'cyberwaste://'],
  config: {
    screens: {
      // Auth Screens
      Onboarding: 'onboarding',
      Login: 'login',
      Register: 'register',
      // Main Tabs
      MainTabs: {
        path: '',
        screens: {
          Dashboard: 'dashboard',
          Scan: 'scan',
          History: 'history',
          'Eco Poin': 'eco-points',
          Profil: 'profile',
        },
      },
      // Profile Settings
      EditProfile: 'profile/edit',
      ChangePassword: 'profile/password',
      NotificationSettings: 'profile/notifications',
      LanguageSettings: 'profile/language',
      Help: 'profile/help',
      AboutApp: 'profile/about',
    },
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen 
        name="Scan" 
        component={ScanScreen}
        options={{
          tabBarLabel: 'Scan',
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
        }}
      />
      <Tab.Screen 
        name="Eco Poin" 
        component={EcoPointScreen}
        options={{
          tabBarLabel: 'Eco Poin',
        }}
      />
      <Tab.Screen 
        name="Profil" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator({ showToast }: AppNavigatorProps) {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#f0fdf4"
        translucent={false}
      />
      <NavigationContainer 
        linking={linking} 
        theme={MagicUITheme}
      >
        <Stack.Navigator
          screenOptions={stackScreenOptions}
        >
          {isAuthenticated ? (
            <>
              <Stack.Screen 
                name="MainTabs" 
                component={MainTabs}
                options={{
                  headerShown: false,
                  cardStyle: { backgroundColor: 'transparent' },
                }}
              />
              <Stack.Screen 
                name="EditProfile" 
                component={EditProfileScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen 
                name="ChangePassword" 
                component={ChangePasswordScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen 
                name="NotificationSettings" 
                component={NotificationSettingsScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen 
                name="LanguageSettings" 
                component={LanguageSettingsScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen 
                name="Help" 
                component={HelpScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen 
                name="AboutApp" 
                component={AboutAppScreen}
                options={{
                  headerShown: false,
                }}
              />
            </>
          ) : (
            <>
              <Stack.Screen 
                name="Onboarding" 
                component={OnboardingScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen 
                name="Login"
                options={{
                  headerShown: false,
                }}
              >
                {() => <LoginScreen showToast={showToast} />}
              </Stack.Screen>
              <Stack.Screen 
                name="Register"
                options={{
                  headerShown: false,
                }}
              >
                {() => <RegisterScreen showToast={showToast} />}
              </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}