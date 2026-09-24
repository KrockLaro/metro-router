"""Диагностика структуры ответа stations_list v3.0."""
import json
from pathlib import Path
from collections import Counter

CACHE = Path(__file__).resolve().parent / "out" / "stations_list.json"

data = json.loads(CACHE.read_text(encoding="utf-8"))

print("=== Верхний уровень ===")
print("Ключи:", list(data.keys()))
for k, v in data.items():
    if isinstance(v, list):
        print(f"  {k}: list, длина = {len(v)}")
    elif isinstance(v, dict):
        print(f"  {k}: dict, ключи = {list(v.keys())[:5]}")
    else:
        print(f"  {k}: {type(v).__name__} = {v!r}")

print()
print("=== Структура первого country ===")
countries = data.get("countries", [])
if countries:
    c = countries[0]
    print("Ключи country:", list(c.keys()))
    regions = c.get("regions", [])
    print(f"  regions: {len(regions)}")
    if regions:
        r = regions[0]
        print("  Ключи region:", list(r.keys()))
        settlements = r.get("settlements", [])
        print(f"  settlements: {len(settlements)}")
        if settlements:
            s = settlements[0]
            print("  Ключи settlement:", list(s.keys()))
            stations = s.get("stations", [])
            print(f"  stations: {len(stations)}")
            if stations:
                st = stations[0]
                print("  Ключи station:", list(st.keys()))
                print("  Пример station:")
                print(json.dumps(st, ensure_ascii=False, indent=4)[:800])

print()
print("=== Все уникальные transport_type ===")
types = Counter()
for c in countries:
    for r in c.get("regions", []):
        for s in r.get("settlements", []):
            for st in s.get("stations", []):
                types[st.get("transport_type")] += 1
for t, n in types.most_common():
    print(f"  {t!r}: {n}")
