"""
gtfs/raptor.py — RAPTOR по расписанию GTFS.
"""

from __future__ import annotations
from dataclasses import dataclass
from datetime import date, datetime
from typing import Optional

from app.gtfs.loader import GTFSFeed, StopTime


INF = 10**12
SECONDS_PER_DAY = 24 * 3600


class RaptorIndex:
    def __init__(self, feed: GTFSFeed, service_date: date):
        self.feed = feed
        self.service_date = service_date
        self.active_trips = {t.id for t in feed.trips_active_on(service_date)}

        self.route_active_trips: dict[str, list[str]] = {}
        for tid in self.active_trips:
            trip = feed.trips[tid]
            self.route_active_trips.setdefault(trip.route_id, []).append(tid)

        self.trip_stops: dict[str, list[StopTime]] = {
            tid: feed.stop_times[tid] for tid in self.active_trips
        }

        self.stop_routes: dict[str, set[str]] = {}
        for tid, times in self.trip_stops.items():
            route_id = feed.trips[tid].route_id
            for st in times:
                self.stop_routes.setdefault(st.stop_id, set()).add(route_id)

        self.route_stop_pos: dict[tuple[str, str], int] = {}
        for route_id, tids in self.route_active_trips.items():
            pattern = [st.stop_id for st in self.trip_stops[tids[0]]]
            for pos, stop_id in enumerate(pattern):
                self.route_stop_pos[(route_id, stop_id)] = pos


@dataclass
class RaptorLabel:
    arrival: int
    transfers: int
    prev_stop: Optional[str]
    trip_id: Optional[str]


def raptor(
    index: RaptorIndex,
    origin_id: str,
    target_id: str,
    departure: datetime,
    max_transfers: int = 4,
) -> Optional[dict]:
    feed = index.feed
    if origin_id not in feed.stops or target_id not in feed.stops:
        return None

    dep_sec = departure.hour * 3600 + departure.minute * 60 + departure.second

    best: dict[str, RaptorLabel] = {
        s: RaptorLabel(INF, INF, None, None) for s in feed.stops
    }
    best[origin_id] = RaptorLabel(dep_sec, 0, None, None)

    marked: set[str] = {origin_id}

    for round_num in range(1, max_transfers + 2):
        if not marked:
            break

        routes_to_scan: set[str] = set()
        for stop_id in marked:
            routes_to_scan |= index.stop_routes.get(stop_id, set())

        new_marked: set[str] = set()

        for route_id in routes_to_scan:
            board_stop = None
            board_time = INF
            for stop_id in marked:
                if (route_id, stop_id) not in index.route_stop_pos:
                    continue
                if best[stop_id].arrival < board_time:
                    board_stop = stop_id
                    board_time = best[stop_id].arrival
            if board_stop is None:
                continue

            board_pos = index.route_stop_pos[(route_id, board_stop)]

            best_trip = None
            best_trip_dep = INF
            for tid in index.route_active_trips[route_id]:
                st = index.trip_stops[tid][board_pos]
                if st.departure >= board_time and st.departure < best_trip_dep:
                    best_trip = tid
                    best_trip_dep = st.departure

            if best_trip is None:
                continue

            trip_stops = index.trip_stops[best_trip]
            for pos in range(board_pos + 1, len(trip_stops)):
                st = trip_stops[pos]
                stop_id = st.stop_id
                if st.arrival < best[stop_id].arrival:
                    best[stop_id] = RaptorLabel(
                        arrival=st.arrival,
                        transfers=round_num - 1,
                        prev_stop=trip_stops[pos - 1].stop_id,
                        trip_id=best_trip,
                    )
                    new_marked.add(stop_id)

        for stop_id in list(new_marked):
            for to_stop, minutes in feed.transfers.get(stop_id, {}).items():
                transfer_arrival = best[stop_id].arrival + minutes * 60
                if transfer_arrival < best[to_stop].arrival:
                    best[to_stop] = RaptorLabel(
                        arrival=transfer_arrival,
                        transfers=best[stop_id].transfers,
                        prev_stop=stop_id,
                        trip_id=None,
                    )
                    new_marked.add(to_stop)

        marked = new_marked

        if target_id in marked and not new_marked - {target_id}:
            break

    if best[target_id].arrival >= INF:
        return None

    return _reconstruct(feed, best, origin_id, target_id)


def _reconstruct(feed, best, origin_id, target_id) -> dict:
    legs: list[dict] = []
    cur = target_id

    while cur != origin_id:
        label = best[cur]
        if label.prev_stop is None:
            break

        if label.trip_id is not None:
            trip = feed.trips[label.trip_id]
            route = feed.routes[trip.route_id]
            trip_stops = feed.stop_times[label.trip_id]

            i = next(i for i, st in enumerate(trip_stops) if st.stop_id == cur)
            board_stop = cur
            while i > 0:
                prev = trip_stops[i - 1]
                prev_label = best.get(prev.stop_id)
                if prev_label and prev_label.trip_id == label.trip_id:
                    board_stop = prev.stop_id
                    i -= 1
                else:
                    break

            dep_stop = trip_stops[i]
            arr_stop = trip_stops[next(
                j for j, st in enumerate(trip_stops) if st.stop_id == cur
            )]

            legs.append({
                "kind": "ride",
                "line": route.long_name or route.short_name,
                "line_color": route.color,
                "trip_id": label.trip_id,
                "from": {"id": board_stop, "name": feed.stops[board_stop].name},
                "to":   {"id": cur, "name": feed.stops[cur].name},
                "departure": _sec_to_str(dep_stop.departure),
                "arrival":   _sec_to_str(arr_stop.arrival),
            })
            cur = board_stop
        else:
            prev = label.prev_stop
            legs.append({
                "kind": "transfer",
                "from": {"id": prev, "name": feed.stops[prev].name},
                "to":   {"id": cur,  "name": feed.stops[cur].name},
                "minutes": (best[cur].arrival - best[prev].arrival) // 60,
            })
            cur = prev

    legs.reverse()
    return {
        "arrival": _sec_to_str(best[target_id].arrival),
        "transfers": best[target_id].transfers,
        "legs": legs,
    }


def _sec_to_str(s: int) -> str:
    h, rem = divmod(s, 3600)
    m, _ = divmod(rem, 60)
    return f"{h:02d}:{m:02d}"