export interface UserEntity {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  profilePictureUri: string | null;
  level: number;
  tier: string;
  createdAt: number;
}

export type PlayStatus = 'NOT_PLAYED' | 'PLAYING' | 'PLAYED';

export interface GameEntity {
  rawgId: number;
  name: string;
  coverImageUrl: string | null;
  backgroundImageUrl: string | null;
  description: string | null;
  developer: string | null;
  releaseDate: string | null;
  platforms: string | null;
  genres: string | null;
  storageSize: string | null;
  rating: number;
  userRating: number;
  userNotes: string | null;
  isInCollection: boolean;
  isInWishlist: boolean;
  isPlayed: boolean;
  playStatus: PlayStatus;
  addedAt: number;
}

export interface SearchHistoryEntity {
  id: number;
  query: string;
  searchedAt: number;
}

export function calculateLevel(gamesPlayed: number): number {
  if (gamesPlayed >= 100) return 10;
  if (gamesPlayed >= 75) return 9;
  if (gamesPlayed >= 50) return 8;
  if (gamesPlayed >= 40) return 7;
  if (gamesPlayed >= 30) return 6;
  if (gamesPlayed >= 20) return 5;
  if (gamesPlayed >= 15) return 4;
  if (gamesPlayed >= 10) return 3;
  if (gamesPlayed >= 5) return 2;
  return 1;
}

export function calculateTier(gamesPlayed: number): string {
  if (gamesPlayed >= 100) return 'LEGENDARY';
  if (gamesPlayed >= 75) return 'GRANDMASTER';
  if (gamesPlayed >= 50) return 'MASTER';
  if (gamesPlayed >= 40) return 'DIAMOND';
  if (gamesPlayed >= 30) return 'PLATINUM';
  if (gamesPlayed >= 20) return 'GOLD';
  if (gamesPlayed >= 15) return 'SILVER';
  if (gamesPlayed >= 10) return 'BRONZE';
  if (gamesPlayed >= 5) return 'IRON';
  return 'ROOKIE';
}