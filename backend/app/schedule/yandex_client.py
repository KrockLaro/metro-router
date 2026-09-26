"""Клиент Яндекс.Расписаний с контролем лимита 500 запросов/сутки."""
from __future__ import annotations

import logging
import os
from datetime import date

import httpx

from ..db.pool import get_pool

log = logging.getLogger(__name__)

# Гасим INFO-логи httpx/httpcore — они логируют URL с apikey
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)

YANDEX_API_KEY = os.getenv("YANDEX_RASP_API_KEY", "")
YANDEX_BASE = "https://api.rasp.yandex.net/v3.0/schedule/"
DAILY_LIMIT = 500


class QuotaExceeded(RuntimeError):
    """Наш собственный лимит 500 запросов/сутки исчерпан."""


class YandexHTTPError(RuntimeError):
    """Ошибка HTTP от Яндекса (без утечки URL и ключа)."""

    def __init__(self, status_code: int, station: str):
        self.status_code = status_code
        self.station = station
        super().__init__(
            f"Yandex Rasp вернул HTTP {status_code} для станции {station}"
        )


async def _bump_usage() -> int:
    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO api_usage (day, requests) VALUES ($1, 1)
            ON CONFLICT (day) DO UPDATE
              SET requests = api_usage.requests + 1
            RETURNING requests
            """,
            date.today(),
        )
        return row["requests"]


async def _check_quota() -> None:
    pool = get_pool()
    async with pool.acquire() as conn:
        used = await conn.fetchval(
            "SELECT requests FROM api_usage WHERE day = $1", date.today()
        ) or 0
    if used >= DAILY_LIMIT:
        raise QuotaExceeded(
            f"Daily Yandex Rasp limit reached ({used}/{DAILY_LIMIT})"
        )


async def fetch_station_schedule(
    yandex_code: str,
    on_date: date,
    *,
    transport_types: str = "suburban",
    skip_quota: bool = False,
) -> dict:
    """Один запрос = расписание одной станции за день.

    skip_quota=True — не считать и не проверять суточный лимит.
    Используется в тестовых скриптах, чтобы не жечь квоту.
    """
    if not YANDEX_API_KEY:
        raise RuntimeError("YANDEX_RASP_API_KEY не задан в окружении")

    if not skip_quota:
        await _check_quota()

    params = {
        "apikey": YANDEX_API_KEY,
        "station": yandex_code,
        "date": on_date.isoformat(),
        "transport_types": transport_types,
        "format": "json",
        "lang": "ru_RU",
        "limit": 1000,
    }

    async with httpx.AsyncClient(timeout=25) as client:
        r = await client.get(YANDEX_BASE, params=params)

    if r.status_code != 200:
        # ВАЖНО: не вызываем r.raise_for_status() — он вкладывает URL
        # с apikey в exception traceback. Бросаем свою ошибку без ключа.
        log.error(
            "Yandex Rasp вернул HTTP %d для станции %s",
            r.status_code, yandex_code,
        )
        raise YandexHTTPError(r.status_code, yandex_code)

    if not skip_quota:
        used = await _bump_usage()
        log.info("Yandex Rasp OK, today used=%d/%d", used, DAILY_LIMIT)

    return r.json()