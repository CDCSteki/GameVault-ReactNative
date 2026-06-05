import { SQLiteDatabase } from 'expo-sqlite';
import { GameEntity, PlayStatus } from '../entities';
import { getDatabase } from '../database';

export class GameDao {
  private async db(): Promise<SQLiteDatabase> {
    return getDatabase();
  }

  async insertGame(game: GameEntity): Promise<void> {
    const db = await this.db();
    await db.runAsync(
      `INSERT OR REPLACE INTO games (
        userId, rawgId, name, coverImageUrl, backgroundImageUrl, description,
        developer, releaseDate, platforms, genres, storageSize,
        rating, userRating, userNotes, isInCollection, isInWishlist,
        isPlayed, playStatus, addedAt
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        game.userId,
        game.rawgId,
        game.name,
        game.coverImageUrl ?? null,
        game.backgroundImageUrl ?? null,
        game.description ?? null,
        game.developer ?? null,
        game.releaseDate ?? null,
        game.platforms ?? null,
        game.genres ?? null,
        game.storageSize ?? null,
        game.rating,
        game.userRating,
        game.userNotes ?? null,
        game.isInCollection ? 1 : 0,
        game.isInWishlist ? 1 : 0,
        game.isPlayed ? 1 : 0,
        game.playStatus,
        game.addedAt ?? Date.now(),
      ]
    );
  }

  async updateGame(game: GameEntity): Promise<void> {
    await this.insertGame(game);
  }

  async getCollection(userId: number): Promise<GameEntity[]> {
    const db = await this.db();
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM games WHERE userId = ? AND isInCollection = 1 ORDER BY addedAt DESC`,
      [userId]
    );
    return rows.map(this.mapRow);
  }

  async getPlayedGames(userId: number): Promise<GameEntity[]> {
    const db = await this.db();
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM games WHERE userId = ? AND isInCollection = 1 AND playStatus = 'PLAYED' ORDER BY addedAt DESC`,
      [userId]
    );
    return rows.map(this.mapRow);
  }

  async getNotPlayedGames(userId: number): Promise<GameEntity[]> {
    const db = await this.db();
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM games WHERE userId = ? AND isInCollection = 1 AND playStatus = 'NOT_PLAYED' ORDER BY addedAt DESC`,
      [userId]
    );
    return rows.map(this.mapRow);
  }

  async getPlayingGames(userId: number): Promise<GameEntity[]> {
    const db = await this.db();
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM games WHERE userId = ? AND isInCollection = 1 AND playStatus = 'PLAYING' ORDER BY addedAt DESC`,
      [userId]
    );
    return rows.map(this.mapRow);
  }

  async getWishlist(userId: number): Promise<GameEntity[]> {
    const db = await this.db();
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM games WHERE userId = ? AND isInWishlist = 1 ORDER BY addedAt DESC`,
      [userId]
    );
    return rows.map(this.mapRow);
  }

  async getGameById(userId: number, rawgId: number): Promise<GameEntity | null> {
    const db = await this.db();
    const row = await db.getFirstAsync<any>(
      `SELECT * FROM games WHERE userId = ? AND rawgId = ? LIMIT 1`,
      [userId, rawgId]
    );
    return row ? this.mapRow(row) : null;
  }

  async updateCollectionStatus(userId: number, rawgId: number, inCollection: boolean): Promise<void> {
    const db = await this.db();
    await db.runAsync(
      `UPDATE games SET isInCollection = ? WHERE userId = ? AND rawgId = ?`,
      [inCollection ? 1 : 0, userId, rawgId]
    );
  }

  async updateWishlistStatus(userId: number, rawgId: number, inWishlist: boolean): Promise<void> {
    const db = await this.db();
    await db.runAsync(
      `UPDATE games SET isInWishlist = ? WHERE userId = ? AND rawgId = ?`,
      [inWishlist ? 1 : 0, userId, rawgId]
    );
  }

  async updatePlayedStatus(userId: number, rawgId: number, isPlayed: boolean, playStatus: PlayStatus): Promise<void> {
    const db = await this.db();
    await db.runAsync(
      `UPDATE games SET isPlayed = ?, playStatus = ? WHERE userId = ? AND rawgId = ?`,
      [isPlayed ? 1 : 0, playStatus, userId, rawgId]
    );
  }

  async updatePlayStatus(userId: number, rawgId: number, playStatus: PlayStatus): Promise<void> {
    const db = await this.db();
    await db.runAsync(
      `UPDATE games SET playStatus = ? WHERE userId = ? AND rawgId = ?`,
      [playStatus, userId, rawgId]
    );
  }

  async updateUserRating(userId: number, rawgId: number, rating: number): Promise<void> {
    const db = await this.db();
    await db.runAsync(
      `UPDATE games SET userRating = ? WHERE userId = ? AND rawgId = ?`,
      [rating, userId, rawgId]
    );
  }

  async updateUserNotes(userId: number, rawgId: number, notes: string | null): Promise<void> {
    const db = await this.db();
    await db.runAsync(
      `UPDATE games SET userNotes = ? WHERE userId = ? AND rawgId = ?`,
      [notes ?? null, userId, rawgId]
    );
  }

  async deleteGame(userId: number, rawgId: number): Promise<void> {
    const db = await this.db();
    await db.runAsync(`DELETE FROM games WHERE userId = ? AND rawgId = ?`, [userId, rawgId]);
  }

  async getPlayedGamesCount(userId: number): Promise<number> {
    const db = await this.db();
    const row = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM games WHERE userId = ? AND isInCollection = 1 AND playStatus = 'PLAYED'`,
      [userId]
    );
    return row?.count ?? 0;
  }

  async filterCollection(userId: number, genre: string | null): Promise<GameEntity[]> {
    const db = await this.db();
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM games
       WHERE userId = ? AND isInCollection = 1
       AND (? IS NULL OR genres LIKE '%' || ? || '%')
       ORDER BY addedAt DESC`,
      [userId, genre, genre]
    );
    return rows.map(this.mapRow);
  }

  async filterWishlist(userId: number, genre: string | null): Promise<GameEntity[]> {
    const db = await this.db();
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM games
       WHERE userId = ? AND isInWishlist = 1
       AND (? IS NULL OR genres LIKE '%' || ? || '%')
       ORDER BY addedAt DESC`,
      [userId, genre, genre]
    );
    return rows.map(this.mapRow);
  }

  private mapRow(row: any): GameEntity {
    return {
      userId: row.userId,
      rawgId: row.rawgId,
      name: row.name,
      coverImageUrl: row.coverImageUrl ?? null,
      backgroundImageUrl: row.backgroundImageUrl ?? null,
      description: row.description ?? null,
      developer: row.developer ?? null,
      releaseDate: row.releaseDate ?? null,
      platforms: row.platforms ?? null,
      genres: row.genres ?? null,
      storageSize: row.storageSize ?? null,
      rating: row.rating ?? 0,
      userRating: row.userRating ?? 0,
      userNotes: row.userNotes ?? null,
      isInCollection: row.isInCollection === 1,
      isInWishlist: row.isInWishlist === 1,
      isPlayed: row.isPlayed === 1,
      playStatus: (row.playStatus as PlayStatus) ?? 'NOT_PLAYED',
      addedAt: row.addedAt,
    };
  }
}

export const gameDao = new GameDao();