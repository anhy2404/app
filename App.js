import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { CheckInProvider } from './src/context/CheckInContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <CheckInProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </CheckInProvider>
    </AuthProvider>
  );
}
