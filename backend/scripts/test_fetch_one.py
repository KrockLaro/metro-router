"""Тестовый фетч одной станции: проверить цепочку Яндекс -> парсер -> БД.

Запуск:
    cd backend
    python -m scripts.test_fetch_one domodedovo
    python -m scripts.test_fetch_one aeroport_domodedovo
"""
from __future__ import annotations

import asyncio
import os
import sys
from datetime import date, timedelta

from dotenv import load_dotenv
load_dotenv()

from app.db.pool import init_pool, close_pool
from app.schedule.repository import upsert_schedule_rows
from app.schedule.worker import parse_payload
from app.schedule.yandex_client import fetch_station_schedule
from app.schedule.yandex_codes import YANDEX_STATION_CODES


async def main(station_id: str) -> None:
    yandex_code = YANDEX_STATION_CODES.get(station_id)
    if not yandex_code:
        sys.exit(f"X Нет Яндекс-кода для станции '{station_id}'")

    print(f"-> Станция: {station_id}")
    print(f"-> Яндекс-код: {yandex_code}")

    await init_pool(os.environ["DATABASE_URL"])

    try:
        today = date.today()
        print(f"-> Запрашиваю расписание на {today.isoformat()} (skip_quota=True)...")
        payload = await fetch_station_schedule(yandex_code, today, skip_quota=True)

        schedule = payload.get("schedule", []) or []
        print(f"-> Яндекс вернул рейсов: {len(schedule)}")

        if not schedule:
            print("! Расписание пустое. Пробуем завтра:")
            tomorrow = today + timedelta(days=1)
            payload = await fetch_station_schedule(
                yandex_code, tomorrow, skip_quota=True
            )
            schedule = payload.get("schedule", []) or []
            print(f"-> На {tomorrow} рейсов: {len(schedule)}")

        rows = parse_payload(payload, station_id, "test")
        print(f"-> Разобрано строк: {len(rows)}")

        if rows:
            print("\n--- Первые 5 рейсов ---")
            for r in rows[:5]:
                print(
                    f"  {r['departure'].strftime('%H:%M')}  "
                    f"{r['train_type']:12}  "
                    f"№ {r['train_number']:6}  "
                    f"{r['origin']} -> {r['destination']}"
                )

            n = await upsert_schedule_rows(rows)
            print(f"\nV Записано в БД: {n} строк")
    finally:
        await close_pool()


if __name__ == "__main__":
    sid = sys.argv[1] if len(sys.argv) > 1 else "domodedovo"
    asyncio.run(main(sid))