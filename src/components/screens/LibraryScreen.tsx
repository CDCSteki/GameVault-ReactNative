import React, { useEffect } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, Modal, Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../../theme/typography';
import { GameVaultTopBar } from '../shared/GameVaultTopBar';
import {
  useLibraryStore,
  LibraryTab,
  CollectionFilter,
} from '../../store/useLibraryStore';
import { GameEntity, PlayStatus } from '../../data/db/entities';
import { firstGenre, firstPlatform } from '../../utils/formatters';

interface LibraryScreenProps {
  onGameClick: (gameId: number) => void;
}

export function LibraryScreen({ onGameClick }: LibraryScreenProps) {
  const { colors } = useTheme();
  const {
    activeTab, collectionFilter, wishlist, isLoading,
    loadAll, setActiveTab, setCollectionFilter,
    onPlayStatusChange, onRemoveFromCollection,
    onRemoveFromWishlist, onMoveToCollection, getFilteredCollection,
  } = useLibraryStore();

  useEffect(() => { loadAll(); }, []);

  const filteredCollection = getFilteredCollection();

  const emptyMessage = activeTab === 'COLLECTION'
    ? collectionFilter === 'PLAYING' ? 'No games currently being played'
    : collectionFilter === 'PLAYED' ? 'No played games yet'
    : collectionFilter === 'NOT_PLAYED' ? 'No unplayed games'
    : 'Your collection is empty.\nSearch for games to add!'
    : 'Your wishlist is empty.\nAdd games you want to play!';

  const listData = activeTab === 'COLLECTION' ? filteredCollection : wishlist;
  const isEmpty = listData.length === 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GameVaultTopBar />

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['COLLECTION', 'WISHLIST'] as LibraryTab[]).map((tab) => {
          const isSelected = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tab,
                {
                  backgroundColor: isSelected ? colors.accent : colors.card,
                  borderColor: isSelected ? colors.accent : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  Typography.labelMedium,
                  {
                    color: isSelected ? colors.textPrimary : colors.textMuted,
                    fontWeight: '700',
                  },
                ]}
              >
                {tab === 'COLLECTION' ? 'MY COLLECTION' : 'WISHLIST'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Collection Filters */}
      {activeTab === 'COLLECTION' && (
        <View style={styles.filterRow}>
          {(['ALL', 'PLAYING', 'PLAYED', 'NOT_PLAYED'] as CollectionFilter[]).map((filter) => {
            const isSelected = collectionFilter === filter;
            const filterColor =
              filter === 'ALL' ? colors.accent
              : filter === 'PLAYING' ? colors.accentSecondary
              : filter === 'PLAYED' ? colors.statusGreen
              : colors.statusOrange;
            return (
              <TouchableOpacity
                key={filter}
                onPress={() => setCollectionFilter(filter)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? filterColor + '26' : 'transparent',
                    borderColor: isSelected ? filterColor : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    Typography.labelSmall,
                    {
                      color: isSelected ? filterColor : colors.textMuted,
                      fontWeight: isSelected ? '700' : '400',
                    },
                  ]}
                >
                  {filter === 'ALL' ? 'All'
                    : filter === 'PLAYING' ? 'Playing'
                    : filter === 'PLAYED' ? 'Played'
                    : 'Not Played'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {isEmpty ? (
        <View style={styles.emptyState}>
          <Ionicons name="film-outline" size={64} color={colors.textMuted} />
          <Text style={[Typography.bodyMedium, { color: colors.textMuted, textAlign: 'center', marginTop: 16 }]}>
            {emptyMessage}
          </Text>
        </View>
      ) : (
        <>
          {activeTab === 'COLLECTION' && (
            <Text style={[Typography.bodySmall, { color: colors.textMuted, paddingHorizontal: 16, paddingVertical: 4 }]}>
              {filteredCollection.length} Games in library
            </Text>
          )}
          <FlatList
            data={listData}
            keyExtractor={(item) => String(item.rawgId)}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            renderItem={({ item }) =>
              activeTab === 'COLLECTION' ? (
                <CollectionGameCard
                  game={item}
                  onClick={() => onGameClick(item.rawgId)}
                  onPlayStatusChange={(status) => onPlayStatusChange(item.rawgId, status)}
                  onRemove={() => onRemoveFromCollection(item.rawgId)}
                  colors={colors}
                />
              ) : (
                <WishlistGameCard
                  game={item}
                  onClick={() => onGameClick(item.rawgId)}
                  onMoveToCollection={() => onMoveToCollection(item)}
                  onRemove={() => onRemoveFromWishlist(item.rawgId)}
                  colors={colors}
                />
              )
            }
          />
        </>
      )}
    </View>
  );
}

// ─── Collection Card ──────────────────────────────────────────────────────────

function CollectionGameCard({ game, onClick, onPlayStatusChange, onRemove, colors }: {
  game: GameEntity; onClick: () => void;
  onPlayStatusChange: (s: PlayStatus) => void; onRemove: () => void; colors: any;
}) {
  const [menuVisible, setMenuVisible] = React.useState(false);
  const currentStatus = game.playStatus as PlayStatus;
  const statusColor =
    currentStatus === 'NOT_PLAYED' ? colors.statusOrange
    : currentStatus === 'PLAYING' ? colors.accentSecondary
    : colors.statusGreen;
  const statusIcon =
    currentStatus === 'NOT_PLAYED' ? 'radio-button-off-outline'
    : currentStatus === 'PLAYING' ? 'play-circle-outline'
    : 'checkmark-circle-outline';
  const statusLabel =
    currentStatus === 'NOT_PLAYED' ? 'Not Played'
    : currentStatus === 'PLAYING' ? 'Playing'
    : 'Played';

  return (
    <TouchableOpacity
      onPress={onClick}
      style={[styles.gameCard, { borderColor: colors.border, backgroundColor: colors.card }]}
      activeOpacity={0.85}
    >
      <View style={styles.gameCardImageWrap}>
        <Image source={{ uri: game.coverImageUrl ?? '' }} style={styles.gameCardImage} contentFit="cover" />
        {firstPlatform(game.platforms) !== '' && (
          <View style={[styles.platformBadge, { backgroundColor: colors.background + 'D9' }]}>
            <Text style={[Typography.labelSmall, { color: colors.textSecondary, fontSize: 8 }]}>
              {firstPlatform(game.platforms).slice(0, 8)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.gameCardContent}>
        <View>
          <Text style={[Typography.titleMedium, { color: colors.textPrimary, fontWeight: '700' }]} numberOfLines={1}>
            {game.name}
          </Text>
          <Text style={[Typography.labelSmall, { color: colors.textMuted }]}>
            {firstGenre(game.genres).toUpperCase()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '26', borderColor: statusColor }]}>
          <Ionicons name={statusIcon as any} size={12} color={statusColor} />
          <Text style={[Typography.labelSmall, { color: statusColor, fontWeight: '600', marginLeft: 4 }]}>
            {statusLabel}
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
        <Ionicons name="ellipsis-vertical" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      {/* Menu Modal */}
      <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menuSheet, { backgroundColor: colors.card }]}>
            {(['NOT_PLAYED', 'PLAYING', 'PLAYED'] as PlayStatus[]).filter(s => s !== currentStatus).map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.menuItem}
                onPress={() => { setMenuVisible(false); onPlayStatusChange(s); }}
              >
                <Text style={[Typography.bodyMedium, { color: colors.textPrimary }]}>
                  {s === 'NOT_PLAYED' ? 'Mark as Not Played'
                    : s === 'PLAYING' ? 'Mark as Playing'
                    : 'Mark as Played'}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={{ height: 1, backgroundColor: colors.border + '4D' }} />
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); onRemove(); }}>
              <Text style={[Typography.bodyMedium, { color: colors.statusRed }]}>Remove</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </TouchableOpacity>
  );
}

// ─── Wishlist Card ────────────────────────────────────────────────────────────

function WishlistGameCard({ game, onClick, onMoveToCollection, onRemove, colors }: {
  game: GameEntity; onClick: () => void;
  onMoveToCollection: () => void; onRemove: () => void; colors: any;
}) {
  const [menuVisible, setMenuVisible] = React.useState(false);

  return (
    <TouchableOpacity
      onPress={onClick}
      style={[styles.gameCard, { borderColor: colors.border, backgroundColor: colors.card }]}
      activeOpacity={0.85}
    >
      <Image source={{ uri: game.coverImageUrl ?? '' }} style={styles.gameCardImage} contentFit="cover" />

      <View style={styles.gameCardContent}>
        <View>
          <Text style={[Typography.titleMedium, { color: colors.textPrimary, fontWeight: '700' }]} numberOfLines={1}>
            {game.name}
          </Text>
          <Text style={[Typography.labelSmall, { color: colors.textMuted }]}>
            {firstGenre(game.genres).toUpperCase()}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onMoveToCollection}
          style={[styles.addToCollBtn, { backgroundColor: colors.accent + '26', borderColor: colors.accent }]}
        >
          <Text style={[Typography.labelSmall, { color: colors.accent, fontWeight: '600' }]}>
            + Add to Collection
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
        <Ionicons name="ellipsis-vertical" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menuSheet, { backgroundColor: colors.card }]}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); onMoveToCollection(); }}>
              <Text style={[Typography.bodyMedium, { color: colors.textPrimary }]}>Add to Collection</Text>
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: colors.border + '4D' }} />
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); onRemove(); }}>
              <Text style={[Typography.bodyMedium, { color: colors.statusRed }]}>Remove</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  tab: { flex: 1, height: 40, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 4, gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  gameCard: { flexDirection: 'row', height: 110, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  gameCardImageWrap: { width: 90, position: 'relative' },
  gameCardImage: { width: 90, height: '100%' },
  platformBadge: { position: 'absolute', bottom: 4, left: 4, paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4 },
  gameCardContent: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, justifyContent: 'space-between' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  addToCollBtn: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  menuButton: { padding: 12, justifyContent: 'center' },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  menuSheet: { width: 220, borderRadius: 12, overflow: 'hidden' },
  menuItem: { paddingHorizontal: 16, paddingVertical: 14 },
});