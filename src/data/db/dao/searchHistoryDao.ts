import { SQLiteDatabase } from 'expo-sqlite';
import { SearchHistoryEntity } from '../entities';
import { getDatabase } from '../database';

export class SearchHistoryDao {
  private async db(): Promise<SQLiteDatabase> {
    return getDatabase();
  }

  async insertSearch(userId: number, query: string): Promise<void> {
    const db = await this.db();
    await db.runAsync(
      `INSERT INTO search_history (userId, query, searchedAt) VALUES (?, ?, ?)`,
      [userId, query, Date.now()]
    );
  }

  async getRecentSearches(userId: number): Promise<SearchHistoryEntity[]> {
    const db = await this.db();
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM search_history WHERE userId = ? ORDER BY searchedAt DESC LIMIT 20`,
      [userId]
    );
    return rows.map(this.mapRow);
  }

  async clearAllHistory(userId: number): Promise<void> {
    const db = await this.db();
    await db.runAsync(`DELETE FROM search_history WHERE userId = ?`, [userId]);
  }

  async deleteById(userId: number, id: number): Promise<void> {
    const db = await this.db();
    await db.runAsync(`DELETE FROM search_history WHERE userId = ? AND id = ?`, [userId, id]);
  }

  async queryExists(userId: number, query: string): Promise<number> {
    const db = await this.db();
    const row = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM search_history WHERE userId = ? AND query = ?`,
      [userId, query]
    );
    return row?.count ?? 0;
  }

  async deleteByQuery(userId: number, query: string): Promise<void> {
    const db = await this.db();
    await db.runAsync(`DELETE FROM search_history WHERE userId = ? AND query = ?`, [userId, query]);
  }

  private mapRow(row: any): SearchHistoryEntity {
    return {
      id: row.id,
      userId: row.userId,
      query: row.query,
      searchedAt: row.searchedAt,
    };
  }
}

export const searchHistoryDao = new SearchHistoryDao();