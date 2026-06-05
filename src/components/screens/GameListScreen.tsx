import React, { useEffect } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../../theme/typography';
import { BadgeChip } from '../shared/BadgeChip';
import { useGameListStore } from '../../store/useGameListStore';
import { GameDto } from '../../data/remote/dto/GameDto';
import { formatRating, extractYear } from '../../utils/formatters';

interface GameListScreenProps {
  listType: string;
  onGameClick: (gameId: number) => void;
  onBackClick: () => void;
}

export function GameListScreen({ listType, onGameClick, onBackClick }: GameListScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { title, games, isLoading, errorMessage, pageSize, loadGames, onPageSizeChange, retry } =
    useGameListStore();

  useEffect(() => { loadGames(listType); }, [listType]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Bar */}
      <LinearGradient
        colors={[colors.accent + '40', colors.background]}
        style={[styles.topBar, { paddingTop: insets.top + 8 }]}
      >
        <TouchableOpacity
          onPress={onBackClick}
          style={[styles.backBtn, { backgroundColor: colors.card }]}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text
          style={[Typography.headlineSmall, { color: colors.accent, fontWeight: '800' }]}
        >
          {title}
        </Text>
      </LinearGradient>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : errorMessage ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.statusRed} />
          <Text style={[Typography.bodyMedium, { color: colors.textSecondary, marginTop: 16, textAlign: 'center' }]}>
            {errorMessage}
          </Text>
          <TouchableOpacity
            onPress={() => retry(listType)}
            style={[styles.retryBtn, { backgroundColor: colors.accent }]}
          >
            <Text style={[Typography.labelMedium, { color: colors.textPrimary }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : games.length === 0 ? (
        <View style={styles.center}>
          <Text style={[Typography.bodyMedium, { color: colors.textMuted }]}>No results found</Text>
        </View>
      ) : (
        <FlatList
          data={games}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListHeaderComponent={
            <PageSizeSelector
              currentSize={pageSize}
              totalShown={games.length}
              onSizeChange={(s) => onPageSizeChange(listType, s)}
              colors={colors}
            />
          }
          renderItem={({ item }) => (
            <GameListCard
              game={item}
              onClick={() => onGameClick(item.id)}
              colors={colors}
            />
          )}
        />
      )}
    </View>
  );
}

// ─── Page Size Selector ───────────────────────────────────────────────────────

function PageSizeSelector({ currentSize, totalShown, onSizeChange, colors }: {
  currentSize: number; totalShown: number; onSizeChange: (s: number) => void; colors: any;
}) {
  const options = [10, 20, 40];
  return (
    <View style={styles.pageSizeContainer}>
      <Text style={[Typography.labelSmall, { color: colors.accent, letterSpacing: 1 }]}>
        Showing {totalShown} titles
      </Text>
      <View style={styles.pageSizeRight}>
        <Text style={[Typography.labelSmall, { color: colors.textMuted }]}>Show:</Text>
        {options.map((size) => {
          const isSelected = currentSize === size;
          return (
            <TouchableOpacity
              key={size}
              onPress={() => { if (!isSelected) onSizeChange(size); }}
              style={[
                styles.pageSizeChip,
                {
                  backgroundColor: isSelected ? colors.accent : colors.card,
                  borderColor: isSelected ? colors.accent : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  Typography.labelSmall,
                  {
                    color: isSelected ? colors.textPrimary : colors.textMuted,
                    fontWeight: isSelected ? '700' : '400',
                  },
                ]}
              >
                {size}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Game List Card ───────────────────────────────────────────────────────────

function GameListCard({ game, onClick, colors }: { game: GameDto; onClick: () => void; colors: any }) {
  return (
    <TouchableOpacity
      onPress={onClick}
      style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: game.background_image ?? '' }}
        style={styles.cardImage}
        contentFit="cover"
      />
      <View style={styles.cardContent}>
        <View>
          <View style={styles.cardBadges}>
            {game.genres?.[0] ? (
              <BadgeChip text={game.genres[0].name.toUpperCase()} />
            ) : null}
            {game.platforms?.[0] ? (
              <BadgeChip
                text={game.platforms[0].platform.name}
                color={colors.accentSecondary + '26'}
                textColor={colors.accentSecondary}
              />
            ) : null}
          </View>
          <Text
            style={[Typography.titleMedium, { color: colors.textPrimary, fontWeight: '700', marginTop: 6 }]}
            numberOfLines={2}
          >
            {game.name}
          </Text>
        </View>

        <View style={styles.cardMeta}>
          <View style={styles.cardMetaItem}>
            <Ionicons name="star" size={14} color={colors.statusYellow} />
            <Text style={[Typography.labelMedium, { color: colors.textSecondary, marginLeft: 4 }]}>
              {formatRating(game.rating)}
            </Text>
          </View>
          
          {(game.playtime ?? 0) > 0 ? (
            <View style={styles.cardMetaItem}>
              <Ionicons name="time-outline" size={14} color={colors.textMuted} />
              <Text style={[Typography.labelSmall, { color: colors.textMuted, marginLeft: 4 }]}>
                {game.playtime}h
              </Text>
            </View>
          ) : null}
          
          {game.released ? (
            <Text style={[Typography.labelSmall, { color: colors.textMuted }]}>
              {extractYear(game.released)}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, marginTop: 16 },
  pageSizeContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, marginBottom: 8 },
  pageSizeRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pageSizeChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1 },
  card: { flexDirection: 'row', height: 120, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  cardImage: { width: 100 },
  cardContent: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, justifyContent: 'space-between' },
  cardBadges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  cardMetaItem: { flexDirection: 'row', alignItems: 'center' },
});