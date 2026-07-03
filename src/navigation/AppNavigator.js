import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';

import { useAuth } from '../context/AuthContext';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main screens
import HomeScreen from '../screens/main/HomeScreen';
import CheckInScreen from '../screens/main/CheckInScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import AIChatScreen from '../screens/main/AIChatScreen';
import CheckInDetailScreen from '../screens/main/CheckInDetailScreen';
import DiscoverScreen from '../screens/main/DiscoverScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ icon, focused }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icon}</Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0e8ff',
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#6c3fc5',
        tabBarInactiveTintColor: '#bbb',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Feed"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Trang chủ',
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarLabel: 'Gợi ý',
          tabBarIcon: ({ focused }) => <TabIcon icon="🌟" focused={focused} />,
          headerShown: true,
          headerTitle: '🌟 Địa điểm nổi tiếng',
          headerStyle: { backgroundColor: '#6c3fc5' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Tab.Screen
        name="CheckIn"
        component={CheckInScreen}
        options={{
          tabBarLabel: 'Check-in',
          tabBarIcon: ({ focused }) => <TabIcon icon="📍" focused={focused} />,
          headerShown: true,
          headerTitle: '📍 Check-in',
          headerStyle: { backgroundColor: '#6c3fc5' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Tab.Screen
        name="AIChat"
        component={AIChatScreen}
        options={{
          tabBarLabel: 'AI Chat',
          tabBarIcon: ({ focused }) => <TabIcon icon="🤖" focused={focused} />,
          headerShown: true,
          headerTitle: '🤖 Trợ lý AI',
          headerStyle: { backgroundColor: '#6c3fc5' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Tôi',
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
          headerShown: true,
          headerTitle: 'Hồ sơ',
          headerStyle: { backgroundColor: '#6c3fc5' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="CheckInDetail"
        component={CheckInDetailScreen}
        options={{
          title: 'Chi tiết check-in',
          headerStyle: { backgroundColor: '#6c3fc5' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f4ff' }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>📍</Text>
        <ActivityIndicator size="large" color="#6c3fc5" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
