"""Запуск одного направления вне ротации.

Использование:
    python -m scripts.one_direction kazanskoye
"""
from __future__ import annotations

import asyncio
import os
import sys
from dotenv import load_dotenv
load_dotenv()

from app.db.pool import init_pool, close_pool
from app.schedule.worker import fetch_direction


async def main(direction_id: str) -> None:
    await init_pool(os.environ["DATABASE_URL"])

    class FakeCtx:
        pass

    print(f"-> Фетчу направление: {direction_id}")
    n = await fetch_direction(FakeCtx(), direction_id)
    print(f"V Готово, всего рейсов: {n}")

    await close_pool()


if __name__ == "__main__":
    did = sys.argv[1] if len(sys.argv) > 1 else "kazanskoye"
    asyncio.run(main(did))