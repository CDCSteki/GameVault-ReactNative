import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../../theme/typography';

interface SplashScreenProps {
  isLoggedIn: boolean;
  onNavigateToHome: () => void;
  onNavigateToLogin: () => void;
}

export function SplashScreen({
  isLoggedIn,
  onNavigateToHome,
  onNavigateToLogin,
}: SplashScreenProps) {
  const { colors } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoggedIn) {
        onNavigateToHome();
      } else {
        onNavigateToLogin();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [isLoggedIn]);

  return (
    <LinearGradient
      colors={[colors.backgroundSecondary, colors.background]}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text
          style={[
            Typography.displayLarge,
            {
              color: colors.accent,
              fontWeight: '800',
              letterSpacing: 4,
            },
          ]}
        >
          GAMEVAULT
        </Text>
        <Text
          style={[
            Typography.titleMedium,
            { color: colors.textMuted, marginTop: 8 },
          ]}
        >
          Your Gaming Universe
        </Text>
        <ActivityIndicator
          color={colors.accent}
          size="small"
          style={styles.loader}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  loader: {
    marginTop: 48,
  },
});