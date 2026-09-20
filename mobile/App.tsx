import 'react-native-gesture-handler';
import 'react-native-reanimated';

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import MapScreen from './src/screens/MapScreen';
import AboutScreen from './src/screens/AboutScreen';

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
        }}
      >
        <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Карта' }} />
        <Tab.Screen name="About" component={AboutScreen} options={{ title: 'О приложении' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Inner />
    </ThemeProvider>
  );
}