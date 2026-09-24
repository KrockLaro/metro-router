"""
main.py — точка входа FastAPI приложения metro-router.

ВАЖНО: load_dotenv() должен быть вызван ДО любых обращений к os.environ,
поэтому он стоит самой первой строкой (после будущих импортов).
"""
from dotenv import load_dotenv
load_dotenv()

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .db.pool import init_pool, close_pool
from .api import route as route_api
from .api import station as station_api

# ──────────────────────────────────────────────────────────
# Логирование
# ──────────────────────────────────────────────────────────
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
)
log = logging.getLogger("metro-router")


# ──────────────────────────────────────────────────────────
# Lifespan: инициализация/очистка ресурсов
# ──────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    dsn = os.environ.get("DATABASE_URL")
    if not dsn:
        raise RuntimeError(
            "DATABASE_URL не задан. Проверьте backend/.env и что load_dotenv() "
            "вызывается до чтения os.environ."
        )

    log.info("Инициализация пула БД...")
    await init_pool(dsn)
    log.info("Пул БД готов")

    yield

    log.info("Закрытие пула БД...")
    await close_pool()
    log.info("Пул БД закрыт")


# ──────────────────────────────────────────────────────────
# Приложение
# ──────────────────────────────────────────────────────────
app = FastAPI(
    title="metro-router API",
    description=(
        "Маршрутизация по электричкам ЦППК/МТППК, МЦД и МЦК. "
        "Расписания подтягиваются из Яндекс.Расписаний."
    ),
    version="0.2.0",
    lifespan=lifespan,
)

# CORS — разрешаем всё в dev-режиме. В проде сузить до конкретных origin'ов.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────────────────
# Роутеры
# ──────────────────────────────────────────────────────────
app.include_router(route_api.router)
app.include_router(station_api.router)


# ──────────────────────────────────────────────────────────
# Health-check
# ──────────────────────────────────────────────────────────
@app.get("/health", tags=["system"])
async def health():
    """Простой health-check. Используется мобильным клиентом для ping."""
    return {"status": "ok"}


@app.get("/health/db", tags=["system"])
async def health_db():
    """Проверка подключения к БД."""
    from .db.pool import get_pool
    pool = get_pool()
    async with pool.acquire() as conn:
        one = await conn.fetchval("SELECT 1")
    return {"status": "ok", "db": "reachable", "select_1": one}


# ──────────────────────────────────────────────────────────
# Глобальный обработчик ошибок (для отладки)
# ──────────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    log.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Внутренняя ошибка сервера: {exc.__class__.__name__}"},
    )