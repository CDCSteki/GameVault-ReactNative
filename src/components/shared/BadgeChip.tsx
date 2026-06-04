import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../../theme/typography';

interface BadgeChipProps {
  text: string;
  color?: string;
  textColor?: string;
  style?: ViewStyle;
}

export function BadgeChip({ text, color, textColor, style }: BadgeChipProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: color ?? colors.accent + '26' },
        style,
      ]}
    >
      <Text
        style={[
          Typography.labelSmall,
          { color: textColor ?? colors.accent, fontWeight: '600' },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});