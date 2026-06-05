import React, { useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Modal, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../../theme/typography';
import { GameVaultTopBar } from '../shared/GameVaultTopBar';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAppStore } from '../../store/useAppStore';
import { THEME_OPTIONS, AppTheme } from '../../theme/colors';

interface SettingsScreenProps {
  onAccountDeleted: () => void;
}

export function SettingsScreen({ onAccountDeleted }: SettingsScreenProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { userId } = useAppStore();
  const {
    appTheme, language, showDeleteDialog, historyCleared,
    loadSettings, selectTheme, changeLanguage,
    clearSearchHistory, showDeleteAccountDialog,
    dismissDeleteAccountDialog, deleteAccount,
  } = useSettingsStore();

  useEffect(() => { loadSettings(); }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <GameVaultTopBar />

        <View style={{ height: 8 }} />

        {/* System Preferences */}
        <SettingsSectionCard borderColor={colors.border} colors={colors}>
          <SectionHeader icon="settings-outline" title={t('settings.system_preferences')} iconColor={colors.accent} colors={colors} />

          {/* Theme Selector */}
          <View style={{ padding: 16 }}>
            <Text style={[Typography.bodyMedium, { color: colors.textPrimary, marginBottom: 12 }]}>
                {t('settings.display_theme')}
            </Text>
            <FlatList
              data={THEME_OPTIONS}
              keyExtractor={(item) => item.theme}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
              renderItem={({ item }) => (
                <ThemeOption
                  theme={item.theme}
                  label={t(`themes.${item.theme}`)}
                  emoji={item.emoji}
                  isSelected={appTheme === item.theme}
                  onPress={() => selectTheme(item.theme)}
                  colors={colors}
                />
              )}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border + '4D' }]} />

          {/* Language Selector */}
          <View style={{ padding: 16 }}>
            <Text style={[Typography.bodyMedium, { color: colors.textPrimary, marginBottom: 10 }]}>
              {t('settings.system_language')}
            </Text>
            <View style={styles.langRow}>
              {[
                { code: 'en', flag: '🇬🇧', name: t('settings.language_english') },
                { code: 'ro', flag: '🇷🇴', name: t('settings.language_romanian') },
              ].map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    onPress={() => changeLanguage(lang.code)}
                    style={[
                      styles.langChip,
                      {
                        backgroundColor: isSelected ? colors.accent + '33' : colors.backgroundSecondary,
                        borderColor: isSelected ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 18 }}>{lang.flag}</Text>
                    <Text
                      style={[
                        Typography.bodySmall,
                        {
                          color: isSelected ? colors.accent : colors.textSecondary,
                          fontWeight: isSelected ? '700' : '400',
                          marginLeft: 8,
                        },
                      ]}
                    >
                      {lang.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </SettingsSectionCard>

        <View style={{ height: 12 }} />

        {/* Privacy & Data */}
        <SettingsSectionCard borderColor={colors.border} colors={colors}>
          <SectionHeader icon="lock-closed-outline" title={t('settings.privacy_data')} iconColor={colors.accent} colors={colors} />
          <View style={styles.settingsRow}>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.bodyMedium, { color: colors.textPrimary }]}>
                {t('settings.search_history')}
              </Text>
              <Text style={[Typography.bodySmall, { color: colors.textMuted }]}>
                {historyCleared ? t('settings.cleared') : t('settings.last_cleared_never')}
              </Text>
            </View>
            <TouchableOpacity onPress={clearSearchHistory}>
              <Text style={[Typography.labelSmall, { color: colors.accentSecondary }]}>{t('settings.clear_now')}</Text>
            </TouchableOpacity>
          </View>
        </SettingsSectionCard>

        <View style={{ height: 12 }} />

        {/* Account Control */}
        <SettingsSectionCard borderColor={colors.statusRed + '66'} colors={colors}>
          <SectionHeader icon="warning-outline" title={t('settings.account_control')} iconColor={colors.statusRed} colors={colors} />
          <View style={{ padding: 16, gap: 8 }}>
            <Text style={[Typography.titleMedium, { color: colors.textPrimary, fontWeight: '700' }]}>
              {t('settings.deactivate_account')}
            </Text>
            <Text style={[Typography.bodySmall, { color: colors.textSecondary }]}>
              {t('settings.deactivate_desc')}
            </Text>
            <View style={{ height: 4 }} />
            <TouchableOpacity
              onPress={showDeleteAccountDialog}
              style={[styles.deleteBtn, { borderColor: colors.statusRed }]}
            >
              <Text style={[Typography.labelMedium, { color: colors.statusRed, fontWeight: '700', letterSpacing: 1 }]}>
                {t('settings.delete_profile')}
              </Text>
            </TouchableOpacity>
          </View>
        </SettingsSectionCard>

      </ScrollView>

      {/* Delete Account Dialog */}
      <Modal
        transparent
        visible={showDeleteDialog}
        animationType="fade"
        onRequestClose={dismissDeleteAccountDialog}
      >
        <View style={styles.dialogOverlay}>
          <View style={[styles.dialog, { backgroundColor: colors.card }]}>
            <Text style={[Typography.titleLarge, { color: colors.statusRed, fontWeight: '700', marginBottom: 12 }]}>
                {t('settings.delete_account_title')}
            </Text>
            <Text style={[Typography.bodyMedium, { color: colors.textSecondary, marginBottom: 24 }]}>
              {t('settings.delete_account_desc')}
            </Text>
            <View style={styles.dialogActions}>
              <TouchableOpacity
                onPress={dismissDeleteAccountDialog}
                style={[styles.dialogCancelBtn, { borderColor: colors.border }]}
              >
                <Text style={[Typography.labelMedium, { color: colors.textSecondary }]}>{t('settings.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteAccount(userId, onAccountDeleted)}
                style={[styles.dialogDeleteBtn, { backgroundColor: colors.statusRed }]}
              >
                <Text style={[Typography.labelMedium, { color: colors.textPrimary }]}>{t('settings.delete')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SettingsSectionCard({ borderColor, colors, children }: {
  borderColor: string; colors: any; children: React.ReactNode;
}) {
  return (
    <View
      style={[
        styles.sectionCard,
        { borderColor, backgroundColor: colors.card },
      ]}
    >
      {children}
    </View>
  );
}

function SectionHeader({ icon, title, iconColor, colors }: {
  icon: any; title: string; iconColor: string; colors: any;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={16} color={iconColor} />
      <Text style={[Typography.labelSmall, { color: iconColor, fontWeight: '700', letterSpacing: 1, marginLeft: 8 }]}>
        {title}
      </Text>
    </View>
  );
}

function ThemeOption({ theme, label, emoji, isSelected, onPress, colors }: {
  theme: AppTheme; label: string; emoji: string;
  isSelected: boolean; onPress: () => void; colors: any;
}) {
  // Get the theme's own accent colors for the circle
  const { getThemeColors } = require('../../theme/colors');
  const themeColors = getThemeColors(theme);

  return (
    <TouchableOpacity onPress={onPress} style={styles.themeOption}>
      <LinearGradient
        colors={[themeColors.accent, themeColors.accentSecondary]}
        style={[
          styles.themeCircle,
          isSelected && { borderWidth: 3, borderColor: colors.textPrimary },
        ]}
      >
        {isSelected ? (
          <Ionicons name="checkmark" size={22} color="#FFFFFF" />
        ) : (
          <Text style={{ fontSize: 22 }}>{emoji}</Text>
        )}
      </LinearGradient>
      <Text
        style={[
          Typography.labelSmall,
          {
            color: isSelected ? colors.accent : colors.textMuted,
            fontWeight: isSelected ? '700' : '400',
            marginTop: 6,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  divider: { height: 1 },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  langRow: { flexDirection: 'row', gap: 10 },
  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  deleteBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  themeOption: { alignItems: 'center', minWidth: 60 },
  themeCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialog: {
    width: '85%',
    borderRadius: 16,
    padding: 24,
  },
  dialogActions: { flexDirection: 'row', gap: 12 },
  dialogCancelBtn: {
    flex: 1, height: 44, borderRadius: 8, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  dialogDeleteBtn: {
    flex: 1, height: 44, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
});