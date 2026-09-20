"""
core/network.py — граф Ярославского направления МЖД (ЦППК + МЦД + МЦК).
"""

from __future__ import annotations
from dataclasses import dataclass
from typing import Optional
import heapq


# ============================================================
# МОДЕЛИ
# ============================================================

@dataclass(frozen=True)
class Station:
    id: str
    name: str
    lat: float = 0.0
    lon: float = 0.0

    def __hash__(self):
        return hash(self.id)


@dataclass(frozen=True)
class Line:
    id: str
    name: str
    color: str
    kind: str            # 'cppk' | 'mcd' | 'mcc' | 'metro'
    headway: int = 10

    @property
    def wait_half(self) -> float:
        return self.headway / 2


@dataclass
class Edge:
    line: Line
    travel_time: int
    kind: str = 'local'
    distance_km: float = 0.0


@dataclass
class Segment:
    line: Optional[Line]
    from_station: Station
    to_station: Station
    minutes: float
    kind: str
    distance_km: float = 0.0


@dataclass
class Route:
    segments: list[Segment]
    total_minutes: float
    transfers: int
    total_km: float
    total_price: int

    def to_dict(self) -> dict:
        return {
            "total_minutes": round(self.total_minutes, 1),
            "transfers": self.transfers,
            "total_km": round(self.total_km, 1),
            "total_price": self.total_price,
            "segments": [
                {
                    "kind": s.kind,
                    "line": s.line.name if s.line else None,
                    "line_color": s.line.color if s.line else None,
                    "line_kind": s.line.kind if s.line else None,
                    "from": {"id": s.from_station.id, "name": s.from_station.name},
                    "to": {"id": s.to_station.id, "name": s.to_station.name},
                    "minutes": round(s.minutes, 1),
                    "distance_km": round(s.distance_km, 1),
                }
                for s in self.segments
            ],
        }


# ============================================================
# ЦЕНООБРАЗОВАНИЕ ЦППК
# ============================================================

def calc_price(distance_km: float) -> int:
    """
    Расчёт стоимости проезда по Ярославскому направлению (2026).
    - В пределах Москвы: 71 ₽
    - Далее по зонам: ~4.5 ₽ за км + базовая ставка.

    Точные тарифы: https://central-ppk.ru
    """
    if distance_km <= 13.5:
        return 71
    # Пригород: базовая 71 + примерно 4.5 руб за км сверх московской зоны
    extra = distance_km - 13.5
    return 71 + int(extra * 4.5)


# ============================================================
# СЕТЬ
# ============================================================

class RailNetwork:
    def __init__(self):
        self.stations: dict[str, Station] = {}
        self.edges: dict[str, dict[str, list[Edge]]] = {}
        self.transfers: dict[str, dict[str, int]] = {}

    def add_station(self, station: Station) -> None:
        self.stations[station.id] = station
        self.edges.setdefault(station.id, {})

    def get(self, station_id: str) -> Station:
        return self.stations[station_id]

    def add_segment(
        self,
        line: Line,
        ids: list[str],
        times: list[int],
        distances: list[float] | None = None,
        kind: str = 'local',
    ) -> None:
        assert len(ids) == len(times) + 1, \
            f"len(ids)={len(ids)} != len(times)+1={len(times)+1} для {line.id}"
        if distances is None:
            distances = [0.0] * len(times)
        assert len(distances) == len(times), "distances должен совпадать с times"

        for i, t in enumerate(times):
            a, b = ids[i], ids[i + 1]
            d = distances[i]
            self._add(a, b, Edge(line, t, kind, d))
            self._add(b, a, Edge(line, t, kind, d))

    def _add(self, a: str, b: str, e: Edge) -> None:
        self.edges[a].setdefault(b, []).append(e)

    def add_transfer(self, a: str, b: str, minutes: int) -> None:
        if a == b:
            return
        self.transfers.setdefault(a, {})[b] = minutes
        self.transfers.setdefault(b, {})[a] = minutes


# ============================================================
# ДАННЫЕ: ЯРОСЛАВСКОЕ НАПРАВЛЕНИЕ
# ============================================================

def build_moscow_network() -> RailNetwork:
    net = RailNetwork()

    # ---------- СТАНЦИИ ----------
    # id : (name, lat, lon)
    stations_data = [
        # === ГЛАВНЫЙ ХОД: Москва — Александров-1 ===
        ("m_yar",           "Москва Ярославская",           55.776, 37.657),
        ("moskva3",         "Москва III",                   55.786, 37.668),
        ("malenkovskaya",   "Маленковская",                 55.792, 37.670),
        ("yauza",           "Яуза",                         55.808, 37.671),
        ("rostokino",       "Ростокино",                    55.845, 37.674),
        ("losinoostrovskaya","Лосиноостровская",            55.861, 37.703),
        ("los",             "Лось",                         55.870, 37.717),
        ("perlovskaya",     "Перловская",                   55.882, 37.735),
        ("tayninskaya",     "Тайнинская",                   55.888, 37.736),
        ("mytishchi",       "Мытищи",                       55.911, 37.736),
        ("stroitel",        "Строитель",                    55.918, 37.755),
        ("chelyuskinskaya", "Челюскинская",                 55.922, 37.777),
        ("tarasovskaya",    "Тарасовская",                  55.926, 37.801),
        ("klyazma",         "Клязьма",                      55.929, 37.821),
        ("mamontovskaya",   "Мамонтовская",                 55.931, 37.843),
        ("pushkino",        "Пушкино",                      55.934, 37.869),
        ("zavety_ilicha",   "Заветы Ильича",                55.937, 37.890),
        ("pravda",          "Правда",                       55.939, 37.910),
        ("zelenogradskaya", "Зеленоградская",               55.941, 37.928),
        ("nagornoye",       "Нагорное (43 км)",             55.943, 37.955),
        ("sofrino",         "Софрино",                      55.948, 37.983),
        ("ashukinskaya",    "Ашукинская",                   55.956, 38.014),
        ("kalistovo",       "Калистово",                    55.963, 38.042),
        ("radonezh",        "Радонеж",                      55.968, 38.063),
        ("abramtsevo",      "Абрамцево",                    55.973, 38.086),
        ("hotkovo",         "Хотьково",                     55.980, 38.112),
        ("semhoz",          "Семхоз",                       55.987, 38.135),
        ("sergiev_posad",   "Сергиев Посад",                55.997, 38.158),
        ("toporkovo",       "Топорково (76 км)",            56.005, 38.185),
        ("dubininskoye",    "Дубининское (81 км)",          56.012, 38.208),
        ("83km",            "83 км",                        56.017, 38.224),
        ("buzhaninovo",     "Бужаниново",                   56.025, 38.250),
        ("shubino",         "Шубино (90 км)",               56.033, 38.273),
        ("arsaki",          "Арсаки",                       56.042, 38.298),
        ("strunino",        "Струнино",                     56.052, 38.325),
        ("aleksandrov",     "Александров-1",                56.062, 38.355),

        # === ОТВЕТВЛЕНИЕ: Софрино — Красноармейск ===
        ("sofrino2",        "Софрино II",                   55.948, 37.985),
        ("rahmanovo",       "Рахманово",                    55.958, 38.010),
        ("fedorovskaya",    "Федоровская",                  55.968, 38.035),
        ("putilovo",        "Путилово",                     55.978, 38.058),
        ("krasnoarmeysk",   "Красноармейск",                55.988, 38.082),

        # === ОТВЕТВЛЕНИЕ: Александров-1 — Балакирево ===
        ("moshnino",        "Мошнино",                      56.075, 38.380),
        ("balakirevo",      "Балакирево",                   56.088, 38.405),

        # === ОТВЕТВЛЕНИЕ: Мытищи — Фрязино-Пассажирская ===
        ("podlipki",        "Подлипки-Дачные",              55.923, 37.812),
        ("bolshevo",        "Болшево",                      55.939, 37.855),
        ("valentinovka",    "Валентиновка",                 55.945, 37.870),
        ("zagoryanskaya",   "Загорянская",                  55.950, 37.885),
        ("sokolovskaya",    "Соколовская",                  55.955, 37.900),
        ("voronok",         "Воронок",                      55.960, 37.918),
        ("schelkovo",       "Щёлково",                      55.965, 37.935),
        ("gagarinskaya",    "Гагаринская",                  55.970, 37.952),
        ("chkalovskaya",    "Чкаловская",                   55.975, 37.970),
        ("bakhchivandzhi",  "Бахчиванджи",                  55.980, 37.988),
        ("tsiolkovskaya",   "Циолковская",                  55.985, 38.005),
        ("oseevskaya",      "Осеевская",                    55.990, 38.022),
        ("monino",          "Монино",                       55.995, 38.040),
        ("kashino",         "Кашино",                       56.000, 38.058),
        ("kolontaevo",      "Колонтаево",                   56.005, 38.075),
        ("lesnaya",         "Лесная (64 км)",               56.010, 38.092),
        ("fryazevo",        "Фрязево",                      56.015, 38.110),
        ("fabrika_1_maya",  "Фабрика 1 Мая",                56.018, 38.125),
        ("zeleny_bor",      "Зелёный Бор",                  56.022, 38.140),
        ("ivanteevka_2",    "Ивантеевка II",                56.025, 38.155),
        ("ivanteevka",      "Ивантеевка",                   56.028, 38.170),
        ("detskaya",        "Детская",                      56.032, 38.182),
        ("fryazino",        "Фрязино",                      56.035, 38.195),
        ("fryazino_pass",   "Фрязино-Пассажирская",         56.038, 38.208),

        # === ПЕРЕСАДКИ (МЦК, метро) ===
        ("m_komsomolskaya", "Комсомольская",                55.775, 37.655),
        ("m_bot_sad",       "Ботанический сад",             55.845, 37.638),
        ("m_vladykino",     "Владыкино",                    55.847, 37.589),
        ("m_bulvar_roks",   "Бульвар Рокоссовского",        55.817, 37.735),
        ("m_cherkizovskaya","Черкизовская",                 55.803, 37.745),
        ("m_preobrazhenskaya","Преображенская площадь",     55.796, 37.715),
        ("m_sokolniki",     "Сокольники",                   55.789, 37.679),
        ("m_krasnoselskaya","Красносельская",               55.780, 37.667),
    ]

    for sid, name, lat, lon in stations_data:
        net.add_station(Station(sid, name, lat, lon))

    # ---------- ЛИНИИ ----------
    yar = Line("yar", "Ярославское направление", "#E5231B", "cppk", headway=8)
    mcc = Line("mcc", "МЦК", "#D51E80", "mcc", headway=6)

    # ---------- ГЛАВНЫЙ ХОД: Москва — Александров-1 ----------
    net.add_segment(
        yar,
        [
            "m_yar", "moskva3", "malenkovskaya", "yauza", "rostokino",
            "losinoostrovskaya", "los", "perlovskaya", "tayninskaya",
            "mytishchi", "stroitel", "chelyuskinskaya", "tarasovskaya",
            "klyazma", "mamontovskaya", "pushkino", "zavety_ilicha",
            "pravda", "zelenogradskaya", "nagornoye", "sofrino",
            "ashukinskaya", "kalistovo", "radonezh", "abramtsevo",
            "hotkovo", "semhoz", "sergiev_posad", "toporkovo",
            "dubininskoye", "83km", "buzhaninovo", "shubino",
            "arsaki", "strunino", "aleksandrov",
        ],
        # Время в пути (мин) между соседними станциями
        [2, 2, 2, 3, 4, 2, 2, 3, 3,
         2, 2, 2, 3, 2, 3, 3, 2,
         3, 3, 3, 3, 3, 3, 2, 3,
         4, 4, 4, 4, 3, 3, 3, 3,
         4, 4],
        # Расстояние (км) между соседними станциями
        [2.9, 1.6, 1.7, 1.7, 2.3, 2.4, 1.7, 1.6, 1.8,
         2.3, 2.0, 1.8, 1.9, 1.9, 2.0, 2.0, 2.0,
         2.0, 2.1, 2.2, 2.1, 2.0, 2.0, 2.0, 2.0,
         2.1, 2.0, 2.0, 2.1, 2.0, 2.0, 2.0, 2.0,
         2.0, 2.0],
        kind="local",
    )

    # ---------- ЭКСПРЕСС: Москва — Александров-1 (только крупные) ----------
    net.add_segment(
        yar,
        ["m_yar", "mytishchi", "pushkino", "sergiev_posad", "aleksandrov"],
        [17, 12, 25, 35],
        [17.8, 12.0, 40.0, 41.4],
        kind="express",
    )

    # ---------- ОТВЕТВЛЕНИЕ: Софрино — Красноармейск ----------
    krasnoarmeysk_line = Line("krasnoarm", "Красноармейская ветка", "#FF9500", "cppk", headway=30)
    net.add_segment(
        krasnoarmeysk_line,
        ["sofrino", "sofrino2", "rahmanovo", "fedorovskaya", "putilovo", "krasnoarmeysk"],
        [3, 3, 3, 3, 3],
        [2.0, 3.0, 3.0, 3.0, 3.0],
        kind="local",
    )

    # ---------- ОТВЕТВЛЕНИЕ: Александров-1 — Балакирево ----------
    net.add_segment(
        yar,
        ["aleksandrov", "moshnino", "balakirevo"],
        [4, 5],
        [6.0, 5.0],
        kind="local",
    )

    # ---------- ОТВЕТВЛЕНИЕ: Мытищи — Фрязино-Пассажирская ----------
    fryazino_line = Line("fryazino", "Фрязинская ветка", "#F79E1B", "cppk", headway=20)
    net.add_segment(
        fryazino_line,
        [
            "mytishchi", "podlipki", "bolshevo", "valentinovka",
            "zagoryanskaya", "sokolovskaya", "voronok", "schelkovo",
            "gagarinskaya", "chkalovskaya", "bakhchivandzhi",
            "tsiolkovskaya", "oseevskaya", "monino", "kashino",
            "kolontaevo", "lesnaya", "fryazevo", "fabrika_1_maya",
            "zeleny_bor", "ivanteevka_2", "ivanteevka", "detskaya",
            "fryazino", "fryazino_pass",
        ],
        [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        [3.0] * 24,
        kind="local",
    )

    # ---------- МЦК (для пересадок) ----------
    mcc_ring = [
        "rostokino", "m_bot_sad", "m_vladykino",
        "m_bulvar_roks", "m_cherkizovskaya", "m_preobrazhenskaya",
        "m_sokolniki", "m_krasnoselskaya", "m_komsomolskaya",
    ]
    net.add_segment(mcc, mcc_ring, [4] * (len(mcc_ring) - 1), [3.5] * (len(mcc_ring) - 1), kind="mcc")

    # ---------- ПЕРЕСАДКИ ----------
    net.add_transfer("m_yar", "m_komsomolskaya", 3)
    net.add_transfer("rostokino", "m_bot_sad", 2)
    net.add_transfer("m_bot_sad", "m_vladykino", 2)

    return net


# ============================================================
# МАРШРУТИЗАТОР (Дейкстра)
# ============================================================

def find_route(
    net: RailNetwork,
    start_id: str,
    end_id: str,
    transfer_penalty: int = 5,
) -> Optional[Route]:
    if start_id not in net.stations or end_id not in net.stations:
        return None

    start_state = (start_id, None)
    dist: dict[tuple[str, Optional[str]], float] = {start_state: 0.0}
    prev: dict[tuple[str, Optional[str]], tuple] = {}
    pq: list[tuple[float, str, Optional[str]]] = [(0.0, start_id, None)]

    while pq:
        cur_time, sid, line_id = heapq.heappop(pq)
        state = (sid, line_id)
        if cur_time > dist.get(state, float("inf")):
            continue

        for nid, edge_list in net.edges[sid].items():
            for edge in edge_list:
                penalty = 0.0
                if line_id is None:
                    penalty += edge.line.wait_half
                elif line_id != edge.line.id:
                    penalty += transfer_penalty + edge.line.wait_half

                new_time = cur_time + edge.travel_time + penalty
                new_state = (nid, edge.line.id)
                if new_time < dist.get(new_state, float("inf")):
                    dist[new_state] = new_time
                    prev[new_state] = (
                        state,
                        Segment(
                            edge.line, net.get(sid), net.get(nid),
                            edge.travel_time + penalty, edge.kind,
                            edge.distance_km,
                        ),
                    )
                    heapq.heappush(pq, (new_time, nid, edge.line.id))

        for nid, minutes in net.transfers.get(sid, {}).items():
            new_time = cur_time + minutes
            new_state = (nid, None)
            if new_time < dist.get(new_state, float("inf")):
                dist[new_state] = new_time
                prev[new_state] = (
                    state,
                    Segment(None, net.get(sid), net.get(nid), minutes, "transfer", 0.0),
                )
                heapq.heappush(pq, (new_time, nid, None))

    end_states = [s for s in dist if s[0] == end_id]
    if not end_states:
        return None

    best = min(end_states, key=lambda s: dist[s])
    segments: list[Segment] = []
    cur = best
    while cur in prev:
        prev_state, seg = prev[cur]
        segments.append(seg)
        cur = prev_state
    segments.reverse()

    transfers = sum(1 for s in segments if s.kind == "transfer")
    total_km = sum(s.distance_km for s in segments if s.kind != "transfer")
    total_price = calc_price(total_km) if total_km > 0 else 0

    return Route(
        segments=segments,
        total_minutes=dist[best],
        transfers=transfers,
        total_km=total_km,
        total_price=total_price,
    )