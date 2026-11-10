/**
 * api/client.ts
 *
 * Единая точка входа к бэкенду metro-router.
 * База URL берётся из EXPO_PUBLIC_API_URL (или .env).
 */
import axios, { AxiosInstance, AxiosError } from 'axios';
import Constants from 'expo-constants';

// ──────────────────────────────────────────────────────────
// Базовая настройка axios
// ──────────────────────────────────────────────────────────

function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, '');

  const fromExtra = (Constants.expoConfig?.extra as any)?.apiUrl;
  if (fromExtra) return String(fromExtra).replace(/\/+$/, '');

  return 'http://localhost:8000';
}

export const API_BASE_URL = resolveBaseUrl();

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (__DEV__) {
      const url = `${error.config?.baseURL ?? ''}${error.config?.url ?? ''}`;
      // eslint-disable-next-line no-console
      console.warn(`[API] ${error.response?.status ?? 'ERR'} ${url}`, {
        params: error.config?.params,
        data: error.response?.data,
      });
    }
    return Promise.reject(error);
  },
);

// ──────────────────────────────────────────────────────────
// Общие типы
// ──────────────────────────────────────────────────────────

export type TrainType = 'local' | 'express' | 'aeroexpress' | 'mcd';

export interface StationBrief {
  id: string;
  name: string;
  lat?: number;
  lon?: number;
  lines?: string[];
}

// ──────────────────────────────────────────────────────────
// Расписание станции
// ──────────────────────────────────────────────────────────

export interface ScheduleItem {
  trip_id: string;
  thread_uid?: string;
  train_number?: string;
  train_type?: TrainType;
  route_name: string;
  departure_time: string;
  departure_iso: string;
  minutes_until: number;
  platform_number?: string | null;
  track_number?: string | null;
  track?: string;
  platform?: string;
  is_express?: boolean;
}

export interface StationSchedule {
  station_id: string;
  to_moscow: ScheduleItem[];
  from_moscow: ScheduleItem[];
}

export async function getStationSchedule(
  stationId: string,
  limit: number = 3,
): Promise<StationSchedule> {
  const { data } = await apiClient.get<StationSchedule>(
    `/station/${encodeURIComponent(stationId)}/departures`,
    { params: { limit } },
  );
  return data;
}

// ──────────────────────────────────────────────────────────
// Построение маршрута
// ──────────────────────────────────────────────────────────

export type SegmentKind = 'ride' | 'transfer' | 'walk' | 'express' | 'local' | 'aeroexpress';

export type LineTrainKind = 'local' | 'express' | 'aeroexpress' | 'branded';

export interface RouteSegment {
  kind: SegmentKind;
  line: string | null;
  line_color: string | null;
  line_kind: 'cppk' | 'mcd' | 'mcc' | 'metro' | null;
  /** Тип сервиса: local | express | aeroexpress | branded */
  line_train_kind?: LineTrainKind | null;
  from: { id: string; name: string };
  to: { id: string; name: string };
  minutes: number;
  departure_time?: string;
  arrival_time?: string;
  train_number?: string;
  train_type?: TrainType;
  wait_minutes?: number;
  schedule_found?: boolean;
}

export interface RouteVariant {
  total_minutes: number;
  transfers: number;
  segments: RouteSegment[];
  /** Теги: 'fastest' | 'balanced' | 'fewest_transfers' | 'without_aeroexpress' | 'has_aeroexpress' | 'has_express' */
  tags?: string[];
  label?: string;
  departure_time?: string;
  arrival_time?: string;
}

/** Алиас для совместимости: где-то импортируется как RouteResult */
export type RouteResult = RouteVariant;

export interface RouteRequest {
  from_id: string;
  to_id: string;
  depart_at?: string;
  max_variants?: number;
  avoid_aeroexpress?: boolean;
  avoid_stations?: string[];
}

export interface RouteResponse {
  variants: RouteVariant[];
}

export async function buildRoute(req: RouteRequest): Promise<RouteResponse> {
  const { data } = await apiClient.post<RouteResponse>('/route', req);
  return data;
}

// ──────────────────────────────────────────────────────────
// Поиск станций
// ──────────────────────────────────────────────────────────

export async function searchStations(
  query: string,
  limit: number = 20,
): Promise<StationBrief[]> {
  if (!query.trim()) return [];
  const { data } = await apiClient.get<StationBrief[]>('/stations/search', {
    params: { q: query, limit },
  });
  return data;
}

// ──────────────────────────────────────────────────────────
// Health-check
// ──────────────────────────────────────────────────────────

export async function pingBackend(): Promise<boolean> {
  try {
    await apiClient.get('/health', { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

// ──────────────────────────────────────────────────────────
// Хелпер для ошибок
// ──────────────────────────────────────────────────────────

export function extractApiError(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const detail = (e.response?.data as any)?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
    return e.message || 'Ошибка сети';
  }
  if (e instanceof Error) return e.message;
  return 'Неизвестная ошибка';
}