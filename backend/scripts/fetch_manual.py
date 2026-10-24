"""
Ручной запуск фетча расписаний для одного или нескольких направлений.

Примеры:
    python -m scripts.fetch_manual gorkovskoye
    python -m scripts.fetch_manual kiyevskoye gorkovskoye
"""
from __future__ import annotations

import asyncio
import os
import sys
import time

from dotenv import load_dotenv
load_dotenv()

from app.db.pool import init_pool, close_pool
from app.schedule.directions import DIRECTIONS
from app.schedule.worker import fetch_direction
from app.schedule.yandex_client import QuotaExceeded


async def main(direction_ids: list[str]) -> None:
    await init_pool(os.environ["DATABASE_URL"])

    total_started = time.time()
    grand_total = 0

    try:
        for d_id in direction_ids:
            if d_id not in DIRECTIONS:
                print(f"! Неизвестное направление: {d_id}")
                print(f"  Доступные: {', '.join(DIRECTIONS.keys())}")
                continue

            d = DIRECTIONS[d_id]
            n_stations = len(d["stations"])
            print(f"\n{'=' * 60}")
            print(f"  {d['name']}  ({n_stations} станций)")
            print(f"{'=' * 60}")

            started = time.time()
            try:
                n_rows = await fetch_direction(None, d_id)
                grand_total += n_rows
                elapsed = time.time() - started
                print(f"V {d_id}: {n_rows} рейсов за {elapsed:.1f} сек")
            except QuotaExceeded as e:
                print(f"X Квота исчерпана: {e}")
                print("  Остальные направления — завтра (лимит 500/сутки).")
                return
            except Exception as e:
                print(f"X Ошибка на {d_id}: {e}")

        total_elapsed = time.time() - total_started
        print(f"\n{'=' * 60}")
        print(f"  ИТОГО: {grand_total} рейсов за {total_elapsed:.1f} сек")
        print(f"{'=' * 60}")
    finally:
        await close_pool()


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        print("Использование: python -m scripts.fetch_manual <direction_id> [...]")
        print(f"Доступные: {', '.join(DIRECTIONS.keys())}")
        sys.exit(1)

    asyncio.run(main(args))