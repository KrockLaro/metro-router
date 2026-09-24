"""Показать сырой JSON первых N рейсов от Яндекса."""
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


async def main(station_id: str, n: int = 5) -> None:
    code = YANDEX_STATION_CODES.get(station_id)
    if not code:
        sys.exit(f"X Нет Яндекс-кода для '{station_id}'")

    await init_pool(os.environ["DATABASE_URL"])
    try:
        payload = await fetch_station_schedule(code, date.today())
        schedule = (payload.get("schedule") or [])[:n]

        print(f"Станция: {station_id}  (код {code})")
        print(f"Всего рейсов: {len(payload.get('schedule') or [])}")
        print(f"Показываю первые {len(schedule)}:\n")

        for i, item in enumerate(schedule, 1):
            thread = item.get("thread") or {}
            print(f"── Рейс #{i} ────────────────────────")
            print(f"  thread.number         = {thread.get('number')!r}")
            print(f"  thread.title          = {thread.get('title')!r}")
            print(f"  thread.express_type   = {thread.get('express_type')!r}")
            print(f"  thread.transport_type = {thread.get('transport_type')!r}")
            print(f"  thread.uid            = {thread.get('uid')!r}")
            print(f"  departure             = {item.get('departure')!r}")
            print()
    finally:
        await close_pool()


if __name__ == "__main__":
    sid = sys.argv[1] if len(sys.argv) > 1 else "domodedovo"
    n = int(sys.argv[2]) if len(sys.argv) > 2 else 5
    asyncio.run(main(sid, n))