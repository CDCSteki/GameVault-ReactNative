// ─── List / Search DTOs ───────────────────────────────────────────────────────

export interface GamesListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GameDto[];
}

export interface GameDto {
  id: number;
  name: string;
  background_image: string | null;
  rating: number;
  released: string | null;
  genres: GenreDto[] | null;
  platforms: PlatformWrapperDto[] | null;
  playtime: number | null;
}

export interface GenreDto {
  id: number;
  name: string;
}

export interface PlatformWrapperDto {
  platform: PlatformDto;
  requirements?: RequirementsDto | null;
  requirements_en?: RequirementsDto | null;
}

export interface RequirementsDto {
  minimum?: string | null;
  recommended?: string | null;
}

export interface PlatformDto {
  id: number;
  name: string;
}

// ─── Detail DTO ──────────────────────────────────────────────────────────────

export interface GameDetailDto {
  id: number;
  name: string;
  description_raw: string | null;
  background_image: string | null;
  released: string | null;
  rating: number;
  ratings_count: number;
  playtime: number | null;
  platforms: PlatformWrapperDto[] | null;
  genres: GenreDto[] | null;
  developers: DeveloperDto[] | null;
  publishers: PublisherDto[] | null;
  ratings: RatingDto[] | null;
  esrb_rating: EsrbRatingDto | null;
}

export interface DeveloperDto {
  id: number;
  name: string;
}

export interface PublisherDto {
  id: number;
  name: string;
}

export interface RatingDto {
  id: number;
  title: string;
  count: number;
  percent: number;
}

export interface EsrbRatingDto {
  id: number;
  name: string;
}

// ─── Screenshots ─────────────────────────────────────────────────────────────

export interface GameScreenshotsResponse {
  count: number;
  results: GameScreenshotDto[];
}

export interface GameScreenshotDto {
  id: number;
  image: string;
  width: number | null;
  height: number | null;
  is_deleted: boolean | null;
}