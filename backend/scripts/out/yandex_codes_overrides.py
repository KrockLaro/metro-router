"""Ручные переопределения кодов Яндекс.Расписаний.

Правки вносить здесь, а не в app/schedule/yandex_codes.py —
тот файл автогенерируется скриптом find_yandex_codes.py.
"""

ALLOWED_DUPLICATES: list[tuple[str, str]] = [
    ("fryazino_tov", "fryazino"),
    ("m_kursk", "ploshchad_trekh_vokzalov"),
]


NO_SCHEDULE: set[str] = {
    "pl109km",
    "pl124km",
    "domodedovo_junction",
    "sheremetyevo_junction",
    # Курское — нет у Яндекса
    "km92_k",
    "km107_k",
    "romanovskie_dachi",
    "aleksandrovka",
    "prostor",
    "rodnichok",
    # Рижское — нет у Яндекса
    "km50_riga",
    "km73_riga",
    "km91_riga",
    "km133_riga",
    "podmoskovnye_dachi",
    # Казанское — депо и километровые без пасп. расписания
    "depo_kursk",
    "depo_ryazan",
    "km179",
    "km189",
}


OVERRIDES: dict[str, str] = {
    # ── Домодедово ──
    "domodedovo":          "s9600811",
    "aeroport_domodedovo": "s9600216",

    # ─── N-км (Ярославское) ───
    "km43":  "s9601848",
    "km76":  "s9601860",
    "km81":  "s9601684",
    "km83":  "s9601899",
    "km90":  "s9602035",
    # ─── N-км (Павелецкое) ───
    "km32":  "s9633652",
    "km85":  "s9633653",
    "km137": "s9634000",
    "km146": "s9601125",

    # ─── Ложные совпадения ───
    "strunino":  "s9601358",
    "pravda":    "s9601127",
    "lesnaya":   "s9602097",
    "pionerskaya":"s9601641",   # Пионерская [Дубки], а не ММДЖД
    "zaharovo":  "s9601659",    # Захарово [МО], а не Ногинск
    "testovskaya":"s9601349",   # Тестовская МЦД-1, а не МЦК
    "savelovo":  "s9603083",    # Савёлово [Тверская], а не Савёловская МЦД-4
    "khoroshevo": "s9602286",   # Хорошево (МО, пос. Хорошово), не МЦК-Хорошёво

    # ─── Шереметьево ───
    "sheremetyevo_south": "s9881841",
    "sheremetyevo_north": "s9881704",

    # ─── Проверены ранее ───
    "arsaki":          "s9600792",
    "aleksandrov":     "s9601547",
    "balakirevo":      "s9604157",
    "biryulyovo_tov":  "s9601698",
    "biryulyovo_pass": "s9601703",

    # ═════════════════════════════════════════════════════════
    # КУРСКОЕ НАПРАВЛЕНИЕ
    # ═════════════════════════════════════════════════════════
    "m_kursk":           "s2000001",
    "moskva_tovarnaya":  "s9601796",
    "kalitniki":         "s9600866",
    "novokhokhlovskaya": "s9868807",
    "tekstilshchiki":    "s9600711",
    "pechatniki":        "s9881845",
    "lyublino":          "s9601788",
    "depo_kursk":        "s9602245",
    "pererva":           "s9601898",
    "kuryanovo":         "s9876608",
    "moskvorechye":      "s9601711",
    "tsaritsyno":        "s9600891",
    "pokrovskoe":        "s9601256",
    "krasny_stroitel":   "s9601943",
    "bittsa":            "s9600703",
    "butovo":            "s9601291",
    "shcherbinka":       "s9600951",
    "ostafyevo":         "s9871176",
    "silikatnaya":       "s9602273",
    "podolsk":           "s9600731",
    "kutuzovskaya_k":    "s9601494",
    "vesennyaya":        "s9601207",
    "grivno":            "s9601157",
    "lvovskaya":         "s9601276",
    "molodi":            "s9601752",
    "stolbovaya":        "s9601626",
    "ivachkovo":         "s9602313",
    "chepelyovo":        "s9602222",
    "chekhov":           "s9601062",
    "luch":              "s9601743",
    "sharapova_okhota":  "s9602216",
    "km92_k":            "s0001022",
    "avangard":          "s9600832",
    "serpukhov":         "s9600830",
    "oka":               "s9601185",
    "km107_k":           "s0001026",
    "priokskaya":        "s9601406",
    "romanovskie_dachi": "s0001028",
    "tarusskaya":        "s9601668",
    "aleksandrovka":     "s0001030",
    "pakhomovo":         "s9600833",
    "shulgino":          "s9600834",
    "prostor":           "s0001033",
    "yasnogorsk":        "s9601630",
    "shemetovo":         "s9601810",
    "baranovo":          "s9601798",
    "revyakino":         "s9601652",
    "baydiki":           "s9601824",
    "khomyakovo":        "s9601785",
    "rodnichok":         "s0001040",
    "tula":              "s9623131",

    # ═════════════════════════════════════════════════════════
    # РИЖСКОЕ НАПРАВЛЕНИЕ
    # ═════════════════════════════════════════════════════════
    "ploshchad_trekh_vokzalov": "s2000001",
    "rizhskaya":            "s9601266",
    "marya_roshcha":        "s9883699",
    "dmitrovskaya":         "s9600901",
    "m_riga":               "s2000008",
    "grazhdanskaya":        "s9601934",
    "krasny_balties":       "s9601947",
    "streshnevo":           "s9601688",
    "shchukinskaya":        "s9879240",
    "tushinskaya":          "s9600741",
    "trikotazhnaya":        "s9602036",
    "volokolamskaya":       "s9874963",
    "penyagino":            "s9874964",
    "pavshino":             "s9602460",
    "krasnogorskaya":       "s9601142",
    "opalikha":             "s9601364",
    "anikeevka":            "s9601770",
    "nahabino":             "s9601122",
    "malinovka":            "s9601748",
    "dedovsk":              "s9600871",
    "miitovskaya":          "s9600675",
    "snegiri":              "s9601442",
    "km50_riga":            "s0002018",
    "manikhino1":           "s9601651",
    "troitskaya":           "s9601763",
    "istra":                "s9601923",
    "novoierusalimskaya":   "s9601222",
    "chekhovskaya_riga":    "s9600769",
    "kholshcheviki":        "s9602215",
    "km73_riga":            "s0002025",
    "yadroshino":           "s9601802",
    "kursakovskaya":        "s9601780",
    "rumyantsevo":          "s9602228",
    "novopetrovskaya":      "s9601667",
    "ustinovka":            "s9601778",
    "km91_riga":            "s0002031",
    "lesodolgorukovo":      "s9601779",
    "chismena":             "s9601759",
    "matryonino":           "s9601148",
    "dubosekovo":           "s9601422",
    "volokolamsk":          "s9600696",
    "km133_riga":           "s0002036",
    "blagoveshchenskoe":    "s9600695",
    "moskvich":             "s9634001",
    "bukholovo":            "s9600697",
    "podmoskovnye_dachi":   "s0002040",
    "shakhovskaya":         "s9600706",

    # ─── Депо на Савёловском ───
    "depo_sav": "s9602464",

    # ═════════════════════════════════════════════════════════
    # ЛЕНИНГРАДСКОЕ НАПРАВЛЕНИЕ
    # ═════════════════════════════════════════════════════════
    # Москва и ближнее Подмосковье
    "ostankino":          "s9603505",
    "likhobory":          "s9603256",   # Лихоборы (бывш. НАТИ)
    "mosselsmash":        "s9603478",
    "grachyovskaya":      "s9603877",   # Грачёвская (бывш. Ховрино)
    "hovrino":            "s9878110",   # Ховрино (МЦД-3)
    "levoberezhnaya":     "s9603663",
    "himki":              "s9603401",
    "molzhaninovo":       "s9603638",   # Молжаниново (бывш. Планерная)
    "novopodrezkovo":     "s9603404",
    "podrezkovo":         "s9603406",
    "shodnya":            "s9603486",
    "firsanovskaya":      "s9603604",
    "malino":             "s9601115",
    "zelenograd_krukovo": "s9600212",
    "alabushevo":         "s9603668",
    "radishchevo":        "s9603761",
    "povarovo1":          "s9602925",
    # TODO: Поваровка — у Яндекса отдельно нет. Похоже, это Поварово-3.
    # Проверить фетчем: если расписание пустое — перенаправить на NO_SCHEDULE.
    "povarovka":          "s9601292",   # Поварово-3
    "beryozki_dachnye":   "s9603765",
    "podsolnechnaya":     "s9603468",
    "senezh":             "s9603714",
    "golovkovo":          "s9603732",
    "pokrovka":           "s9603708",
    "frolovskoe":         "s9603744",
    "streglovo":          "s9603436",
    "klin":               "s9602944",
    "yamuga":             "s9603464",
    "reshetnikovo":       "s9602945",
    # Тверская область
    "chernichnaya":       "s9603509",
    "zavidovo":           "s9602593",
    "moskovskoe_more":    "s9603507",
    "redkino":            "s9602946",
    "mezhevo":            "s9603423",
    "kuzminka":           "s9603871",
    "chupriyanovka":      "s9603829",
    "lazurnaya":          "s9603790",
    "tver":               "s9603093",
    # Ветка в Конаково
    "puteprovodnaya":     "s9603753",
    "konakovskiy_moh":    "s9603888",
    "donhovka":           "s9603676",
    "konakovo_gres":      "s9603735",
    # МЦД-3
    "mitkovo":            "s9601312",
}