"""
core/network.py — Dijkstra-граф (fallback, если OTP недоступен).
"""

from __future__ import annotations

import heapq
from dataclasses import dataclass


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
    kind: str
    headway: int = 10

    @property
    def wait_half(self) -> float:
        return self.headway / 2


@dataclass
class Edge:
    line: Line
    travel_time: int
    kind: str = 'local'


@dataclass
class Segment:
    line: Line | None
    from_station: Station
    to_station: Station
    minutes: float
    kind: str


@dataclass
class Route:
    segments: list[Segment]
    total_minutes: float
    transfers: int

    def to_dict(self) -> dict:
        return {
            "total_minutes": round(self.total_minutes, 1),
            "transfers": self.transfers,
            "segments": [
                {
                    "kind": s.kind,
                    "line": s.line.name if s.line else None,
                    "line_color": s.line.color if s.line else None,
                    "line_kind": s.line.kind if s.line else None,
                    "from": {"id": s.from_station.id, "name": s.from_station.name},
                    "to": {"id": s.to_station.id, "name": s.to_station.name},
                    "minutes": round(s.minutes, 1),
                }
                for s in self.segments
            ],
        }


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

    def add_segment(self, line: Line, ids: list[str],
                    times: list[int], kind: str = 'local') -> None:
        assert len(ids) == len(times) + 1, "Несовпадение станций и времён"
        for i, t in enumerate(times):
            a, b = ids[i], ids[i + 1]
            self._add(a, b, Edge(line, t, kind))
            self._add(b, a, Edge(line, t, kind))

    def _add(self, a: str, b: str, e: Edge) -> None:
        self.edges[a].setdefault(b, []).append(e)

    def add_transfer(self, a: str, b: str, minutes: int) -> None:
        if a == b:
            return
        self.transfers.setdefault(a, {})[b] = minutes
        self.transfers.setdefault(b, {})[a] = minutes


# ============================================================
# ДАННЫЕ
# ============================================================

# Все станции (id, name) — координаты не критичны, ставим 0
_STATIONS = [
    # --- Ярославское: основной ход ---
    ("m_yar", "Москва Ярославская"),
    ("moscow3", "Москва-3"),
    ("malenkovskaya", "Маленковская"),
    ("yauza", "Яуза"),
    ("rostokino", "Ростокино"),
    ("losinoostrovskaya", "Лосиноостровская"),
    ("los", "Лось"),
    ("perlovskaya", "Перловская"),
    ("tayninskaya", "Тайнинская"),
    ("mytishchi", "Мытищи"),
    ("stroitel", "Строитель"),
    ("chelyuskinskaya", "Челюскинская"),
    ("tarasovskaya", "Тарасовская"),
    ("klyazma", "Клязьма"),
    ("mamontovskaya", "Мамонтовская"),
    ("pushkino", "Пушкино"),
    ("zavety_ilyicha", "Заветы Ильича"),
    ("pravda", "Правда"),
    ("zelenogradskaya", "Зеленоградская"),
    ("km43", "Нагорное (43 км)"),
    ("sofrino", "Софрино"),
    ("ashukinskaya", "Ашукинская"),
    ("kalistovo", "Калистово"),
    ("radonezh", "Радонеж"),
    ("abramtsevo", "Абрамцево"),
    ("hotkovo", "Хотьково"),
    ("semhoz", "Семхоз"),
    ("sergiev_posad", "Сергиев Посад"),
    ("km76", "76 км"),
    ("km81", "81 км"),
    ("km83", "83 км"),
    ("buzhaninovo", "Бужаниново"),
    ("km90", "90 км"),
    ("arsaki", "Арсаки"),
    ("strunino", "Струнино"),
    ("aleksandrov", "Александров-1"),
    ("balakirevo", "Балакирево"),

    # --- Ярославское: Монинский ход ---
    ("podlipki", "Подлипки-Дачные"),
    ("bolshevo", "Болшево"),
    ("valentinovka", "Валентиновка"),
    ("zagoryanskaya", "Загорянская"),
    ("sokolovskaya", "Соколовская"),
    ("voronok", "Воронок"),
    ("shchelkovo", "Щёлково"),
    ("gagarinskaya", "Гагаринская"),
    ("chkalovskaya", "Чкаловская"),
    ("bakhchivandzhi", "Бахчиванджи"),
    ("tsiolkovskaya", "Циолковская"),
    ("monino", "Монино"),
    ("kashino", "Кашино"),
    ("kolontaevo", "Колонтаево"),
    ("lesnaya", "Лесная"),
    ("fryazevo", "Фрязево"),

    # --- Ярославское: Фрязинский ход ---
    ("fabrika1maya", "Фабрика 1 Мая"),
    ("zelyony_bor", "Зелёный Бор"),
    ("ivanteevka2", "Ивантеевка-2"),
    ("ivanteevka", "Ивантеевка"),
    ("detskaya", "Детская"),
    ("fryazino_tov", "Фрязино-Тов."),
    ("fryazino", "Фрязино-Пасс."),

    # --- Ярославское: Красноармейская ветка ---
    ("poselok_dalniy", "Посёлок Дальний"),
    ("rahmanovo", "Рахманово"),
    ("fedorovskoe", "Фёдоровское"),
    ("putilovo", "Путилово"),
    ("krasnoarmeysk", "Красноармейск"),

    # --- Павелецкое ---
    ("m_pav", "Москва Павелецкая"),
    ("derbenevskaya", "Дербеневская"),
    ("tulskaya", "Тульская"),
    ("varshavskaya", "Варшавская"),
    ("verhnie_kotly", "Верхние Котлы"),
    ("nagatinskaya", "Нагатинская"),
    ("kolomenskoye", "Коломенское"),
    ("chertanovo", "Чертаново"),
    ("biryulyovo_tov", "Бирюлёво-Товарная"),
    ("biryulyovo_pass", "Бирюлёво-Пассажирская"),
    ("bulatnikovo", "Булатниково"),
    ("rastorguevo", "Расторгуево"),
    ("kalinina", "Калинина"),
    ("leninskaya", "Ленинская"),
    ("km32", "32 км"),
    ("domodedovo", "Домодедово"),
    ("aviacionnaya", "Авиационная"),
    ("kosmos", "Космос"),
    ("aeroport_domodedovo", "Аэропорт Домодедово"),
    ("vzlyotnaya", "Взлётная"),
    ("vostryakovo", "Востряково"),
    ("belye_stolby", "Белые Столбы"),
    ("barybino", "Барыбино"),
    ('danilovo_52', 'Данилово (52 км)'),
    ("privalovo", "Привалово"),
    ("velyaminovo", "Вельяминово"),
    ('shugarovo', 'Шугарово'),
    ("mihnevo", "Михнево"),
    ("shugarovo", "Шугарово"),
    ('km85', '85 км'),
    ("zhilyovo", "Жилёво"),
    ('sitenka', 'Ситенка'),
    ("stupino", "Ступино"),
    ("akri", "Акри"),
    ("belopesotsky", "Белопесоцкий"),
    ("kashira", "Кашира"),
    ("tesna", "Тесна"),
    ("ozherelye", "Ожерелье"),
    ("zubovo_121", "Зубово (121 км)"),
    ("purlovo", "Пурлово"),
    ("kolmenka_131", "Колменка (131 км)"),
    ("topkanovo", "Топканово"),
    ("km137", "137 км"),
    ("bogatishchevo", "Богатищево"),
    ("km146", "146 км"),
    ("korovino", "Коровино"),
    ("novosyolki_152", "Новосёлки (152 км)"),
    ("uzunovo", "Узуново"),
]


def build_moscow_network() -> RailNetwork:
    net = RailNetwork()
    for sid, name in _STATIONS:
        net.add_station(Station(sid, name))

    # --- Линии ---
    yar = Line("yar", "Ярославское направление", "#E5231B", "cppk", headway=8)
    yar_mon = Line("yar_monino", "Монинский ход", "#E5231B", "cppk", headway=15)
    yar_frz = Line("yar_fryazino", "Фрязинский ход", "#E5231B", "cppk", headway=20)
    yar_kras = Line("yar_krasnoarmeysk", "Красноармейская ветка", "#E5231B", "cppk", headway=30)
    pav = Line("pav", "Павелецкое направление", "#00A651", "cppk", headway=10)
    pav_aero = Line("pav_aero", "Аэроэкспресс", "#00A651", "cppk", headway=30)
    pav_aero_sub = Line("pav_aero_sub", "До Аэропорта Домодедово", "#00A651", "cppk", headway=60)

    # --- Ярославское: основной ход (время в пути между соседними, минут) ---
    net.add_segment(yar, [
        "m_yar", "moscow3", "malenkovskaya", "yauza", "rostokino",
        "losinoostrovskaya", "los", "perlovskaya", "tayninskaya",
        "mytishchi", "stroitel", "chelyuskinskaya", "tarasovskaya",
        "klyazma", "mamontovskaya", "pushkino", "zavety_ilyicha",
        "pravda", "zelenogradskaya", "km43", "sofrino", "ashukinskaya",
        "kalistovo", "radonezh", "abramtsevo", "hotkovo", "semhoz",
        "sergiev_posad", "km76", "km81", "km83", "buzhaninovo",
        "km90", "arsaki", "strunino", "aleksandrov", "balakirevo",
    ], [3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 5, 4, 4, 5, 5, 4, 5, 5, 7, 4, 4, 4, 5, 5, 5, 4, 6, 5, 5, 6, 5, 5, 6, 12, 15], kind="local")

    # --- Ярославское: Монинский ход ---
    net.add_segment(yar_mon, [
        "mytishchi", "podlipki", "bolshevo",
        "valentinovka", "zagoryanskaya", "sokolovskaya", "voronok",
        "shchelkovo", "gagarinskaya", "chkalovskaya", "bakhchivandzhi",
        "tsiolkovskaya", "monino", "kashino", "kolontaevo", "lesnaya",
        "fryazevo",
    ], [8, 10, 6, 6, 6, 6, 6, 6, 6, 6, 6, 8, 6, 6, 6, 6], kind="local")

    # --- Ярославское: Фрязинский ход ---
    net.add_segment(yar_frz, [
        "bolshevo", "fabrika1maya", "zelyony_bor",
        "ivanteevka2", "ivanteevka", "detskaya",
        "fryazino_tov", "fryazino",
    ], [5, 4, 5, 4, 4, 4, 5], kind="local")

    # --- Ярославское: Красноармейская ветка ---
    net.add_segment(yar_kras, [
        "sofrino", "poselok_dalniy", "rahmanovo",
        "fedorovskoe", "putilovo", "krasnoarmeysk",
    ], [8, 8, 8, 8, 8], kind="local")

    # --- Павелецкое --- 44 станции
    net.add_segment(pav, [
        "m_pav", "derbenevskaya", "tulskaya", "varshavskaya",
        "verhnie_kotly", "nagatinskaya", "kolomenskoye", "chertanovo",
        "biryulyovo_tov", "biryulyovo_pass", 'bulatnikovo', "rastorguevo", "kalinina",
        "leninskaya", "km32", "domodedovo",
        "vzlyotnaya", "vostryakovo", "belye_stolby", "barybino",
        "danilovo_52", "privalovo", "velyaminovo", "mihnevo", 'shugarovo',
        "km85", "zhilyovo", "sitenka",
        "stupino", "akri", "belopesotsky", "kashira",
        "tesna", "ozherelye", "zubovo_121",
        "purlovo", "kolmenka_131", "topkanovo", "km137",
        "bogatishchevo", "km146", "korovino",
        "novosyolki_152", "uzunovo",
     ], [
        4, 3, 3, 4, 4, 4, 5, 5, 5, 5, 5, 5, 4, 5,
        4, 4, 4, 5, 5, 5, 5, 5, 6, 5, 5, 6, 5, 5,
        5, 5, 5, 6, 6, 6, 6, 6, 6, 5, 6, 6, 5, 6,
        6,
    ], kind="local")
    # --- Пересадки (пока условные — на будущее) ---
    # Между Москва Павелецкая и Москва Ярославская через метро — примерно 25 минут
    

    # Аэроэкспресс: Москва Павелецкая → Верхние Котлы → Аэропорт Домодедово
    # Время в пути: 4 мин до Верхних Котлов, 40 мин до аэропорта
    net.add_segment(pav_aero, [
        "m_pav", "verhnie_kotly", "aeroport_domodedovo",
    ], [5, 40], kind="local")
    return net

    net.add_segment(pav_aero_sub, [
            "domodedovo", 'aviacionnaya', "kosmos", "aeroport_domodedovo",
            ], [7, 5, 5], kind="local")
    return net 

# ============================================================
# МАРШРУТИЗАТОР
# ============================================================

def find_route(net: RailNetwork, start_id: str, end_id: str,
               transfer_penalty: int = 5) -> Route | None:
    if start_id not in net.stations or end_id not in net.stations:
        return None

    if start_id == end_id:
        return Route(segments=[], total_minutes=0.0, transfers=0)

        start_state = (start_id, None)
    dist: dict[tuple[str, str | None], float] = {start_state: 0.0}
    prev: dict[tuple[str, str | None], tuple] = {}
    pq: list[tuple[float, str, str | None]] = [(0.0, start_id, None)]

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
                        Segment(edge.line, net.get(sid), net.get(nid),
                                edge.travel_time + penalty, edge.kind),
                    )
                    heapq.heappush(pq, (new_time, nid, edge.line.id))

        for nid, minutes in net.transfers.get(sid, {}).items():
            new_time = cur_time + minutes
            new_state = (nid, None)
            if new_time < dist.get(new_state, float("inf")):
                dist[new_state] = new_time
                prev[new_state] = (
                    state,
                    Segment(None, net.get(sid), net.get(nid), minutes, "transfer"),
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
    return Route(segments, dist[best], transfers)