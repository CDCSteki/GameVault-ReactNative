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
import { PasswordStrengthIndicator } from '../shared/PasswordStrengthIndicator';
import { useRegisterStore } from '../../store/useAuthStore';

interface RegisterScreenProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
}

export function RegisterScreen({ onRegisterSuccess, onNavigateToLogin }: RegisterScreenProps) {
  const { colors } = useTheme();
  const {
    username, email, password, confirmPassword,
    isPasswordVisible, isConfirmPasswordVisible,
    isLoading, errorMessage,
    setUsername, setEmail, setPassword, setConfirmPassword,
    togglePasswordVisibility, toggleConfirmPasswordVisibility,
    register,
  } = useRegisterStore();

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
          <View
            style={[
              styles.card,
              { backgroundColor: '#0D1726F2', borderColor: colors.accentSecondary },
            ]}
          >
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
                { color: colors.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 32 },
              ]}
            >
              Create your account
            </Text>

            {/* Username */}
            <Text style={[Typography.labelMedium, { color: colors.textSecondary, marginBottom: 8 }]}>
              Username
            </Text>
            <GameVaultTextField
              value={username}
              onChangeText={setUsername}
              placeholder="Choose a username"
              leadingIcon="person-outline"
              autoCapitalize="none"
              returnKeyType="next"
            />

            <View style={{ height: 16 }} />

            {/* Email */}
            <Text style={[Typography.labelMedium, { color: colors.textSecondary, marginBottom: 8 }]}>
              Email
            </Text>
            <GameVaultTextField
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              leadingIcon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />

            <View style={{ height: 16 }} />

            {/* Password */}
            <Text style={[Typography.labelMedium, { color: colors.textSecondary, marginBottom: 8 }]}>
              Password
            </Text>
            <GameVaultTextField
              value={password}
              onChangeText={setPassword}
              placeholder="Min. 6 characters"
              leadingIcon="lock-closed-outline"
              isPassword
              isPasswordVisible={isPasswordVisible}
              onTogglePasswordVisibility={togglePasswordVisibility}
              returnKeyType="next"
            />
            {password.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <PasswordStrengthIndicator password={password} />
              </View>
            )}

            <View style={{ height: 16 }} />

            {/* Confirm Password */}
            <Text style={[Typography.labelMedium, { color: colors.textSecondary, marginBottom: 8 }]}>
              Confirm Password
            </Text>
            <GameVaultTextField
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repeat your password"
              leadingIcon="lock-closed-outline"
              isPassword
              isPasswordVisible={isConfirmPasswordVisible}
              onTogglePasswordVisibility={toggleConfirmPasswordVisibility}
              returnKeyType="done"
              onSubmitEditing={() => register(onRegisterSuccess)}
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

            <GradientButton
              text="CREATE ACCOUNT"
              onPress={() => register(onRegisterSuccess)}
              isLoading={isLoading}
            />

            <View style={{ height: 20 }} />

            <View style={styles.loginRow}>
              <Text style={[Typography.bodySmall, { color: colors.textSecondary }]}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={onNavigateToLogin}>
                <Text
                  style={[Typography.bodySmall, { color: colors.accent, fontWeight: '700' }]}
                >
                  Sign In
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
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});