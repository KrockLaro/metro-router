import { STATIONS, SchemaStation } from './schemaStations';
import { LINES } from './schemaLines';

// ─────────────────────────────────────────────────────────────
// ТАРИФЫ ЦППК / МТППК (2026)
// ─────────────────────────────────────────────────────────────
// Источник: официальный документ ЦППК.
//
//   В пределах Москвы .............. 71 ₽
//   Зона «Центральная» (МЦД) ....... 83 ₽
//   Зона «Пригород» (МЦД) .......... 110 ₽
//   1-я зона МО (до 10 км) ......... 61 ₽
//   Каждая последующая зона МО ..... +39 ₽
//
// Аэроэкспресс — отдельный тариф, вне зонной сетки:
//   При покупке заранее ............ 650 ₽
//   В день поездки ................. 700 ₽
//   (показываем 700 ₽ — безопасная оценка)
//
// Экспрессы ЦППК (7xxx) по цене НЕ отличаются от обычных
// электричек — только по времени в пути и остановкам.

const FARE_MOSCOW_RUB = 71;
const FARE_MO_FIRST_ZONE_RUB = 61;
const FARE_MO_NEXT_ZONE_RUB = 39;
const AEROEXPRESS_RUB = 700;

export interface Fare {
  rubles: number;
  zonesCrossed: number;
  isExpress: boolean;
  isAeroexpress: boolean;
}

export function calculateFare(
  fromStationId: string,
  toStationId: string,
  isExpress: boolean = false,
  isAeroexpress: boolean = false,
): Fare | null {
  const from = STATIONS[fromStationId];
  const to = STATIONS[toStationId];
  if (!from || !to) return null;

  // Аэроэкспресс — фиксированный тариф, вне зонной сетки
  if (isAeroexpress) {
    return {
      rubles: AEROEXPRESS_RUB,
      zonesCrossed: 0,
      isExpress: true,
      isAeroexpress: true,
    };
  }

  const fromZone = from.zone ?? 0;
  const toZone = to.zone ?? 0;
  const maxZone = Math.max(fromZone, toZone);

  let rubles: number;

  if (maxZone === 0) {
    // Обе станции в Москве
    rubles = FARE_MOSCOW_RUB;
  } else if (maxZone === 1) {
    // Первая зона МО
    rubles = FARE_MO_FIRST_ZONE_RUB;
  } else {
    // Москва + несколько зон МО
    rubles = FARE_MO_FIRST_ZONE_RUB + (maxZone - 1) * FARE_MO_NEXT_ZONE_RUB;
  }

  return {
    rubles,
    zonesCrossed: maxZone,
    isExpress,
    isAeroexpress: false,
  };
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
      // Не показываем служебные путевые точки (Junction и т.п.)
      .filter((s) => !s.isJunction)
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

  // На Москву — если едем на станцию со словом «Москва» в названии
  if (/москва/i.test(to.name)) {
    return { label: `В сторону: ${to.name}`, isToMoscow: true };
  }

  // Иначе — определяем по зонам
  const fromZone = from.zone ?? 0;
  const toZone = to.zone ?? 0;
  const isToMoscow = toZone < fromZone;

  if (isToMoscow) {
    return { label: `На Москву`, isToMoscow: true };
  }

  // Едем от Москвы — конечная = край линии, в которую движемся.
  // У SchemaLine нет поля terminus, вычисляем его из path:
  //   - если индекс от < индекс до, едем к концу → берём последний элемент
  //   - иначе едем к началу → берём первый элемент
  for (const line of LINES) {
    const i = line.path.indexOf(fromId);
    const j = line.path.indexOf(toId);
    if (i === -1 || j === -1) continue;

    const terminusId =
      i < j
        ? line.path[line.path.length - 1]   // едем вперёд — конечная в конце
        : line.path[0];                     // едем назад — конечная в начале

    const terminus = STATIONS[terminusId];
    if (terminus) {
      return { label: `В сторону: ${terminus.name}`, isToMoscow: false };
    }
  }

  return null;
}