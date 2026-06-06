import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../../theme/typography';
import { useHomeStore } from '../../store/useHomeStore';
import { useAppStore } from '../../store/useAppStore';
import { GameDto } from '../../data/remote/dto/GameDto';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OfflineState } from '../shared/OfflineState';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface HomeScreenProps {
  onGameClick: (gameId: number) => void;
  onViewAllClick: (listType: string) => void;
}

export function HomeScreen({ onGameClick, onViewAllClick }: HomeScreenProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { userId } = useAppStore();
  const {
    username, popularThisYear, allTimeLegends,
    indieGems, competitive, coop, retro,
    isLoading, errorMessage,
    loadUsername, loadHomeData, setupNetworkObserver
  } = useHomeStore();

  useEffect(() => {
    loadUsername(userId);
    loadHomeData();
    const unsubscribe = setupNetworkObserver();
    
    return () => unsubscribe();
  }, [userId]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>
        
        <HomeHeader username={username} colors={colors} />

        {isLoading && popularThisYear.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <ActivityIndicator color={colors.accent} size="large" />
          </View>
        ) : !isLoading && popularThisYear.length === 0 && errorMessage ? (
          <View style={{ flex: 1, justifyContent: 'center', minHeight: 300 }}>
            <OfflineState message={errorMessage} onRetry={loadHomeData} colors={colors} />
          </View>
        ) : (
          <>
            {popularThisYear.length > 0 && (
              <>
                <SectionHeader
                  title={t('home.popular_this_year')}
                  iconName="trending-up"
                  onViewAll={() => onViewAllClick('this_year')}
                  colors={colors}
                />
                <FlatList
                  data={popularThisYear}
                  keyExtractor={(item) => String(item.id)}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
                  renderItem={({ item, index }) => (
                    <GameCardMedium
                      game={item}
                      badge={index === 0 ? t('home.badge_online') : index === 1 ? t('home.badge_trending') : undefined}
                      badgeType={index === 0 ? 'ONLINE' : 'TRENDING'}
                      onClick={() => onGameClick(item.id)}
                      colors={colors}
                    />
                  )}
                />
                <View style={{ height: 24 }} />
              </>
            )}

            {allTimeLegends.length > 0 && (
              <>
                <SectionHeader
                  title={t('home.all_time_legends')}
                  iconName="trophy"
                  onViewAll={() => onViewAllClick('all_time')}
                  colors={colors}
                />
                <AllTimeLegendCard
                  game={allTimeLegends[0]}
                  onClick={() => onGameClick(allTimeLegends[0].id)}
                  colors={colors}
                />
                <View style={{ height: 24 }} />
              </>
            )}

            {!errorMessage && (indieGems.length > 0 || competitive.length > 0) && (
              <>
                <SectionHeader
                  title={t('home.discover')}
                  iconName="star"
                  onViewAll={null}
                  colors={colors}
                />
                <DiscoverGrid
                  indieGames={indieGems}
                  competitiveGames={competitive}
                  coOpGames={coop}
                  retroGames={retro}
                  onViewAllGenre={onViewAllClick}
                  colors={colors}
                />
                <View style={{ height: 24 }} />
              </>
            )}

            {errorMessage && popularThisYear.length > 0 && (
              <Text style={[Typography.bodyMedium, { color: colors.statusRed, margin: 16 }]}>
                {errorMessage}
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function HomeHeader({ username, colors }: { username: string; colors: any }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={[colors.accent + '40', colors.background]}
      style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}
    >
      <View style={styles.headerLogo}>
        <Ionicons name="game-controller" size={28} color={colors.accent} />
        <Text style={[Typography.titleMedium, { color: colors.accent, fontWeight: '800', letterSpacing: 2, marginLeft: 10 }]}>
          GAMEVAULT
        </Text>
      </View>
      <View style={{ height: 16 }} />
      <Text style={[Typography.headlineSmall, { color: colors.textSecondary }]}>{t('home.welcome')}</Text>
      <Text style={[Typography.headlineLarge, { color: colors.accent, fontWeight: '700' }]}>
        {username}
      </Text>
      <Text style={[Typography.bodySmall, { color: colors.textMuted, marginTop: 4 }]}>
        {t('home.subtitle')}
      </Text>
    </LinearGradient>
  );
}

function SectionHeader({ title, iconName, onViewAll, colors }: { title: string; iconName: keyof typeof Ionicons.glyphMap; onViewAll: (() => void) | null; colors: any; }) {
  const { t } = useTranslation();
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <Ionicons name={iconName} size={18} color={colors.accent} />
        <Text style={[Typography.titleLarge, { color: colors.textPrimary, fontWeight: '700', marginLeft: 8 }]}>
          {title}
        </Text>
      </View>
      {onViewAll && (
        <TouchableOpacity onPress={onViewAll}>
          <Text style={[Typography.labelSmall, { color: colors.accent, letterSpacing: 1 }]}>
            {t('home.view_all')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function GameCardMedium({ game, badge, badgeType, onClick, colors }: { game: GameDto; badge?: string; badgeType?: string; onClick: () => void; colors: any; }) {
  return (
    <TouchableOpacity onPress={onClick} style={styles.gameCardMedium} activeOpacity={0.85}>
      <Image source={{ uri: game.background_image ?? '' }} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={StyleSheet.absoluteFill} />
      {badge && (
        <View style={[styles.badge, { backgroundColor: badgeType === 'ONLINE' ? colors.accentSecondary : colors.accent }]}>
          <Text style={[Typography.labelSmall, { color: colors.background, fontWeight: '700' }]}>{badge}</Text>
        </View>
      )}
      <View style={styles.gameCardInfo}>
        <Text style={[Typography.labelLarge, { color: colors.textPrimary }]} numberOfLines={2}>{game.name}</Text>
        <Text style={[Typography.labelSmall, { color: colors.textMuted }]}>{game.genres?.[0]?.name?.toUpperCase() ?? ''}</Text>
      </View>
    </TouchableOpacity>
  );
}

function AllTimeLegendCard({ game, onClick, colors }: { game: GameDto; onClick: () => void; colors: any; }) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity onPress={onClick} style={styles.allTimeLegendCard} activeOpacity={0.85}>
      <Image source={{ uri: game.background_image ?? '' }} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient colors={['rgba(0,0,0,0.85)', 'transparent']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
      <View style={styles.legendContent}>
        <View style={[styles.hallOfFameBadge, { backgroundColor: colors.statusYellow + 'E6' }]}>
          <Text style={[Typography.labelSmall, { color: colors.background, fontWeight: '800' }]}>{t('home.hall_of_fame')}</Text>
        </View>
        <View style={{ height: 6 }} />
        <Text style={[Typography.headlineSmall, { color: colors.textPrimary, fontWeight: '700' }]}>{game.name}</Text>
        <Text style={[Typography.bodySmall, { color: colors.textSecondary }]}>{game.genres?.[0]?.name ?? ''}</Text>
      </View>
    </TouchableOpacity>
  );
}

const DISCOVER_CATEGORIES = [
  { key: 'discover_indie',       i18nKey: 'home.discover_indie',       symbol: '◈', colorKey: 'accent' },
  { key: 'discover_competitive', i18nKey: 'home.discover_competitive', symbol: '⚡', colorKey: 'accentSecondary' },
  { key: 'discover_coop',        i18nKey: 'home.discover_coop',        symbol: '◎', colorKey: 'statusGreen' },
  { key: 'discover_retro',       i18nKey: 'home.discover_retro',       symbol: '◀', colorKey: 'statusOrange' },
];

function DiscoverGrid({ indieGames, competitiveGames, coOpGames, retroGames, onViewAllGenre, colors }: any) {
  const { t } = useTranslation();
  const gameMap: Record<string, GameDto[]> = { discover_indie: indieGames, discover_competitive: competitiveGames, discover_coop: coOpGames, discover_retro: retroGames };
  const pairs = [DISCOVER_CATEGORIES.slice(0, 2), DISCOVER_CATEGORIES.slice(2, 4)];

  return (
    <View style={styles.discoverGrid}>
      {pairs.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.discoverRow}>
          {row.map((cat) => {
            const color = colors[cat.colorKey] ?? colors.accent;
            const games = gameMap[cat.key] ?? [];
            return (
              <TouchableOpacity
                key={cat.key}
                onPress={() => onViewAllGenre(cat.key)}
                style={[styles.discoverCard, { borderColor: color + '66', backgroundColor: colors.card }]}
                activeOpacity={0.85}
              >
                {games[0]?.background_image && <Image source={{ uri: games[0].background_image }} style={[StyleSheet.absoluteFill, { opacity: 0.3, borderRadius: 12 }]} contentFit="cover" />}
                <View style={[styles.discoverIcon, { backgroundColor: color + '26', borderColor: color + '80' }]}>
                  <Text style={{ color, fontSize: 18 }}>{cat.symbol}</Text>
                </View>
                <Text style={[Typography.labelMedium, { color: colors.textPrimary, fontWeight: '600', marginTop: 8 }]}>{t(cat.i18nKey)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  headerLogo: { flexDirection: 'row', alignItems: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  gameCardMedium: { width: 150, height: 200, borderRadius: 12, overflow: 'hidden' },
  badge: { position: 'absolute', top: 8, right: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  gameCardInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10 },
  allTimeLegendCard: { height: 200, marginHorizontal: 16, borderRadius: 16, overflow: 'hidden' },
  legendContent: { position: 'absolute', bottom: 16, left: 16 },
  hallOfFameBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  discoverGrid: { paddingHorizontal: 16, gap: 12 },
  discoverRow: { flexDirection: 'row', gap: 12 },
  discoverCard: { flex: 1, height: 120, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  discoverIcon: { width: 40, height: 40, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});