"""Проверка: как Яндекс отвечает на limit/offset."""
import asyncio
import os
import sys
from datetime import date

import httpx
from dotenv import load_dotenv
load_dotenv()

API_KEY = os.getenv("YANDEX_RASP_API_KEY")
BASE = "https://api.rasp.yandex.net/v3.0/schedule/"


async def probe(station: str, limit: int, offset: int) -> None:
    params = {
        "apikey": API_KEY,
        "station": station,
        "date": date.today().isoformat(),
        "transport_types": "suburban",
        "format": "json",
        "lang": "ru_RU",
        "limit": limit,
        "offset": offset,
    }
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.get(BASE, params=params)
        if r.status_code != 200:
            print(f"  limit={limit:5} offset={offset:4} → HTTP {r.status_code}")
            return
        data = r.json()

    schedule = data.get("schedule") or []
    pagination = data.get("pagination") or {}
    if schedule:
        first = schedule[0].get("departure", "")[-14:-6]  # HH:MM:SS
        last = schedule[-1].get("departure", "")[-14:-6]
    else:
        first = last = "—"
    print(f"  limit={limit:5} offset={offset:4} → {len(schedule):3} рейсов, "
          f"от {first} до {last}, pagination={pagination}")


async def main(station: str = "s9600681") -> None:  # mytishchi
    print(f"Станция {station}:")
    # Проба 1: дефолт 100
    await probe(station, 100, 0)
    # Проба 2: limit=1000
    await probe(station, 1000, 0)
    # Проба 3: пагинация
    await probe(station, 100, 100)
    await probe(station, 100, 200)


if __name__ == "__main__":
    sid = sys.argv[1] if len(sys.argv) > 1 else "s9600681"
    asyncio.run(main(sid))