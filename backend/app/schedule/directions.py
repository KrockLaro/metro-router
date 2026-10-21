"""Ротация направлений по дням недели.

Индексы 0..6 = Пн..Вс (datetime.weekday()).
"""
from __future__ import annotations


DIRECTIONS: dict[str, dict] = {
    "savyolovskoye": {
        "name": "Савёловское",
        "stations": [
            "m_sav", "timiryazevskaya", "petrovsko_razumovskaya", "okruzhnaya",
            "degunino", "beskudnikovo", "lianozovo", "mark", "novodachnaya",
            "dolgoprudnaya", "vodniki", "hlebnikovo", "sheremetyevskaya",
            "lobnya", "depo_sav", "lugovaya", "nekrasovskaya", "katuar",
            "trudovaya", "iksha", "morozki", "turist", "yahroma", "dmitrov",
            "kanalstroy", "barsuchenko", "orudevo", "verbilki", "nikulki",
            "zheltikovo", "vlasovo", "taldom", "lebzino", "pl124km", "savelovo",
            # ветка на Дубну
            "sorevnovanie", "zaprudnya", "tempy", "meldino",
            "zhivopisnoe", "karmanovo", "bolshaya_volga", "dubna",
        ],
        "line_id": "sav",
    },
    "belorusskoye": {
        "name": "Белорусское",
        "stations": [
            "m_bel", "begovaya", "testovskaya", "fili", "slavyansky_bulvar",
            "kuntsevskaya", "rabochiy_poselok", "setun", "nemchinovka", "skolkovo",
            "bakovka", "odintsovo", "otradnoe", "pionerskaya", "perhushkovo",
            "zdravnitsa", "zhavoronki", "dachnoe", "malye_vyazemy", "golitsyno",
            "sushkinskaya", "petelino", "chastsovskaya", "portnovskaya",
            "chapaevka", "polushkino", "sanatornaya", "tuchkovo", "teatralnaya",
            "sadovaya", "dorohovo", "partizanskaya", "shalikovo", "kukarinskaya",
            "pl109km", "mozhaysk", "borodino",
            # Усовская ветка
            "kuntsevo2", "romashkovo", "razdory", "barviha", "ilyinskoe", "usovo",
            # Звенигородская ветка
            "zaharovo", "hlyupino", "skorotovo", "zvenigorod",
            # Аэроэкспресс в Шереметьево
            "sheremetyevo_south", "sheremetyevo_north",
        ],
        "line_id": "bel",
    },
        "kurskoye": {
        "name": "Курское",
        "stations": [
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
        ],
        "line_id": "kursk",
    },
    "rizhskoye": {
        "name": "Рижское",
        "stations": [
            "ploshchad_trekh_vokzalov", "rizhskaya", "marya_roshcha",
            "dmitrovskaya", "m_riga",
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
        ],
        "line_id": "riga",
    },
        "leningradskoye": {
        "name": "Ленинградское",
        "stations": [
            "m_len", "ostankino", "petrovsko_razumovskaya", "likhobory",
            "mosselsmash", "grachyovskaya", "hovrino", "levoberezhnaya",
            "himki", "molzhaninovo", "novopodrezkovo", "podrezkovo", "shodnya",
            "firsanovskaya", "malino", "zelenograd_krukovo", "alabushevo",
            "radishchevo", "povarovka", "povarovo1", "beryozki_dachnye",
            "podsolnechnaya", "senezh", "golovkovo", "pokrovka", "frolovskoe",
            "streglovo", "klin", "yamuga", "reshetnikovo", "chernichnaya",
            "zavidovo", "moskovskoe_more", "redkino", "mezhevo", "kuzminka",
            "chupriyanovka", "lazurnaya", "tver",
            # ветка Конаково
            "puteprovodnaya", "konakovskiy_moh", "donhovka", "konakovo_gres",
        ],
        "line_id": "len",
    },
        "kazanskoye": {
        "name": "Казанское",
        "stations": [
            # Стартовая точка — Казанский вокзал
            "m_kaz",
            # МЦД-3 участок (Митьково между Останкино и Электрозаводской)
            "mitkovo",
            # Основной Рязанский ход: Москва → Рязань-1
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
            # Тупиковая ветка на Рязань-2 (от Лагерного)
            "ryazan_2",
            # Казанский ход (ответвление от Люберец-1)
            "lyubertsy2", "korenyovo", "ovrazhki", "rodniki", "vyalki",
            "khripan", "km41_kaz", "donino",
            "igumnovo_49", "km52", "grigorovo", "gzhel_istochniki_55",
            "gzhel", "ignatyevo", "kuzyayevo",
            "shevlyagino", "smolevo",
            "antsiferovo", "podosinki", "kurovskaya",
            "lokomotivnoe_depo_90", "belivo", "avsyunino",
            "zapolitsy", "zaputnaya", "shaturtorf", "shatura",
            "botino", "krivandino",
            "tugolesye", "voymezhny", "cherusti",
            "struya", "tasin", "ilichyov", "torfoprodukt",
            "miltsevo", "nechaevskaya", "vekovka",
            # Ветка в Рязановку (от Кривандина)
            "osanovo", "km15_kaz", "pozhoga", "km29_kaz",
            "barmino", "sazonovo", "km47_kaz", "ryazanovka",
            # Ветка в Озёры (от Голутвина)
            "bachmanovo", "proezd_stankostroiteley_6", "sychyovo", "lystsevskaya",
            "semyonovsky",
            "posyolok_lesnoy_18", "karasyovo", "kudryavtsevo", "danilovskaya",
            "kholmy_30", "km38_kaz", "ozyory",
        ],
        "line_id": "kaz",
    },
    "gorkovskoye": {
        "name": "Горьковское",
        "stations": [],
        "line_id": "gork",
    },
    "kiyevskoye": {
        "name": "Киевское",
        "stations": [],
        "line_id": "kiev",
    },
    "yaroslavskoye": {
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
    "bmo": {
        "name": "БМО",
        "stations": [],
        "line_id": "bmo",
    },
    "mcc": {
        "name": "МЦК",
        "stations": [],
        "line_id": "mcc",
    },
}


# День недели → список direction_id
WEEKLY_ROTATION: dict[int, list[str]] = {
    0: ["savyolovskoye", "belorusskoye"],         # Пн
    1: ["kurskoye", "rizhskoye"],                 # Вт
    2: ["leningradskoye", "kazanskoye"],          # Ср
    3: ["gorkovskoye", "kiyevskoye"],             # Чт
    4: ["yaroslavskoye", "paveletskoye"],         # Пт
    5: ["bmo"],                                   # Сб
    6: ["mcc"],                                   # Вс
}