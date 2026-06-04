import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../../theme/typography';
import {
  getPasswordStrength,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
} from '../../utils/formatters';

interface Props {
  password: string;
}

export function PasswordStrengthIndicator({ password }: Props) {
  const { colors } = useTheme();
  const strength = getPasswordStrength(password);
  const label = getPasswordStrengthLabel(strength);
  const color = getPasswordStrengthColor(strength);

  return (
    <View>
      <View style={styles.labelRow}>
        <Text style={[Typography.labelSmall, { color: colors.textMuted }]}>
          Password strength
        </Text>
        <Text style={[Typography.labelSmall, { color, fontWeight: '700' }]}>
          {label}
        </Text>
      </View>
      <View style={styles.barsRow}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.bar,
              {
                backgroundColor: index < strength ? color : colors.backgroundSecondary,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  barsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
});