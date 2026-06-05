import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../../theme/typography';
import { GameVaultTextField } from '../shared/GameVaultTextField';
import { GradientButton } from '../shared/GradientButton';
import { useLoginStore } from '../../store/useAuthStore';
import { useTranslation } from 'react-i18next';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onNavigateToRegister: () => void;
}

export function LoginScreen({ onLoginSuccess, onNavigateToRegister }: LoginScreenProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const {
    emailOrUsername, password,
    isPasswordVisible, isLoading, errorMessage,
    setEmailOrUsername, setPassword,
    togglePasswordVisibility, login,
  } = useLoginStore();

  return (
    <LinearGradient
      colors={[colors.backgroundSecondary, colors.background]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Card */}
          <View
            style={[
              styles.card,
              { backgroundColor: '#0D1726F2', borderColor: colors.accentSecondary },
            ]}
          >
            {/* Title */}
            <Text
              style={[
                Typography.displayMedium,
                { color: colors.accent, fontWeight: '800', letterSpacing: 3, textAlign: 'center' },
              ]}
            >
              GAMEVAULT
            </Text>
            <Text
              style={[
                Typography.titleMedium,
                { color: colors.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 36 },
              ]}
            >
              {t('login.welcome')}
            </Text>

            {/* Email */}
            <Text style={[Typography.labelMedium, { color: colors.textSecondary, marginBottom: 8 }]}>
              {t('login.email_username_txt')}
            </Text>
            <GameVaultTextField
              value={emailOrUsername}
              onChangeText={setEmailOrUsername}
              placeholder={t('login.email_username_placeholder')}
              leadingIcon="person-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />

            <View style={{ height: 20 }} />

            {/* Password */}
            <Text style={[Typography.labelMedium, { color: colors.textSecondary, marginBottom: 8 }]}>
              {t('login.password_txt')}
            </Text>
            <GameVaultTextField
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              leadingIcon="lock-closed-outline"
              isPassword
              isPasswordVisible={isPasswordVisible}
              onTogglePasswordVisibility={togglePasswordVisibility}
              returnKeyType="done"
              onSubmitEditing={() => login(onLoginSuccess)}
            />

            {/* Error */}
            {errorMessage && (
              <Text
                style={[
                  Typography.bodySmall,
                  { color: colors.statusRed, textAlign: 'center', marginTop: 12 },
                ]}
              >
                {errorMessage}
              </Text>
            )}

            <View style={{ height: 28 }} />

            {/* Button */}
            <GradientButton
              text={t('login.login_btn')}
              onPress={() => login(onLoginSuccess)}
              isLoading={isLoading}
            />

            <View style={{ height: 20 }} />

            {/* Register link */}
            <View style={styles.registerRow}>
              <Text style={[Typography.bodySmall, { color: colors.textSecondary }]}>
                {t('login.no_account')}
              </Text>
              <TouchableOpacity onPress={onNavigateToRegister}>
                <Text
                  style={[
                    Typography.bodySmall,
                    { color: colors.accent, fontWeight: '700', paddingRight: 2 },
                  ]}
                >
                  {t('login.sign_up_link')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});