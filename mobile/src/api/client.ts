import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.130:8000';

export const api = axios.create({ baseURL: API_URL, timeout: 10000 });

export interface Station {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export interface RouteSegment {
  kind: string;
  line: string | null;
  line_color: string | null;
  line_kind: string | null;
  from: { id: string; name: string };
  to: { id: string; name: string };
  minutes: number;
  distance_km: number;
}

export interface RouteResult {
  total_minutes: number;
  transfers: number;
  total_km: number;
  total_price: number;
  segments: RouteSegment[];
}

export const searchStations = (q: string) =>
  api.get<Station[]>('/api/stations', { params: { q } }).then((r) => r.data);

export const buildRoute = (fromId: string, toId: string) =>
  api
    .post<RouteResult>('/api/route/simple', { from_id: fromId, to_id: toId })
    .then((r) => r.data);