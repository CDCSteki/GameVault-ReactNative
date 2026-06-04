import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../theme/ThemeContext';
import { useAppStore } from '../store/useAppStore';
import { getDatabase } from '../data/db/database';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({});

  const { isLoggedIn, appTheme, isInitialized, initialize } = useAppStore();
  const router = useRouter();
  const segments = useSegments();

  // Init DB + preferences on startup
  useEffect(() => {
    async function boot() {
      await getDatabase();   // initializes SQLite tables
      await initialize();    // loads prefs (theme, language, auth)
    }
    boot();
  }, []);

  // Hide splash once ready
  useEffect(() => {
    if (isInitialized && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isInitialized, fontsLoaded]);

  // Auth guard — redirect based on login state
  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!isLoggedIn && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (isLoggedIn && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isLoggedIn, isInitialized, segments]);

  if (!isInitialized || !fontsLoaded) {
    return null; // Keep native splash visible
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider theme={appTheme}>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="auth/register" />
            <Stack.Screen
              name="game/[id]"
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="game/list/[listType]"
              options={{ animation: 'slide_from_right' }}
            />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}