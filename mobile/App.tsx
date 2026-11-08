import 'react-native-gesture-handler';
import 'react-native-reanimated';

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import MapScreen from './src/screens/MapScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AboutScreen from './src/screens/AboutScreen';
import { MapIcon, SettingsIcon, InfoIcon } from './src/icons/NavIcons';
import { SettingsProvider } from './src/store/SettingsContext';

const Tab = createBottomTabNavigator();

function Inner() {
  const { theme } = useTheme();
  const navTheme = theme.name === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={theme.name === 'dark' ? 'light' : 'dark'} />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.card,
            borderTopColor: theme.border,
          },
          tabBarActiveTintColor: theme.accent,
          tabBarInactiveTintColor: theme.iconMuted,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        <Tab.Screen
          name="Map"
          component={MapScreen}
          options={{
            title: 'Карта',
            tabBarIcon: ({ color, size }) => <MapIcon size={size} color={color} />,
          }}
        />
        
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Настройки',
            tabBarIcon: ({ color, size }) => <SettingsIcon size={size} color={color} />,
          }}
        />

        <Tab.Screen
          name="About"
          component={AboutScreen}
          options={{
            title: 'О приложении',
            tabBarIcon: ({ color, size }) => <InfoIcon size={size} color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <Inner />
      </SettingsProvider>
    </ThemeProvider>
  );
}