// App.tsx
// קובץ ראשי של האפליקציה - גרסה מתוקנת

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { View, ActivityIndicator, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Redux Store
import { store, persistor } from './src/store';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Utils
import './src/utils/i18n'; // אתחול i18n
import { theme } from './src/utils/theme';

// הסתרת warnings מסוימים בפיתוח (אופציונלי)
LogBox.ignoreLogs([
  'AsyncStorage has been extracted',
  'Setting a timer',
  'Non-serializable values were found',
  'Warning: componentWillReceiveProps has been renamed',
  'Remote debugger',
]);

// קומפוננטת טעינה למצב Persist
const LoadingScreen: React.FC = () => (
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
  </View>
);

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar 
              style="light" // תמיד לבן כי אנחנו ב-dark mode
              backgroundColor={theme.colors.background}
            />
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;