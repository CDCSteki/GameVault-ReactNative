import { createContext, useContext, ReactNode } from 'react';
import { GameVaultColors, AppTheme, getThemeColors, CyberDarkColors } from './colors';

interface ThemeContextValue {
  colors: GameVaultColors;
  theme: AppTheme;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: CyberDarkColors,
  theme: 'CYBER_DARK',
});

export function ThemeProvider({
  children,
  theme,
}: {
  children: ReactNode;
  theme: AppTheme;
}) {
  const colors = getThemeColors(theme);
  
  return (
    <ThemeContext.Provider value={{ colors, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}