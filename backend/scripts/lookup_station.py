"""Поиск станций в локальном кэше stations_list.json.

Примеры:
    python -m scripts.lookup_station "76 км"
    python -m scripts.lookup_station "Струнино"
    python -m scripts.lookup_station "Правда"
    python -m scripts.lookup_station "Лесная"
    python -m scripts.lookup_station "Нагорное"
"""
import json
import sys
from pathlib import Path

CACHE = Path(__file__).resolve().parent / "out" / "stations_list.json"


def main():
    if len(sys.argv) < 2:
        sys.exit("Использование: python -m scripts.lookup_station <часть_названия>")

    query = sys.argv[1].lower().strip()
    data = json.loads(CACHE.read_text(encoding="utf-8"))

    results = []
    for country in data.get("countries", []):
        for region in country.get("regions", []):
            rt = region.get("title", "")
            for settlement in region.get("settlements", []):
                st = settlement.get("title", "")
                for station in settlement.get("stations", []):
                    title = (station.get("title") or "").lower()
                    if query not in title:
                        continue
                    code = (station.get("codes") or {}).get("yandex_code", "?")
                    results.append({
                        "code": code,
                        "title": station.get("title"),
                        "type": station.get("transport_type"),
                        "region": rt,
                        "settlement": st,
                    })

    if not results:
        print(f"Ничего не найдено по запросу «{sys.argv[1]}»")
        return

    print(f"Найдено {len(results)}:\n")
    for r in results[:40]:
        print(f"  {r['code']:12}  {r['title']:35}  [{r['region']} / {r['settlement']}]  ({r['type']})")


if __name__ == "__main__":
    main()
