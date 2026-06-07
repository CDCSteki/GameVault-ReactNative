import { create } from 'zustand';
import { entityToDetailDto, GameRepository } from '../data/repository/GameRepository';
import { GameEntity, PlayStatus } from '../data/db/entities';
import { useProfileStore } from './useAuthStore';
import { useAppStore } from './useAppStore';

export type LibraryTab = 'COLLECTION' | 'WISHLIST';
export type CollectionFilter = 'ALL' | 'PLAYING' | 'PLAYED' | 'NOT_PLAYED';

interface LibraryState {
  activeTab: LibraryTab;
  collectionFilter: CollectionFilter;
  collection: GameEntity[];
  wishlist: GameEntity[];
  isLoading: boolean;

  loadCollection: () => Promise<void>;
  loadWishlist: () => Promise<void>;
  loadAll: () => Promise<void>;
  setActiveTab: (tab: LibraryTab) => void;
  setCollectionFilter: (filter: CollectionFilter) => void;
  onPlayStatusChange: (rawgId: number, status: PlayStatus) => Promise<void>;
  onRemoveFromCollection: (rawgId: number) => Promise<void>;
  onRemoveFromWishlist: (rawgId: number) => Promise<void>;
  onMoveToCollection: (game: GameEntity) => Promise<void>;
  getFilteredCollection: () => GameEntity[];
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  activeTab: 'COLLECTION',
  collectionFilter: 'ALL',
  collection: [],
  wishlist: [],
  isLoading: false,

  loadCollection: async () => {
    const collection = await GameRepository.getCollection();
    set({ collection });
  },

  loadWishlist: async () => {
    const wishlist = await GameRepository.getWishlist();
    set({ wishlist });
  },

  loadAll: async () => {
    set({ isLoading: true });
    const [collection, wishlist] = await Promise.all([
      GameRepository.getCollection(),
      GameRepository.getWishlist(),
    ]);
    set({ collection, wishlist, isLoading: false });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setCollectionFilter: (filter) => set({ collectionFilter: filter }),

  onPlayStatusChange: async (rawgId, status) => {
  await GameRepository.updatePlayStatus(rawgId, status);
  await get().loadCollection();

  const userId = useAppStore.getState().userId;
  if (userId !== -1) {
    await useProfileStore.getState().refreshUser(userId);
  }
},

  onRemoveFromCollection: async (rawgId) => {
    await GameRepository.removeFromCollection(rawgId);
    await get().loadCollection();
  },

  onRemoveFromWishlist: async (rawgId) => {
    await GameRepository.removeFromWishlist(rawgId);
    await get().loadWishlist();
  },

  onMoveToCollection: async (game) => {
    const dto = entityToDetailDto(game);
    await GameRepository.addToCollection(dto);
    await Promise.all([get().loadCollection(), get().loadWishlist()]);
  },

  getFilteredCollection: () => {
    const { collection, collectionFilter } = get();
    switch (collectionFilter) {
      case 'PLAYING':    return collection.filter((g) => g.playStatus === 'PLAYING');
      case 'PLAYED':     return collection.filter((g) => g.playStatus === 'PLAYED');
      case 'NOT_PLAYED': return collection.filter((g) => g.playStatus === 'NOT_PLAYED');
      default:           return collection;
    }
  },
}));