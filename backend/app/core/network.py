"""
core/network.py — Dijkstra-граф (fallback, если OTP недоступен).
"""

from __future__ import annotations

import heapq
from dataclasses import dataclass, field


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
    kind: str            # оператор: 'cppk' | 'mcd' | 'mcc' | 'metro'
    headway: int = 10
    train_kind: str = 'local'   # 'local' | 'express' | 'aeroexpress' | 'branded'

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


_VARIANT_LABELS = {
    "fastest":            "Быстрейший",
    "balanced":           "Оптимальный",
    "fewest_transfers":   "Меньше пересадок",
    "without_aeroexpress":"Без Аэроэкспресса",
    "with_express":       "С экспрессом",
    "branded":            "Фирменный",
}


@dataclass
class Route:
    segments: list[Segment]
    total_minutes: float
    transfers: int
    tags: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        label = _VARIANT_LABELS.get(self.tags[0], "Маршрут") if self.tags else "Маршрут"
        return {
            "total_minutes": round(self.total_minutes, 1),
            "transfers": self.transfers,
            "tags": list(self.tags),
            "label": label,
            "segments": [
                {
                    "kind": s.kind,
                    "line": s.line.name if s.line else None,
                    "line_color": s.line.color if s.line else None,
                    "line_kind": s.line.kind if s.line else None,
                    "line_train_kind": s.line.train_kind if s.line else None,
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
        if a not in self.stations or b not in self.stations:
            raise ValueError(
                f"add_transfer: одна из станций не зарегистрирована ({a}, {b})"
            )
        self.transfers.setdefault(a, {})[b] = minutes
        self.transfers.setdefault(b, {})[a] = minutes


# ============================================================
# ДАННЫЕ
# ============================================================

_STATIONS = [
    # ══════════ ВОКЗАЛЫ МОСКВЫ (метро-узлы) ══════════
    ("m_yar",   "Москва Ярославская"),
    ("m_pav",   "Москва Павелецкая"),
    ("m_kursk", "Москва Курская"),
    ("m_kaz",   "Москва Казанская"),
    ("m_bel",   "Москва Белорусская"),
    ("m_kiev",  "Москва Киевская"),
    ("m_sav",   "Москва Савёловская"),
    ("m_len",   "Москва Ленинградская"),

    # ─── Ярославское: основной ход ───
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

    # ─── Ярославское: Монинский ход ───
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

    # ─── Ярославское: Фрязинский ход ───
    ("fabrika1maya", "Фабрика 1 Мая"),
    ("zelyony_bor", "Зелёный Бор"),
    ("ivanteevka2", "Ивантеевка-2"),
    ("ivanteevka", "Ивантеевка"),
    ("detskaya", "Детская"),
    ("fryazino_tov", "Фрязино-Тов."),
    ("fryazino", "Фрязино-Пасс."),

    # ─── Ярославское: Красноармейская ветка ───
    ("poselok_dalniy", "Посёлок Дальний"),
    ("rahmanovo", "Рахманово"),
    ("fedorovskoe", "Фёдоровское"),
    ("putilovo", "Путилово"),
    ("krasnoarmeysk", "Красноармейск"),

    # ─── Павелецкое ───
    ("derbenevskaya", "Дербеневская"),
    ("tulskaya", "Тульская"),
    ("varshavskaya", "Варшавская"),
    ("verhnie_kotly", "Верхние Котлы"),
    ("nagatinskaya", "Нагатинская"),
    ("chertanovo", "Чертаново"),
    ("biryulyovo_tov", "Бирюлёво-Товарная"),
    ("biryulyovo_pass", "Бирюлёво-Пассажирская"),
    ("bulatnikovo", "Булатниково"),
    ("rastorguevo", "Расторгуево"),
    ("kalinina", "Калинина"),
    ("leninskaya", "Ленинская"),
    ("km32", "32 км"),
    ("domodedovo", "Домодедово"),
    ("domodedovo_junction", "Junction"),
    ("aviacionnaya", "Авиационная"),
    ("kosmos", "Космос"),
    ("aeroport_domodedovo", "Аэропорт Домодедово"),
    ("vzlyotnaya", "Взлётная"),
    ("vostryakovo", "Востряково"),
    ("belye_stolby", "Белые Столбы"),
    ("barybino", "Барыбино"),
    ("danilovo_52", "Данилово (52 км)"),
    ("privalovo", "Привалово"),
    ("velyaminovo", "Вельяминово"),
    ("shugarovo", "Шугарово"),
    ("mihnevo", "Михнево"),
    ("km85", "85 км"),
    ("zhilyovo", "Жилёво"),
    ("sitenka", "Ситенка"),
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

    # ─── Белорусское: основной ход ───
    ("begovaya", "Беговая"),
    ("testovskaya", "Москва-Сити"),
    ("fili", "Фили"),
    ("slavyansky_bulvar", "Славянский Бульвар"),
    ("kuntsevskaya", "Кунцевская"),
    ("rabochiy_poselok", "Рабочий Посёлок"),
    ("setun", "Сетунь"),
    ("nemchinovka", "Немчиновка"),
    ("skolkovo", "Сколково"),
    ("bakovka", "Баковка"),
    ("odintsovo", "Одинцово"),
    ("otradnoe", "Отрадное"),
    ("pionerskaya", "Пионерская"),
    ("perhushkovo", "Перхушково"),
    ("zdravnitsa", "Здравница"),
    ("zhavoronki", "Жаворонки"),
    ("dachnoe", "Дачное"),
    ("malye_vyazemy", "Малые Вязёмы"),
    ("golitsyno", "Голицыно"),
    ("sushkinskaya", "Сушкинская"),
    ("petelino", "Петелино"),
    ("chastsovskaya", "Часцовская"),
    ("portnovskaya", "Портновская"),
    ("kubinka1", "Кубинка-1"),
    ("chapaevka", "Чапаевка"),
    ("polushkino", "Полушкино"),
    ("sanatornaya", "Санаторная"),
    ("tuchkovo", "Тучково"),
    ("teatralnaya", "Театральная"),
    ("sadovaya", "Садовая"),
    ("dorohovo", "Дорохово"),
    ("partizanskaya", "Партизанская"),
    ("shalikovo", "Шаликово"),
    ("kukarinskaya", "Кукаринская"),
    ("pl109km", "109 км (Платовская)"),
    ("mozhaysk", "Можайск"),
    ("borodino", "Бородино"),

    # ─── Белорусское: Усовская ветка ───
    ("kuntsevo2", "Кунцево-2"),
    ("romashkovo", "Ромашково"),
    ("razdory", "Раздоры"),
    ("barviha", "Барвиха"),
    ("ilyinskoe", "Ильинское"),
    ("usovo", "Усово"),

    # ─── Белорусское: Звенигородская ветка ───
    ("zaharovo", "Захарово"),
    ("hlyupino", "Хлюпино"),
    ("skorotovo", "Скоротово"),
    ("zvenigorod", "Звенигород"),

    # ─── Белорусское/Савёловское: аэроэкспресс в Шереметьево ───
    ("sheremetyevo_junction", "Junction"),
    ("sheremetyevo_south", "Шереметьево — Юг"),
    ("sheremetyevo_north", "Шереметьево — Север"),

    # ─── Савёловское: основной ход ───
    ("timiryazevskaya", "Тимирязевская"),
    ("petrovsko_razumovskaya", "Петровско-Разумовская"),
    ("okruzhnaya", "Окружная"),
    ("degunino", "Дегунино"),
    ("beskudnikovo", "Бескудниково"),
    ("lianozovo", "Лианозово"),
    ("mark", "Марк"),
    ("novodachnaya", "Новодачная"),
    ("dolgoprudnaya", "Долгопрудная"),
    ("vodniki", "Водники"),
    ("hlebnikovo", "Хлебниково"),
    ("sheremetyevskaya", "Шереметьевская"),
    ("lobnya", "Лобня"),
    ("depo_sav", "Депо"),
    ("lugovaya", "Луговая"),
    ("nekrasovskaya", "Некрасовская"),
    ("katuar", "Катуар"),
    ("trudovaya", "Трудовая"),
    ("iksha", "Икша"),
    ("morozki", "Морозки"),
    ("turist", "Турист"),
    ("yahroma", "Яхрома"),
    ("dmitrov", "Дмитров"),
    ("kanalstroy", "Каналстрой"),
    ("barsuchenko", "Имени Барсученко"),
    ("orudevo", "Орудьево"),
    ("verbilki", "Вербилки"),
    ("nikulki", "Никулки"),
    ("zheltikovo", "Жёлтиково"),
    ("vlasovo", "Власово"),
    ("taldom", "Талдом"),
    ("lebzino", "Лебзино"),
    ("pl124km", "124 км"),
    ("savelovo", "Савёлово"),

    # ─── Савёловское: ветка Вербилки — Дубна ───
    ("sorevnovanie", "Соревнование"),
    ("zaprudnya", "Запрудня"),
    ("tempy", "Темпы"),
    ("meldino", "Мельдино"),
    ("zhivopisnoe", "Живописное (119 км)"),
    ("karmanovo", "Карманово (122 км)"),
    ("bolshaya_volga", "Большая Волга"),
    ("dubna", "Дубна"),

        # ─── Ленинградское направление ───
    ("ostankino", "Останкино"),
    ("likhobory", "Лихоборы"),
    ("mosselsmash", "Моссельмаш"),
    ("grachyovskaya", "Грачёвская"),
    ("hovrino", "Ховрино"),
    ("levoberezhnaya", "Левобережная"),
    ("himki", "Химки"),
    ("molzhaninovo", "Молжаниново"),
    ("novopodrezkovo", "Новоподрезково"),
    ("podrezkovo", "Подрезково"),
    ("shodnya", "Сходня"),
    ("firsanovskaya", "Фирсановская"),
    ("malino", "Малино"),
    ("zelenograd_krukovo", "Зеленоград-Крюково"),
    ("alabushevo", "Алабушево"),
    ("radishchevo", "Радищево"),
    ("povarovka", "Поваровка"),
    ("povarovo1", "Поварово-1"),
    ("beryozki_dachnye", "Берёзки-Дачные"),
    ("podsolnechnaya", "Подсолнечная"),
    ("senezh", "Сенеж"),
    ("golovkovo", "Головково"),
    ("pokrovka", "Покровка"),
    ("frolovskoe", "Фроловское"),
    ("streglovo", "Стреглово"),
    ("klin", "Клин"),
    ("yamuga", "Ямуга"),
    ("reshetnikovo", "Решетниково"),
    ("chernichnaya", "Черничная"),
    ("zavidovo", "Завидово"),
    ("moskovskoe_more", "Московское Море"),
    ("redkino", "Редкино"),
    ("mezhevo", "Межево"),
    ("kuzminka", "Кузьминка"),
    ("chupriyanovka", "Чуприяновка"),
    ("lazurnaya", "Лазурная"),
    ("tver", "Тверь"),
    # Ветка в Конаково
    ("puteprovodnaya", "Путепроводная"),
    ("konakovskiy_moh", "Конаковский Мох"),
    ("donhovka", "Донховка"),
    ("konakovo_gres", "Конаково ГРЭС"),
    # МЦД-3
    ("mitkovo", "Митьково"),

    # ─── Курское направление ───
    ("moskva_tovarnaya", "Москва-Товарная"),
    ("kalitniki", "Калитники"),
    ("novokhokhlovskaya", "Новохохловская"),
    ("tekstilshchiki", "Текстильщики"),
    ("pechatniki", "Печатники"),
    ("lyublino", "Люблино"),
    ("depo_kursk", "Депо"),
    ("pererva", "Перерва"),
    ("kuryanovo", "Курьяново"),
    ("moskvorechye", "Москворечье"),
    ("tsaritsyno", "Царицыно"),
    ("pokrovskoe", "Покровское"),
    ("krasny_stroitel", "Красный Строитель"),
    ("bittsa", "Битца"),
    ("butovo", "Бутово"),
    ("shcherbinka", "Щербинка"),
    ("ostafyevo", "Остафьево"),
    ("silikatnaya", "Силикатная"),
    ("podolsk", "Подольск"),
    ("kutuzovskaya_k", "Кутузовская"),
    ("vesennyaya", "Весенняя"),
    ("grivno", "Гривно"),
    ("lvovskaya", "Львовская"),
    ("molodi", "Молоди"),
    ("stolbovaya", "Столбовая"),
    ("ivachkovo", "Ивачково (66 км)"),
    ("chepelyovo", "Чепелёво"),
    ("chekhov", "Чехов"),
    ("luch", "Луч"),
    ("sharapova_okhota", "Шарапова Охота"),
    ("km92_k", "92 км"),
    ("avangard", "Авангард"),
    ("serpukhov", "Серпухов"),
    ("oka", "Ока"),
    ("km107_k", "107 км"),
    ("priokskaya", "Приокская"),
    ("romanovskie_dachi", "Романовские дачи"),
    ("tarusskaya", "Тарусская"),
    ("aleksandrovka", "Александровка (132 км)"),
    ("pakhomovo", "Пахомово"),
    ("shulgino", "Шульгино"),
    ("prostor", "Простор (153 км)"),
    ("yasnogorsk", "Ясногорск"),
    ("shemetovo", "Шеметово"),
    ("baranovo", "Бараново"),
    ("revyakino", "Ревякино"),
    ("baydiki", "Байдики"),
    ("khomyakovo", "Хомяково"),
    ("rodnichok", "Родничок (191 км)"),
    ("tula", "Тула"),

    # ─── Рижское направление ───
    ("ploshchad_trekh_vokzalov", "Площадь Трёх Вокзалов"),
    ("rizhskaya", "Рижская"),
    ("marya_roshcha", "Марьина Роща"),
    ("dmitrovskaya", "Дмитровская"),
    ("m_riga", "Москва Рижская"),
    ("grazhdanskaya", "Гражданская"),
    ("krasny_balties", "Красный Балтиец"),
    ("streshnevo", "Стрешнево"),
    ("shchukinskaya", "Щукинская"),
    ("tushinskaya", "Тушинская"),
    ("trikotazhnaya", "Трикотажная"),
    ("volokolamskaya", "Волоколамская"),
    ("penyagino", "Пенягино"),
    ("pavshino", "Павшино"),
    ("krasnogorskaya", "Красногорская"),
    ("opalikha", "Опалиха"),
    ("anikeevka", "Аникеевка"),
    ("nahabino", "Нахабино"),
    ("malinovka", "Малиновка"),
    ("dedovsk", "Дедовск"),
    ("miitovskaya", "Миитовская"),
    ("snegiri", "Снегири"),
    ("km50_riga", "50 км"),
    ("manikhino1", "Манихино 1"),
    ("troitskaya", "Троицкая"),
    ("istra", "Истра"),
    ("novoierusalimskaya", "Новоиерусалимская"),
    ("chekhovskaya_riga", "Чеховская"),
    ("kholshcheviki", "Холщёвики"),
    ("km73_riga", "73 км"),
    ("yadroshino", "Ядрошино"),
    ("kursakovskaya", "Курсаковская"),
    ("rumyantsevo", "Румянцево"),
    ("novopetrovskaya", "Новопетровская"),
    ("ustinovka", "Устиновка"),
    ("km91_riga", "91 км"),
    ("lesodolgorukovo", "Лесодолгоруково"),
    ("chismena", "Чисмена"),
    ("matryonino", "Матрёнино"),
    ("dubosekovo", "Дубосеково"),
    ("volokolamsk", "Волоколамск"),
    ("km133_riga", "133 км"),
    ("blagoveshchenskoe", "Благовещенское"),
    ("moskvich", "Москвич (141 км)"),
    ("bukholovo", "Бухолово"),
    ("podmoskovnye_dachi", "Подмосковные дачи (149 км)"),
    ("shakhovskaya", "Шаховская"),

    # ══════════ КАЗАНСКОЕ НАПРАВЛЕНИЕ ══════════
    # МЦД-3 (Митьково-Люберцы) и основной Рязанский ход
    ("elektrozavodskaya", "Электрозаводская"),
    ("sortirovochnaya", "Сортировочная"),
    ("aviamotornaya", "Авиамоторная"),
    ("andronovka", "Андроновка"),
    ("perovo", "Перово"),
    ("plyushchevo", "Плющево"),
    ("veshnyaki", "Вешняки"),
    ("vykhino", "Выхино"),
    ("kosino", "Косино"),
    ("ukhtomskaya", "Ухтомская"),
    ("lyubertsy1", "Люберцы-1"),
    ("panki", "Панки"),
    ("tomilino", "Томилино"),
    ("kraskovo", "Красково"),
    ("malakhovka", "Малаховка"),
    ("udelnaya", "Удельная"),
    ("bykovo", "Быково"),
    ("ilyinskaya", "Ильинская"),
    ("otdykh", "Отдых"),
    ("kratovo", "Кратово"),
    ("eseninskaya", "Есенинская"),
    ("fabrichnaya", "Фабричная"),
    ("ramenskoye", "Раменское"),
    ("ippodrom", "Ипподром"),
    ("sovkhoz", "Совхоз"),
    ("zagornovo", "Загорново"),
    ("bronnitsy", "Бронницы"),
    ("raduga", "Радуга"),
    ("tsibino_63", "Цибино (63 км)"),
    ("beloozerskaya", "Белоозёрская"),
    ("faustovo", "Фаустово"),
    ("zolotovo", "Золотово"),
    ("vinogradovo", "Виноградово"),
    ("konobeevo", "Конобеево"),
    ("trofimovo_84", "Трофимово (84 км)"),
    ("km88", "88 км"),
    ("voskresensk", "Воскресенск"),
    ("lopatino", "Лопатино"),
    ("shifernaya", "Шиферная"),
    ("ilyinsky_pogost", "Ильинский Погост"),
    ("tsemgigant", "Цемгигант"),
    ("peski", "Пески"),
    ("konev_bor", "Конев Бор"),
    ("khoroshevo", "Хорошево"),
    ("amerevo_113", "Амерево (113 км)"),
    ("kolomna", "Коломна"),
    ("golutvin", "Голутвин"),
    ("shchurovo", "Щурово"),
    ("chyornaya", "Чёрная"),
    ("lukhovitsy", "Луховицы"),
    ("km142", "142 км"),
    ("podlipki_kaz", "Подлипки (Казанские)"),
    ("fruktovaya", "Фруктовая"),
    ("alpatyevo", "Алпатьево"),
    ("slyomy", "Слёмы"),
    ("divovo", "Дивово"),
    ("istodniki", "Истодники"),
    ("km179", "179 км"),
    ("rybnoye", "Рыбное"),
    ("khodynino", "Ходынино"),
    ("depo_ryazan", "Депо (Рязань)"),
    ("ryazan_sort", "Рязань-Сорт."),
    ("km187", "187 км"),
    ("km189", "189 км"),
    ("nedostoevo", "Недостоево"),
    ("dyagilevo", "Дягилево"),
    ("lagerny", "Лагерный"),
    ("ryazan_1", "Рязань-1"),
    ("ryazan_2", "Рязань-2"),

    # ─── Казанский ход (от Люберец-1) ───
    ("lyubertsy2", "Люберцы-2"),
    ("korenyovo", "Коренёво"),
    ("ovrazhki", "Овражки"),
    ("rodniki", "Родники"),
    ("vyalki", "Вялки"),
    ("khripan", "Хрипань"),
    ("km41_kaz", "41 км"),
    ("donino", "Донино"),
    ("igumnovo_49", "Игумново (49 км)"),
    ("km52", "52 км"),
    ("grigorovo", "Григорово"),
    ("gzhel_istochniki_55", "Гжельские Источники (55 км)"),
    ("gzhel", "Гжель"),
    ("ignatyevo", "Игнатьево"),
    ("kuzyayevo", "Кузяево"),
    ("shevlyagino", "Шевлягино"),
    ("smolevo", "Смолево"),
    ("antsiferovo", "Анциферово"),
    ("podosinki", "Подосинки"),
    ("kurovskaya", "Куровская"),
    ("lokomotivnoe_depo_90", "Локомотивное депо (90 км)"),
    ("belivo", "Беливо"),
    ("avsyunino", "Авсюнино"),
    ("zapolitsy", "Заполицы"),
    ("zaputnaya", "Запутная"),
    ("shaturtorf", "Шатурторф"),
    ("shatura", "Шатура"),
    ("botino", "Ботино"),
    ("krivandino", "Кривандино"),
    ("tugolesye", "Туголесье"),
    ("voymezhny", "Воймежный"),
    ("cherusti", "Черусти"),
    ("struya", "Струя"),
    ("tasin", "Тасин"),
    ("ilichyov", "Ильичёв"),
    ("torfoprodukt", "Торфопродукт"),
    ("miltsevo", "Мильцево"),
    ("nechaevskaya", "Нечаевская"),
    ("vekovka", "Вековка"),

    # ─── Ветка в Рязановку (от Кривандина) ───
    ("osanovo", "Осаново"),
    ("km15_kaz", "15 км"),
    ("pozhoga", "Пожога"),
    ("km29_kaz", "29 км"),
    ("barmino", "Бармино"),
    ("sazonovo", "Сазоново"),
    ("km47_kaz", "47 км"),
    ("ryazanovka", "Рязановка"),

    # ─── Ветка в Озёры (от Голутвина) ───
    ("bachmanovo", "Бачманово"),
    ("proezd_stankostroiteley_6", "Проезд Станкостроителей (6 км)"),
    ("sychyovo", "Сычёво"),
    ("lystsevskaya", "Лысцовская"),
    ("semyonovsky", "Семёновский"),
    ("posyolok_lesnoy_18", "Посёлок Лесной (18 км)"),
    ("karasyovo", "Карасёво"),
    ("kudryavtsevo", "Кудрявцево"),
    ("danilovskaya", "Даниловская"),
    ("kholmy_30", "Холмы (30 км)"),
    ("km38_kaz", "38 км"),
    ("ozyory", "Озёры"),
]


_VOKZAL_TRANSFERS = [
    # ─── Комсомольская площадь (Ярославский + Ленинградский + Казанский) ───
    ("m_len", "m_sav", 10),      # через метро Комсомольская — Савёловская
    ("m_len", "m_bel", 25),
    ("m_len", "m_kursk", 15),
    ("m_yar",  "m_len",   5),    # пешком через площадь
    ("m_yar",  "m_kaz",   5),    # пешком через площадь
    ("m_len",  "m_kaz",   5),    # пешком через площадь
    ("m_yar",  "ploshchad_trekh_vokzalov", 5),
    ("m_len",  "ploshchad_trekh_vokzalov", 5),
    ("m_kaz",  "ploshchad_trekh_vokzalov", 5),

    # ─── Курский вокзал (отдельно, но связан с Комсомольской) ───
    ("m_kursk", "ploshchad_trekh_vokzalov", 10),   # метро, 1 остановка
    ("m_kursk", "m_yar",   20),
    ("m_kursk", "m_len",   15),
    ("m_kursk", "m_kaz",   10),
    ("m_kursk", "m_pav",   20),
    ("m_kursk", "m_kiev",  25),
    ("m_kursk", "m_bel",   20),

    # ─── Остальные вокзалы ───
    ("m_bel",  "m_sav",   15),
    ("m_bel",  "m_yar",   25),
    ("m_pav",  "m_yar",   25),
    ("m_pav",  "m_kiev",  20),
    ("m_pav",  "m_bel",   30),
    ("m_sav",  "m_bel",   15),
    ("m_sav",  "m_len",   10),

    # ─── Новые: Рижская и Дмитровская ───
    ("rizhskaya",    "ploshchad_trekh_vokzalov", 10),
    ("rizhskaya",    "dmitrovskaya",              5),
    ("rizhskaya",    "m_riga",                    5),   # ответвление на Рижский вокзал
    ("dmitrovskaya", "m_sav",                     5),   # метро, 1 остановка
    ("dmitrovskaya", "marya_roshcha",             5),
]


def build_moscow_network() -> RailNetwork:
    net = RailNetwork()
    for sid, name in _STATIONS:
        net.add_station(Station(sid, name))

    # ─── Линии ─────────────────────────────────────────────
    # Ярославское
    yar = Line("yar", "Ярославское направление", "#E5231B", "cppk", headway=8)
    yar_mon = Line("yar_monino", "Монинский ход", "#E5231B", "cppk", headway=15)
    yar_frz = Line("yar_fryazino", "Фрязинский ход", "#E5231B", "cppk", headway=20)
    yar_kras = Line("yar_krasnoarmeysk", "Красноармейская ветка", "#E5231B", "cppk", headway=30)
    # Павелецкое
    pav = Line("pav", "Павелецкое направление", "#00A651", "cppk", headway=10)
    pav_aero = Line("pav_aero", "Аэроэкспресс", "#E5231B", "cppk",
                    headway=30, train_kind="aeroexpress")
    pav_aero_sub = Line("pav_aero_sub", "До Аэропорта Домодедово", "#00A651", "cppk", headway=60)
    # Белорусское
    bel = Line("bel", "Белорусское направление", "#e1d8bb", "cppk", headway=10)
    bel_usovo = Line("bel_usovo", "Усовская ветка", "#e1d8bb", "cppk", headway=30)
    bel_zven = Line("bel_zven", "Звенигородская ветка", "#e1d8bb", "cppk", headway=60)
    # Савёловское
    sav = Line("sav", "Савёловское направление", "#e1d8bb", "cppk", headway=10)
    sav_dubna = Line("sav_dubna", "Ветка Вербилки — Дубна", "#e1d8bb", "cppk", headway=60)
    sav_aero = Line("sav_aero", "Аэроэкспресс в Шереметьево", "#E5231B", "cppk",
                    headway=30, train_kind="aeroexpress")
    len_line = Line("len", "Ленинградское направление", "#8B7355", "cppk", headway=10)
    len_konakovo = Line("len_konakovo", "Ветка в Конаково", "#8B7355", "cppk", headway=60)
    # ─── Курское ───
    kursk = Line("kursk", "Курское направление", "#f754e1", "cppk", headway=10)
    # ─── Рижское ───
    riga = Line("riga", "Рижское направление", "#f754e1", "cppk", headway=15)
    riga_m = Line("riga_m", "Ветка на Рижский вокзал", "#f754e1", "cppk", headway=30)
    # ─── Казанское ───
    kaz = Line("kaz", "Казанское направление", "#00A651", "cppk", headway=10)
    kaz_khod = Line("kaz_khod", "Казанский ход", "#00A651", "cppk", headway=20)
    kaz_ryazanovka = Line("kaz_ryazanovka", "Ветка в Рязановку", "#00A651", "cppk", headway=60)
    kaz_ozery = Line("kaz_ozery", "Ветка в Озёры", "#00A651", "cppk", headway=60)
    mcd3 = Line("mcd3", "МЦД-3", "#E5231B", "mcd", headway=10, train_kind="mcd")

    # ─── Ярославское: основной ход ───
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

    # ─── Ярославское: Монинский ход ───
    net.add_segment(yar_mon, [
        "mytishchi", "podlipki", "bolshevo",
        "valentinovka", "zagoryanskaya", "sokolovskaya", "voronok",
        "shchelkovo", "gagarinskaya", "chkalovskaya", "bakhchivandzhi",
        "tsiolkovskaya", "monino", "kashino", "kolontaevo", "lesnaya",
        "fryazevo",
    ], [8, 10, 6, 6, 6, 6, 6, 6, 6, 6, 6, 8, 6, 6, 6, 6], kind="local")

    # ─── Ярославское: Фрязинский ход ───
    net.add_segment(yar_frz, [
        "bolshevo", "fabrika1maya", "zelyony_bor",
        "ivanteevka2", "ivanteevka", "detskaya",
        "fryazino_tov", "fryazino",
    ], [5, 4, 5, 4, 4, 4, 5], kind="local")

    # ─── Ярославское: Красноармейская ветка ───
    net.add_segment(yar_kras, [
        "sofrino", "poselok_dalniy", "rahmanovo",
        "fedorovskoe", "putilovo", "krasnoarmeysk",
    ], [8, 8, 8, 8, 8], kind="local")

    # ─── Павелецкое: основной ход ───
    net.add_segment(pav, [
        "m_pav", "derbenevskaya", "tulskaya", "varshavskaya",
        "verhnie_kotly", "nagatinskaya", "chertanovo",
        "biryulyovo_tov", "biryulyovo_pass", "bulatnikovo", "rastorguevo", "kalinina",
        "leninskaya", "km32", "domodedovo",
        "vzlyotnaya", "vostryakovo", "belye_stolby", "barybino",
        "danilovo_52", "privalovo", "velyaminovo", "mihnevo", "shugarovo",
        "km85", "zhilyovo", "sitenka",
        "stupino", "akri", "belopesotsky", "kashira",
        "tesna", "ozherelye", "zubovo_121",
        "purlovo", "kolmenka_131", "topkanovo", "km137",
        "bogatishchevo", "km146", "korovino",
        "novosyolki_152", "uzunovo",
    ], [
        4, 3, 3, 4, 4, 5, 5, 5, 5, 5, 4, 5,
        4, 4, 4, 5, 5, 5, 5, 5, 6, 5, 5, 6, 5, 5,
        5, 5, 5, 6, 6, 6, 6, 6, 6, 5, 6, 6, 5, 6,
        6, 6,
    ], kind="local")

    # ─── Павелецкое: аэроэкспресс и электричка до аэропорта ───
    net.add_segment(pav_aero, [
        "m_pav", "verhnie_kotly", "domodedovo_junction", "aeroport_domodedovo",
    ], [25, 5, 40], kind="express")

    net.add_segment(pav_aero_sub, [
        "domodedovo", "domodedovo_junction", "aviacionnaya", "kosmos", "aeroport_domodedovo",
    ], [7, 3, 5, 5], kind="local")

    # ─── Белорусское: основной ход ───
    net.add_segment(bel, [
        "m_bel", "begovaya", "testovskaya", "fili", "slavyansky_bulvar",
        "kuntsevskaya", "rabochiy_poselok", "setun", "nemchinovka", "skolkovo",
        "bakovka", "odintsovo", "otradnoe", "pionerskaya", "perhushkovo",
        "zdravnitsa", "zhavoronki", "dachnoe", "malye_vyazemy", "golitsyno",
        "sushkinskaya", "petelino", "chastsovskaya", "portnovskaya",
        "kubinka1", "chapaevka", "polushkino", "sanatornaya", "tuchkovo",
        "teatralnaya", "sadovaya", "dorohovo", "partizanskaya", "shalikovo",
        "kukarinskaya", "pl109km", "mozhaysk", "borodino",
    ], [
        4, 3, 4, 4, 4, 4, 3, 4, 4, 3, 4, 4, 4, 4, 5, 4, 5, 4, 5, 6,
        4, 4, 4, 4, 5, 4, 4, 4, 5, 4, 4, 5, 5, 4, 5, 5, 6,
    ], kind="local")

    # ─── Белорусское: Усовская ветка ───
    net.add_segment(bel_usovo, [
        "rabochiy_poselok", "kuntsevo2", "romashkovo", "razdory",
        "barviha", "ilyinskoe", "usovo",
    ], [3, 4, 5, 4, 3, 3], kind="local")

    # ─── Белорусское: Звенигородская ветка ───
    net.add_segment(bel_zven, [
        "golitsyno", "zaharovo", "hlyupino", "skorotovo", "zvenigorod",
    ], [5, 5, 5, 5], kind="local")

    # ─── Савёловское: основной ход ───
    net.add_segment(sav, [
        "m_sav", "timiryazevskaya", "petrovsko_razumovskaya", "okruzhnaya",
        "degunino", "beskudnikovo", "lianozovo", "mark", "novodachnaya",
        "dolgoprudnaya", "vodniki", "hlebnikovo", "sheremetyevskaya",
        "lobnya", "depo_sav", "lugovaya", "nekrasovskaya", "katuar",
        "trudovaya", "iksha", "morozki", "turist", "yahroma", "dmitrov",
        "kanalstroy", "barsuchenko", "orudevo", "verbilki", "nikulki",
        "zheltikovo", "vlasovo", "taldom", "lebzino", "pl124km", "savelovo",
    ], [
        4, 3, 3, 3, 3, 4, 4, 4, 5, 4, 4, 4, 4, 4, 3, 3, 4, 4, 5,
        5, 4, 4, 6, 4, 4, 4, 5, 5, 4, 5, 5, 5, 4, 5,
    ], kind="local")

    # ─── Савёловское: ветка Вербилки — Дубна ───
    net.add_segment(sav_dubna, [
        "verbilki", "sorevnovanie", "zaprudnya", "tempy", "meldino",
        "zhivopisnoe", "karmanovo", "bolshaya_volga", "dubna",
    ], [4, 5, 5, 4, 5, 4, 6, 5], kind="local")

    # ─── Аэроэкспресс в Шереметьево (от Одинцово) ───
    net.add_segment(sav_aero, [
        "odintsovo", "bakovka", "skolkovo", "nemchinovka", "setun",
        "rabochiy_poselok", "kuntsevskaya", "slavyansky_bulvar", "fili",
        "testovskaya", "begovaya", "m_bel", "m_sav", "okruzhnaya",
        "lianozovo", "sheremetyevo_south", "sheremetyevo_north",
    ], [
        5, 5, 4, 5, 4, 4, 4, 4, 5, 4, 5, 6, 5, 6, 8, 6,
    ], kind="express")

        # ─── Курское: основной ход ───
    net.add_segment(kursk, [
        "m_kursk", "moskva_tovarnaya", "kalitniki", "novokhokhlovskaya",
        "tekstilshchiki", "pechatniki", "lyublino", "depo_kursk",
        "pererva", "kuryanovo", "moskvorechye", "tsaritsyno",
        "pokrovskoe", "krasny_stroitel", "bittsa", "butovo",
        "shcherbinka", "ostafyevo", "silikatnaya", "podolsk",
        "kutuzovskaya_k", "vesennyaya", "grivno", "lvovskaya",
        "molodi", "stolbovaya", "ivachkovo", "chepelyovo", "chekhov",
        "luch", "sharapova_okhota", "km92_k", "avangard", "serpukhov",
        "oka", "km107_k", "priokskaya", "romanovskie_dachi", "tarusskaya",
        "aleksandrovka", "pakhomovo", "shulgino", "prostor", "yasnogorsk",
        "shemetovo", "baranovo", "revyakino", "baydiki", "khomyakovo",
        "rodnichok", "tula",
    ], [
        5, 4, 4, 4, 4, 4, 3, 4, 3, 4, 4, 4, 4, 4, 4, 3, 4, 3, 4, 5,
        5, 4, 4, 4, 4, 4, 4, 4, 5, 4, 5, 4, 5, 5, 5, 4, 5, 5, 5, 5,
        4, 4, 5, 5, 5, 4, 5, 5, 4, 5,
    ], kind="local")

    # ─── Рижское: основной ход ───
    net.add_segment(riga, [
        "m_kursk", "ploshchad_trekh_vokzalov", "rizhskaya",
        "marya_roshcha", "dmitrovskaya",
        "grazhdanskaya", "krasny_balties", "streshnevo", "shchukinskaya",
        "tushinskaya", "trikotazhnaya", "volokolamskaya", "penyagino",
        "pavshino", "krasnogorskaya", "opalikha", "anikeevka", "nahabino",
        "malinovka", "dedovsk", "miitovskaya", "snegiri", "km50_riga",
        "manikhino1", "troitskaya", "istra", "novoierusalimskaya",
        "chekhovskaya_riga", "kholshcheviki", "km73_riga", "yadroshino",
        "kursakovskaya", "rumyantsevo", "novopetrovskaya", "ustinovka",
        "km91_riga", "lesodolgorukovo", "chismena", "matryonino",
        "dubosekovo", "volokolamsk", "km133_riga", "blagoveshchenskoe",
        "moskvich", "bukholovo", "podmoskovnye_dachi", "shakhovskaya",
    ], [
        5, 5, 4, 5,
        4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
        4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
        5, 4, 5,
    ], kind="local")

    # ─── Ветка на Рижский вокзал ───
    net.add_segment(riga_m, [
        "dmitrovskaya", "m_riga",
        ], [
            5,
    ], kind="local")

        # ─── Ленинградское: основной ход ───
    net.add_segment(len_line, [
        "m_len", "ostankino", "petrovsko_razumovskaya", "likhobory",
        "mosselsmash", "grachyovskaya", "hovrino", "levoberezhnaya",
        "himki", "molzhaninovo", "novopodrezkovo", "podrezkovo", "shodnya",
        "firsanovskaya", "malino", "zelenograd_krukovo", "alabushevo",
        "radishchevo", "povarovka", "povarovo1", "beryozki_dachnye",
        "podsolnechnaya", "senezh", "golovkovo", "pokrovka", "frolovskoe",
        "streglovo", "klin", "yamuga", "reshetnikovo", "chernichnaya",
        "zavidovo", "moskovskoe_more", "redkino", "mezhevo", "kuzminka",
        "chupriyanovka", "lazurnaya", "tver",
    ], [
        4, 5, 4, 4, 5, 4, 4, 4, 5, 4, 4, 5, 5, 4, 4, 5, 5, 5, 5, 5,
        4, 5, 4, 4, 5, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 10,
    ], kind="local")

    # ─── Ветка в Конаково ───
    net.add_segment(len_konakovo, [
        "reshetnikovo", "puteprovodnaya", "konakovskiy_moh",
        "donhovka", "konakovo_gres",
    ], [7, 7, 7, 7], kind="local")

    # ─── МЦД-3 (Петровско-Разумовская → Ипподром) ───
    net.add_segment(mcd3, [
        "petrovsko_razumovskaya", "ostankino", "mitkovo",
        "elektrozavodskaya", "sortirovochnaya", "aviamotornaya",
        "andronovka", "perovo", "plyushchevo", "veshnyaki",
        "vykhino", "kosino", "ukhtomskaya", "lyubertsy1",
        "panki", "tomilino", "kraskovo", "malakhovka", "udelnaya",
        "bykovo", "ilyinskaya", "otdykh", "kratovo", "eseninskaya",
        "fabrichnaya", "ramenskoye", "ippodrom",
    ], [
        5, 6, 6, 4, 4, 4, 4, 4, 3, 4, 3, 4, 4, 4,
        5, 5, 5, 5, 5, 4, 4, 4, 4, 4,
        4, 5,
    ], kind="mcd")

    # ─── Казанское: основной ход до Рязани-1 ───
    net.add_segment(kaz, [
        "m_kaz",
        "elektrozavodskaya", "sortirovochnaya", "aviamotornaya",
        "andronovka", "perovo", "plyushchevo", "veshnyaki",
        "vykhino", "kosino", "ukhtomskaya", "lyubertsy1",
        "panki", "tomilino", "kraskovo", "malakhovka", "udelnaya",
        "bykovo", "ilyinskaya", "otdykh", "kratovo", "eseninskaya",
        "fabrichnaya", "ramenskoye", "ippodrom",
        "sovkhoz", "zagornovo", "bronnitsy", "raduga", "tsibino_63",
        "beloozerskaya", "faustovo", "zolotovo", "vinogradovo",
        "konobeevo", "trofimovo_84", "km88", "voskresensk",
        "lopatino", "shifernaya", "ilyinsky_pogost", "tsemgigant",
        "peski", "konev_bor", "khoroshevo", "amerevo_113", "kolomna",
        "golutvin", "shchurovo", "chyornaya",
        "lukhovitsy", "km142", "podlipki_kaz", "fruktovaya", "alpatyevo",
        "slyomy", "divovo", "istodniki", "km179", "rybnoye",
        "khodynino", "depo_ryazan", "ryazan_sort", "km187", "km189",
        "nedostoevo", "dyagilevo", "lagerny", "ryazan_1",
    ], [
        5, 4, 4, 4, 4, 4, 3, 4, 3, 4, 4, 4,
        5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 5, 5,
        5, 4, 4, 5, 4, 5, 4, 4, 5, 4, 4, 5, 4, 5,
        4, 4, 5, 5, 5, 4, 4, 5, 4, 4,
        4, 5, 4, 4, 4, 5, 4, 4, 5, 4,
        4, 4, 4, 4, 4, 4, 4, 5, 5,
    ], kind="local")

    # ─── Ветка в Рязань-2 (тупик от Лагерного) ───
    net.add_segment(kaz, [
        "lagerny", "ryazan_2",
    ], [6], kind="local")

    # ─── Казанский ход ───
    net.add_segment(kaz_khod, [
        "lyubertsy1", "lyubertsy2",
        "korenyovo", "ovrazhki", "rodniki", "vyalki",
        "khripan", "km41_kaz", "donino",
        "igumnovo_49", "km52", "grigorovo", "gzhel_istochniki_55",
        "gzhel", "ignatyevo", "kuzyayevo",
        "shevlyagino", "smolevo",
        "antsiferovo", "podosinki",
        "kurovskaya",
        "lokomotivnoe_depo_90", "belivo", "avsyunino",
        "zapolitsy", "zaputnaya", "shaturtorf", "shatura",
        "botino", "krivandino",
        "tugolesye", "voymezhny", "cherusti",
        "struya", "tasin", "ilichyov", "torfoprodukt",
        "miltsevo", "nechaevskaya", "vekovka",
    ], [
        8, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 5,
        4, 5, 5, 5, 5, 5, 5,
        5, 5,
        5, 5, 5,
        5, 5, 5, 5,
        5, 5,
    ], kind="local")

    # ─── Ветка в Рязановку ───
    net.add_segment(kaz_ryazanovka, [
        "krivandino",
        "osanovo", "km15_kaz", "pozhoga", "km29_kaz",
        "barmino", "sazonovo", "km47_kaz", "ryazanovka",
    ], [6, 5, 5, 5, 5, 5, 5, 5], kind="local")

    # ─── Ветка в Озёры ───
    net.add_segment(kaz_ozery, [
        "golutvin",
        "bachmanovo", "proezd_stankostroiteley_6", "sychyovo", "lystsevskaya",
        "semyonovsky",
        "posyolok_lesnoy_18", "karasyovo", "kudryavtsevo", "danilovskaya",
        "kholmy_30", "km38_kaz", "ozyory",
    ], [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5], kind="local")

    # ─── Пересадки между вокзалами ───
    

    # ─── Пересадки между вокзалами ───
    for a, b, m in _VOKZAL_TRANSFERS:
        net.add_transfer(a, b, m)

    return net


# ============================================================
# МАРШРУТИЗАТОР
# ============================================================

AVOID_LINE_PENALTY = 10_000


def find_route(net: RailNetwork, start_id: str, end_id: str,
               transfer_penalty: int = 5,
               tags: list[str] | None = None,
               avoid_kinds: frozenset[str] | None = None) -> Route | None:
    if start_id not in net.stations or end_id not in net.stations:
        return None

    avoid_kinds = avoid_kinds or frozenset()

    if start_id == end_id:
        return Route(segments=[], total_minutes=0.0, transfers=0,
                     tags=list(tags or []))

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
                entering_line = line_id is None or line_id != edge.line.id
                if line_id is None:
                    penalty += edge.line.wait_half
                elif line_id != edge.line.id:
                    penalty += transfer_penalty + edge.line.wait_half

                if entering_line and edge.line.train_kind in avoid_kinds:
                    penalty += AVOID_LINE_PENALTY

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
    return Route(segments, dist[best], transfers, tags=list(tags or []))


def _route_signature(r: Route) -> tuple:
    return tuple(
        (s.from_station.id, s.to_station.id, s.line.id if s.line else None)
        for s in r.segments
    )


def _route_tags(route: Route, strategy_tag: str) -> list[str]:
    tags = [strategy_tag]
    has_aero = any(s.line and s.line.train_kind == 'aeroexpress'
                   for s in route.segments)
    has_express = any(s.line and s.line.train_kind == 'express'
                      for s in route.segments)
    if has_aero:
        tags.append("has_aeroexpress")
    if has_express:
        tags.append("has_express")
    return tags


_STRATEGIES: list[tuple[str, int, frozenset[str]]] = [
    ("fastest",            5,  frozenset()),
    ("balanced",           15, frozenset()),
    ("fewest_transfers",   30, frozenset()),
    ("without_aeroexpress",5,  frozenset({"aeroexpress"})),
]


def find_routes(net: RailNetwork, start_id: str, end_id: str,
                k: int = 3) -> list[Route]:
    if start_id not in net.stations or end_id not in net.stations:
        return []

    variants: list[Route] = []
    seen: set[tuple] = set()

    for tag, penalty, avoid in _STRATEGIES:
        r = find_route(net, start_id, end_id,
                       transfer_penalty=penalty,
                       tags=[tag],
                       avoid_kinds=avoid)
        if r is None:
            continue

        sig = _route_signature(r)
        if sig in seen:
            continue
        seen.add(sig)
        r.tags = _route_tags(r, tag)
        variants.append(r)

        if len(variants) >= k:
            break

    return variants