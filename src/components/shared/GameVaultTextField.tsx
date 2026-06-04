import React from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../../theme/typography';

interface GameVaultTextFieldProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  leadingIcon: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
  isPasswordVisible?: boolean;
  onTogglePasswordVisibility?: () => void;
  containerStyle?: ViewStyle;
  enabled?: boolean;
}

export function GameVaultTextField({
  value,
  onChangeText,
  placeholder,
  leadingIcon,
  isPassword = false,
  isPasswordVisible = false,
  onTogglePasswordVisibility,
  containerStyle,
  enabled = true,
  ...rest
}: GameVaultTextFieldProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: colors.border,
          backgroundColor: colors.card,
        },
        containerStyle,
      ]}
    >
      <Ionicons
        name={leadingIcon}
        size={20}
        color={colors.textMuted}
        style={styles.leadingIcon}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={isPassword && !isPasswordVisible}
        editable={enabled}
        style={[
          Typography.bodyMedium,
          styles.input,
          { color: colors.textPrimary },
        ]}
        {...rest}
      />
      {isPassword && onTogglePasswordVisibility && (
        <TouchableOpacity onPress={onTogglePasswordVisibility} style={styles.trailingIcon}>
          <Ionicons
            name={isPasswordVisible ? 'eye' : 'eye-off'}
            size={20}
            color={colors.textMuted}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
  },
  leadingIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
  },
  trailingIcon: {
    padding: 4,
  },
});