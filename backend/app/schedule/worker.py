"""arq worker: cron-задача + ручной запуск фетча расписаний.

Фетчит расписание на 3 дня (Пн + Сб + Вс) и объединяет дни недели
в days_mask. Это покрывает всю неделю одним заходом.
"""
from __future__ import annotations

from dotenv import load_dotenv
load_dotenv()

import logging
import os
from datetime import date, datetime, timedelta

from arq import cron
from arq.connections import RedisSettings

from ..db.pool import init_pool, close_pool
from .directions import DIRECTIONS, WEEKLY_ROTATION
from .yandex_codes import YANDEX_STATION_CODES
from .yandex_client import fetch_station_schedule, QuotaExceeded
from .repository import upsert_schedule_rows

log = logging.getLogger(__name__)
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
)


# ──────────────────────── Классификация ──────────────────
def classify_train(number: str, origin: str, destination: str) -> str:
    """Тип поезда: 'aeroexpress' | 'express' | 'local'.

    Яндекс v3.0 не отдаёт express_type для suburban-рейсов, поэтому
    определяем сами по номеру:
        7xxx  → экспресс (включая аэроэкспрессы)
        6xxx  → пригород
    Аэроэкспресс отличается тем, что маршрут ведёт в/из аэропорта.
    """
    n = (number or "").strip()
    route = f"{origin} {destination}".lower()
    is_airport = "аэропорт" in route

    if n.startswith("7"):
        return "aeroexpress" if is_airport else "express"
    return "local"


# ──────────────────────── Даты покрытия ──────────────────
def _nearest_weekday(target: int) -> date:
    """Ближайшая дата с указанным днём недели (0=Пн..6=Вс).

    Если сегодня уже target — вернёт сегодняшнюю дату.
    """
    today = date.today()
    delta = (target - today.weekday()) % 7
    return today + timedelta(days=delta)


def coverage_dates() -> list[date]:
    """3 даты, покрывающие будни, субботу и воскресенье.

    Берём ближайшие Пн, Сб, Вс. Если сегодня уже один из них — 
    берём сегодняшнюю дату.
    """
    dates = {_nearest_weekday(0), _nearest_weekday(5), _nearest_weekday(6)}
    return sorted(dates)


# ──────────────────────── Парсер ─────────────────────────
def _parse_one_item(
    item: dict, station_id: str, line_id: str, on_date: date
) -> dict | None:
    """Парсит один рейс из ответа Яндекса. days_mask = бит дня on_date."""
    thread = item.get("thread") or {}
    dep_iso = item.get("departure")
    if not dep_iso:
        return None

    dep_dt = datetime.fromisoformat(dep_iso.replace("Z", "+00:00"))
    arr_iso = item.get("arrival")
    arr_dt = (
        datetime.fromisoformat(arr_iso.replace("Z", "+00:00"))
        if arr_iso else None
    )

    title = thread.get("title") or ""
    parts = title.split(" — ")
    origin = parts[0] if parts else "—"
    dest = parts[-1] if len(parts) > 1 else "—"

    direction = "to_moscow" if "москв" in dest.lower() else "from_moscow"
    number = thread.get("number") or ""
    train_type = classify_train(number, origin, dest)

    return {
        "station_id": station_id,
        "line_id": line_id,
        "thread_uid": thread.get("uid") or dep_iso,
        "train_number": number or "—",
        "train_type": train_type,
        "origin": origin or "—",
        "destination": dest or "—",
        "direction": direction,
        "departure": dep_dt.time(),
        "arrival": arr_dt.time() if arr_dt else None,
        "days_mask": 1 << on_date.weekday(),
        "platform": item.get("platform"),
        "track": item.get("track"),
    }


def parse_payload(payload: dict, station_id: str, line_id: str) -> list[dict]:
    """Обратная совместимость: парсит один день (сегодня)."""
    today = date.today()
    out: list[dict] = []
    for item in payload.get("schedule", []) or []:
        row = _parse_one_item(item, station_id, line_id, today)
        if row:
            out.append(row)
    return out


# ──────────────────────── Фетч одной станции ─────────────
async def fetch_one_station_multi_day(
    ctx, station_id: str, line_id: str, on_dates: list[date]
) -> int:
    """Фетчит расписание станции на несколько дней, объединяет days_mask.

    Возвращает число сохранённых уникальных ниток.
    """
    yandex_code = YANDEX_STATION_CODES.get(station_id)
    if not yandex_code:
        log.warning("Нет Яндекс-кода для %s — пропускаю", station_id)
        return 0

    # {thread_uid: row}
    by_uid: dict[str, dict] = {}

    for on_date in on_dates:
        try:
            payload = await fetch_station_schedule(yandex_code, on_date)
        except QuotaExceeded:
            raise
        except Exception:
            log.exception(
                "Ошибка фетча %s на %s — пропускаю день",
                station_id, on_date,
            )
            continue

        for item in payload.get("schedule", []) or []:
            row = _parse_one_item(item, station_id, line_id, on_date)
            if not row:
                continue
            uid = row["thread_uid"]
            if uid in by_uid:
                # Тот же поезд, другой день — объединяем биты
                by_uid[uid]["days_mask"] |= row["days_mask"]
            else:
                by_uid[uid] = row

    rows = list(by_uid.values())
    n = await upsert_schedule_rows(rows)
    log.info(
        "Сохранено %d рейсов для %s (по %d дням)",
        n, station_id, len(on_dates),
    )
    return n


# Обратная совместимость: одностаничный фетч на сегодня
async def fetch_one_station(ctx, station_id: str, line_id: str) -> int:
    return await fetch_one_station_multi_day(
        ctx, station_id, line_id, [date.today()]
    )


# ──────────────────────── Направление ────────────────────
async def fetch_direction(ctx, direction_id: str) -> int:
    d = DIRECTIONS.get(direction_id)
    if not d:
        log.warning("Неизвестное направление %s", direction_id)
        return 0

    on_dates = coverage_dates()
    log.info(
        "Направление %s: дни %s",
        direction_id, [dt.isoformat() for dt in on_dates],
    )

    total = 0
    for sid in d["stations"]:
        try:
            total += await fetch_one_station_multi_day(
                ctx, sid, d["line_id"], on_dates
            )
        except QuotaExceeded:
            log.error("Стоп по квоте на станции %s", sid)
            raise
        except Exception:
            log.exception("Ошибка при фетче станции %s", sid)

    log.info("Направление %s: всего %d рейсов", direction_id, total)
    return total


# ──────────────────────── Cron ───────────────────────────
async def daily_rotation(ctx):
    """Каждый день в 03:00 — берёт направления по дню недели."""
    weekday = datetime.now().weekday()
    dirs = WEEKLY_ROTATION.get(weekday, [])
    log.info("День недели %d: обрабатываю %s", weekday, dirs)
    for d_id in dirs:
        try:
            await fetch_direction(ctx, d_id)
        except QuotaExceeded:
            log.error("Квота исчерпана, остальное — завтра")
            return


# ──────────────────────── arq настройки ──────────────────
async def startup(ctx):
    dsn = os.environ["DATABASE_URL"]
    ctx["pool"] = await init_pool(dsn)
    log.info("Worker started")


async def shutdown(ctx):
    await close_pool()
    log.info("Worker stopped")


REDIS_SETTINGS = RedisSettings.from_dsn(
    os.getenv("REDIS_URL", "redis://127.0.0.1:6379/0")
)


class WorkerSettings:
    functions = [fetch_direction, fetch_one_station, fetch_one_station_multi_day]
    cron_jobs = [
        cron(daily_rotation, hour=3, minute=0),
    ]
    on_startup = startup
    on_shutdown = shutdown
    redis_settings = REDIS_SETTINGS
    max_jobs = 3
    job_timeout = 600