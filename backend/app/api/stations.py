# backend/app/api/stations.py
from fastapi import APIRouter
from ..core.network import _STATIONS

router = APIRouter(prefix="/stations", tags=["stations"])

@router.get("/search")
async def search(q: str = "", limit: int = 20):
    q = q.strip().lower()
    if not q:
        return []
    result = []
    for sid, name in _STATIONS:
        if q in name.lower():
            result.append({"id": sid, "name": name})
        if len(result) >= limit:
            break
    return result