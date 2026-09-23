"""
api/route.py — эндпоинты маршрутизации.
"""

from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.core.network import build_moscow_network, find_route


router = APIRouter(prefix="/api/route", tags=["route"])
net = build_moscow_network()


class PlanRequest(BaseModel):
    from_lat: float
    from_lon: float
    to_lat: float
    to_lon: float
    when: datetime
    wheelchair: bool = False
    max_transfers: int = Field(3, ge=0, le=5)


class SimpleRouteRequest(BaseModel):
    from_id: str
    to_id: str


@router.post("/simple")
def simple(req: SimpleRouteRequest):
    """
    Построить маршрут между двумя станциями по их ID.
    Использует локальный граф (Dijkstra).
    """
    if req.from_id not in net.stations:
        raise HTTPException(404, f"Станция '{req.from_id}' не найдена")
    if req.to_id not in net.stations:
        raise HTTPException(404, f"Станция '{req.to_id}' не найдена")

    r = find_route(net, req.from_id, req.to_id)
    if r is None:
        raise HTTPException(404, "Маршрут не найден")

    return r.to_dict()


@router.get("/stations")
def list_stations():
    """Список всех станций в графе (для отладки)."""
    return [
        {"id": s.id, "name": s.name}
        for s in sorted(net.stations.values(), key=lambda x: x.name)
    ]


@router.get("/debug/{from_id}/{to_id}")
def debug_route(from_id: str, to_id: str):
    """
    Отладочный эндпоинт: показывает, есть ли оба ID в графе,
    и пытается построить маршрут.
    """
    has_from = from_id in net.stations
    has_to = to_id in net.stations
    if not has_from or not has_to:
        return {
            "ok": False,
            "from_exists": has_from,
            "to_exists": has_to,
            "hint": "Одна или обе станции не в графе. Перезапусти uvicorn.",
        }

    r = find_route(net, from_id, to_id)
    if r is None:
        return {
            "ok": False,
            "from_exists": True,
            "to_exists": True,
            "hint": "Станции есть, но маршрут не построился. Проверь связи в графе.",
        }
    return {"ok": True, "route": r.to_dict()}