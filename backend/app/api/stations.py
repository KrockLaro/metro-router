"""
api/stations.py — эндпоинты станций.
"""

from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel

from app.core.network import build_moscow_network


router = APIRouter(prefix="/api/stations", tags=["stations"])
net = build_moscow_network()


class StationOut(BaseModel):
    id: str
    name: str
    lat: float
    lon: float


@router.get("", response_model=list[StationOut])
def list_stations(q: str = Query("")):
    result = []
    for s in net.stations.values():
        if q.lower() in s.name.lower():
            result.append(StationOut(id=s.id, name=s.name, lat=s.lat, lon=s.lon))
    result.sort(key=lambda s: s.name)
    return result


@router.get("/{station_id}", response_model=StationOut)
def get_station(station_id: str):
    if station_id not in net.stations:
        raise HTTPException(404, "Станция не найдена")
    s = net.stations[station_id]
    return StationOut(id=s.id, name=s.name, lat=s.lat, lon=s.lon)


@router.get("/network/geojson")
def network_geojson():
    features = []
    for s in net.stations.values():
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [s.lon, s.lat]},
            "properties": {"kind": "station", "id": s.id, "name": s.name},
        })

    seen = set()
    for a, neighbours in net.edges.items():
        for b, edges in neighbours.items():
            key = tuple(sorted([a, b]))
            if key in seen:
                continue
            seen.add(key)
            for e in edges:
                sa, sb = net.get(a), net.get(b)
                features.append({
                    "type": "Feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [[sa.lon, sa.lat], [sb.lon, sb.lat]],
                    },
                    "properties": {
                        "kind": "track",
                        "line": e.line.name,
                        "color": e.line.color,
                        "edge_kind": e.kind,
                    },
                })

    for a, links in net.transfers.items():
        for b in links:
            key = ("T",) + tuple(sorted([a, b]))
            if key in seen:
                continue
            seen.add(key)
            sa, sb = net.get(a), net.get(b)
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [[sa.lon, sa.lat], [sb.lon, sb.lat]],
                },
                "properties": {"kind": "transfer"},
            })

    return {"type": "FeatureCollection", "features": features}