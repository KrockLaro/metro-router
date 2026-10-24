"""Проверка: какие станции уже лежат в БД и сколько рейсов."""
import asyncio
import os
import sys

from dotenv import load_dotenv
load_dotenv()

from app.db.pool import init_pool, get_pool, close_pool


async def main(station_ids: list[str] | None) -> None:
    await init_pool(os.environ["DATABASE_URL"])
    pool = get_pool()

    async with pool.acquire() as conn:
        if station_ids:
            # Точечная проверка
            print(f"{'station_id':25} {'рейсов':>8}")
            print("-" * 35)
            for sid in station_ids:
                n = await conn.fetchval(
                    "SELECT COUNT(*) FROM schedules WHERE station_id = $1", sid
                )
                print(f"{sid:25} {n:>8}")
        else:
            # Общая сводка по линиям
            print(f"{'line_id':20} {'рейсов':>10}")
            print("-" * 32)
            rows = await conn.fetch(
                "SELECT line_id, COUNT(*) AS n FROM schedules "
                "GROUP BY line_id ORDER BY line_id"
            )
            total = 0
            for r in rows:
                print(f"{r['line_id']:20} {r['n']:>10}")
                total += r["n"]
            print("-" * 32)
            print(f"{'ИТОГО':20} {total:>10}")

    await close_pool()


if __name__ == "__main__":
    ids = sys.argv[1:] or None
    asyncio.run(main(ids))