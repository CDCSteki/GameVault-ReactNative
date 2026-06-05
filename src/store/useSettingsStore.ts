import { create } from 'zustand';
import { AppPreferences } from '../data/preferences/AppPreferences';
import { AuthRepository } from '../data/repository/AuthRepository';
import { SearchRepository } from '../data/repository/SearchRepository';
import { AppTheme } from '../theme/colors';
import { useAppStore } from './useAppStore';
import { useSearchStore } from './useSearchStore';

interface SettingsState {
  appTheme: AppTheme;
  language: string;
  showDeleteDialog: boolean;
  historyCleared: boolean;

  loadSettings: () => Promise<void>;
  selectTheme: (theme: AppTheme) => Promise<void>;
  changeLanguage: (lang: string) => Promise<void>;
  clearSearchHistory: () => Promise<void>;
  showDeleteAccountDialog: () => void;
  dismissDeleteAccountDialog: () => void;
  deleteAccount: (userId: number, onSuccess: () => void) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  appTheme: 'CYBER_DARK',
  language: 'en',
  showDeleteDialog: false,
  historyCleared: false,

  loadSettings: async () => {
    const [theme, language] = await Promise.all([
      AppPreferences.getAppTheme(),
      AppPreferences.getLanguage(),
    ]);
    set({ appTheme: theme, language });
  },

  selectTheme: async (theme) => {
    await useAppStore.getState().setAppTheme(theme);
    set({ appTheme: theme });
  },

  changeLanguage: async (lang) => {
    await useAppStore.getState().setLanguage(lang);
    set({ language: lang });
  },

  clearSearchHistory: async () => {
    await SearchRepository.clearAllHistory();
    await useSearchStore.getState().clearHistory();
    set({ historyCleared: true });
  },

  showDeleteAccountDialog: () => set({ showDeleteDialog: true }),
  dismissDeleteAccountDialog: () => set({ showDeleteDialog: false }),

  deleteAccount: async (userId, onSuccess) => {
    await AuthRepository.deleteAccount(userId);
    await useAppStore.getState().setLoggedOut();
    set({ showDeleteDialog: false });
    onSuccess();
  },
}));