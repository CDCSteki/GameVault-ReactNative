import { create } from 'zustand';
import { GameRepository } from '../data/repository/GameRepository';
import { GameDto } from '../data/remote/dto/GameDto';

interface GameListState {
  title: string;
  games: GameDto[];
  isLoading: boolean;
  errorMessage: string | null;
  pageSize: number;

  loadGames: (listType: string, pageSize?: number) => Promise<void>;
  onPageSizeChange: (listType: string, newSize: number) => Promise<void>;
  retry: (listType: string) => Promise<void>;
}

export const useGameListStore = create<GameListState>((set, get) => ({
  title: 'GameVault',
  games: [],
  isLoading: false,
  errorMessage: null,
  pageSize: 10,

  loadGames: async (listType, pageSize) => {
    const size = pageSize ?? get().pageSize;
    set({ isLoading: true, errorMessage: null, pageSize: size });

    const clean = listType.split('/').pop() ?? listType;

    const titleMap: Record<string, string> = {
      this_year: 'Popular This Year',
      all_time: 'All-Time Legends',
      discover_indie: 'Indie Gems',
      discover_competitive: 'Competitive',
      discover_coop: 'Co-Op',
      discover_retro: 'Retro',
    };

    const title = titleMap[clean] ?? 'GameVault';

    let result: { data: GameDto[]; error?: string };
    const currentYear = new Date().getFullYear();

    switch (clean) {
      case 'this_year':
        result = await GameRepository.getGamesThisYear(
          `${currentYear}-01-01,${currentYear}-12-31`,
          size
        );
        break;
      case 'all_time':
        result = await GameRepository.getAllTimeTopGames(size);
        break;
      case 'discover_indie':
        result = await GameRepository.getGamesWithFilters({ genres: 'indie', pageSize: size });
        break;
      case 'discover_competitive':
        result = await GameRepository.getGamesWithFilters({ tags: 'multiplayer,competitive', pageSize: size });
        break;
      case 'discover_coop':
        result = await GameRepository.getGamesWithFilters({ tags: 'co-op', pageSize: size });
        break;
      case 'discover_retro':
        result = await GameRepository.getGamesWithFilters({ dates: '1980-01-01,2005-12-31', pageSize: size });
        break;
      default:
        result = await GameRepository.getPopularGames(size);
    }

    set({
      title,
      games: result.data,
      isLoading: false,
      errorMessage: result.error ? 'Failed to load games. Check your connection.' : null,
    });
  },

  onPageSizeChange: async (listType, newSize) => {
    await get().loadGames(listType, newSize);
  },

  retry: async (listType) => {
    await get().loadGames(listType);
  },
}));