import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, FlatList, TextInput, Modal,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../../theme/typography';
import { useGameDetailStore } from '../../store/useGameDetailStore';
import { PlayStatus } from '../../data/db/entities';
import { formatReleaseDate, toPlaytimeString } from '../../utils/formatters';

interface GameDetailScreenProps {
  gameId: number;
  onBackClick: () => void;
}

export function GameDetailScreen({ gameId, onBackClick }: GameDetailScreenProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    gameDetail, screenshots, isLoading, errorMessage, snackbarMessage,
    isInCollection, isInWishlist, playStatus, userRating, userNotes, showNotesDialog,
    loadGameDetail, addToCollection, removeFromCollection,
    addToWishlist, removeFromWishlist, onPlayStatusChange,
    onRatingChange, onNotesChange, onSaveNotes, toggleNotesDialog, dismissSnackbar, retry,
  } = useGameDetailStore();

  useEffect(() => { loadGameDetail(gameId); }, [gameId]);

  useEffect(() => {
    if (snackbarMessage) {
      const timer = setTimeout(dismissSnackbar, 3000);
      return () => clearTimeout(timer);
    }
  }, [snackbarMessage]);

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (errorMessage && !gameDetail) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.statusRed} />
        <Text style={[Typography.bodyMedium, { color: colors.textSecondary, marginTop: 16, textAlign: 'center' }]}>
          {errorMessage}
        </Text>
        <TouchableOpacity
          onPress={() => retry(gameId)}
          style={[styles.retryBtn, { backgroundColor: colors.accent }]}
        >
          <Text style={[Typography.labelMedium, { color: colors.textPrimary }]}>{t('game_detail.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!gameDetail) return null;

  const sentimentPercent = Math.round((gameDetail.rating / 5) * 100);
  const pcPlatform = gameDetail.platforms?.find(p => p.platform.name.toLowerCase().includes('pc'));
  const requirements = pcPlatform?.requirements ?? pcPlatform?.requirements_en;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Hero */}
        <View style={styles.hero}>
          <Image source={{ uri: gameDetail.background_image ?? '' }} style={styles.heroImage} contentFit="cover" />
          <LinearGradient colors={['transparent', colors.background]} style={StyleSheet.absoluteFill} />
          <TouchableOpacity
            onPress={onBackClick}
            style={[styles.backBtn, { backgroundColor: 'rgba(0,0,0,0.5)', top: insets.top + 8 }]}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={[styles.titleSection, { marginTop: -16 }]}>
          <View style={styles.genreBadges}>
            {gameDetail.genres?.slice(0, 2).map((g) => (
              <View key={g.id} style={[styles.genreBadge, { backgroundColor: colors.accent + '33', borderColor: colors.accent + '80' }]}>
                <Text style={[Typography.labelSmall, { color: colors.accent }]}>{g.name.toUpperCase()}</Text>
              </View>
            ))}
          </View>
          <Text style={[Typography.displayMedium, { color: colors.textPrimary, fontWeight: '800', marginTop: 8 }]}>
            {gameDetail.name}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={isInCollection ? () => removeFromCollection(gameId) : () => addToCollection(gameId)}
            style={[styles.actionBtn, { overflow: 'hidden' }]}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={isInCollection ? [colors.statusGreen, colors.statusGreen + 'B3'] : [colors.accent, colors.accent + 'B3']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.actionBtnGradient}
            >
              <Ionicons name={isInCollection ? 'checkmark-circle' : 'add'} size={16} color={colors.textPrimary} />
              <Text numberOfLines={1} adjustsFontSizeToFit style={[Typography.labelSmall, { color: colors.textPrimary, fontWeight: '700', marginLeft: 6 , flexShrink: 1,}]}>
                {isInCollection ? t('game_detail.in_collection') : t('game_detail.add_to_collection')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={isInCollection ? undefined : isInWishlist ? () => removeFromWishlist(gameId) : () => addToWishlist(gameId)}
            style={[
              styles.actionBtn,
              {
                borderWidth: 1,
                borderColor: isInCollection ? colors.textMuted + '4D' : isInWishlist ? colors.statusYellow : colors.border,
                backgroundColor: isInWishlist && !isInCollection ? colors.statusYellow + '1A' : 'transparent',
                justifyContent: 'center', alignItems: 'center', flexDirection: 'row',
              },
            ]}
            disabled={isInCollection}
          >
            <Ionicons
              name={isInCollection ? 'ban' : isInWishlist ? 'bookmark' : 'bookmark-outline'}
              size={16}
              color={isInCollection ? colors.textMuted + '4D' : isInWishlist ? colors.statusYellow : colors.textSecondary}
            />
            <Text numberOfLines={1} adjustsFontSizeToFit style={[
              Typography.labelSmall,
              {
                color: isInCollection ? colors.textMuted + '4D' : isInWishlist ? colors.statusYellow : colors.textSecondary,
                fontWeight: '700', marginLeft: 6, flexShrink: 1
              },
            ]}>
              {isInCollection ? t('game_detail.in_collection') : t('game_detail.wishlist')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Play Status */}
        {isInCollection && (
          <View style={[styles.section, { paddingHorizontal: 16 }]}>
            <Text style={[Typography.labelSmall, { color: colors.textMuted, letterSpacing: 1, marginBottom: 8 }]}>
              {t('game_detail.play_status')}
            </Text>
            <View style={styles.statusRow}>
              {(['NOT_PLAYED', 'PLAYING', 'PLAYED'] as PlayStatus[]).map((s) => {
                const isSelected = playStatus === s;
                const statusColor = s === 'NOT_PLAYED' ? colors.textMuted : s === 'PLAYING' ? colors.accentSecondary : colors.statusGreen;
                
                const statusLabel = 
                  s === 'NOT_PLAYED' ? t('game_detail.not_played') : 
                  s === 'PLAYING' ? t('game_detail.playing') : 
                  t('game_detail.played');

                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => onPlayStatusChange(gameId, s)}
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor: isSelected ? statusColor + '26' : colors.card,
                        borderColor: isSelected ? statusColor : colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={s === 'NOT_PLAYED' ? 'radio-button-off-outline' : s === 'PLAYING' ? 'play-circle-outline' : 'checkmark-circle-outline'}
                      size={14} color={isSelected ? statusColor : colors.textMuted}
                    />
                    <Text style={[Typography.labelSmall, { color: isSelected ? statusColor : colors.textMuted, marginLeft: 4, fontWeight: isSelected ? '700' : '400' }]}>
                      {statusLabel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Info Grid */}
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <View style={styles.infoRow}>
            <InfoItem label={t('game_detail.developer')} value={gameDetail.developers?.[0]?.name ?? t('game_detail.na')} colors={colors} />
            <InfoItem label={t('game_detail.release')} value={formatReleaseDate(gameDetail.released) ?? t('game_detail.na')} colors={colors} />
          </View>
          <View style={{ height: 12 }} />
          <View style={styles.infoRow}>
            <InfoItem label={t('game_detail.platform')} value={gameDetail.platforms?.slice(0, 3).map(p => p.platform.name).join(', ') ?? t('game_detail.na')} colors={colors} />
            <InfoItem label={t('game_detail.playtime')} value={toPlaytimeString(gameDetail.playtime) ?? t('game_detail.na')} colors={colors} />
          </View>
        </View>

        {/* PC Requirements */}
        {(requirements?.minimum || requirements?.recommended) && (
          <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionBar, { backgroundColor: colors.accentSecondary }]} />
              <Text style={[Typography.titleMedium, { color: colors.textPrimary, fontWeight: '700' }]}>
                {t('game_detail.pc_requirements')}
              </Text>
            </View>
            {requirements.minimum && (
              <Text style={[Typography.bodySmall, { color: colors.textSecondary, lineHeight: 20 }]}>
                {requirements.minimum}
              </Text>
            )}
            {requirements.recommended && (
              <Text style={[Typography.bodySmall, { color: colors.textSecondary, lineHeight: 20, marginTop: 12 }]}>
                {requirements.recommended}
              </Text>
            )}
          </View>
        )}

        {/* Private Notes & Rating */}
        <View style={[styles.notesCard, { backgroundColor: colors.card, borderColor: colors.accent + '4D' }]}>
          <View style={styles.notesHeader}>
            <Text style={[Typography.titleMedium, { color: colors.textPrimary, fontWeight: '700' }]}>
              {t('game_detail.private_notes')}
            </Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => onRatingChange(gameId, star)}>
                  <Ionicons
                    name={userRating >= star ? 'star' : 'star-outline'}
                    size={24}
                    color={userRating >= star ? colors.statusYellow : colors.textMuted}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity
            onPress={toggleNotesDialog}
            style={[styles.notesPreview, { backgroundColor: colors.backgroundSecondary }]}
          >
            <Text
              style={[Typography.bodySmall, { color: userNotes ? colors.textSecondary : colors.textMuted }]}
              numberOfLines={3}
            >
              {userNotes || t('game_detail.notes_empty')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        {gameDetail.description_raw && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionBar, { backgroundColor: colors.accent }]} />
              <Text style={[Typography.titleMedium, { color: colors.textPrimary, fontWeight: '700' }]}>
                {t('game_detail.about_game')}
              </Text>
            </View>
            <Text style={[Typography.bodyMedium, { color: colors.textSecondary }]} numberOfLines={6}>
              {gameDetail.description_raw}
            </Text>
          </View>
        )}

        {/* Screenshots */}
        {screenshots.length > 0 && (
          <View style={{ paddingVertical: 8 }}>
            <Text style={[Typography.titleMedium, { color: colors.textPrimary, fontWeight: '700', paddingHorizontal: 16, marginBottom: 8 }]}>
              {t('game_detail.screenshots')}
            </Text>
            <FlatList
              data={screenshots.slice(0, 8)}
              keyExtractor={(item) => String(item.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
              renderItem={({ item }) => (
                <Image source={{ uri: item.image }} style={styles.screenshot} contentFit="cover" />
              )}
            />
          </View>
        )}

        {/* User Sentiment */}
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={[Typography.labelSmall, { color: colors.textMuted, letterSpacing: 1, marginBottom: 8 }]}>
            {t('game_detail.user_sentiment')}
          </Text>
          <View style={styles.sentimentRow}>
            <Text style={[Typography.headlineLarge, { color: colors.accentSecondary, fontWeight: '800' }]}>
              {sentimentPercent}%
            </Text>
            <View style={[styles.sentimentBar, { backgroundColor: colors.backgroundSecondary }]}>
              <View style={[styles.sentimentFill, { width: `${sentimentPercent}%` as any, backgroundColor: colors.accentSecondary }]} />
            </View>
          </View>
          {gameDetail.ratings?.slice(0, 3).map((r) => (
            <View key={r.id} style={styles.ratingRow}>
              <Text style={[Typography.labelMedium, { color: colors.textSecondary, width: 100 }]}>
                {r.title.charAt(0).toUpperCase() + r.title.slice(1)}
              </Text>
              <View style={[styles.ratingBarBg, { backgroundColor: colors.backgroundSecondary }]}>
                <View style={[styles.ratingBarFill, { width: `${r.percent}%` as any, backgroundColor: colors.accent }]} />
              </View>
              <Text style={[Typography.labelSmall, { color: colors.textMuted, width: 40, textAlign: 'right' }]}>
                {Math.round(r.percent)}%
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Snackbar */}
      {snackbarMessage && (
        <View style={[styles.snackbar, { backgroundColor: colors.card }]}>
          <Text style={[Typography.bodyMedium, { color: colors.textPrimary }]}>{snackbarMessage}</Text>
        </View>
      )}

      {/* Notes Dialog */}
      <Modal transparent visible={showNotesDialog} animationType="fade" onRequestClose={toggleNotesDialog}>
        <View style={styles.dialogOverlay}>
          <View style={[styles.dialog, { backgroundColor: colors.card }]}>
            <Text style={[Typography.titleMedium, { color: colors.textPrimary, fontWeight: '700', marginBottom: 12 }]}>
              {t('game_detail.private_notes')}
            </Text>
            <TextInput
              value={userNotes}
              onChangeText={onNotesChange}
              placeholder={t('game_detail.notes_placeholder')}
              placeholderTextColor={colors.textMuted}
              multiline
              style={[
                Typography.bodySmall,
                styles.notesInput,
                { color: colors.textPrimary, backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
              ]}
            />
            <View style={styles.dialogActions}>
              <TouchableOpacity onPress={toggleNotesDialog}>
                <Text style={[Typography.labelMedium, { color: colors.textSecondary }]}>{t('game_detail.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onSaveNotes(gameId)}
                style={[styles.saveBtn, { backgroundColor: colors.accent }]}
              >
                <Text style={[Typography.labelMedium, { color: colors.textPrimary }]}>{t('game_detail.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function InfoItem({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={[Typography.labelSmall, { color: colors.textMuted, letterSpacing: 1 }]}>{label}</Text>
      <Text style={[Typography.bodyMedium, { color: colors.textPrimary, fontWeight: '600', marginTop: 4 }]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, marginTop: 16 },
  hero: { height: 280, position: 'relative' },
  heroImage: { ...StyleSheet.absoluteFill },
  backBtn: { position: 'absolute', left: 16, padding: 8, borderRadius: 8 },
  titleSection: { paddingHorizontal: 16 },
  genreBadges: { flexDirection: 'row', gap: 8 },
  genreBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, borderWidth: 1 },
  actionButtons: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 8 },
  actionBtn: { flex: 1, height: 48, borderRadius: 12, overflow: 'hidden' },
  actionBtnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  section: { padding: 16 },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  infoCard: { margin: 16, borderRadius: 12, padding: 16 },
  infoRow: { flexDirection: 'row' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionBar: { width: 3, height: 20, borderRadius: 2 },
  notesCard: { margin: 16, borderRadius: 12, borderWidth: 1, padding: 16 },
  notesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  starsRow: { flexDirection: 'row' },
  notesPreview: { borderRadius: 8, padding: 12 },
  screenshot: { width: 200, height: 120, borderRadius: 10 },
  sentimentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  sentimentBar: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  sentimentFill: { height: '100%', borderRadius: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3 },
  ratingBarBg: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden', marginHorizontal: 8 },
  ratingBarFill: { height: '100%', borderRadius: 3 },
  snackbar: { position: 'absolute', bottom: 90, left: 16, right: 16, borderRadius: 8, padding: 14, alignItems: 'center' },
  dialogOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  dialog: { width: '85%', borderRadius: 16, padding: 20 },
  notesInput: { height: 150, borderWidth: 1, borderRadius: 12, padding: 12, textAlignVertical: 'top', marginBottom: 16 },
  dialogActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, alignItems: 'center' },
  saveBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
});