export type AppTheme =
  | 'CYBER_DARK'
  | 'OCEAN_BLUE'
  | 'FOREST_GREEN'
  | 'SUNSET'
  | 'MIDNIGHT_RED'
  | 'NEON_GREEN'
  | 'ROSE_GOLD';

export interface GameVaultColors {
  accent: string;
  accentSecondary: string;
  background: string;
  backgroundSecondary: string;
  card: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  statusGreen: string;
  statusOrange: string;
  statusRed: string;
  statusYellow: string;
}

// ─── Status (shared across all themes) ───────────────────────────────────────

export const STATUS_GREEN = '#4CAF50';
export const STATUS_ORANGE = '#FF9800';
export const STATUS_RED = '#E53935';
export const STATUS_YELLOW = '#FFD700';

const sharedStatus = {
  statusGreen: STATUS_GREEN,
  statusOrange: STATUS_ORANGE,
  statusRed: STATUS_RED,
  statusYellow: STATUS_YELLOW,
};

// ─── Theme definitions ────────────────────────────────────────────────────────

export const CyberDarkColors: GameVaultColors = {
  accent: '#9B59F5',
  accentSecondary: '#00D4FF',
  background: '#0A0E1A',
  backgroundSecondary: '#111827',
  card: '#1A2235',
  border: '#1A4A5A',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0BEC5',
  textMuted: '#607D8B',
  ...sharedStatus,
};

export const OceanBlueColors: GameVaultColors = {
  accent: '#48CAE4',
  accentSecondary: '#90E0EF',
  background: '#03045E',
  backgroundSecondary: '#023E8A',
  card: '#0077B6',
  border: '#0096C7',
  textPrimary: '#FFFFFF',
  textSecondary: '#ADE8F4',
  textMuted: '#90E0EF',
  ...sharedStatus,
};

export const ForestGreenColors: GameVaultColors = {
  accent: '#52B788',
  accentSecondary: '#B7E4C7',
  background: '#081C15',
  backgroundSecondary: '#1B4332',
  card: '#2D6A4F',
  border: '#40916C',
  textPrimary: '#FFFFFF',
  textSecondary: '#D8F3DC',
  textMuted: '#95D5B2',
  ...sharedStatus,
};

export const SunsetColors: GameVaultColors = {
  accent: '#FF6B35',
  accentSecondary: '#FFD166',
  background: '#1A0A00',
  backgroundSecondary: '#2D1500',
  card: '#3D1F00',
  border: '#7C3A00',
  textPrimary: '#FFFFFF',
  textSecondary: '#FFD6B3',
  textMuted: '#FF9A6C',
  ...sharedStatus,
};

export const MidnightRedColors: GameVaultColors = {
  accent: '#E63946',
  accentSecondary: '#FF6B6B',
  background: '#0D0305',
  backgroundSecondary: '#1A0608',
  card: '#2D0A0E',
  border: '#6B1520',
  textPrimary: '#FFFFFF',
  textSecondary: '#FFB3B8',
  textMuted: '#FF6B6B',
  ...sharedStatus,
};

export const NeonGreenColors: GameVaultColors = {
  accent: '#39FF14',
  accentSecondary: '#00FFFF',
  background: '#050A05',
  backgroundSecondary: '#0A140A',
  card: '#0F1F0F',
  border: '#1A3A1A',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0FFB0',
  textMuted: '#39FF14',
  ...sharedStatus,
};

export const RoseGoldColors: GameVaultColors = {
  accent: '#E8A598',
  accentSecondary: '#F7D6CB',
  background: '#1A0D0A',
  backgroundSecondary: '#2D1510',
  card: '#3D1F18',
  border: '#6B3028',
  textPrimary: '#FFFFFF',
  textSecondary: '#FFD6CC',
  textMuted: '#E8A598',
  ...sharedStatus,
};

export function getThemeColors(theme: AppTheme): GameVaultColors {
  switch (theme) {
    case 'CYBER_DARK':    return CyberDarkColors;
    case 'OCEAN_BLUE':    return OceanBlueColors;
    case 'FOREST_GREEN':  return ForestGreenColors;
    case 'SUNSET':        return SunsetColors;
    case 'MIDNIGHT_RED':  return MidnightRedColors;
    case 'NEON_GREEN':    return NeonGreenColors;
    case 'ROSE_GOLD':     return RoseGoldColors;
    default:              return CyberDarkColors;
  }
}

export const THEME_OPTIONS: {
  theme: AppTheme;
  label: string;
  emoji: string;
}[] = [
  { theme: 'CYBER_DARK',   label: 'Cyber',   emoji: '🌌' },
  { theme: 'OCEAN_BLUE',   label: 'Ocean',   emoji: '🌊' },
  { theme: 'FOREST_GREEN', label: 'Forest',  emoji: '🌿' },
  { theme: 'SUNSET',       label: 'Sunset',  emoji: '🌅' },
  { theme: 'MIDNIGHT_RED', label: 'Blood',   emoji: '🔴' },
  { theme: 'NEON_GREEN',   label: 'Matrix',  emoji: '💚' },
  { theme: 'ROSE_GOLD',    label: 'Rose',    emoji: '🌸' },
];