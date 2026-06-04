import { searchHistoryDao } from '../db/dao/searchHistoryDao';
import { SearchHistoryEntity } from '../db/entities';
import { searchGames as apiSearchGames } from '../remote/api/RawgApi';
import { GameDto } from '../remote/dto/GameDto';

class SearchRepositoryClass {
  // ── REMOTE SEARCH ─────────────────────────────────────────────────────────

  async searchGames(params: {
    query: string;
    genres?: string;
    platforms?: string;
    metacritic?: string;
    dates?: string;
    ordering?: string;
    page?: number;
  }): Promise<{ data: GameDto[]; error?: string }> {
    try {
      const response = await apiSearchGames({
        query: params.query,
        genres: params.genres,
        platforms: params.platforms,
        metacritic: params.metacritic,
        dates: params.dates,
        ordering: params.ordering,
        page: params.page ?? 1,
        pageSize: 20,
      });
      return { data: response.results };
    } catch (e: any) {
      return { data: [], error: e.message };
    }
  }

  // ── HISTORY ───────────────────────────────────────────────────────────────

  async getRecentSearches(): Promise<SearchHistoryEntity[]> {
    return searchHistoryDao.getRecentSearches();
  }

  async saveSearch(query: string): Promise<void> {
    if (!query.trim()) return;
    // Remove duplicate first (same as Kotlin: delete then re-insert to bump timestamp)
    if ((await searchHistoryDao.queryExists(query)) > 0) {
      await searchHistoryDao.deleteByQuery(query);
    }
    await searchHistoryDao.insertSearch(query);
  }

  async deleteSearchById(id: number): Promise<void> {
    await searchHistoryDao.deleteById(id);
  }

  async clearAllHistory(): Promise<void> {
    await searchHistoryDao.clearAllHistory();
  }
}

export const SearchRepository = new SearchRepositoryClass();