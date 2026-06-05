import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Typography } from '../../theme/typography';

interface OfflineStateProps {
  message: string;
  onRetry: () => void;
  colors: any;
}

export function OfflineState({ message, onRetry, colors }: OfflineStateProps) {
  const { t } = useTranslation();
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
      <Ionicons name="cloud-offline" size={72} color={colors.textMuted} />
      <Text style={[Typography.bodyMedium, { color: colors.textMuted, textAlign: 'center', marginTop: 16, marginBottom: 24 }]}>
        {message}
      </Text>
      <TouchableOpacity
        style={{ backgroundColor: colors.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
        onPress={onRetry}
      >
        <Text style={[Typography.labelLarge, { color: colors.textPrimary, fontWeight: '700' }]}>
          {t('home.retry') || 'Retry'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}