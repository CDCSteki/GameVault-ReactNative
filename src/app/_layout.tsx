import { useEffect } from 'react';
import '../locales/i18n';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../theme/ThemeContext';
import { useAppStore } from '../store/useAppStore';
import { getDatabase } from '../data/db/database';
import { getThemeColors } from '../theme/colors';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({});

  const { isLoggedIn, appTheme, isInitialized, initialize } = useAppStore();
  const router = useRouter();
  const segments = useSegments();

  const themeColors = getThemeColors(appTheme); 

  useEffect(() => {
    async function boot() {
      await getDatabase();   
      await initialize();    
    }
    boot();
  }, []);

  useEffect(() => {
    if (isInitialized && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isInitialized, fontsLoaded]);

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
    return null; 
  }

  return (
    // <-- 3. Adăugarea background-ului pe containerul root
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <SafeAreaProvider>
        <ThemeProvider theme={appTheme}>
          <StatusBar style="light" />
          <Stack 
            screenOptions={{ 
              headerShown: false,
              // <-- 4. Setarea culorii de conținut pe stiva de navigare
              contentStyle: { backgroundColor: themeColors.background } 
            }}
          >
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