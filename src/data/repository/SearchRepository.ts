import { searchHistoryDao } from '../db/dao/searchHistoryDao';
import { SearchHistoryEntity } from '../db/entities';
import { searchGames as apiSearchGames } from '../remote/api/RawgApi';
import { GameDto } from '../remote/dto/GameDto';
import { AppPreferences } from '../preferences/AppPreferences';

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
    const userId = await AppPreferences.getLoggedInUserId();
    if (userId === -1) return [];
    return searchHistoryDao.getRecentSearches(userId);
  }

  async saveSearch(query: string): Promise<void> {
    if (!query.trim()) return;
    const userId = await AppPreferences.getLoggedInUserId();
    if (userId === -1) return;

    if ((await searchHistoryDao.queryExists(userId, query)) > 0) {
      await searchHistoryDao.deleteByQuery(userId, query);
    }
    await searchHistoryDao.insertSearch(userId, query);
  }

  async deleteSearchById(id: number): Promise<void> {
    const userId = await AppPreferences.getLoggedInUserId();
    if (userId !== -1) {
      await searchHistoryDao.deleteById(userId, id);
    }
  }

  async clearAllHistory(): Promise<void> {
    const userId = await AppPreferences.getLoggedInUserId();
    if (userId !== -1) {
      await searchHistoryDao.clearAllHistory(userId);
    }
  }
}

export const SearchRepository = new SearchRepositoryClass();