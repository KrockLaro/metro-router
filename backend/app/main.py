"""
main.py — точка входа FastAPI.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.route import router as route_router
from app.api.stations import router as stations_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


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
    return {"status": "ok"}