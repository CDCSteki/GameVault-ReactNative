import { SQLiteDatabase } from 'expo-sqlite';
import { SearchHistoryEntity } from '../entities';
import { getDatabase } from '../database';

export class SearchHistoryDao {
  private async db(): Promise<SQLiteDatabase> {
    return getDatabase();
  }

  async insertSearch(query: string): Promise<void> {
    const db = await this.db();
    await db.runAsync(
      `INSERT OR REPLACE INTO search_history (query, searchedAt) VALUES (?, ?)`,
      [query, Date.now()]
    );
  }

  async getRecentSearches(): Promise<SearchHistoryEntity[]> {
    const db = await this.db();
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM search_history ORDER BY searchedAt DESC LIMIT 20`
    );
    return rows.map(this.mapRow);
  }

  async clearAllHistory(): Promise<void> {
    const db = await this.db();
    await db.runAsync(`DELETE FROM search_history`);
  }

  async deleteById(id: number): Promise<void> {
    const db = await this.db();
    await db.runAsync(`DELETE FROM search_history WHERE id = ?`, [id]);
  }

  async queryExists(query: string): Promise<number> {
    const db = await this.db();
    const row = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM search_history WHERE query = ?`,
      [query]
    );
    return row?.count ?? 0;
  }

  async deleteByQuery(query: string): Promise<void> {
    const db = await this.db();
    await db.runAsync(`DELETE FROM search_history WHERE query = ?`, [query]);
  }

  private mapRow(row: any): SearchHistoryEntity {
    return {
      id: row.id,
      query: row.query,
      searchedAt: row.searchedAt,
    };
  }
}

export const searchHistoryDao = new SearchHistoryDao();