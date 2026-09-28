"""Массовый поиск кодов Яндекс.Расписаний для станций.

Запуск:
    cd backend
    python -m scripts.batch_lookup

Результат: scripts/out/lookup_codes.txt (UTF-8, читаемый)
"""
from __future__ import annotations

import json
from pathlib import Path

CACHE = Path(__file__).resolve().parent / "out" / "stations_list.json"
OUT = Path(__file__).resolve().parent / "out" / "lookup_codes.txt"


STATIONS = [
    # Курское
    "Серп и Молот", "Калитники", "Новохохловская", "Текстильщики", "Печатники",
    "Люблино", "Депо", "Перерва", "Курьяново", "Москворечье", "Царицыно",
    "Покровское", "Красный Строитель", "Битца", "Бутово", "Щербинка", "Остафьево",
    "Силикатная", "Подольск", "Кутузовская", "Весенняя", "Гривно", "Львовская",
    "Молоди", "Столбовая", "Ивачково", "Чепелёво", "Чехов", "Луч", "Шарапова Охота",
    "Авангард", "Серпухов", "Ока", "Приокская", "Тарусская",
    "Пахомово", "Шульгино", "Ясногорск", "Шеметово", "Бараново", "Ревякино",
    "Байдики", "Хомяково", "Тула",
    # Рижское
    "Рижский вокзал", "Рижская", "Марьина Роща", "Дмитровская", "Гражданская",
    "Красный Балтиец", "Стрешнево", "Щукинская", "Тушинская", "Трикотажная",
    "Волоколамская", "Пенягино", "Павшино", "Красногорская", "Опалиха", "Аникеевка",
    "Нахабино", "Малиновка", "Дедовск", "Миитовская", "Снегири", "Манихино",
    "Троицкая", "Истра", "Новоиерусалимская", "Чеховская", "Холщёвики",
    "Ядрошино", "Курсаковская", "Румянцево", "Новопетровская", "Устиновка",
    "Лесодолгоруково", "Чисмена", "Матрёнино", "Дубосеково", "Волоколамск",
    "Благовещенское", "Москвич", "Бухолово", "Шаховская",
]


def flatten(data: dict) -> list[dict]:
    out: list[dict] = []
    for country in data.get("countries", []):
        for region in country.get("regions", []):
            rt = region.get("title", "")
            for settlement in region.get("settlements", []):
                st = settlement.get("title", "")
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
                        "type": ttype,
                        "region": rt,
                        "settlement": st,
                    })
    return out


def main() -> None:
    if not CACHE.exists():
        raise SystemExit(f"Кэш не найден: {CACHE}")

    data = json.loads(CACHE.read_text(encoding="utf-8-sig"))
    all_st = flatten(data)
    print(f"Всего ж/д станций: {len(all_st)}")

    lines: list[str] = []
    for query in STATIONS:
        q = query.lower().strip()
        matches = [
            s for s in all_st
            if q in s["title"].lower()
        ]
        lines.append(f"\n{'═' * 70}")
        lines.append(f"  {query}")
        lines.append(f"{'═' * 70}")
        if not matches:
            lines.append("  ❌ не найдено")
            continue
        # Сортируем: сначала Москва/МО, потом остальные; train раньше bus
        matches.sort(key=lambda s: (
            0 if "москв" in s["region"].lower() else 1,
            0 if s["type"] == "train" else 1,
            s["title"],
        ))
        for m in matches[:15]:
            marker = "★" if "москв" in m["region"].lower() and m["type"] == "train" else " "
            lines.append(
                f"  {marker} {m['code']:12}  {m['title']:35}  "
                f"[{m['region']} / {m['settlement']}]  ({m['type']})"
            )

    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"✓ Отчёт сохранён: {OUT}")
    print("Открой его в VS Code: он точно читаемый.")


if __name__ == "__main__":
    main()