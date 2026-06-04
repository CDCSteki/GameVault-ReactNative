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
        rawgId, name, coverImageUrl, backgroundImageUrl, description,
        developer, releaseDate, platforms, genres, storageSize,
        rating, userRating, userNotes, isInCollection, isInWishlist,
        isPlayed, playStatus, addedAt
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
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

  async getCollection(): Promise<GameEntity[]> {
    const db = await this.db();
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM games WHERE isInCollection = 1 ORDER BY addedAt DESC`
    );
    return rows.map(this.mapRow);
  }

  async getPlayedGames(): Promise<GameEntity[]> {
    const db = await this.db();
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM games WHERE isInCollection = 1 AND playStatus = 'PLAYED' ORDER BY addedAt DESC`
    );
    return rows.map(this.mapRow);
  }

  async getNotPlayedGames(): Promise<GameEntity[]> {
    const db = await this.db();
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM games WHERE isInCollection = 1 AND playStatus = 'NOT_PLAYED' ORDER BY addedAt DESC`
    );
    return rows.map(this.mapRow);
  }

  async getPlayingGames(): Promise<GameEntity[]> {
    const db = await this.db();
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM games WHERE isInCollection = 1 AND playStatus = 'PLAYING' ORDER BY addedAt DESC`
    );
    return rows.map(this.mapRow);
  }

  async getWishlist(): Promise<GameEntity[]> {
    const db = await this.db();
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM games WHERE isInWishlist = 1 ORDER BY addedAt DESC`
    );
    return rows.map(this.mapRow);
  }

  async getGameById(rawgId: number): Promise<GameEntity | null> {
    const db = await this.db();
    const row = await db.getFirstAsync<any>(
      `SELECT * FROM games WHERE rawgId = ? LIMIT 1`,
      [rawgId]
    );
    return row ? this.mapRow(row) : null;
  }

  async updateCollectionStatus(rawgId: number, inCollection: boolean): Promise<void> {
    const db = await this.db();
    await db.runAsync(
      `UPDATE games SET isInCollection = ? WHERE rawgId = ?`,
      [inCollection ? 1 : 0, rawgId]
    );
  }

  async updateWishlistStatus(rawgId: number, inWishlist: boolean): Promise<void> {
    const db = await this.db();
    await db.runAsync(
      `UPDATE games SET isInWishlist = ? WHERE rawgId = ?`,
      [inWishlist ? 1 : 0, rawgId]
    );
  }

  async updatePlayedStatus(rawgId: number, isPlayed: boolean, playStatus: PlayStatus): Promise<void> {
    const db = await this.db();
    await db.runAsync(
      `UPDATE games SET isPlayed = ?, playStatus = ? WHERE rawgId = ?`,
      [isPlayed ? 1 : 0, playStatus, rawgId]
    );
  }

  async updatePlayStatus(rawgId: number, playStatus: PlayStatus): Promise<void> {
    const db = await this.db();
    await db.runAsync(
      `UPDATE games SET playStatus = ? WHERE rawgId = ?`,
      [playStatus, rawgId]
    );
  }

  async updateUserRating(rawgId: number, rating: number): Promise<void> {
    const db = await this.db();
    await db.runAsync(
      `UPDATE games SET userRating = ? WHERE rawgId = ?`,
      [rating, rawgId]
    );
  }

  async updateUserNotes(rawgId: number, notes: string | null): Promise<void> {
    const db = await this.db();
    await db.runAsync(
      `UPDATE games SET userNotes = ? WHERE rawgId = ?`,
      [notes ?? null, rawgId]
    );
  }

  async deleteGame(rawgId: number): Promise<void> {
    const db = await this.db();
    await db.runAsync(`DELETE FROM games WHERE rawgId = ?`, [rawgId]);
  }

  async getPlayedGamesCount(): Promise<number> {
    const db = await this.db();
    const row = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM games WHERE isInCollection = 1 AND playStatus = 'PLAYED'`
    );
    return row?.count ?? 0;
  }

  async filterCollection(genre: string | null): Promise<GameEntity[]> {
    const db = await this.db();
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM games
       WHERE isInCollection = 1
       AND (? IS NULL OR genres LIKE '%' || ? || '%')
       ORDER BY addedAt DESC`,
      [genre, genre]
    );
    return rows.map(this.mapRow);
  }

  async filterWishlist(genre: string | null): Promise<GameEntity[]> {
    const db = await this.db();
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM games
       WHERE isInWishlist = 1
       AND (? IS NULL OR genres LIKE '%' || ? || '%')
       ORDER BY addedAt DESC`,
      [genre, genre]
    );
    return rows.map(this.mapRow);
  }

  private mapRow(row: any): GameEntity {
    return {
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