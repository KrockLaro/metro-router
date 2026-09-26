"""Показать сырой JSON первых N рейсов от Яндекса.

Запуск:
    cd backend
    python -m scripts.dump_raw sofrino 3
    python -m scripts.dump_raw pushkino 3
    python -m scripts.dump_raw m_yar 3
"""
from __future__ import annotations

import asyncio
import os
import sys
from datetime import date

from dotenv import load_dotenv
load_dotenv()

from app.db.pool import init_pool, close_pool
from app.schedule.yandex_client import fetch_station_schedule
from app.schedule.yandex_codes import YANDEX_STATION_CODES


async def main(station_id: str, n: int = 3) -> None:
    code = YANDEX_STATION_CODES.get(station_id)
    if not code:
        sys.exit(f"X Нет Яндекс-кода для '{station_id}'")

    await init_pool(os.environ["DATABASE_URL"])
    try:
        payload = await fetch_station_schedule(
            code, date.today(), skip_quota=True
        )
        schedule = (payload.get("schedule") or [])[:n]

        print(f"Станция: {station_id}  (код {code})")
        print(f"Всего рейсов: {len(payload.get('schedule') or [])}")
        print(f"Показываю первые {len(schedule)}:\n")

        for i, item in enumerate(schedule, 1):
            thread = item.get("thread") or {}
            print(f"── Рейс #{i} ────────────────────────")
            print(f"  number         = {thread.get('number')!r}")
            print(f"  title          = {thread.get('title')!r}")
            # ВСЕ поля рейса
            print(f"  departure      = {item.get('departure')!r}")
            print(f"  arrival        = {item.get('arrival')!r}")
            print(f"  platform       = {item.get('platform')!r}")
            print(f"  track          = {item.get('track')!r}")
            print(f"  --- полный item ---")
            for k, v in item.items():
                if k not in ("thread",):
                    print(f"    {k:20} = {v!r}")
            print()
    finally:
        await close_pool()


if __name__ == "__main__":
    sid = sys.argv[1] if len(sys.argv) > 1 else "domodedovo"
    n = int(sys.argv[2]) if len(sys.argv) > 2 else 3
    asyncio.run(main(sid, n))