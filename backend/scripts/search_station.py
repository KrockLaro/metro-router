"""Поиск станций в stations_list.json по частичному имени.

Использование:
    python -m scripts.search_station арсак
    python -m scripts.search_station александров
    python -m scripts.search_station коломенск

По умолчанию ищет по ВСЕМ регионам. Чтобы ограничить Москвой/МО:
    python -m scripts.search_station --moscow александров
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = Path(__file__).resolve().parent / "out" / "stations_list.json"


def normalize(s: str) -> str:
    s = s.lower().replace("ё", "е")
    s = re.sub(r"[^\w\s]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def fmt_coord(v) -> str:
    if v is None:
        return "—"
    try:
        return f"{float(v):.5f}"
    except (ValueError, TypeError):
        return str(v)


def main(query: str, moscow_only: bool) -> None:
    if not CACHE.exists():
        sys.exit(f"❌ Нет кэша {CACHE}. Сначала запустите find_yandex_codes.")

    data = json.loads(CACHE.read_text(encoding="utf-8"))
    q = normalize(query)
    found = []

    for country in data.get("countries", []):
        for region in country.get("regions", []):
            rt = region.get("title", "")
            if moscow_only:
                if "москв" not in rt.lower() and "московск" not in rt.lower():
                    continue
            for settlement in region.get("settlements", []):
                st_settle = settlement.get("title", "")
                for station in settlement.get("stations", []):
                    if station.get("transport_type") not in ("train", "suburban"):
                        continue
                    title = station.get("title") or ""
                    if q not in normalize(title):
                        continue
                    codes = station.get("codes", {}) or {}
                    found.append({
                        "code": codes.get("yandex_code", "—"),
                        "title": title,
                        "direction": station.get("direction") or "",
                        "lat": station.get("latitude"),
                        "lon": station.get("longitude"),
                        "region": rt,
                        "settlement": st_settle,
                    })

    if not found:
        scope = "Москве/МО" if moscow_only else "всем регионам"
        print(f"❌ Ничего не найдено по запросу «{query}» по {scope}")
        return

    print(f"Найдено кандидатов: {len(found)}\n")
    for f in found:
        print(f"  {f['code']:12}  {f['title']}")
        print(f"                направление: {f['direction']!r}")
        print(f"                регион:      {f['region']}")
        print(f"                нас. пункт:  {f['settlement']}")
        print(f"                координаты:  {fmt_coord(f['lat'])}, {fmt_coord(f['lon'])}")
        print()


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        print("Usage: python -m scripts.search_station [--moscow] <подстрока>")
        sys.exit(1)
    moscow_only = "--moscow" in args
    args = [a for a in args if a != "--moscow"]
    main(" ".join(args), moscow_only)
