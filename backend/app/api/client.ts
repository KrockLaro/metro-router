/**
 * api/client.ts
 *
 * Единая точка входа к бэкенду metro-router.
 * База URL берётся из EXPO_PUBLIC_API_URL (или .env).
 *
 * Для локальной разработки:
 *   iOS Simulator:     http://localhost:8000
 *   Android Emulator:  http://10.0.2.2:8000
 *   Физическое тело:   http://<IP_компьютера>:8000
 */
import axios, { AxiosInstance, AxiosError } from 'axios';
import Constants from 'expo-constants';

// ──────────────────────────────────────────────────────────
// Базовая настройка axios
// ──────────────────────────────────────────────────────────

function resolveBaseUrl(): string {
  // 1) Явно из окружения
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, '');

  // 2) Из extra в app.json (если так настроено)
  const fromExtra = (Constants.expoConfig?.extra as any)?.apiUrl;
  if (fromExtra) return String(fromExtra).replace(/\/+$/, '');

  // 3) Фолбэк для разработки
  return 'http://localhost:8000';
}

export const API_BASE_URL = resolveBaseUrl();

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Разворачиваем ответ сразу в data (чтобы не писать .data каждый раз)
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Логируем для отладки в dev-режиме
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

export type TrainType = 'local' | 'express' | 'aeroexpress';

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
  /** Уникальный id поездки (thread_uid + departure) — для key в списке */
  trip_id: string;
  /** Уникальный id нитки у Яндекса */
  thread_uid?: string;
  /** Номер поезда, e.g. "6123" */
  train_number?: string;
  /** Тип поезда: пригород / экспресс / аэроэкспресс */
  train_type?: TrainType;
  /** Читаемое имя маршрута: "Москва Ярославская — Софрино" */
  route_name: string;
  /** Время отправления в формате "14:35" */
  departure_time: string;
  /** ISO-строка отправления (для пересчёта "через N мин" на клиенте) */
  departure_iso: string;
  /** Сколько минут до отправления на момент ответа сервера */
  minutes_until: number;
  /** Путь / платформа (если есть) */
  track?: string;
  platform?: string;
  /** Устаревшее поле, оставлено для совместимости */
  is_express?: boolean;
}

export interface StationSchedule {
  station_id: string;
  /** Поезда в сторону Москвы */
  to_moscow: ScheduleItem[];
  /** Поезда от Москвы */
  from_moscow: ScheduleItem[];
}

/**
 * Ближайшие электрички для станции.
 * По умолчанию возвращает по 3 поезда в каждую сторону.
 */
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

export type SegmentKind = 'ride' | 'transfer' | 'walk';

export interface RouteSegment {
  kind: SegmentKind;
  /** Название линии, напр. "Ярославское направление" (null для перехода) */
  line: string | null;
  line_color: string | null;
  line_kind: 'cppk' | 'mcd' | 'mcc' | 'metro' | null;
  from: { id: string; name: string };
  to: { id: string; name: string };
  minutes: number;
}

export interface RouteVariant {
  total_minutes: number;
  transfers: number;
  segments: RouteSegment[];
  /** Флаги варианта для UI (опционально — заполнит бэкенд) */
  tags?: Array<'fastest' | 'fewest_transfers' | 'express' | 'aeroexpress'>;
}

export interface RouteRequest {
  from_id: string;
  to_id: string;
  /** ISO-строка желаемого времени отправления (опционально) */
  depart_at?: string;
  /** Максимум вариантов, которые вернёт бэкенд (по умолчанию 3) */
  max_variants?: number;
}

export interface RouteResponse {
  variants: RouteVariant[];
}

/**
 * Строит один или несколько вариантов маршрута.
 * Бэкенд (пока) возвращает один вариант в массиве — это ок, потом добавим top-N.
 */
export async function buildRoute(
  req: RouteRequest,
): Promise<RouteResponse> {
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
// Health-check (удобно для отладки подключения)
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