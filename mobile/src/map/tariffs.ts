import { STATIONS } from './schemaStations';
import { LINES } from './schemaLines';

const BASE_FARE_RUB = 30;
const PER_ZONE_RUB = 15;
const EXPRESS_MULTIPLIER = 1.5;

export interface Fare {
  rubles: number;
  zonesCrossed: number;
  isExpress: boolean;
}

export function calculateFare(
  fromStationId: string,
  toStationId: string,
  isExpress: boolean = false,
): Fare | null {
  const from = STATIONS[fromStationId];
  const to = STATIONS[toStationId];
  if (!from || !to) return null;

  const fromZone = from.zone ?? 0;
  const toZone = to.zone ?? 0;
  const zonesCrossed = Math.max(1, Math.abs(toZone - fromZone) + 1);

  let rubles = BASE_FARE_RUB + (zonesCrossed - 1) * PER_ZONE_RUB;
  if (isExpress) rubles = Math.round(rubles * EXPRESS_MULTIPLIER);

  return { rubles: Math.round(rubles), zonesCrossed, isExpress };
}

// ------------------------------------------------------------
// ПРОМЕЖУТОЧНЫЕ СТАНЦИИ С УЧЁТОМ НАПРАВЛЕНИЯ
// ------------------------------------------------------------

export interface IntermediateStation {
  id: string;
  name: string;
  expressStop: boolean;
}

export function getIntermediateStations(
  fromId: string,
  toId: string,
): IntermediateStation[] {
  for (const line of LINES) {
    const i = line.path.indexOf(fromId);
    const j = line.path.indexOf(toId);
    if (i === -1 || j === -1) continue;

    const forward = i < j;
    const [start, end] = forward ? [i, j] : [j, i];
    const ids = line.path.slice(start + 1, end);
    const ordered = forward ? ids : [...ids].reverse();

    return ordered
      .map((id) => STATIONS[id])
      .filter(Boolean)
      .map((s) => ({
        id: s.id,
        name: s.name,
        expressStop: !!s.expressStop,
      }));
  }
  return [];
}

// ------------------------------------------------------------
// ОПРЕДЕЛЕНИЕ НАПРАВЛЕНИЯ
// ------------------------------------------------------------

export function getDirectionInfo(
  fromId: string,
  toId: string,
): { label: string; isToMoscow: boolean } | null {
  const from = STATIONS[fromId];
  const to = STATIONS[toId];
  if (!from || !to) return null;

  // На Москву — если едем на станцию со словом "Москва" в названии
  if (/москва/i.test(to.name)) {
    return { label: `В сторону: ${to.name}`, isToMoscow: true };
  }

  // Иначе — определяем по зонам
  const fromZone = from.zone ?? 0;
  const toZone = to.zone ?? 0;
  const isToMoscow = toZone < fromZone;

  if (isToMoscow) {
    // Едем к Москве — конечная Москва
    return { label: `На Москву`, isToMoscow: true };
  }

  // Едем от Москвы — конечная = terminus линии
  // Ищем линию, которой принадлежат обе станции
  for (const line of LINES) {
    if (line.path.includes(fromId) && line.path.includes(toId)) {
      const terminus = STATIONS[line.terminus];
      if (terminus) {
        return { label: `В сторону: ${terminus.name}`, isToMoscow: false };
      }
    }
  }

  return null;
}