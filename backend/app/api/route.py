"""
api/route.py — эндпоинты маршрутизации.

Пути:
    POST /route           — основной (frontend)
    POST /route/plan      — алиас
    POST /api/route/simple — старый путь (совместимость)
    GET  /route/stations  — список станций графа
    GET  /route/debug/{from_id}/{to_id}
"""
from datetime import datetime
from datetime import time as time_t

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.core.network import build_moscow_network, find_routes
from app.schedule.enrich import enrich_route
from app.schedule.repository import MSK


router = APIRouter(tags=["route"])
net = build_moscow_network()


class PlanRequest(BaseModel):
    from_lat: float
    from_lon: float
    to_lat: float
    to_lon: float
    when: datetime
    wheelchair: bool = False
    max_transfers: int = Field(3, ge=0, le=5)


class RouteRequest(BaseModel):
    from_id: str
    to_id: str
    depart_at: str | None = None      # "HH:MM" МСК; если нет — берём now
    max_variants: int | None = None


def _parse_depart_at(s: str | None) -> time_t:
    if not s:
        return datetime.now(MSK).time()
    # Принимаем "14:32" и "14:32:00"
    parts = s.split(":")
    if len(parts) < 2:
        raise HTTPException(400, f"Неверный формат depart_at: {s!r}")
    try:
        hh, mm = int(parts[0]), int(parts[1])
        return time_t(hh, mm)
    except ValueError:
        raise HTTPException(400, f"Неверный формат depart_at: {s!r}")


def _same_trains(a: dict, b: dict) -> bool:
    """Сравнивает набор поездов в двух вариантах маршрута.

    Если у обоих вариантов одинаковые train_number'ы — это один и тот же
    маршрут, показывать его дважды смысла нет.
    """
    def sig(v: dict) -> tuple:
        return tuple(
            (s["from"]["id"], s["to"]["id"], s.get("train_number"))
            for s in v["segments"]
        )
    return sig(a) == sig(b)


async def _build_response(from_id: str, to_id: str,
                          max_variants: int | None = None,
                          depart_at: str | None = None) -> dict:
    if from_id not in net.stations:
        raise HTTPException(404, f"Станция '{from_id}' не найдена")
    if to_id not in net.stations:
        raise HTTPException(404, f"Станция '{to_id}' не найдена")

    dep_time = _parse_depart_at(depart_at)
    k = max(1, min(max_variants or 3, 5))

    routes = find_routes(net, from_id, to_id, k=k)

    # 1. Базовые варианты — явно на обычной электричке (local).
    #    Иначе enrich может сам найти экспресс, и второй вариант
    #    окажется дубликатом первого.
    variants: list[dict] = []
    for r in routes:
        d = r.to_dict()
        d = await enrich_route(d, dep_time, avoid_express=True)
        variants.append(d)

    # 2. Пробуем построить вариант «с экспрессом» от первого (быстрейшего) пути.
    if routes:
        d_exp = routes[0].to_dict()
        d_exp = await enrich_route(d_exp, dep_time, prefer_express=True)
        if variants and not _same_trains(variants[0], d_exp):
            d_exp["tags"] = ["with_express"]
            d_exp["label"] = "С экспрессом"
            variants.insert(1, d_exp)

    return {"variants": variants[:k]}


# ── Основные пути (без префикса) ──────────────────────────

@router.post("/route")
async def route_main(req: RouteRequest):
    """Основной эндпоинт, который вызывает frontend."""
    return await _build_response(req.from_id, req.to_id,
                                 req.max_variants, req.depart_at)


@router.post("/route/plan")
async def route_plan(req: RouteRequest):
    """Алиас — некоторые старые версии фронта стучатся сюда."""
    return await _build_response(req.from_id, req.to_id,
                                 req.max_variants, req.depart_at)


@router.post("/api/route/simple")
async def route_simple(req: RouteRequest):
    """Старый путь. Оставлен на случай, если что-то ещё сюда стучится."""
    return await _build_response(req.from_id, req.to_id,
                                 req.max_variants, req.depart_at)


# ── Отладка ───────────────────────────────────────────────

@router.get("/route/stations")
def list_stations():
    return [
        {"id": s.id, "name": s.name}
        for s in sorted(net.stations.values(), key=lambda x: x.name)
    ]


@router.get("/route/debug/{from_id}/{to_id}")
async def debug_route(from_id: str, to_id: str,
                      depart_at: str | None = None):
    has_from = from_id in net.stations
    has_to = to_id in net.stations
    if not has_from or not has_to:
        return {
            "ok": False,
            "from_exists": has_from,
            "to_exists": has_to,
            "hint": "Одна или обе станции не в графе.",
        }

    dep_time = _parse_depart_at(depart_at)
    routes = find_routes(net, from_id, to_id, k=3)
    if not routes:
        return {
            "ok": False,
            "from_exists": True,
            "to_exists": True,
            "hint": "Станции есть, но маршрут не построился.",
        }
    enriched = [await enrich_route(r.to_dict(), dep_time) for r in routes]
    return {
        "ok": True,
        "variants_count": len(enriched),
        "variants": enriched,
    }