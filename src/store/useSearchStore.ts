import { create } from 'zustand';
import { SearchRepository } from '../data/repository/SearchRepository';
import { GameRepository } from '../data/repository/GameRepository';
import { GameDto } from '../data/remote/dto/GameDto';
import { SearchHistoryEntity } from '../data/db/entities';

export interface SearchFilters {
  genre: string | null;
  platform: string | null;
  minRating: string | null;
  year: string | null;
  ordering: string | null;
}

const DEFAULT_FILTERS: SearchFilters = {
  genre: null,
  platform: null,
  minRating: null,
  year: null,
  ordering: null,
};

interface SearchState {
  query: string;
  searchResults: GameDto[];
  defaultGames: GameDto[];
  searchHistory: SearchHistoryEntity[];
  filters: SearchFilters;
  isLoading: boolean;
  isFilterSheetVisible: boolean;
  hasSearched: boolean;
  errorMessage: string | null;

  loadDefaultGames: () => Promise<void>;
  loadSearchHistory: () => Promise<void>;
  setQuery: (q: string) => void;
  submitSearch: () => Promise<void>;
  onHistoryItemClick: (query: string) => Promise<void>;
  deleteHistoryItem: (id: number) => Promise<void>;
  clearHistory: () => Promise<void>;
  toggleFilterSheet: () => void;
  applyFilters: (filters: SearchFilters) => Promise<void>;
  clearFilters: () => Promise<void>;
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  searchResults: [],
  defaultGames: [],
  searchHistory: [],
  filters: DEFAULT_FILTERS,
  isLoading: false,
  isFilterSheetVisible: false,
  hasSearched: false,
  errorMessage: null,

  loadDefaultGames: async () => {
    set({ isLoading: true });
    const result = await GameRepository.getPopularGames(20);
    set({ defaultGames: result.data, isLoading: false });
  },

  loadSearchHistory: async () => {
    const history = await SearchRepository.getRecentSearches();
    set({ searchHistory: history });
  },

  setQuery: (q) => {
    set({ query: q, errorMessage: null });
    if (debounceTimer) clearTimeout(debounceTimer);

    if (q.length >= 2) {
      debounceTimer = setTimeout(() => {
        get().submitSearch();
      }, 500);
    } else if (q.length === 0 && isFiltersEmpty(get().filters)) {
      set({ searchResults: [], hasSearched: false });
    }
  },

  submitSearch: async () => {
    const { query, filters } = get();
    if (!query.trim() && isFiltersEmpty(filters)) return;
    set({ isLoading: true, errorMessage: null });

    if (query.trim()) await SearchRepository.saveSearch(query.trim());

    const today = new Date().toISOString().split('T')[0];
    const datesParam = filters.year
      ? `${filters.year}-01-01,${filters.year}-12-31`
      : filters.ordering === '-released'
      ? `1950-01-01,${today}`
      : undefined;

    const result = await SearchRepository.searchGames({
      query,
      genres: filters.genre ?? undefined,
      platforms: filters.platform ?? undefined,
      metacritic: filters.minRating ?? undefined,
      dates: datesParam,
      ordering: filters.ordering ?? undefined,
    });

    // Refresh history after saving
    const history = await SearchRepository.getRecentSearches();

    set({
      searchResults: result.data,
      searchHistory: history,
      isLoading: false,
      hasSearched: true,
      errorMessage: result.error ? 'Failed to load. Check your connection.' : null,
    });
  },

  onHistoryItemClick: async (query) => {
    set({ query });
    await get().submitSearch();
  },

  deleteHistoryItem: async (id) => {
    await SearchRepository.deleteSearchById(id);
    const history = await SearchRepository.getRecentSearches();
    set({ searchHistory: history });
  },

  clearHistory: async () => {
    await SearchRepository.clearAllHistory();
    set({ searchHistory: [] });
  },

  toggleFilterSheet: () =>
    set((s) => ({ isFilterSheetVisible: !s.isFilterSheetVisible })),

  applyFilters: async (filters) => {
    set({ filters, isFilterSheetVisible: false });
    await get().submitSearch();
  },

  clearFilters: async () => {
    set({ filters: DEFAULT_FILTERS });
    const { query } = get();
    if (query.trim()) {
      await get().submitSearch();
    } else {
      set({ searchResults: [], hasSearched: false });
    }
  },
}));

function isFiltersEmpty(f: SearchFilters): boolean {
  return !f.genre && !f.platform && !f.minRating && !f.year && !f.ordering;
}