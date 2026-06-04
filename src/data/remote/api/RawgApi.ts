import axios, { AxiosInstance } from 'axios';
import { RAWG_API_KEY, RAWG_BASE_URL } from '../../../constants/constants';
import {
  GamesListResponse,
  GameDetailDto,
  GameScreenshotsResponse,
} from '../dto/GameDto';

const http: AxiosInstance = axios.create({
  baseURL: RAWG_BASE_URL,
  timeout: 15000,
});

// ─── API calls ────────────────────────────────────────────────────────────────

/** Popular This Year */
export async function getGamesThisYear(
  dates: string,
  pageSize: number = 10
): Promise<GamesListResponse> {
  const { data } = await http.get<GamesListResponse>('/games', {
    params: {
      key: RAWG_API_KEY,
      dates,
      ordering: '-rating',
      page_size: pageSize,
    },
  });
  return data;
}

/** All-Time Legends */
export async function getAllTimeTopGames(
  pageSize: number = 10
): Promise<GamesListResponse> {
  const { data } = await http.get<GamesListResponse>('/games', {
    params: {
      key: RAWG_API_KEY,
      ordering: '-rating',
      metacritic: '90,100',
      page_size: pageSize,
    },
  });
  return data;
}

/** Discover / Filters */
export async function getGamesByFilters(params: {
  genres?: string;
  tags?: string;
  dates?: string;
  ordering?: string;
  pageSize?: number;
}): Promise<GamesListResponse> {
  const { data } = await http.get<GamesListResponse>('/games', {
    params: {
      key: RAWG_API_KEY,
      genres: params.genres,
      tags: params.tags,
      dates: params.dates,
      ordering: params.ordering ?? '-rating',
      page_size: params.pageSize ?? 10,
    },
  });
  return data;
}

/** Search with advanced filters */
export async function searchGames(params: {
  query: string;
  genres?: string;
  platforms?: string;
  metacritic?: string;
  dates?: string;
  ordering?: string;
  page?: number;
  pageSize?: number;
}): Promise<GamesListResponse> {
  const { data } = await http.get<GamesListResponse>('/games', {
    params: {
      key: RAWG_API_KEY,
      search: params.query,
      genres: params.genres,
      platforms: params.platforms,
      metacritic: params.metacritic,
      dates: params.dates,
      ordering: params.ordering,
      page: params.page ?? 1,
      page_size: params.pageSize ?? 20,
    },
  });
  return data;
}

/** Game Details */
export async function getGameDetails(gameId: number): Promise<GameDetailDto> {
  const { data } = await http.get<GameDetailDto>(`/games/${gameId}`, {
    params: { key: RAWG_API_KEY },
  });
  return data;
}

/** Screenshots */
export async function getGameScreenshots(
  gameId: number
): Promise<GameScreenshotsResponse> {
  const { data } = await http.get<GameScreenshotsResponse>(
    `/games/${gameId}/screenshots`,
    { params: { key: RAWG_API_KEY } }
  );
  return data;
}

/** Popular / Trending */
export async function getPopularGames(
  pageSize: number = 10,
  page: number = 1
): Promise<GamesListResponse> {
  const { data } = await http.get<GamesListResponse>('/games', {
    params: {
      key: RAWG_API_KEY,
      ordering: '-added',
      page_size: pageSize,
      page,
    },
  });
  return data;
}