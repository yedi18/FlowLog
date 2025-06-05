// src/navigation/AppNavigator.tsx
// נווט ראשי של האפליקציה - גרסה מתוקנת

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { theme } from '../utils/theme';
import { RootStackParamList } from '../types';

// Import navigators - תיקון שמות הקבצים
import AuthNavigator from './AuthNavigator';
import MainTabs from './MainTabs'; // שינוי מ-MainTabNavigator ל-MainTabs

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { user, isAuthenticated, isLoading, error } = useAuth();

  console.log('AppNavigator: Rendering with state:', {
    isLoading,
    isAuthenticated,
    hasUser: !!user,
    error,
  });

  // מסך טעינה בזמן בדיקת מצב האימות
  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
      }}>
        <ActivityIndicator 
          size="large" 
          color={theme.colors.primary} 
        />
        <Text style={{
          marginTop: 16,
          fontSize: 16,
          color: theme.colors.text,
        }}>
          Loading...
        </Text>
      </View>
    );
  }

  // אם יש שגיאה
  if (error) {
    console.log('AppNavigator: Error state:', error);
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        padding: 20,
      }}>
        <Text style={{
          fontSize: 16,
          color: theme.colors.error,
          textAlign: 'center',
          marginBottom: 20,
        }}>
          Authentication Error: {error}
        </Text>
        <Text style={{
          fontSize: 14,
          color: theme.colors.textSecondary,
          textAlign: 'center',
        }}>
          Please restart the app
        </Text>
      </View>
    );
  }

  console.log('AppNavigator: Rendering navigator for authenticated:', isAuthenticated);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {isAuthenticated && user ? (
        // אם המשתמש מחובר - הצג את המסכים הראשיים
        <Stack.Screen
          name="Main"
          component={MainTabs} // שינוי ל-MainTabs
          options={{ animationTypeForReplace: 'push' }}
        />
      ) : (
        // אם המשתמש לא מחובר - הצג מסכי אימות
        <Stack.Screen
          name="Auth"
          component={AuthNavigator}
          options={{ animationTypeForReplace: 'push' }}
        />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;