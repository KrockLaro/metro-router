"""
gtfs/loader.py — загрузка GTFS-фида.
"""

from __future__ import annotations
import csv
import zipfile
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Iterator


@dataclass(frozen=True)
class Stop:
    id: str
    name: str
    lat: float
    lon: float
    parent_id: str | None = None


@dataclass(frozen=True)
class Route:
    id: str
    short_name: str
    long_name: str
    color: str
    kind: int


@dataclass(frozen=True)
class Trip:
    id: str
    route_id: str
    service_id: str
    headsign: str


@dataclass
class StopTime:
    trip_id: str
    stop_id: str
    arrival: int
    departure: int
    stop_sequence: int


class GTFSFeed:
    def __init__(self) -> None:
        self.stops: dict[str, Stop] = {}
        self.routes: dict[str, Route] = {}
        self.trips: dict[str, Trip] = {}
        self.stop_times: dict[str, list[StopTime]] = {}
        self.route_trips: dict[str, list[str]] = {}
        self.stop_routes: dict[str, set[str]] = {}
        self.transfers: dict[str, dict[str, int]] = {}
        self.calendar: dict[str, set[int]] = {}

    @classmethod
    def from_zip(cls, path: str | Path) -> "GTFSFeed":
        feed = cls()
        with zipfile.ZipFile(path) as z:
            with z.open("stops.txt") as f:
                feed._load_stops(f)
            with z.open("routes.txt") as f:
                feed._load_routes(f)
            with z.open("trips.txt") as f:
                feed._load_trips(f)
            with z.open("stop_times.txt") as f:
                feed._load_stop_times(f)
            try:
                with z.open("transfers.txt") as f:
                    feed._load_transfers(f)
            except KeyError:
                pass
            try:
                with z.open("calendar.txt") as f:
                    feed._load_calendar(f)
            except KeyError:
                pass
        feed._build_indexes()
        return feed

    def _load_stops(self, f) -> None:
        for row in csv.DictReader(line.decode("utf-8-sig") for line in f):
            self.stops[row["stop_id"]] = Stop(
                id=row["stop_id"],
                name=row["stop_name"],
                lat=float(row["stop_lat"]),
                lon=float(row["stop_lon"]),
                parent_id=row.get("parent_station") or None,
            )

    def _load_routes(self, f) -> None:
        for row in csv.DictReader(line.decode("utf-8-sig") for line in f):
            self.routes[row["route_id"]] = Route(
                id=row["route_id"],
                short_name=row.get("route_short_name", ""),
                long_name=row.get("route_long_name", ""),
                color="#" + row.get("route_color", "888888"),
                kind=int(row.get("route_type", 2)),
            )

    def _load_trips(self, f) -> None:
        for row in csv.DictReader(line.decode("utf-8-sig") for line in f):
            self.trips[row["trip_id"]] = Trip(
                id=row["trip_id"],
                route_id=row["route_id"],
                service_id=row["service_id"],
                headsign=row.get("trip_headsign", ""),
            )

    def _load_stop_times(self, f) -> None:
        for row in csv.DictReader(line.decode("utf-8-sig") for line in f):
            tid = row["trip_id"]
            self.stop_times.setdefault(tid, []).append(StopTime(
                trip_id=tid,
                stop_id=row["stop_id"],
                arrival=self._parse_time(row["arrival_time"]),
                departure=self._parse_time(row["departure_time"]),
                stop_sequence=int(row["stop_sequence"]),
            ))

    def _load_transfers(self, f) -> None:
        for row in csv.DictReader(line.decode("utf-8-sig") for line in f):
            if row.get("transfer_type", "0") not in ("0", "2", "3"):
                continue
            a = row["from_stop_id"]
            b = row["to_stop_id"]
            minutes = int(row.get("min_transfer_time", 180)) // 60
            self.transfers.setdefault(a, {})[b] = minutes
            self.transfers.setdefault(b, {})[a] = minutes

    def _load_calendar(self, f) -> None:
        for row in csv.DictReader(line.decode("utf-8-sig") for line in f):
            days = {i for i, key in enumerate(
                ["monday", "tuesday", "wednesday", "thursday",
                 "friday", "saturday", "sunday"]
            ) if row.get(key) == "1"}
            self.calendar[row["service_id"]] = days

    @staticmethod
    def _parse_time(t: str) -> int:
        h, m, s = map(int, t.split(":"))
        return h * 3600 + m * 60 + s

    def _build_indexes(self) -> None:
        for tid, times in self.stop_times.items():
            times.sort(key=lambda st: st.stop_sequence)

        for trip in self.trips.values():
            self.route_trips.setdefault(trip.route_id, []).append(trip.id)

        for tid, times in self.stop_times.items():
            route_id = self.trips[tid].route_id
            for st in times:
                self.stop_routes.setdefault(st.stop_id, set()).add(route_id)

    def trips_active_on(self, d: date) -> Iterator[Trip]:
        weekday = d.weekday()
        for trip in self.trips.values():
            days = self.calendar.get(trip.service_id)
            if days is None or weekday in days:
                yield trip

    def route_pattern(self, route_id: str) -> list[str]:
        tid = self.route_trips[route_id][0]
        return [st.stop_id for st in self.stop_times[tid]]