"""Ротация направлений по дням недели."""
from __future__ import annotations


DIRECTIONS: dict[str, dict] = {
    "savyolovskoye":  {"name": "Савёловское",  "stations": ["m_sav"],  "line_id": "sav"},
    "belorusskoye":   {"name": "Белорусское",  "stations": ["m_bel"],  "line_id": "bel"},
    "kurskoye":       {"name": "Курское",      "stations": ["m_kursk"],"line_id": "kursk"},
    "rizhskoye":      {"name": "Рижское",      "stations": ["m_riga"], "line_id": "riga"},
    "leningradskoye": {"name": "Ленинградское","stations": ["m_len"],  "line_id": "len"},
    "kazanskoye":     {"name": "Казанское",    "stations": ["m_kaz"],  "line_id": "kaz"},
    "gorkovskoye":    {"name": "Горьковское",  "stations": ["m_kursk"],"line_id": "gork"},
    "kiyevskoye":     {"name": "Киевское",     "stations": ["m_kiev"], "line_id": "kiev"},
    "yaroslavskoye":  {
        "name": "Ярославское",
        "stations": [
            "m_yar", "moscow3", "malenkovskaya", "yauza", "rostokino",
            "losinoostrovskaya", "los", "perlovskaya", "tayninskaya",
            "mytishchi", "stroitel", "chelyuskinskaya", "tarasovskaya",
            "klyazma", "mamontovskaya", "pushkino", "zavety_ilyicha",
            "pravda", "zelenogradskaya", "km43", "sofrino", "ashukinskaya",
            "kalistovo", "radonezh", "abramtsevo", "hotkovo", "semhoz",
            "sergiev_posad", "km76", "km81", "km83", "buzhaninovo",
            "km90", "arsaki", "strunino", "aleksandrov", "balakirevo",
            "podlipki", "bolshevo", "valentinovka", "zagoryanskaya",
            "sokolovskaya", "voronok", "shchelkovo", "gagarinskaya",
            "chkalovskaya", "bakhchivandzhi", "tsiolkovskaya", "monino",
            "kashino", "kolontaevo", "lesnaya", "fryazevo",
            "fabrika1maya", "zelyony_bor", "ivanteevka2", "ivanteevka",
            "detskaya", "fryazino_tov", "fryazino",
            "poselok_dalniy", "rahmanovo", "fedorovskoe", "putilovo",
            "krasnoarmeysk",
        ],
        "line_id": "yar",
    },
    "paveletskoye": {
        "name": "Павелецкое",
        "stations": [
            "m_pav", "derbenevskaya", "tulskaya", "varshavskaya",
            "verhnie_kotly", "nagatinskaya", "chertanovo",
            "biryulyovo_tov", "biryulyovo_pass", "bulatnikovo",
            "rastorguevo", "kalinina", "leninskaya", "km32",
            "domodedovo", "aviacionnaya", "kosmos",
            "aeroport_domodedovo", "vzlyotnaya", "vostryakovo",
            "belye_stolby", "barybino", "danilovo_52", "privalovo",
            "velyaminovo", "mihnevo", "shugarovo", "km85", "zhilyovo",
            "sitenka", "stupino", "akri", "belopesotsky", "kashira",
            "tesna", "ozherelye", "zubovo_121", "purlovo",
            "kolmenka_131", "topkanovo", "km137", "bogatishchevo",
            "km146", "korovino", "novosyolki_152", "uzunovo",
        ],
        "line_id": "pav",
    },
    "bmo": {"name": "БМО", "stations": [], "line_id": "bmo"},
    "mcc": {"name": "МЦК", "stations": [], "line_id": "mcc"},
}


WEEKLY_ROTATION: dict[int, list[str]] = {
    0: ["savyolovskoye", "belorusskoye"],
    1: ["kurskoye", "rizhskoye"],
    2: ["leningradskoye", "kazanskoye"],
    3: ["gorkovskoye", "kiyevskoye"],
    4: ["yaroslavskoye", "paveletskoye"],
    5: ["bmo"],
    6: ["mcc"],
}
