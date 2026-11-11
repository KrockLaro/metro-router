"""Пул соединений asyncpg + автозапуск миграций."""
from __future__ import annotations

import logging
from pathlib import Path

import asyncpg

log = logging.getLogger(__name__)

_pool: asyncpg.Pool | None = None

MIGRATIONS_DIR = Path(__file__).parent / "migrations"


async def init_pool(dsn: str) -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            dsn,
            min_size=2,
            max_size=10,
            command_timeout=30,
            ssl="require",
            statement_cache_size=0
        )
        await _run_migrations(_pool)
    return _pool


async def close_pool() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None


def get_pool() -> asyncpg.Pool:
    if _pool is None:
        raise RuntimeError("DB pool is not initialised. Call init_pool() first.")
    return _pool


async def _run_migrations(pool: asyncpg.Pool) -> None:
    """Применяет *.sql файлы по алфавиту. Идемпотентно."""
    async with pool.acquire() as conn:
        await conn.execute(
            """
            CREATE TABLE IF NOT EXISTS _migrations (
                name TEXT PRIMARY KEY,
                applied_at TIMESTAMPTZ DEFAULT now()
            )
            """
        )

        applied = {
            r["name"]
            for r in await conn.fetch("SELECT name FROM _migrations")
        }

        for path in sorted(MIGRATIONS_DIR.glob("*.sql")):
            if path.name in applied:
                continue
            log.info("Applying migration %s", path.name)
            sql = path.read_text(encoding="utf-8-sig")
            async with conn.transaction():
                await conn.execute(sql)
                await conn.execute(
                    "INSERT INTO _migrations (name) VALUES ($1)", path.name
                )