import { create } from 'zustand';
import { SearchRepository } from '../data/repository/SearchRepository';
import { GameRepository } from '../data/repository/GameRepository';
import { GameDto } from '../data/remote/dto/GameDto';
import { SearchHistoryEntity } from '../data/db/entities';
import i18n from '../locales/i18n';
import NetInfo from '@react-native-community/netinfo';

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
  isOffline: boolean;

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
  setupNetworkObserver: () => () => void;
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
  isOffline: false,

  loadDefaultGames: async () => {
    set({ isLoading: true });
    const result = await GameRepository.getPopularGames(20);
    set({ 
      defaultGames: result.data, 
      isLoading: false,
      errorMessage: result.error ? i18n.t('search.error_failed_to_load') : null
    });
  },

  loadSearchHistory: async () => {
    const history = await SearchRepository.getRecentSearches();
    set({ searchHistory: history });
  },

  setQuery: (q) => {
    set({ query: q, errorMessage: null });
    
    if (get().isOffline) return;

    if (debounceTimer) clearTimeout(debounceTimer);

    if (q.length >= 2) {
      debounceTimer = setTimeout(() => {
        get().submitSearch();
      }, 500);
    } else if (q.length === 0) {
      const filters = get().filters;
      if (!isFiltersEmpty(filters)) {
        debounceTimer = setTimeout(() => {
          get().submitSearch();
        }, 500);
      } else {
        set({ searchResults: [], hasSearched: false });
      }
    }
  },

  submitSearch: async () => {
    if (get().isOffline) return;
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

    const history = await SearchRepository.getRecentSearches();

    set({
      searchResults: result.data,
      searchHistory: history,
      isLoading: false,
      hasSearched: true,
      errorMessage: result.error ? i18n.t('search.error_failed_to_load') : null,
    });
  },

  onHistoryItemClick: async (query) => {
    if (get().isOffline) return;
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
    if (get().isOffline) return;
    set({ filters, isFilterSheetVisible: false });
    await get().submitSearch();
  },

  clearFilters: async () => {
    set({ filters: DEFAULT_FILTERS });
    if (get().isOffline) return;
    
    const { query } = get();
    if (query.trim()) {
      await get().submitSearch();
    } else {
      set({ searchResults: [], hasSearched: false });
    }
  },

  setupNetworkObserver: () => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected && state.isInternetReachable !== false;
      const { isOffline, defaultGames, hasSearched, query, filters, loadDefaultGames, submitSearch } = get();

      if (!isConnected && !isOffline) {
        if (debounceTimer) clearTimeout(debounceTimer);
        set({
          defaultGames: [],
          searchResults: [],
          isLoading: false,
          isOffline: true,
          errorMessage: i18n.t('search.error_failed_to_load')
        });
      } else if (isConnected && isOffline) {
        set({ isOffline: false });
        if (defaultGames.length === 0) {
          loadDefaultGames();
        }
        if (hasSearched || query.trim() !== '' || !isFiltersEmpty(filters)) {
          submitSearch();
        }
      }
    });
    
    return unsubscribe;
  }
}));

function isFiltersEmpty(f: SearchFilters): boolean {
  return !f.genre && !f.platform && !f.minRating && !f.year && !f.ordering;
}