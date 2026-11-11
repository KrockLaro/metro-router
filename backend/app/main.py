import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.pool import init_pool, close_pool
from app.api import route as route_api
from app.api import station as station_api  # Если у тебя есть роутер для расписаний

# Настраиваем логирование, чтобы видеть ошибки в консоли Cloady
logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Управляет жизненным циклом приложения.
    Инициализирует пул подключений к БД при старте и закрывает при выключении.
    """
    # --- СТАРТ ПРИЛОЖЕНИЯ ---
    dsn = os.environ.get("DATABASE_URL")
    if dsn:
        log.info("Инициализация пула подключений к базе данных...")
        try:
            await init_pool(dsn)
            log.info("Пул подключений успешно создан.")
        except Exception as e:
            log.exception("Ошибка подключения к БД:")
    else:
        log.warning("ВНИМАНИЕ: Переменная DATABASE_URL не задана в окружении!")

    yield  # Здесь приложение работает и принимает запросы

    # --- ВЫКЛЮЧЕНИЕ ПРИЛОЖЕНИЯ ---
    log.info("Закрытие пула подключений к базе данных...")
    await close_pool()


# Создаем экземпляр FastAPI с использованием lifespan
app = FastAPI(
    title="Маршрутизатор API",
    description="Бэкенд для построения маршрутов электричек",
    version="1.0.0",
    lifespan=lifespan
)

# --- НАСТРОЙКА CORS (КРИТИЧЕСКИ ВАЖНО ДЛЯ МОБИЛЬНОГО ПРИЛОЖЕНИЯ) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешаем запросы с любого домена/IP
    allow_credentials=True,
    allow_methods=["*"],  # Разрешаем GET, POST, OPTIONS и т.д.
    allow_headers=["*"],  # Разрешаем любые заголовки
)
# ------------------------------------------------------------------

# Подключаем роутеры (API эндпоинты)
app.include_router(route_api.router)

# Подключаем роутер расписаний (если он у тебя есть и импортируется)
try:
    app.include_router(station_api.router)
except Exception as e:
    log.warning(f"Не удалось подключить station_api: {e}")


@app.get("/health")
def health_check():
    """Эндпоинт для проверки жизнеспособности сервера (пинг)."""
    return {"status": "ok", "service": "metro-router-api"}