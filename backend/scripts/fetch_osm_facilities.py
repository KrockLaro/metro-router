import json
import re
import time
import math
from pathlib import Path
import httpx

from app.core.network import _STATIONS

OVERPASS_URLS = [
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
]
BBOX = "53.0, 34.0, 58.0, 42.0"
OUT_DIR = Path(__file__).parent / "out"
OUT_DIR.mkdir(exist_ok=True)
STATIONS_CACHE = OUT_DIR / "osm_stations_coords.json"
OUT_FILE = OUT_DIR / "osm_facilities.json"

HEADERS = {
    "User-Agent": "MetroRouter/1.0 (https://github.com/KrockLaro/metro-router)",
    "Accept": "application/json",
}

def clean_name(name: str) -> str:
    name = name.replace("Москва ", "").replace("Москва-", "").strip()
    name = re.sub(r"\s*\([^)]*\)", "", name)
    return name

def haversine(lat1, lon1, lat2, lon2):
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlam/2)**2
    return 2 * R * math.asin(math.sqrt(a))

def overpass_query(query: str, retries: int = 3) -> dict | None:
    for attempt in range(retries):
        for url in OVERPASS_URLS:
            try:
                r = httpx.post(url, content=query, headers=HEADERS, timeout=45)
                if r.status_code == 200:
                    return r.json()
                elif r.status_code == 504:
                    print(f" [504] Жду 5с...", end="", flush=True)
                    time.sleep(5)
                else:
                    print(f" [HTTP {r.status_code}]", end="", flush=True)
                    break
            except httpx.TimeoutException:
                print(f" [Таймаут]", end="", flush=True)
            except Exception as e:
                print(f" [Ошибка: {type(e).__name__}]", end="", flush=True)
                break
    return None

def download_all_stations():
    """Скачивает координаты ВСЕХ станций региона и кэширует в файл."""
    if STATIONS_CACHE.exists():
        print("Загружаю координаты станций из кэша...")
        with open(STATIONS_CACHE, "r", encoding="utf-8") as f:
            return json.load(f)

    print("Скачиваю координаты ВСЕХ станций региона (1 запрос)...")
    query = f'''
    [out:json][timeout:180];
    node["railway"~"station|halt"]["name"]({BBOX});
    out center;
    '''
    data = overpass_query(query)
    if not data or "elements" not in data:
        print("Не удалось скачать станции!")
        return {}

    osm_stations = {}
    for el in data["elements"]:
        name = el.get("tags", {}).get("name")
        if not name: continue
        lat = el.get("lat") or (el.get("center") or {}).get("lat")
        lon = el.get("lon") or (el.get("center") or {}).get("lon")
        if lat and lon:
            osm_stations[name.lower()] = (lat, lon)

    with open(STATIONS_CACHE, "w", encoding="utf-8") as f:
        json.dump(osm_stations, f, ensure_ascii=False, indent=2)
    
    print(f"   V Сохранено {len(osm_stations)} станций в кэш.")
    time.sleep(3)
    return osm_stations

def fetch_infrastructure(lat: float, lon: float) -> dict:
    query = f'''
    [out:json][timeout:30];
    (
      nwr(around:300,{lat},{lon})["barrier"="turnstile"];
      nwr(around:300,{lat},{lon})["highway"="elevator"];
      nwr(around:300,{lat},{lon})["stairs"="yes"]["conveying"="yes"];
      nwr(around:300,{lat},{lon})["amenity"~"toilets|ticket_office|ticket_vending_machine|parking|bicycle_parking|luggage_locker|waiting_room"];
      nwr(around:300,{lat},{lon})["vending"="public_transport_tickets"];
      nwr(around:300,{lat},{lon})["internet_access"="wlan"];
      nwr(around:300,{lat},{lon})["information"="office"];
      nwr(around:300,{lat},{lon})["wheelchair"];
      nwr(around:300,{lat},{lon})["payment:troika"];
    );
    out tags center;
    '''
    return overpass_query(query) or {}

def parse_facilities(elements: list) -> dict:
    facilities = {
        "wheelchair": "none", "ticketOffice": False, "ticketMachines": False,
        "turnstiles": False, "lifts": 0, "escalators": 0, "wc": False,
        "waitingRoom": False, "wifi": False, "parking": False,
        "bikeRacks": False, "luggageStorage": False, "helpDesk": False, "troikaPayment": False,
    }
    wc_partial = False
    for el in elements:
        tags = el.get("tags", {})
        if tags.get("barrier") == "turnstile": facilities["turnstiles"] = True
        if tags.get("highway") == "elevator": facilities["lifts"] += 1
        if tags.get("stairs") == "yes" and tags.get("conveying") == "yes": facilities["escalators"] += 1
        if tags.get("amenity") == "toilets": facilities["wc"] = True
        if tags.get("vending") == "public_transport_tickets" or tags.get("amenity") == "ticket_vending_machine": facilities["ticketMachines"] = True
        if tags.get("amenity") == "ticket_office" or tags.get("shop") == "ticket": facilities["ticketOffice"] = True
        if tags.get("amenity") == "parking": facilities["parking"] = True
        if tags.get("amenity") == "bicycle_parking": facilities["bikeRacks"] = True
        if tags.get("amenity") == "luggage_locker": facilities["luggageStorage"] = True
        if tags.get("amenity") == "waiting_room": facilities["waitingRoom"] = True
        if tags.get("internet_access") == "wlan": facilities["wifi"] = True
        if tags.get("information") == "office": facilities["helpDesk"] = True
        if tags.get("payment:troika") == "yes": facilities["troikaPayment"] = True
        if tags.get("wheelchair") in ("yes", "limited"): wc_partial = True

    if wc_partial: facilities["wheelchair"] = "partial"
    return facilities

def main():
    osm_stations = download_all_stations()
    if not osm_stations: return

    results = {}
    if OUT_FILE.exists():
        with open(OUT_FILE, "r", encoding="utf-8") as f:
            results = json.load(f)
    
    # Фильтруем те, что уже сделали
    stations_to_fetch = [s for s in _STATIONS if s[0] not in results]
    total = len(stations_to_fetch)
    print(f"Осталось обработать: {total} станций\n")

    try:
        for i, (sid, our_name) in enumerate(stations_to_fetch, 1):
            clean = clean_name(our_name).lower()
            
            # Ищем координаты станции в скачанном кэше
            best_station = None
            best_score = 0
            for osm_name, coords in osm_stations.items():
                if clean == osm_name:
                    best_score = 100
                    best_station = coords
                    break
                elif clean in osm_name or osm_name in clean:
                    score = min(len(clean), len(osm_name)) / max(len(clean), len(osm_name)) * 50
                    if score > best_score:
                        best_score = score
                        best_station = coords

            if not best_station:
                print(f"[{i}/{total}] {our_name} - X не найдено в OSM")
                continue
            
            lat, lon = best_station
            print(f"[{i}/{total}] {our_name} (запрос...)", end="", flush=True)
            
            infra = fetch_infrastructure(lat, lon)
            if infra and "elements" in infra:
                facs = parse_facilities(infra["elements"])
                results[sid] = facs
                print(f" -> V объектов: {len(infra['elements'])}")
                
                with open(OUT_FILE, "w", encoding="utf-8") as f:
                    json.dump(results, f, ensure_ascii=False, indent=2)
            else:
                print(f" -> X пусто")
            
            time.sleep(2)  # пауза между станциями
    except KeyboardInterrupt:
        print("\n\nОстановлено пользователем.")

    print(f"\nГотово! Всего станций в базе: {len(results)}")
    print("\n--- ВСТАВЬ ЭТО В schemaStations.ts ---\n")
    print("const osmFacilities: Record<string, Partial<StationFacilities>> = {")
    for sid, facs in results.items():
        facs_str = ", ".join(f'{k}: {json.dumps(v)}' for k, v in facs.items())
        print(f"  {sid}: {{ {facs_str} }},")
    print("};")

if __name__ == "__main__":
    main()