"""Обогащение маршрута реальным расписанием из БД.

Вызывается после find_routes — берёт готовый маршрут (dict)
и для каждого ride-сегмента подставляет реальный поезд из schedules.

ВАЖНО: перед обогащением ride-сегменты одной линии склеиваются
в один — иначе поезда, которые не останавливаются на промежуточных
станциях, не находятся, и появляются фейковые «ожидания 50 мин».
"""
from __future__ import annotations

import logging
from datetime import datetime, time, timedelta

from ..db.pool import get_pool
from .repository import MSK

log = logging.getLogger(__name__)


def _add_minutes(t: time, minutes: float) -> time:
    base = datetime.combine(datetime.now(MSK).date(), t)
    return (base + timedelta(minutes=minutes)).time()


def _diff_minutes(a: time, b: time) -> float:
    base = datetime.combine(datetime.now(MSK).date(), a)
    other = datetime.combine(datetime.now(MSK).date(), b)
    if other < base:
        other += timedelta(days=1)
    return round((other - base).total_seconds() / 60, 1)


def _to_min(t: time) -> int:
    return t.hour * 60 + t.minute


def _fmt(t: time) -> str:
    return t.strftime("%H:%M")


def _weekday_bit_msk() -> int:
    wd = datetime.now(MSK).weekday()
    return 1 << (0 if wd < 5 else wd)


def _parse_time(s: str) -> time:
    hh, mm = s.split(":")[:2]
    return time(int(hh), int(mm))


# ──────────────────────────────────────────────────────────────
# Склейка ride-сегментов одной линии в один
# ──────────────────────────────────────────────────────────────

def _merge_ride_segments(segments: list[dict]) -> list[dict]:
    """Склеивает подряд идущие ride-сегменты одной линии.

    Пример: m_pav → derbenevskaya → tulskaya → varshavskaya
            превращается в m_pav → varshavskaya.

    Пересадки (kind='transfer') не трогаем — они разделители.
    """
    result: list[dict] = []

    for seg in segments:
        if seg["kind"] == "transfer":
            result.append(dict(seg))
            continue

        last = result[-1] if result else None
        if (
            last is not None
            and last["kind"] != "transfer"
            and last.get("line") == seg.get("line")
            and last.get("line_color") == seg.get("line_color")
            and last["to"]["id"] == seg["from"]["id"]
        ):
            # Продолжение того же поезда — сливаем
            last["to"] = seg["to"]
            last["minutes"] = round(last["minutes"] + seg["minutes"], 1)
        else:
            result.append(dict(seg))

    return result


# ──────────────────────────────────────────────────────────────
# Основная функция
# ──────────────────────────────────────────────────────────────

async def enrich_route(route_dict: dict, depart_at: time) -> dict:
    """Для каждого ride-сегмента ищет реальный поезд в БД.

    Добавляет/подменяет поля:
      departure_time — "14:32" (реальное)
      arrival_time   — "17:48"
      train_number   — "6712"
      train_type     — "local" | "express" | "aeroexpress"
      wait_minutes   — сколько минут ждать до поезда
      schedule_found — True / False
    """
    # 1. Сначала склеиваем ride-сегменты одной линии
    merged = _merge_ride_segments(route_dict["segments"])

    # 2. Обогащаем каждый большой сегмент
    pool = get_pool()
    bit = _weekday_bit_msk()
    cursor: time = depart_at
    enriched: list[dict] = []

    async with pool.acquire() as conn:
        for seg in merged:
            seg = dict(seg)

            # Пересадка: просто двигаем «часы»
            if seg["kind"] == "transfer":
                cursor = _add_minutes(cursor, seg["minutes"])
                seg["departure_time"] = _fmt(cursor)
                seg["arrival_time"] = _fmt(cursor)
                seg["schedule_found"] = True
                enriched.append(seg)
                continue

            # Ride-сегмент: ищем реальный поезд
            row = await _find_train(
                conn,
                from_id=seg["from"]["id"],
                to_id=seg["to"]["id"],
                after=cursor,
                bit=bit,
            )

            if row is None:
                arrival_time = _add_minutes(cursor, seg["minutes"])
                seg["departure_time"] = _fmt(cursor)
                seg["arrival_time"] = _fmt(arrival_time)
                seg["schedule_found"] = False
                cursor = arrival_time
                enriched.append(seg)
                continue

            dep_time = row["departure"]
            arr_time = row["arrival_at_to"]
            seg["departure_time"] = _fmt(dep_time)
            seg["arrival_time"] = _fmt(arr_time)
            seg["train_number"] = row["train_number"]
            seg["train_type"] = row["train_type"]
            seg["wait_minutes"] = _diff_minutes(cursor, dep_time)
            seg["schedule_found"] = True
            seg["minutes"] = _diff_minutes(dep_time, arr_time)
            cursor = arr_time
            enriched.append(seg)

        # 3. Пересчёт total_minutes: от входа на станцию (depart_at)
    #    до прибытия в конечную точку
    if enriched:
        last_arr = _parse_time(enriched[-1]["arrival_time"])
        route_dict["total_minutes"] = _diff_minutes(depart_at, last_arr)

    route_dict["segments"] = enriched
    route_dict["departure_time"] = _fmt(depart_at)
    route_dict["arrival_time"] = (
        enriched[-1]["arrival_time"] if enriched else _fmt(depart_at)
    )
    return route_dict


async def _find_train(conn, from_id: str, to_id: str,
                      after: time, bit: int) -> dict | None:
    """Ближайший поезд, идущий ОТ from_id К to_id (в правильном направлении).

    Логика:
      1. Ищем поезда, отправляющиеся от from_id после времени `after`.
      2. Для каждого проверяем, есть ли тот же thread_uid на to_id.
      3. Проверяем, что время на to_id ПОЗЖЕ времени на from_id.
         Если раньше — поезд идёт в обратную сторону, пропускаем.
    """
    rows = await conn.fetch(
        """
        SELECT thread_uid, train_number, train_type, departure
        FROM schedules
        WHERE station_id = $1
          AND departure >= $2
          AND (days_mask & $3) <> 0
        ORDER BY departure
        LIMIT 200
        """,
        from_id, after, bit,
    )

    for r in rows:
        to_row = await conn.fetchrow(
            """
            SELECT arrival, departure
            FROM schedules
            WHERE station_id = $1
              AND thread_uid = $2
              AND (days_mask & $3) <> 0
            LIMIT 1
            """,
            to_id, r["thread_uid"], bit,
        )
        if to_row is None:
            continue

        dep_from = _to_min(r["departure"])
        dep_to = _to_min(to_row["departure"])

        # Поезд идёт from_id → to_id, только если dep_to > dep_from.
        # Если разница отрицательная, но небольшая (< 6 ч) — это
        # обратный рейс, пропускаем. Если большая — поезд через полночь.
        if dep_to <= dep_from:
            if dep_from - dep_to < 6 * 60:
                continue

        arrival_at_to = to_row["arrival"] or to_row["departure"]
        if arrival_at_to is None:
            continue

        return {
            "thread_uid": r["thread_uid"],
            "train_number": r["train_number"],
            "train_type": r["train_type"],
            "departure": r["departure"],
            "arrival_at_to": arrival_at_to,
        }

    return None