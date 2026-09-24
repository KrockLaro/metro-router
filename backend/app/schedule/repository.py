"""Запросы к таблице schedules."""
from __future__ import annotations

from datetime import datetime

from ..db.pool import get_pool


async def upsert_schedule_rows(rows: list[dict]) -> int:
    """UPSERT пачки расписаний. Возвращает число вставленных/обновлённых."""
    if not rows:
        return 0

    # asyncpg.executemany ожидает iterable of tuples, не dict'ов.
    # Порядок значений должен точно соответствовать $1..$13 в SQL.
    tuples = [
        (
            r["station_id"],
            r["line_id"],
            r["thread_uid"],
            r["train_number"],
            r["train_type"],
            r["origin"],
            r["destination"],
            r["direction"],
            r["departure"],
            r["arrival"],
            r["days_mask"],
            r["platform"],
            r["track"],
        )
        for r in rows
    ]

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
    return len(rows)


async def get_upcoming_departures(
    station_id: str, limit: int = 3
) -> dict | None:
    """Ближайшие поезда от/до Москвы."""
    now = datetime.now()
    now_time = now.time()
    weekday_bit = 1 << now.weekday()

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
        item = {
            "trip_id": f"{r['thread_uid']}_{r['departure'].isoformat()}",
            "thread_uid": r["thread_uid"],
            "train_number": r["train_number"],
            "train_type": r["train_type"],
            "origin": r["origin"],
            "destination": r["destination"],
            "route_name": f"{r['origin']} — {r['destination']}",
            "departure_time": r["departure"].strftime("%H:%M"),
            "departure_iso": _combine_today(r["departure"]).isoformat(),
            "minutes_until": int(r["minutes"] or 0),
            "platform": r["platform"],
            "track": r["track"],
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


def _combine_today(t) -> datetime:
    today = datetime.now().date()
    return datetime.combine(today, t)
