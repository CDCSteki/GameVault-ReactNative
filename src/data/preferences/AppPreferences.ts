import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PREFS_KEY_USER_ID,
  PREFS_KEY_IS_LOGGED_IN,
  PREFS_KEY_APP_THEME,
  PREFS_KEY_LANGUAGE,
} from '../../constants/constants';

export type AppTheme =
  | 'CYBER_DARK'
  | 'OCEAN_BLUE'
  | 'FOREST_GREEN'
  | 'SUNSET'
  | 'MIDNIGHT_RED'
  | 'NEON_GREEN'
  | 'ROSE_GOLD';

class AppPreferencesClass {
  // --- AUTH ---
  async isLoggedIn(): Promise<boolean> {
    const val = await AsyncStorage.getItem(PREFS_KEY_IS_LOGGED_IN);
    return val === 'true';
  }

  async getLoggedInUserId(): Promise<number> {
    const val = await AsyncStorage.getItem(PREFS_KEY_USER_ID);
    return val ? parseInt(val, 10) : -1;
  }

  async saveLoggedInUser(userId: number): Promise<void> {
    await AsyncStorage.multiSet([
      [PREFS_KEY_USER_ID, String(userId)],
      [PREFS_KEY_IS_LOGGED_IN, 'true'],
    ]);
  }

  async clearLoggedInUser(): Promise<void> {
    await AsyncStorage.multiSet([
      [PREFS_KEY_USER_ID, '-1'],
      [PREFS_KEY_IS_LOGGED_IN, 'false'],
    ]);
  }

  // --- THEME ---
  async getAppTheme(): Promise<AppTheme> {
    const val = await AsyncStorage.getItem(PREFS_KEY_APP_THEME);
    const valid: AppTheme[] = [
      'CYBER_DARK',
      'OCEAN_BLUE',
      'FOREST_GREEN',
      'SUNSET',
      'MIDNIGHT_RED',
      'NEON_GREEN',
      'ROSE_GOLD',
    ];
    return valid.includes(val as AppTheme) ? (val as AppTheme) : 'CYBER_DARK';
  }

  async setAppTheme(theme: AppTheme): Promise<void> {
    await AsyncStorage.setItem(PREFS_KEY_APP_THEME, theme);
  }

  // --- LANGUAGE ---
  async getLanguage(): Promise<string> {
    const val = await AsyncStorage.getItem(PREFS_KEY_LANGUAGE);
    return val ?? 'en';
  }

  async setLanguage(lang: string): Promise<void> {
    await AsyncStorage.setItem(PREFS_KEY_LANGUAGE, lang);
  }

  // --- BATCH READ (for app init) ---
  async loadAll(): Promise<{
    isLoggedIn: boolean;
    userId: number;
    appTheme: AppTheme;
    language: string;
  }> {
    const keys = [
      PREFS_KEY_IS_LOGGED_IN,
      PREFS_KEY_USER_ID,
      PREFS_KEY_APP_THEME,
      PREFS_KEY_LANGUAGE,
    ];
    const pairs = await AsyncStorage.multiGet(keys);
    const map = Object.fromEntries(pairs.map(([k, v]) => [k, v]));

    const validThemes: AppTheme[] = [
      'CYBER_DARK',
      'OCEAN_BLUE',
      'FOREST_GREEN',
      'SUNSET',
      'MIDNIGHT_RED',
      'NEON_GREEN',
      'ROSE_GOLD',
    ];
    const rawTheme = map[PREFS_KEY_APP_THEME];

    return {
      isLoggedIn: map[PREFS_KEY_IS_LOGGED_IN] === 'true',
      userId: map[PREFS_KEY_USER_ID] ? parseInt(map[PREFS_KEY_USER_ID]!, 10) : -1,
      appTheme: validThemes.includes(rawTheme as AppTheme)
        ? (rawTheme as AppTheme)
        : 'CYBER_DARK',
      language: map[PREFS_KEY_LANGUAGE] ?? 'en',
    };
  }
}

export const AppPreferences = new AppPreferencesClass();