"""Показать ПОЛНЫЙ thread для первых N рейсов + проверить /thread/ endpoint."""
from __future__ import annotations

import asyncio
import json
import os
import sys
from datetime import date

import httpx
from dotenv import load_dotenv
load_dotenv()

from app.db.pool import init_pool, close_pool
from app.schedule.yandex_client import fetch_station_schedule
from app.schedule.yandex_codes import YANDEX_STATION_CODES

API_KEY = os.getenv("YANDEX_RASP_API_KEY", "")
THREAD_URL = "https://api.rasp.yandex.net/v3.0/thread/"


async def fetch_thread(uid: str) -> dict:
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.get(THREAD_URL, params={
            "apikey": API_KEY,
            "uid": uid,
            "format": "json",
            "lang": "ru_RU",
        })
        r.raise_for_status()
        return r.json()


async def main(station_id: str, n: int = 3) -> None:
    code = YANDEX_STATION_CODES.get(station_id)
    if not code:
        sys.exit(f"X Нет Яндекс-кода для '{station_id}'")

    await init_pool(os.environ["DATABASE_URL"])
    try:
        payload = await fetch_station_schedule(code, date.today())
        schedule = (payload.get("schedule") or [])[:n]

        for i, item in enumerate(schedule, 1):
            thread = item.get("thread") or {}
            uid = thread.get("uid")
            print(f"\n═══ РЕЙС #{i} ═══════════════════════════════════")
            print(f"title = {thread.get('title')!r}")
            print(f"number = {thread.get('number')!r}")
            print(f"uid = {uid!r}")

            print("\n  ── ПОЛНЫЙ thread ──")
            print(json.dumps(thread, ensure_ascii=False, indent=4))

            if uid:
                print(f"\n  ── /thread/?uid={uid} ──")
                try:
                    details = await fetch_thread(uid)
                    # нам интересны поля о типе
                    t = details.get("thread", details)
                    interesting = {
                        "express_type": t.get("express_type"),
                        "transport_type": t.get("transport_type"),
                        "title": t.get("title"),
                        "number": t.get("number"),
                        "vehicle": t.get("vehicle"),
                        "carrier": t.get("carrier"),
                    }
                    print(json.dumps(interesting, ensure_ascii=False, indent=4))
                except Exception as e:
                    print(f"  ! Ошибка: {e}")
    finally:
        await close_pool()


if __name__ == "__main__":
    sid = sys.argv[1] if len(sys.argv) > 1 else "domodedovo"
    n = int(sys.argv[2]) if len(sys.argv) > 2 else 3
    asyncio.run(main(sid, n))