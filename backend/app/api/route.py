"""
api/route.py — эндпоинты маршрутизации.
"""

from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import redis.asyncio as redis

from app.otp.client import OTPClient
from app.core.network import build_moscow_network, find_route
from app.gtfs_rt.poller import get_trip_delay


router = APIRouter(prefix="/api/route", tags=["route"])
otp = OTPClient()
net = build_moscow_network()
redis_client = redis.from_url("redis://redis:6379", decode_responses=False)


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


@router.post("/plan")
async def plan(req: PlanRequest):
    try:
        return await otp.plan(
            req.from_lat, req.from_lon,
            req.to_lat, req.to_lon,
            req.when,
            wheelchair=req.wheelchair,
            max_transfers=req.max_transfers,
        )
    except Exception as e:
        raise HTTPException(502, f"OTP error: {e}")


@router.post("/plan-realtime")
async def plan_realtime(req: PlanRequest):
    plan = await otp.plan(
        req.from_lat, req.from_lon,
        req.to_lat, req.to_lon,
        req.when,
        wheelchair=req.wheelchair,
        max_transfers=req.max_transfers,
    )
    date_str = req.when.strftime("%Y%m%d")
    for it in plan["itineraries"]:
        for leg in it["legs"]:
            if leg.get("trip"):
                leg["realtimeDelay"] = await get_trip_delay(
                    redis_client, leg["trip"]["gtfsId"], date_str
                )
    return plan


@router.post("/simple")
def simple(req: SimpleRouteRequest):
    r = find_route(net, req.from_id, req.to_id)
    if r is None:
        raise HTTPException(404, "Маршрут не найден")
    return r.to_dict()