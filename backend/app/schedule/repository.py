"""Запросы к таблице schedules."""
from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone

from ..db.pool import get_pool


# Московское время. Яндекс отдаёт рейсы в MSK, и нам нужно, чтобы
# `departure_iso` тоже был с явным +03:00 — иначе JS на клиенте парсит
# строку как локальное время устройства и получается сдвиг на 3 часа
# при UTC-часовом поясе (типично для эмуляторов).
MSK = timezone(timedelta(hours=3))


# Регулярки для разбора строки Яндекса вида
#   "3 пл 1 путь"
#   "обычно 2 пл 6 путь"
_PLATFORM_RE = re.compile(r"(\d+)\s*пл", re.IGNORECASE)
_TRACK_RE = re.compile(r"(\d+)\s*путь", re.IGNORECASE)


def _parse_platform(raw: str | None) -> tuple[str | None, str | None]:
    """Из строки Яндекса 'обычно 2 пл 6 путь' делает ('2', '6').

    Возвращает (platform_number, track_number).
    Если чего-то нет — возвращает None для соответствующего поля.
    """
    if not raw:
        return None, None

    plat_m = _PLATFORM_RE.search(raw)
    track_m = _TRACK_RE.search(raw)

    platform_num = plat_m.group(1) if plat_m else None
    track_num = track_m.group(1) if track_m else None
    return platform_num, track_num


def _short(name: str) -> str:
    """Сокращает длинные названия московских вокзалов.

    'Москва (Ярославский вокзал)' → 'Москва Яросл.'
    'Москва (Павелецкий вокзал)' → 'Москва Павел.'
    """
    replacements = {
        "Москва (Ярославский вокзал)": "Москва Яросл.",
        "Москва (Павелецкий вокзал)":  "Москва Павел.",
        "Москва (Курский вокзал)":     "Москва Курск.",
        "Москва (Казанский вокзал)":   "Москва Каз.",
        "Москва (Белорусский вокзал)": "Москва Бел.",
        "Москва (Киевский вокзал)":    "Москва Киев.",
        "Москва (Савеловский вокзал)": "Москва Сав.",
        "Москва (Ленинградский вокзал)": "Москва Лен.",
        "аэропорт Домодедово":          "Аэропорт Дмд.",
        "Аэропорт Домодедово":          "Аэропорт Дмд.",
    }
    return replacements.get(name, name)


async def upsert_schedule_rows(rows: list[dict]) -> int:
    """UPSERT пачки расписаний. Возвращает число вставленных/обновлённых."""
    if not rows:
        return 0

    # Порядок колонок ДОЛЖЕН совпадать с $1..$13 в INSERT
    columns = [
        "station_id", "line_id", "thread_uid", "train_number", "train_type",
        "origin", "destination", "direction", "departure", "arrival",
        "days_mask", "platform", "track",
    ]

    # asyncpg.executemany ожидает последовательности (tuple), а не dict
    tuples = [tuple(row[c] for c in columns) for row in rows]

    pool = get_pool()
    async with pool.acquire() as conn:
        await conn.executemany(
            """
            INSERT INTO schedules (
                station_id, line_id, thread_uid, train_number, train_type,
                origin, destination, direction, departure, arrival,
                days_mask, platform, track
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
            )
            ON CONFLICT (station_id, thread_uid, departure) DO UPDATE SET
                train_type   = EXCLUDED.train_type,
                origin       = EXCLUDED.origin,
                destination  = EXCLUDED.destination,
                direction    = EXCLUDED.direction,
                arrival      = EXCLUDED.arrival,
                days_mask    = EXCLUDED.days_mask,
                platform     = EXCLUDED.platform,
                track        = EXCLUDED.track,
                fetched_at   = now()
            """,
            tuples,
        )
    return len(tuples)


async def get_upcoming_departures(
    station_id: str, limit: int = 3
) -> dict | None:
    """Ближайшие поезда от/до Москвы."""
    now = datetime.now(MSK)
    now_time = now.time()

    # В БД лежат маски только для Пн (bit 0), Сб (bit 5), Вс (bit 6).
    # Считаем, что бит 0 покрывает все будни Пн–Пт — расписание
    # у ЦППК на будние дни одинаковое (плюс-минус пара сезонных ниток).
    wd = now.weekday()
    weekday_bit = 1 << (0 if wd < 5 else wd)

    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT
                thread_uid, train_number, train_type, origin, destination,
                direction, departure, platform, track,
                EXTRACT(EPOCH FROM (departure - $2::time)) / 60 AS minutes
            FROM schedules
            WHERE station_id = $1
              AND (days_mask & $3) <> 0
              AND departure >= $2::time
            ORDER BY departure
            LIMIT $4
            """,
            station_id, now_time, weekday_bit, limit * 6,
        )

    if not rows:
        async with pool.acquire() as conn:
            exists = await conn.fetchval(
                "SELECT 1 FROM schedules WHERE station_id = $1 LIMIT 1",
                station_id,
            )
        if not exists:
            return None
        return {"station_id": station_id, "to_moscow": [], "from_moscow": []}

    to_moscow: list[dict] = []
    from_moscow: list[dict] = []

    for r in rows:
        platform_num, track_num = _parse_platform(r["platform"])

        item = {
            "trip_id": f"{r['thread_uid']}_{r['departure'].isoformat()}",
            "thread_uid": r["thread_uid"],
            "train_number": r["train_number"],
            "train_type": r["train_type"],
            "origin": r["origin"],
            "destination": r["destination"],
            "route_name": f"{_short(r['origin'])} — {_short(r['destination'])}",
            "departure_time": r["departure"].strftime("%H:%M"),
            "departure_iso": _combine_today_msk(r["departure"]),
            "minutes_until": int(r["minutes"] or 0),
            "platform_number": platform_num,
            "track_number": track_num,
        }

        if r["direction"] == "to_moscow" and len(to_moscow) < limit:
            to_moscow.append(item)
        elif r["direction"] == "from_moscow" and len(from_moscow) < limit:
            from_moscow.append(item)

        if len(to_moscow) >= limit and len(from_moscow) >= limit:
            break

    return {
        "station_id": station_id,
        "to_moscow": to_moscow,
        "from_moscow": from_moscow,
    }


def _combine_today_msk(t) -> str:
    """Собирает ISO-строку с явным MSK-смещением.

    Без +03:00 JS на клиенте парсит строку как локальное время устройства,
    и получается сдвиг на 3 часа при UTC-часовом поясе.
    """
    today = datetime.now(MSK).date()
    dt = datetime.combine(today, t, tzinfo=MSK)
    return dt.isoformat()