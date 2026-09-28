"""Сопоставление наших station_id с кодами Яндекс.Расписаний (v3.0).

Запуск:
    cd backend
    python -m scripts.find_yandex_codes

Результаты:
    scripts/out/stations_list.json       — кэш ответа Яндекса
    scripts/out/yandex_codes_report.txt  — отчёт
    app/schedule/yandex_codes.py         — итоговый модуль (автогенерация)

Правки маппинга вносятся в scripts/out/yandex_codes_overrides.py:
    OVERRIDES            — явные коды для проблемных станций
    NO_SCHEDULE          — станции без пассажирского расписания
    ALLOWED_DUPLICATES   — легитимные дубли (две наши = одна у Яндекса)
"""
from __future__ import annotations

import json
import os
import re
import sys
from difflib import SequenceMatcher
from pathlib import Path

import httpx
from dotenv import load_dotenv
load_dotenv()

API_KEY = os.getenv("YANDEX_RASP_API_KEY", "")
BASE = "https://api.rasp.yandex.net/v3.0/stations_list/"

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = Path(__file__).resolve().parent / "out"
OUT_DIR.mkdir(exist_ok=True)
CACHE = OUT_DIR / "stations_list.json"
REPORT_TXT = OUT_DIR / "yandex_codes_report.txt"
OVERRIDES_PY = OUT_DIR / "yandex_codes_overrides.py"
TARGET_MODULE = ROOT / "app" / "schedule" / "yandex_codes.py"

THRESHOLD = 0.80


def load_data() -> dict:
    if CACHE.exists():
        print(f"-> Читаю кэш {CACHE}")
        return json.loads(CACHE.read_text(encoding="utf-8-sig"))

    if not API_KEY:
        sys.exit("X YANDEX_RASP_API_KEY не задан в .env")

    print(f"-> Скачиваю {BASE} (большой ответ, ~20–60 сек)...")
    with httpx.Client(timeout=180) as c:
        r = c.get(BASE, params={
            "apikey": API_KEY, "format": "json", "lang": "ru_RU",
        })
        print(f"-> HTTP {r.status_code}, size={len(r.content)} bytes")
        r.raise_for_status()
        data = r.json()

    CACHE.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    print(f"V Кэш сохранён: {CACHE}")
    return data


def flatten(data: dict) -> list[dict]:
    out: list[dict] = []
    for country in data.get("countries", []):
        for region in country.get("regions", []):
            rt = region.get("title", "")
            for settlement in region.get("settlements", []):
                st_title = settlement.get("title", "")
                for station in settlement.get("stations", []):
                    ttype = station.get("transport_type")
                    if ttype not in ("train", "suburban"):
                        continue
                    code = (station.get("codes") or {}).get("yandex_code")
                    if not code:
                        continue
                    out.append({
                        "code": code,
                        "title": (station.get("title") or "").strip(),
                        "transport_type": ttype,
                        "region_title": rt,
                        "settlement_title": st_title,
                    })
    return out


_KM_RE = re.compile(r"\b\d+\s*км\b", re.IGNORECASE)
_PAREN_RE = re.compile(r"\([^)]*\)")
_TOV_RE = re.compile(r"\bтов\.?$", re.IGNORECASE)
_PASS_RE = re.compile(r"\bпасс\.?$", re.IGNORECASE)
_DASH1_RE = re.compile(r"-1$")

_VOKZAL_RE = re.compile(r"москва\s*\((\w+?)ий\s+вокзал\)", re.IGNORECASE)


def normalize(name: str) -> str:
    s = name.lower().strip()

    m = _VOKZAL_RE.search(s)
    if m:
        base = m.group(1).lower()
        return f"москва {base}ая"

    s = _PAREN_RE.sub("", s)
    s = _KM_RE.sub("км", s)
    s = _TOV_RE.sub("", s)
    s = _PASS_RE.sub("", s)
    s = _DASH1_RE.sub("", s)
    s = s.replace("ё", "е")
    s = re.sub(r"[–—\-]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def sim(a: str, b: str) -> float:
    return SequenceMatcher(None, a, b).ratio()


def main() -> None:
    data = load_data()
    all_st = flatten(data)
    print(f"-> Всего ж/д станций (без метро/автобусов): {len(all_st)}")

    if len(all_st) < 100:
        print("! Мало станций — превью ответа:")
        print(json.dumps(data, ensure_ascii=False)[:500])
        sys.exit(1)

    moscow = [s for s in all_st if "москв" in s["region_title"].lower()]
    print(f"-> В московском регионе: {len(moscow)}")

    from app.core.network import _STATIONS
    our_stations = {sid: name for sid, name in _STATIONS}
    print(f"-> Наших станций: {len(our_stations)}")

    overrides: dict[str, str] = {}
    no_schedule: set[str] = set()
    allowed_duplicates: list[tuple[str, str]] = []
    if OVERRIDES_PY.exists():
        ns: dict = {}
        exec(OVERRIDES_PY.read_text(encoding="utf-8-sig"), ns)
        overrides = ns.get("OVERRIDES", {}) or {}
        no_schedule = ns.get("NO_SCHEDULE", set()) or set()
        allowed_duplicates = list(ns.get("ALLOWED_DUPLICATES", []) or [])
        print(
            f"-> Ручных overrides: {len(overrides)}, "
            f"без расписания: {len(no_schedule)}, "
            f"разрешённых дублей: {len(allowed_duplicates)}"
        )

    mapping: dict[str, str] = {}
    report: list[str] = []
    low_conf: list[str] = []

    for sid, our_name in our_stations.items():
        if sid in no_schedule:
            report.append(f"[SKIP] {sid:20} -> нет пасп. расписания ({our_name})")
            continue

        if sid in overrides:
            code = overrides[sid]
            if not code:
                low_conf.append(f"[---] {sid:20} -> override пустой ({our_name})")
                continue
            mapping[sid] = code
            report.append(f"[OVR] {sid:20} -> {code:12} ({our_name})")
            continue

        target = normalize(our_name)
        best, best_score = None, 0.0
        for c in moscow:
            sc = sim(target, normalize(c["title"]))
            if sc > best_score:
                best_score, best = sc, c

        if best and best_score >= THRESHOLD:
            mapping[sid] = best["code"]
            report.append(
                f"[OK ] {sid:20} -> {best['code']:12} "
                f"({our_name} ~= {best['title']} "
                f"[{best['settlement_title']}], {best_score:.2f})"
            )
        elif best:
            low_conf.append(
                f"[?? ] {sid:20} -> {best['code']:12} "
                f"({our_name} ~= {best['title']}, {best_score:.2f})"
            )
        else:
            low_conf.append(f"[XXX] {sid:20} -> не найдено ({our_name})")

    reverse: dict[str, list[str]] = {}
    for sid, code in mapping.items():
        reverse.setdefault(code, []).append(sid)

    allowed_pairs = {tuple(sorted(pair)) for pair in allowed_duplicates}
    duplicates: dict[str, list[str]] = {}
    for code, sids in reverse.items():
        if len(sids) < 2:
            continue
        pair = tuple(sorted(sids))
        if pair not in allowed_pairs:
            duplicates[code] = sids

    if duplicates:
        print("\n!!! КРИТИЧНО — дубли (два наших id → один код):")
        for code, sids in duplicates.items():
            print(f"    {code} <- {sids}")
        print("    Исправьте через OVERRIDES или добавьте в ALLOWED_DUPLICATES")
    else:
        print("-> Дублей нет (или все разрешены)")

    report_text = "\n".join([
        "=== Уверенные совпадения ===", *report,
        "",
        "=== Требуют ручной проверки ===", *low_conf,
    ])
    REPORT_TXT.write_text(report_text, encoding="utf-8")
    print(f"V Отчёт: {REPORT_TXT}")

    lines = [
        '"""АВТОГЕНЕРАЦИЯ. Правки вносить в scripts/out/yandex_codes_overrides.py."""',
        '',
        'YANDEX_STATION_CODES: dict[str, str] = {',
    ]
    for sid in sorted(mapping):
        lines.append(f'    "{sid}": "{mapping[sid]}",')
    lines.append('}')
    lines.append('')

    TARGET_MODULE.parent.mkdir(parents=True, exist_ok=True)
    TARGET_MODULE.write_text("\n".join(lines), encoding="utf-8")
    print(f"V Модуль: {TARGET_MODULE}")
    print(f"   Всего сопоставлено: {len(mapping)} / {len(our_stations)}")

    if low_conf:
        print(f"\n! Ещё {len(low_conf)} станций требуют проверки — см. отчёт")


if __name__ == "__main__":
    main()