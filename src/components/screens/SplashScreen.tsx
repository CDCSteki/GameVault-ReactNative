import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../../theme/typography';

interface SplashScreenProps {
  isLoggedIn?: boolean;
  onNavigateToHome?: () => void;
  onNavigateToLogin?: () => void;
}

export function SplashScreen({ 
  isLoggedIn, 
  onNavigateToHome, 
  onNavigateToLogin 
}: SplashScreenProps) {
  const { colors } = useTheme();

  useEffect(() => {
    if (onNavigateToHome && onNavigateToLogin) {
      const timer = setTimeout(() => {
        if (isLoggedIn) {
          onNavigateToHome();
        } else {
          onNavigateToLogin();
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, onNavigateToHome, onNavigateToLogin]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.backgroundSecondary, colors.accent]}
        start={{ x: 0.5, y: 0.2 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
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
        
        <View style={{ height: 8 }} />
        
        <Text
          style={[
            Typography.titleMedium,
            {
              color: colors.textMuted,
            },
          ]}
        >
          Your Gaming Universe
        </Text>
        
        <View style={{ height: 48 }} />
        
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});