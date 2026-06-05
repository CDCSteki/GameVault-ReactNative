import { create } from 'zustand';
import { GameRepository, gameDetailToEntity, entityToDetailDto } from '../data/repository/GameRepository';
import { GameDetailDto, GameScreenshotDto } from '../data/remote/dto/GameDto';
import { GameEntity, PlayStatus } from '../data/db/entities';
import { useLibraryStore } from './useLibraryStore';
import i18n from '../locales/i18n';

interface GameDetailState {
  gameDetail: GameDetailDto | null;
  localGame: GameEntity | null;
  screenshots: GameScreenshotDto[];
  isLoading: boolean;
  errorMessage: string | null;
  snackbarMessage: string | null;
  isInCollection: boolean;
  isInWishlist: boolean;
  playStatus: PlayStatus;
  userRating: number;
  userNotes: string;
  showNotesDialog: boolean;

  loadGameDetail: (gameId: number) => Promise<void>;
  refreshLocalState: (gameId: number) => Promise<void>;
  addToCollection: (gameId: number) => Promise<void>;
  removeFromCollection: (gameId: number) => Promise<void>;
  addToWishlist: (gameId: number) => Promise<void>;
  removeFromWishlist: (gameId: number) => Promise<void>;
  onPlayStatusChange: (gameId: number, status: PlayStatus) => Promise<void>;
  onRatingChange: (gameId: number, rating: number) => Promise<void>;
  onNotesChange: (notes: string) => void;
  onSaveNotes: (gameId: number) => Promise<void>;
  toggleNotesDialog: () => void;
  dismissSnackbar: () => void;
  retry: (gameId: number) => Promise<void>;
}

export const useGameDetailStore = create<GameDetailState>((set, get) => ({
  gameDetail: null,
  localGame: null,
  screenshots: [],
  isLoading: false,
  errorMessage: null,
  snackbarMessage: null,
  isInCollection: false,
  isInWishlist: false,
  playStatus: 'NOT_PLAYED',
  userRating: 0,
  userNotes: '',
  showNotesDialog: false,

  loadGameDetail: async (gameId) => {
    set({ isLoading: true, errorMessage: null });

    const detailResult = await GameRepository.getGameDetails(gameId);

    if (detailResult.data) {
      const screenshotsResult = await GameRepository.getGameScreenshots(gameId);
      set({
        gameDetail: detailResult.data,
        screenshots: screenshotsResult.data?.results ?? [],
        isLoading: false,
      });
    } else {
      const localGame = await GameRepository.getGameById(gameId);
      if (localGame) {
        set({
          gameDetail: entityToDetailDto(localGame),
          screenshots: [],
          isLoading: false,
        });
      } else {
        set({
          gameDetail: null,
          isLoading: false,
          errorMessage: i18n.t('game_detail.msg_no_internet'),
        });
      }
    }

    await get().refreshLocalState(gameId);
  },

  refreshLocalState: async (gameId) => {
    const localGame = await GameRepository.getGameById(gameId);
    set({
      localGame,
      isInCollection: localGame?.isInCollection ?? false,
      isInWishlist: localGame?.isInWishlist ?? false,
      playStatus: (localGame?.playStatus as PlayStatus) ?? 'NOT_PLAYED',
      userRating: localGame?.userRating ?? 0,
      userNotes: localGame?.userNotes ?? '',
    });
  },

  addToCollection: async (gameId) => {
    const { gameDetail } = get();
    if (!gameDetail) return;
    const result = await GameRepository.addToCollection(gameDetail);
    set({
      snackbarMessage:
        result === 'Success' ? i18n.t('game_detail.msg_added_collection') : i18n.t('game_detail.msg_already_collection'),
    });
    await get().refreshLocalState(gameId);
    await useLibraryStore.getState().loadAll();
  },

  removeFromCollection: async (gameId) => {
    await GameRepository.removeFromCollection(gameId);
    set({ snackbarMessage: i18n.t('game_detail.msg_removed_collection') });
    await get().refreshLocalState(gameId);
    await useLibraryStore.getState().loadAll();
  },

  addToWishlist: async (gameId) => {
    const { gameDetail } = get();
    if (!gameDetail) return;
    const result = await GameRepository.addToWishlist(gameDetail);
    const messages: Record<string, string> = {
      Success: i18n.t('game_detail.msg_added_wishlist'),
      AlreadyInWishlist: i18n.t('game_detail.msg_already_wishlist'),
      AlreadyInCollection: i18n.t('game_detail.msg_wishlist_in_collection'),
    };
    set({ snackbarMessage: messages[result] });
    await get().refreshLocalState(gameId);
    await useLibraryStore.getState().loadAll();
  },

  removeFromWishlist: async (gameId) => {
    await GameRepository.removeFromWishlist(gameId);
    set({ snackbarMessage: i18n.t('game_detail.msg_removed_wishlist') });
    await get().refreshLocalState(gameId);
    await useLibraryStore.getState().loadAll();
  },

  onPlayStatusChange: async (gameId, status) => {
    await GameRepository.updatePlayStatus(gameId, status);
    await get().refreshLocalState(gameId);
    await useLibraryStore.getState().loadAll();
  },

  onRatingChange: async (gameId, rating) => {
    set({ userRating: rating });
    const { localGame, gameDetail } = get();
    if (!localGame && gameDetail) {
      await GameRepository.addToCollection(gameDetail);
    }
    await GameRepository.updateUserRating(gameId, rating);
    await get().refreshLocalState(gameId);
  },

  onNotesChange: (notes) => set({ userNotes: notes }),

  onSaveNotes: async (gameId) => {
    await GameRepository.updateUserNotes(gameId, get().userNotes);
    set({ showNotesDialog: false });
    await get().refreshLocalState(gameId);
  },

  toggleNotesDialog: () =>
    set((s) => ({ showNotesDialog: !s.showNotesDialog })),

  dismissSnackbar: () => set({ snackbarMessage: null }),

  retry: async (gameId) => {
    await get().loadGameDetail(gameId);
  },
}));