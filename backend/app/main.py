# backend/app/main.py
"""
main.py — точка входа FastAPI.
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.route import router as route_router
from app.api.stations import router as stations_router


# GTFS-RT poller запускается только если задан флаг ENABLE_GTFS_RT=1.
# По умолчанию выключен — чтобы не спамить логами фейковыми URL.

poller = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global poller

    if os.getenv("ENABLE_GTFS_RT") == "1":
        from app.gtfs_rt.poller import GtfsRtPoller

        poller = GtfsRtPoller(
            redis_url=os.getenv("REDIS_URL", "redis://localhost:6379"),
            feeds={
                # ⚠️ Замени на реальные URL, когда получишь их от ЦППК/Мосгортранса
                "trip-updates": os.getenv("GTFS_RT_TRIP_UPDATES", ""),
                "alerts":       os.getenv("GTFS_RT_ALERTS", ""),
                "vehicle-positions": os.getenv("GTFS_RT_VEHICLES", ""),
            },
            interval_sec=30,
        )
        poller.start()

    yield

    if poller is not None:
        await poller.stop()


app = FastAPI(
    title="MetroRouter API",
    version="2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(route_router)
app.include_router(stations_router)


@app.get("/health")
def health():
    return {"status": "ok", "gtfs_rt_enabled": poller is not None}