"""Ежедневное обновление расписаний по ротации дней недели.

Скрипт сам определяет сегодняшний день недели и фетчит только те
направления, что запланированы на этот день (см. WEEKLY_ROTATION
в app/schedule/directions.py):

    Пн — Савёловское + Белорусское (и Шереметьево)
    Вт — Курское + Рижское
    Ср — Ленинградское + Казанское
    Чт — Горьковское + Киевское
    Пт — Ярославское + Павелецкое
    Сб — БМО
    Вс — МЦК

Направления без станций (ещё не реализованы) пропускаются без ошибки.

Запуск:
    cd backend
    python -m scripts.daily_refresh

Использование из Task Scheduler — см. scripts/refresh.bat.
"""
from __future__ import annotations

import asyncio
import logging
import os
import sys
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
load_dotenv()

from app.db.pool import init_pool, close_pool
from app.schedule.directions import DIRECTIONS, WEEKLY_ROTATION
from app.schedule.worker import fetch_one_station_multi_day, coverage_dates
from app.schedule.yandex_client import QuotaExceeded
from app.schedule.repository import MSK


# ─── Настройки ────────────────────────────────────────────

# Оставляем немного квоты «на запас» — для ручных тестов через API
# в течение дня. Если после фетча осталось меньше — не запускаем
# следующее направление.
QUOTA_SOFT_LIMIT = 450       # не начинать новое направление, если использовано ≥ этого
DAILY_LIMIT = 500            # жёсткий лимит Яндекса (для справки)

# Папка для логов
LOG_DIR = Path(__file__).resolve().parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)
LOG_FILE = LOG_DIR / "daily_refresh.log"


# ─── Логирование ──────────────────────────────────────────

_fmt = "%(asctime)s | %(levelname)-7s | %(name)s | %(message)s"
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format=_fmt,
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
    ],
    force=True,   # ← сбрасывает handlers, которые могли появиться при импорте worker
)
log = logging.getLogger("daily_refresh")


# ─── Квота ────────────────────────────────────────────────

async def _current_usage() -> int:
    """Сколько запросов к Яндексу сделано сегодня (по нашей таблице api_usage)."""
    from app.db.pool import get_pool
    pool = get_pool()
    async with pool.acquire() as conn:
        used = await conn.fetchval(
            "SELECT requests FROM api_usage WHERE day = $1",
            datetime.now(MSK).date(),
        ) or 0
    return used


# ─── Основная логика ──────────────────────────────────────

async def refresh_direction(direction_id: str) -> int:
    """Фетчит все станции одного направления. Возвращает total рейсов.

    Если у направления нет станций (ещё не реализовано) — возвращает 0
    без ошибки.
    """
    d = DIRECTIONS.get(direction_id)
    if not d:
        log.warning("Неизвестное направление: %s — пропускаю", direction_id)
        return 0

    stations = d.get("stations") or []
    if not stations:
        log.info(
            "Направление '%s' (%s): станции ещё не заданы — пропускаю",
            d.get("name", direction_id),
            direction_id,
        )
        return 0

    # Мягкий лимит: если уже много запросов, не начинаем новое направление
    used = await _current_usage()
    if used >= QUOTA_SOFT_LIMIT:
        log.warning(
            "Использовано %d/%d запросов — пропускаю '%s' до завтра",
            used, DAILY_LIMIT, direction_id,
        )
        return 0

    on_dates = coverage_dates()
    log.info(
        "Направление '%s' (%s): %d станций, дни %s",
        d.get("name", direction_id),
        direction_id,
        len(stations),
        [dt.isoformat() for dt in on_dates],
    )

    total = 0
    for sid in stations:
        # Проверяем квоту каждые несколько станций, чтобы вовремя остановиться
        if total % 10 == 0:
            used = await _current_usage()
            if used >= DAILY_LIMIT:
                log.error("Квота исчерпана (%d/%d) — прерываю '%s'",
                          used, DAILY_LIMIT, direction_id)
                raise QuotaExceeded(f"Daily limit reached ({used}/{DAILY_LIMIT})")

        try:
            total += await fetch_one_station_multi_day(
                ctx=None,
                station_id=sid,
                line_id=d["line_id"],
                on_dates=on_dates,
            )
        except QuotaExceeded:
            raise
        except Exception:
            log.exception("Ошибка фетча станции %s — пропускаю", sid)

    log.info("Направление '%s': всего %d рейсов", direction_id, total)
    return total


async def main() -> None:
    started = datetime.now(MSK)
    weekday = started.weekday()          # 0 = Пн, 6 = Вс
    weekday_name = [
        "Понедельник", "Вторник", "Среда", "Четверг",
        "Пятница", "Суббота", "Воскресенье",
    ][weekday]
    directions = WEEKLY_ROTATION.get(weekday, [])

    log.info("=" * 70)
    log.info(
        "Daily refresh запущен: %s МСК, %s",
        started.strftime("%Y-%m-%d %H:%M"), weekday_name,
    )
    log.info("По ротации сегодня: %s", directions or "(пусто)")

    if not directions:
        log.info("Нет направлений на сегодня — выходим")
        return

    dsn = os.environ.get("DATABASE_URL")
    if not dsn:
        log.error("DATABASE_URL не задан. Проверь backend/.env")
        sys.exit(1)

    await init_pool(dsn)

    grand_total = 0
    failed: list[str] = []
    skipped: list[str] = []

    try:
        for direction_id in directions:
            used = await _current_usage()
            if used >= QUOTA_SOFT_LIMIT:
                skipped.append(direction_id)
                log.warning(
                    "Квота на пределе (%d/%d) — '%s' переносится",
                    used, DAILY_LIMIT, direction_id,
                )
                continue

            try:
                n = await refresh_direction(direction_id)
                if n == 0:
                    skipped.append(direction_id)
                else:
                    grand_total += n
            except QuotaExceeded:
                failed.append(direction_id)
                log.error("Квота исчерпана — прерываю оставшиеся направления")
                break
            except Exception:
                failed.append(direction_id)
                log.exception("Упало направление %s", direction_id)

        used_end = await _current_usage()
    finally:
        await close_pool()

    finished = datetime.now(MSK)
    duration = (finished - started).total_seconds()
    log.info(
        "Daily refresh завершён: %s МСК, %.1f сек, всего %d рейсов, "
        "квота %d/%d",
        finished.strftime("%Y-%m-%d %H:%M"),
        duration,
        grand_total,
        used_end,
        DAILY_LIMIT,
    )
    if skipped:
        log.info("Пропущено: %s", ", ".join(skipped))
    if failed:
        log.warning("С ошибками: %s", ", ".join(failed))
        sys.exit(2)


if __name__ == "__main__":
    asyncio.run(main())