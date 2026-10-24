"""
Фетч расписания для конкретных станций (без прогона всего направления).

Примеры:
    python -m scripts.fetch_stations krasnaya_okhota petushki vladimir
    python -m scripts.fetch_stations vladimir --line gorky
"""
from __future__ import annotations

import argparse
import asyncio
import os
import time

from dotenv import load_dotenv
load_dotenv()

from app.db.pool import init_pool, close_pool
from app.schedule.directions import DIRECTIONS
from app.schedule.worker import fetch_one_station_multi_day, coverage_dates
from app.schedule.yandex_client import QuotaExceeded


def _find_line_id(station_id: str) -> str | None:
    """Ищет line_id станции по всем направлениям."""
    for d in DIRECTIONS.values():
        if station_id in d["stations"]:
            return d["line_id"]
    return None


async def main(station_ids: list[str], forced_line: str | None) -> None:
    await init_pool(os.environ["DATABASE_URL"])

    on_dates = coverage_dates()
    print(f"Даты: {[d.isoformat() for d in on_dates]}")
    print(f"Станций к обработке: {len(station_ids)}\n")

    started_all = time.time()
    grand_total = 0

    try:
        for sid in station_ids:
            line_id = forced_line or _find_line_id(sid)
            if not line_id:
                print(f"X {sid}: не найдено в DIRECTIONS (укажи --line)")
                continue

            started = time.time()
            try:
                n = await fetch_one_station_multi_day(None, sid, line_id, on_dates)
                grand_total += n
                elapsed = time.time() - started
                print(f"V {sid:25} ({line_id:15}) {n:4} рейсов за {elapsed:.1f}s")
            except QuotaExceeded as e:
                print(f"X Квота исчерпана: {e}")
                return
            except Exception as e:
                print(f"X {sid}: {type(e).__name__}: {e}")

        total_elapsed = time.time() - started_all
        print(f"\n{'=' * 60}")
        print(f"  ИТОГО: {grand_total} рейсов за {total_elapsed:.1f} сек")
        print(f"  Станций: {len(station_ids)}, запросов: {len(station_ids) * len(on_dates)}")
        print(f"{'=' * 60}")
    finally:
        await close_pool()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("stations", nargs="+", help="ID станций")
    parser.add_argument("--line", help="Принудительный line_id (если станция в нескольких)")
    args = parser.parse_args()

    asyncio.run(main(args.stations, args.line))