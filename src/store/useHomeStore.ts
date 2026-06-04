import { create } from 'zustand';
import { GameRepository } from '../data/repository/GameRepository';
import { AuthRepository } from '../data/repository/AuthRepository';
import { GameDto } from '../data/remote/dto/GameDto';

interface HomeState {
  username: string;
  popularThisYear: GameDto[];
  allTimeLegends: GameDto[];
  indieGems: GameDto[];
  competitive: GameDto[];
  coop: GameDto[];
  retro: GameDto[];
  isLoading: boolean;
  errorMessage: string | null;

  loadUsername: (userId: number) => Promise<void>;
  loadHomeData: () => Promise<void>;
}

export const useHomeStore = create<HomeState>((set) => ({
  username: 'Hunter',
  popularThisYear: [],
  allTimeLegends: [],
  indieGems: [],
  competitive: [],
  coop: [],
  retro: [],
  isLoading: false,
  errorMessage: null,

  loadUsername: async (userId: number) => {
    if (userId === -1) return;
    const user = await AuthRepository.getUserById(userId);
    set({ username: user?.username ?? 'Hunter' });
  },

  loadHomeData: async () => {
    set({ isLoading: true, errorMessage: null });

    const currentYear = new Date().getFullYear();
    const dates = `${currentYear}-01-01,${currentYear}-12-31`;

    const [thisYear, allTime, indie, comp, coop, retro] = await Promise.all([
      GameRepository.getGamesThisYear(dates),
      GameRepository.getAllTimeTopGames(),
      GameRepository.getGamesWithFilters({ genres: 'indie', pageSize: 10 }),
      GameRepository.getGamesWithFilters({ tags: 'multiplayer,competitive', pageSize: 10 }),
      GameRepository.getGamesWithFilters({ tags: 'co-op', pageSize: 10 }),
      GameRepository.getGamesWithFilters({ dates: '1980-01-01,2005-12-31', pageSize: 10 }),
    ]);

    const hasError = thisYear.error && allTime.error;

    set({
      popularThisYear: thisYear.data,
      allTimeLegends: allTime.data,
      indieGems: indie.data,
      competitive: comp.data,
      coop: coop.data,
      retro: retro.data,
      isLoading: false,
      errorMessage: hasError ? 'Failed to load games. Check your connection.' : null,
    });
  },
}));