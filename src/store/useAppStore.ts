import { create } from 'zustand';
import { AppPreferences } from '../data/preferences/AppPreferences';
import { AppTheme } from '../theme/colors';
import i18n from '../locales/i18n';

interface AppState {
  isLoggedIn: boolean;
  userId: number;
  appTheme: AppTheme;
  language: string;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  setLoggedIn: (userId: number) => Promise<void>;
  setLoggedOut: () => Promise<void>;
  setAppTheme: (theme: AppTheme) => Promise<void>;
  setLanguage: (lang: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  isLoggedIn: false,
  userId: -1,
  appTheme: 'CYBER_DARK',
  language: 'en',
  isInitialized: false,

  initialize: async () => {
    const prefs = await AppPreferences.loadAll();
    await i18n.changeLanguage(prefs.language);
    set({
      isLoggedIn: prefs.isLoggedIn,
      userId: prefs.userId,
      appTheme: prefs.appTheme,
      language: prefs.language,
      isInitialized: true,
    });
  },

  setLoggedIn: async (userId: number) => {
    await AppPreferences.saveLoggedInUser(userId);
    set({ isLoggedIn: true, userId });
  },

  setLoggedOut: async () => {
    await AppPreferences.clearLoggedInUser();
    set({ isLoggedIn: false, userId: -1 });
  },

  setAppTheme: async (theme: AppTheme) => {
    await AppPreferences.setAppTheme(theme);
    set({ appTheme: theme });
  },

  setLanguage: async (lang: string) => {
    await AppPreferences.setLanguage(lang);
    await i18n.changeLanguage(lang);
    set({ language: lang });
  },
}));