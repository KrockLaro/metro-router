"""
gtfs_rt/poller.py — опрос GTFS-RT фидов и кеширование в Redis.
"""

from __future__ import annotations
import asyncio
import logging

import httpx
import redis.asyncio as redis
from google.transit import gtfs_realtime_pb2

log = logging.getLogger(__name__)


class GtfsRtPoller:
    def __init__(
        self,
        redis_url: str,
        feeds: dict[str, str],
        interval_sec: int = 30,
    ):
        self.redis = redis.from_url(redis_url, decode_responses=False)
        self.feeds = feeds
        self.interval = interval_sec
        self._client = httpx.AsyncClient(timeout=15)
        self._task: asyncio.Task | None = None

    def start(self) -> None:
        self._task = asyncio.create_task(self._loop())

    async def stop(self) -> None:
        if self._task:
            self._task.cancel()
        await self._client.aclose()

    async def _loop(self) -> None:
        while True:
            try:
                await asyncio.gather(*[
                    self._fetch(name, url) for name, url in self.feeds.items()
                ])
            except Exception:
                log.exception("GTFS-RT poll failed")
            await asyncio.sleep(self.interval)

    async def _fetch(self, name: str, url: str) -> None:
        r = await self._client.get(url)
        r.raise_for_status()

        msg = gtfs_realtime_pb2.FeedMessage()
        msg.ParseFromString(r.content)

        key = f"gtfsrt:{name}"
        await self.redis.set(key, r.content, ex=self.interval * 4)

        if name == "trip-updates":
            pipe = self.redis.pipeline()
            for entity in msg.entity:
                if not entity.HasField("trip_update"):
                    continue
                tu = entity.trip_update
                trip_id = tu.trip.trip_id
                delay = self._extract_delay(tu)
                if delay is None:
                    continue
                pipe.hset(
                    "gtfsrt:delays",
                    f"{trip_id}:{tu.trip.start_date}",
                    str(delay),
                )
            pipe.expire("gtfsrt:delays", 600)
            await pipe.execute()

        log.info("GTFS-RT %s updated: %d entities", name, len(msg.entity))

    @staticmethod
    def _extract_delay(tu) -> int | None:
        deltas = [
            stu.arrival.delay
            for stu in tu.stop_time_update
            if stu.HasField("arrival")
        ]
        return int(sum(deltas) / len(deltas)) if deltas else None


async def get_trip_delay(redis_client, trip_id: str, date: str) -> int:
    val = await redis_client.hget("gtfsrt:delays", f"{trip_id}:{date}")
    return int(val) if val else 0