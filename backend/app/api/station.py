"""API эндпоинта расписания станции."""
from fastapi import APIRouter, HTTPException

from ..schedule.repository import get_upcoming_departures

router = APIRouter(prefix="/station", tags=["station"])


@router.get("/{station_id}/departures")
async def departures(station_id: str, limit: int = 3):
    """
    Возвращает ближайшие поезда в обе стороны от станции.
    limit — максимум в каждую сторону (по умолчанию 3).
    """
    data = await get_upcoming_departures(station_id, limit=limit)
    if data is None:
        raise HTTPException(status_code=404, detail="Station has no schedule data")
    return data
