"""
otp/client.py — клиент к OpenTripPlanner 2.x (GraphQL).
"""

from __future__ import annotations
from datetime import datetime
from typing import Any
import httpx


OTP_PLAN_QUERY = """
query Plan($from: InputCoordinates!, $to: InputCoordinates!,
           $date: String!, $time: String!, $modes: [TransportMode!],
           $num: Int!, $maxTransfers: Int!, $wheelchair: Boolean!) {
  plan(
    from: $from, to: $to, date: $date, time: $time,
    transportModes: $modes,
    numItineraries: $num,
    maxTransfers: $maxTransfers,
    wheelchair: $wheelchair
  ) {
    itineraries {
      duration
      startTime
      endTime
      walkDistance
      waitingTime
      legs {
        mode
        duration
        distance
        from { name lat lon stop { gtfsId code } }
        to   { name lat lon stop { gtfsId code } }
        startTime
        endTime
        realtime
        departureDelay
        arrivalDelay
        route {
          gtfsId
          shortName
          longName
          color
          mode
          agency { name }
        }
        intermediatePlaces { name stop { gtfsId } }
        legGeometry { points length }
        alerts {
          alertHeaderText
          alertSeverityLevel
          alertDescriptionText
        }
      }
    }
  }
}
"""


class OTPClient:
    def __init__(self, base_url: str = "http://otp:8080"):
        self.base_url = base_url.rstrip("/") + "/otp/gtfs/v1"
        self._client = httpx.AsyncClient(timeout=30)

    async def plan(
        self,
        from_lat: float, from_lon: float,
        to_lat: float, to_lon: float,
        when: datetime,
        modes: list[str] | None = None,
        num_itineraries: int = 3,
        max_transfers: int = 3,
        wheelchair: bool = False,
    ) -> dict[str, Any]:
        variables = {
            "from": {"latitude": from_lat, "longitude": from_lon},
            "to":   {"latitude": to_lat,   "longitude": to_lon},
            "date": when.strftime("%Y-%m-%d"),
            "time": when.strftime("%H:%M:%S"),
            "modes": [{"mode": m} for m in (modes or ["RAIL", "SUBWAY", "WALK"])],
            "num": num_itineraries,
            "maxTransfers": max_transfers,
            "wheelchair": wheelchair,
        }
        r = await self._client.post(
            self.base_url,
            json={"query": OTP_PLAN_QUERY, "variables": variables},
        )
        r.raise_for_status()
        data = r.json()
        if "errors" in data:
            raise RuntimeError(data["errors"])
        return data["data"]["plan"]