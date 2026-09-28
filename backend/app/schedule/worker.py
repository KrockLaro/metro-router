"""arq worker: cron-задача + ручной запуск фетча расписаний."""
from __future__ import annotations

from dotenv import load_dotenv
load_dotenv()

import logging
import os
from datetime import date, datetime

from arq import cron
from arq.connections import RedisSettings

from ..db.pool import init_pool, close_pool
from ..core.network import _STATIONS as _STATIONS_LIST
from .directions import DIRECTIONS, WEEKLY_ROTATION
from .yandex_codes import YANDEX_STATION_CODES
from .yandex_client import fetch_station_schedule, QuotaExceeded
from .repository import upsert_schedule_rows

log = logging.getLogger(__name__)
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
)


# ──────────────────────── Справочник направлений ──────────
# Строим {lowercased_name: direction_id} из directions.py.
# Нужен для классификации МЦД (когда origin и dest на разных направлениях).
_NAME_TO_DIR: dict[str, str] = {}

# 1) Из directions.py — реальные станции, что фетчим
for _dir_id, _d in DIRECTIONS.items():
    for _sid in _d.get("stations", []):
        for _sid_actual, _name_actual in _STATIONS_LIST:
            if _sid_actual == _sid:
                _NAME_TO_DIR[_name_actual.lower()] = _dir_id
                break

# 2) Алиасы вокзалов — Яндекс пишет иначе, чем наши _STATIONS
_VOKZAL_ALIASES: dict[str, str] = {
    "москва (ярославский вокзал)":    "yaroslavskoye",
    "москва (казанский вокзал)":      "kazanskoye",
    "москва (ленинградский вокзал)":  "leningradskoye",
    "москва (курский вокзал)":        "kurskoye",
    "москва (павелецкий вокзал)":     "paveletskoye",
    "москва (белорусский вокзал)":    "belorusskoye",
    "москва (киевский вокзал)":       "kiyevskoye",
    "москва (савёловский вокзал)":    "savyolovskoye",
    "площадь трёх вокзалов (каланчёвская)": "kurskoye",
}
_NAME_TO_DIR.update(_VOKZAL_ALIASES)

# 3) Хабы МЦД-3 / МЦД-4 и другие конечные, которых у нас нет в DIRECTIONS,
#    но которые встречаются в маршрутах сквозных поездов.
_MCD_HUBS: dict[str, str] = {
    "зеленоград-крюково":  "leningradskoye",   # МЦД-3
    "ипподром":            "kazanskoye",       # МЦД-3 (Раменское)
    "апрелевка":           "kiyevskoye",       # МЦД-4
    "железнодорожная":     "gorkovskoye",      # МЦД-4
    "крутое":              "gorkovskoye",      # Горьковское (не МЦД, но для корректности)
    "владимир":            "gorkovskoye",      # РЭКС Горьковского
    "орехово-зуево":       "gorkovskoye",      # Горьковское
}
_NAME_TO_DIR.update(_MCD_HUBS)


# ──────────────────────── Классификация ──────────────────
def classify_train(number: str, origin: str, destination: str) -> str:
    """Тип поезда: 'aeroexpress' | 'mcd' | 'express' | 'local'.

    Признаки:
      • 'аэропорт' в маршруте       → aeroexpress
      • 7xxx и origin/dest на РАЗНЫХ направлениях → mcd (сквозь Москву)
      • 7xxx на одном направлении   → express (РЭКС)
      • 6xxx / остальные            → local
    """
    n = (number or "").strip()
    route = f"{origin} {destination}".lower()

    if "аэропорт" in route:
        return "aeroexpress"

    if n.startswith("7"):
        dir_origin = _NAME_TO_DIR.get((origin or "").lower())
        dir_dest = _NAME_TO_DIR.get((destination or "").lower())
        # Сквозной маршрут между двумя направлениями = МЦД
        if dir_origin and dir_dest and dir_origin != dir_dest:
            return "mcd"
        return "express"

    return "local"


# ──────────────────────── Парсер ─────────────────────────
def parse_payload(payload: dict, station_id: str, line_id: str) -> list[dict]:
    """Yandex Rasp JSON -> строки для таблицы schedules."""
    rows: list[dict] = []

    for item in payload.get("schedule", []) or []:
        thread = item.get("thread", {}) or {}
        dep_iso = item.get("departure")
        arr_iso = item.get("arrival")
        if not dep_iso:
            continue

        dep_dt = datetime.fromisoformat(dep_iso.replace("Z", "+00:00"))
        arr_dt = (
            datetime.fromisoformat(arr_iso.replace("Z", "+00:00"))
            if arr_iso else None
        )

        title = thread.get("title") or ""
        parts = title.split(" — ")
        origin = parts[0].strip() if parts else "—"
        dest = parts[-1].strip() if len(parts) > 1 else "—"

        direction = "to_moscow" if "москв" in dest.lower() else "from_moscow"

        number = thread.get("number") or ""
        train_type = classify_train(number, origin, dest)

        rows.append({
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
            "days_mask": 1 << dep_dt.weekday(),
            "platform": item.get("platform"),
            "track": item.get("track"),
        })
    return rows


# ──────────────────────── Одна станция ───────────────────
async def fetch_one_station(ctx, station_id: str, line_id: str) -> int:
    yandex_code = YANDEX_STATION_CODES.get(station_id)
    if not yandex_code:
        log.warning("Нет Яндекс-кода для %s — пропускаю", station_id)
        return 0

    try:
        payload = await fetch_station_schedule(yandex_code, date.today())
    except QuotaExceeded as e:
        log.error("Quota exceeded: %s", e)
        raise

    rows = parse_payload(payload, station_id, line_id)
    n = await upsert_schedule_rows(rows)
    log.info("Сохранено %d рейсов для %s", n, station_id)
    return n


# ──────────────────────── Направление ────────────────────
async def fetch_direction(ctx, direction_id: str) -> int:
    d = DIRECTIONS.get(direction_id)
    if not d:
        log.warning("Неизвестное направление %s", direction_id)
        return 0

    total = 0
    for sid in d["stations"]:
        try:
            total += await fetch_one_station(ctx, sid, d["line_id"])
        except QuotaExceeded:
            log.error("Стоп по квоте на станции %s", sid)
            raise
        except Exception:
            log.exception("Ошибка при фетче станции %s", sid)

    log.info("Направление %s: всего %d рейсов", direction_id, total)
    return total


# ──────────────────────── Cron ───────────────────────────
async def daily_rotation(ctx):
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
    functions = [fetch_direction, fetch_one_station]
    cron_jobs = [
        cron(daily_rotation, hour=3, minute=0),
    ]
    on_startup = startup
    on_shutdown = shutdown
    redis_settings = REDIS_SETTINGS
    max_jobs = 3
    job_timeout = 600