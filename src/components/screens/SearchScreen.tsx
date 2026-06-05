import React, { useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, Modal, ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../../theme/typography';
import { GameVaultTopBar } from '../shared/GameVaultTopBar';
import { BadgeChip } from '../shared/BadgeChip';
import { useSearchStore, SearchFilters } from '../../store/useSearchStore';
import { GameDto } from '../../data/remote/dto/GameDto';
import { formatRating } from '../../utils/formatters';

interface SearchScreenProps {
  onGameClick: (gameId: number) => void;
}

export function SearchScreen({ onGameClick }: SearchScreenProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const {
    query, searchResults, defaultGames, searchHistory,
    filters, isLoading, isFilterSheetVisible, hasSearched, errorMessage,
    loadDefaultGames, loadSearchHistory, setQuery, submitSearch,
    onHistoryItemClick, deleteHistoryItem, clearHistory,
    toggleFilterSheet, applyFilters, clearFilters,
  } = useSearchStore();

  useEffect(() => {
    loadDefaultGames();
    loadSearchHistory();
  }, []);

  const isDefaultState = !query && !filters.genre && !filters.platform && !filters.ordering && !filters.year;
  const displayList = isDefaultState ? defaultGames : searchResults;

  const hasActiveFilters = !!(filters.genre || filters.platform || filters.ordering || filters.year);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GameVaultTopBar />

      <View style={[styles.searchField, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('search.search_placeholder')}
          placeholderTextColor={colors.textMuted}
          style={[Typography.bodyMedium, { flex: 1, color: colors.textPrimary, marginHorizontal: 8 }]}
          returnKeyType="search"
          onSubmitEditing={submitSearch}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity onPress={toggleFilterSheet} style={styles.filterButton} activeOpacity={0.85}>
        <LinearGradient
          colors={[colors.accent, colors.accentSecondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.filterGradient}
        >
          <Ionicons name="options" size={18} color={colors.textPrimary} />
          <Text style={[Typography.labelLarge, { color: colors.textPrimary, marginLeft: 8, letterSpacing: 1 }]}>
            {hasActiveFilters ? t('search.filter_active') : t('search.filter')}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {errorMessage && (
        <Text style={[Typography.bodyMedium, { color: colors.statusRed, paddingHorizontal: 16, paddingVertical: 8 }]}>
          {errorMessage}
        </Text>
      )}

      <View style={{ flex: 1 }}>
        <FlatList
          data={displayList}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListHeaderComponent={
            <>
              {isDefaultState && searchHistory.length > 0 && (
                <SearchHistorySection
                  history={searchHistory}
                  onHistoryClick={onHistoryItemClick}
                  onDeleteItem={deleteHistoryItem}
                  onClearAll={clearHistory}
                  colors={colors}
                />
              )}
              {displayList.length > 0 && (
                <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
                  <Text style={[Typography.titleLarge, { color: colors.textPrimary, fontWeight: '700' }]}>
                    {isDefaultState ? t('search.trending_suggestions') : t('search.search_results')}
                  </Text>
                  <Text style={[Typography.labelSmall, { color: colors.accent, letterSpacing: 1 }]}>
                    {t('search.titles_found', { count: displayList.length })}
                  </Text>
                </View>
              )}
              {!isDefaultState && !isLoading && displayList.length === 0 && hasSearched && (
                <View style={styles.emptyState}>
                  <Ionicons name="search" size={64} color={colors.textMuted} />
                  <Text style={[Typography.titleMedium, { color: colors.textMuted, marginTop: 16 }]}>
                    {t('search.no_results')}
                  </Text>
                </View>
              )}
            </>
          }
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
              <SearchResultCard game={item} onClick={() => onGameClick(item.id)} colors={colors} />
            </View>
          )}
        />
        {isLoading && (
          <View style={[styles.loadingOverlay, { backgroundColor: colors.background + '99' }]}>
            <ActivityIndicator color={colors.accent} size="large" />
          </View>
        )}
      </View>

      {isFilterSheetVisible && (
        <FilterBottomSheet
          currentFilters={filters}
          onApply={applyFilters}
          onDismiss={toggleFilterSheet}
          onClear={clearFilters}
          colors={colors}
        />
      )}
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SearchHistorySection({ history, onHistoryClick, onDeleteItem, onClearAll, colors }: any) {
  const { t } = useTranslation();
  return (
    <View style={{ padding: 16 }}>
      <View style={styles.historyHeader}>
        <Text style={[Typography.titleMedium, { color: colors.textPrimary, fontWeight: '700' }]}>
          {t('search.recent_searches')}
        </Text>
        <TouchableOpacity onPress={onClearAll}>
          <Text style={[Typography.labelSmall, { color: colors.accent, letterSpacing: 1 }]}>
            {t('search.clear_all')}
          </Text>
        </TouchableOpacity>
      </View>
      {history.map((item: any) => (
        <View key={item.id}>
          <View style={styles.historyItem}>
            <TouchableOpacity
              style={styles.historyItemLeft}
              onPress={() => onHistoryClick(item.query)}
            >
              <Ionicons name="time-outline" size={18} color={colors.textMuted} />
              <Text style={[Typography.bodyMedium, { color: colors.textSecondary, marginLeft: 12 }]}>
                {item.query}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDeleteItem(item.id)}>
              <Ionicons name="close" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={{ height: 1, backgroundColor: colors.border + '4D' }} />
        </View>
      ))}
    </View>
  );
}

function SearchResultCard({ game, onClick, colors }: { game: GameDto; onClick: () => void; colors: any }) {
  return (
    <TouchableOpacity
      onPress={onClick}
      style={[styles.resultCard, { borderColor: colors.border, backgroundColor: colors.card }]}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: game.background_image ?? '' }}
        style={styles.resultCardImage}
        contentFit="cover"
      />
      <View style={styles.resultCardContent}>
        <View style={styles.resultCardBadges}>
          {game.genres?.[0] && (
            <BadgeChip text={game.genres[0].name.toUpperCase()} />
          )}
          {game.platforms && game.platforms.length > 0 && (
            <BadgeChip
              text={game.platforms.length === 1
                ? game.platforms[0].platform.name
                : `${game.platforms[0].platform.name} +${game.platforms.length - 1}`}
              color={colors.accentSecondary + '26'}
              textColor={colors.accentSecondary}
            />
          )}
        </View>
        <Text
          style={[Typography.titleMedium, { color: colors.textPrimary, fontWeight: '700', marginTop: 6 }]}
          numberOfLines={2}
        >
          {game.name}
        </Text>
        <View style={styles.resultCardMeta}>
          <Ionicons name="star" size={14} color={colors.statusYellow} />
          <Text style={[Typography.labelMedium, { color: colors.textSecondary, marginLeft: 4 }]}>
            {formatRating(game.rating)}
          </Text>
          {(game.playtime ?? 0) > 0 ? (
            <>
              <Ionicons name="time-outline" size={14} color={colors.textMuted} style={{ marginLeft: 12 }} />
              <Text style={[Typography.labelSmall, { color: colors.textMuted, marginLeft: 4 }]}>
                {game.playtime}h
              </Text>
            </>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function FilterBottomSheet({ currentFilters, onApply, onDismiss, onClear, colors }: any) {
  const { t } = useTranslation();
  const [selectedGenre, setSelectedGenre] = React.useState<string | null>(currentFilters.genre);
  const [selectedPlatform, setSelectedPlatform] = React.useState<string | null>(currentFilters.platform);
  const [selectedOrdering, setSelectedOrdering] = React.useState<string | null>(currentFilters.ordering);

  const genres = ['action', 'rpg', 'shooter', 'strategy', 'indie', 'adventure', 'puzzle'];
  const platforms = [
    { id: '4', name: 'PC' }, { id: '187', name: 'PS5' },
    { id: '18', name: 'PS4' }, { id: '1', name: 'Xbox' }, { id: '7', name: 'Nintendo' },
  ];
  const orderings = [
    { value: '-rating', label: t('search.order_best_rated') },
    { value: '-released', label: t('search.order_newest') },
    { value: '-added', label: t('search.order_most_popular') },
  ];

  return (
    <Modal transparent animationType="slide" onRequestClose={onDismiss}>
      <TouchableOpacity style={styles.modalOverlay} onPress={onDismiss} activeOpacity={1} />
      <View style={[styles.filterSheet, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={[Typography.headlineSmall, { color: colors.textPrimary, fontWeight: '700', marginBottom: 20 }]}>
            {t('search.filter_games')}
          </Text>

          <FilterSectionTitle title={t('search.genre')} colors={colors} />
          <View style={styles.filterChipsRow}>
            {genres.map((g) => (
              <FilterChip
                key={g}
                text={t(`search.genre_${g}`)}
                isSelected={selectedGenre === g}
                onPress={() => setSelectedGenre(selectedGenre === g ? null : g)}
                colors={colors}
              />
            ))}
          </View>

          <View style={{ height: 16 }} />
          <FilterSectionTitle title={t('search.platform')} colors={colors} />
          <View style={styles.filterChipsRow}>
            {platforms.map((p) => (
              <FilterChip
                key={p.id}
                text={p.name}
                isSelected={selectedPlatform === p.id}
                onPress={() => setSelectedPlatform(selectedPlatform === p.id ? null : p.id)}
                colors={colors}
              />
            ))}
          </View>

          <View style={{ height: 16 }} />
          <FilterSectionTitle title={t('search.sort_by')} colors={colors} />
          <View style={styles.filterChipsRow}>
            {orderings.map((o) => (
              <FilterChip
                key={o.value}
                text={o.label}
                isSelected={selectedOrdering === o.value}
                onPress={() => setSelectedOrdering(selectedOrdering === o.value ? null : o.value)}
                colors={colors}
              />
            ))}
          </View>

          <View style={{ height: 24 }} />

          <View style={styles.filterActions}>
            <TouchableOpacity
              style={[styles.filterClearBtn, { borderColor: colors.border }]}
              onPress={() => { setSelectedGenre(null); setSelectedPlatform(null); setSelectedOrdering(null); onClear(); }}
            >
              <Text style={[Typography.labelMedium, { color: colors.textSecondary }]}>{t('search.clear')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterApplyBtn, { backgroundColor: colors.accent }]}
              onPress={() => onApply({ genre: selectedGenre, platform: selectedPlatform, ordering: selectedOrdering, year: null, minRating: null })}
            >
              <Text style={[Typography.labelMedium, { color: colors.textPrimary }]}>{t('search.apply')}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function FilterSectionTitle({ title, colors }: { title: string; colors: any }) {
  return (
    <Text style={[Typography.labelMedium, { color: colors.textSecondary, marginBottom: 8 }]}>
      {title}
    </Text>
  );
}

function FilterChip({ text, isSelected, onPress, colors }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.filterChip,
        {
          backgroundColor: isSelected ? colors.accent : colors.card,
          borderColor: isSelected ? colors.accent : colors.border,
        },
      ]}
    >
      <Text style={[Typography.labelMedium, { color: isSelected ? colors.textPrimary : colors.textSecondary }]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterButton: { marginHorizontal: 16, marginVertical: 4, height: 48, borderRadius: 12, overflow: 'hidden' },
  filterGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 16 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  historyItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  resultCard: { flexDirection: 'row', height: 120, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  resultCardImage: { width: 100 },
  resultCardContent: { flex: 1, padding: 12, justifyContent: 'space-between' },
  resultCardBadges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  resultCardMeta: { flexDirection: 'row', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  filterSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  filterChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterActions: { flexDirection: 'row', justifyContent: 'space-between' },
  filterClearBtn: { width: '48%', height: 48, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  filterApplyBtn: { width: '48%', height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});