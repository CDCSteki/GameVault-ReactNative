import { gameDao } from '../db/dao/gameDao';
import { userDao } from '../db/dao/userDao';
import { AppPreferences } from '../preferences/AppPreferences';
import { GameEntity, PlayStatus, calculateLevel, calculateTier } from '../db/entities';
import { GameDetailDto, GameDto } from '../remote/dto/GameDto';
import {
  getGamesThisYear,
  getAllTimeTopGames,
  getGamesByFilters,
  getPopularGames,
  getGameDetails,
  getGameScreenshots,
} from '../remote/api/RawgApi';
import type { GameScreenshotsResponse } from '../remote/dto/GameDto';

// ─── Result types ─────────────────────────────────────────────────────────────

export type AddToCollectionResult = 'Success' | 'AlreadyInCollection';
export type AddToWishlistResult = 'Success' | 'AlreadyInWishlist' | 'AlreadyInCollection';

// ─── Mappers ──────────────────────────────────────────────────────────────────

export function gameDetailToEntity(detail: GameDetailDto): GameEntity {
  return {
    rawgId: detail.id,
    name: detail.name,
    coverImageUrl: detail.background_image ?? null,
    backgroundImageUrl: detail.background_image ?? null,
    description: detail.description_raw ?? null,
    developer: detail.developers?.[0]?.name ?? null,
    releaseDate: detail.released ?? null,
    platforms: detail.platforms?.map((p) => p.platform.name).join(',') ?? null,
    genres: detail.genres?.map((g) => g.name).join(',') ?? null,
    storageSize: null,
    rating: detail.rating,
    userRating: 0,
    userNotes: null,
    isInCollection: false,
    isInWishlist: false,
    isPlayed: false,
    playStatus: 'NOT_PLAYED',
    addedAt: Date.now(),
  };
}

export function entityToDetailDto(entity: GameEntity): GameDetailDto {
  return {
    id: entity.rawgId,
    name: entity.name,
    description_raw: entity.description ?? null,
    background_image: entity.backgroundImageUrl ?? null,
    released: entity.releaseDate ?? null,
    rating: entity.rating,
    ratings_count: 0,
    playtime: null,
    platforms:
      entity.platforms
        ?.split(',')
        .map((name) => ({ platform: { id: 0, name: name.trim() } })) ?? null,
    genres:
      entity.genres
        ?.split(',')
        .map((name) => ({ id: 0, name: name.trim() })) ?? null,
    developers: entity.developer
      ? [{ id: 0, name: entity.developer }]
      : null,
    publishers: null,
    ratings: null,
    esrb_rating: null,
  };
}

// ─── Repository ───────────────────────────────────────────────────────────────

class GameRepositoryClass {
  // ── REMOTE ─────────────────────────────────────────────────────────────────

  async getGamesThisYear(
    dates: string,
    pageSize: number = 10
  ): Promise<{ data: GameDto[]; error?: string }> {
    try {
      const response = await getGamesThisYear(dates, pageSize);
      return { data: response.results };
    } catch (e: any) {
      return { data: [], error: e.message };
    }
  }

  async getAllTimeTopGames(
    pageSize: number = 10
  ): Promise<{ data: GameDto[]; error?: string }> {
    try {
      const response = await getAllTimeTopGames(pageSize);
      return { data: response.results };
    } catch (e: any) {
      return { data: [], error: e.message };
    }
  }

  async getGamesWithFilters(params: {
    genres?: string;
    tags?: string;
    dates?: string;
    pageSize?: number;
  }): Promise<{ data: GameDto[]; error?: string }> {
    try {
      const response = await getGamesByFilters(params);
      return { data: response.results };
    } catch (e: any) {
      return { data: [], error: e.message };
    }
  }

  async getPopularGames(
    pageSize: number = 10
  ): Promise<{ data: GameDto[]; error?: string }> {
    try {
      const response = await getPopularGames(pageSize);
      return { data: response.results };
    } catch (e: any) {
      return { data: [], error: e.message };
    }
  }

  async getGameDetails(
    gameId: number
  ): Promise<{ data: GameDetailDto | null; error?: string }> {
    try {
      const data = await getGameDetails(gameId);
      return { data };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  }

  async getGameScreenshots(
    gameId: number
  ): Promise<{ data: GameScreenshotsResponse | null; error?: string }> {
    try {
      const data = await getGameScreenshots(gameId);
      return { data };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  }

  // ── LOCAL - COLLECTION ─────────────────────────────────────────────────────

  async getCollection(): Promise<GameEntity[]> {
    return gameDao.getCollection();
  }

  async addToCollection(game: GameEntity): Promise<AddToCollectionResult> {
    const existing = await gameDao.getGameById(game.rawgId);
    if (existing?.isInCollection) return 'AlreadyInCollection';

    if (existing) {
      await gameDao.updateCollectionStatus(game.rawgId, true);
      await gameDao.updateWishlistStatus(game.rawgId, false);
    } else {
      await gameDao.insertGame({
        ...game,
        isInCollection: true,
        isInWishlist: false,
        playStatus: 'NOT_PLAYED',
      });
    }
    return 'Success';
  }

  async removeFromCollection(rawgId: number): Promise<void> {
    await gameDao.updateCollectionStatus(rawgId, false);
    await gameDao.updatePlayStatus(rawgId, 'NOT_PLAYED');
  }

  async updatePlayStatus(rawgId: number, status: PlayStatus): Promise<void> {
    const isPlayed = status === 'PLAYED';
    await gameDao.updatePlayedStatus(rawgId, isPlayed, status);
    if (isPlayed) await this.recalculateUserLevel();
  }

  // ── LOCAL - WISHLIST ───────────────────────────────────────────────────────

  async getWishlist(): Promise<GameEntity[]> {
    return gameDao.getWishlist();
  }

  async addToWishlist(game: GameEntity): Promise<AddToWishlistResult> {
    const existing = await gameDao.getGameById(game.rawgId);
    if (existing?.isInCollection) return 'AlreadyInCollection';
    if (existing?.isInWishlist) return 'AlreadyInWishlist';

    if (existing) {
      await gameDao.updateWishlistStatus(game.rawgId, true);
    } else {
      await gameDao.insertGame({
        ...game,
        isInWishlist: true,
        isInCollection: false,
      });
    }
    return 'Success';
  }

  async removeFromWishlist(rawgId: number): Promise<void> {
    await gameDao.updateWishlistStatus(rawgId, false);
  }

  // ── LOCAL - RATINGS & NOTES ────────────────────────────────────────────────

  async updateUserRating(rawgId: number, rating: number): Promise<void> {
    await gameDao.updateUserRating(rawgId, rating);
  }

  async updateUserNotes(rawgId: number, notes: string | null): Promise<void> {
    await gameDao.updateUserNotes(rawgId, notes);
  }

  async getGameById(rawgId: number): Promise<GameEntity | null> {
    return gameDao.getGameById(rawgId);
  }

  // ── LEVEL SYSTEM ──────────────────────────────────────────────────────────

  private async recalculateUserLevel(): Promise<void> {
    const playedCount = await gameDao.getPlayedGamesCount();
    const userId = await AppPreferences.getLoggedInUserId();
    if (userId === -1) return;

    const user = await userDao.getUserById(userId);
    if (!user) return;

    const newLevel = calculateLevel(playedCount);
    const newTier = calculateTier(playedCount);

    if (user.level !== newLevel || user.tier !== newTier) {
      await userDao.updateUser({ ...user, level: newLevel, tier: newTier });
    }
  }
}

export const GameRepository = new GameRepositoryClass();