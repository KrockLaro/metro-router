"""Переклассификация МЦД в существующих данных БД.

Проходит по всем рейсам с train_type='express' и, если origin/destination
на разных направлениях, меняет тип на 'mcd'.

Запуск:
    cd backend
    python -m scripts.reclassify_mcd
"""
from __future__ import annotations

import asyncio
import os

from dotenv import load_dotenv
load_dotenv()

from app.db.pool import init_pool, close_pool, get_pool
from app.schedule.worker import classify_train


async def main() -> None:
    await init_pool(os.environ["DATABASE_URL"])
    pool = get_pool()

    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT id, train_number, origin, destination, train_type
            FROM schedules
            WHERE train_type IN ('express', 'mcd')
            """
        )

    print(f"Всего рейсов 7xxx: {len(rows)}")

    updates: list[tuple[str, int]] = []
    for r in rows:
        new_type = classify_train(
            r["train_number"], r["origin"], r["destination"]
        )
        if new_type != r["train_type"]:
            updates.append((new_type, r["id"]))

    if not updates:
        print("Обновлять нечего.")
        await close_pool()
        return

    print(f"Меняем тип у {len(updates)} рейсов…")

    async with pool.acquire() as conn:
        await conn.executemany(
            "UPDATE schedules SET train_type = $1 WHERE id = $2",
            updates,
        )

    # Статистика после
    async with pool.acquire() as conn:
        stats = await conn.fetch(
            """
            SELECT train_type, COUNT(*) AS cnt
            FROM schedules
            GROUP BY train_type
            ORDER BY train_type
            """
        )

    print("\nПосле переклассификации:")
    for s in stats:
        print(f"  {s['train_type']:12}  {s['cnt']}")

    await close_pool()


if __name__ == "__main__":
    asyncio.run(main())