export interface SchemaLine {
  id: string;
  name: string;
  color: string;
  kind: 'cppk' | 'mcd' | 'mcc' | 'metro';
  path: string[];
}

export const LINES: SchemaLine[] = [
  // ══════════════════════════════════════════════════════════════
  // ЯРОСЛАВСКОЕ НАПРАВЛЕНИЕ
  // ══════════════════════════════════════════════════════════════
  {
    id: 'yar',
    name: 'Ярославское направление',
    color: '#E5231B',
    kind: 'cppk',
    path: [
      'ploshchad_trekh_vokzalov', 'moscow3', 'malenkovskaya', 'yauza', 'rostokino',
      'losinoostrovskaya', 'los', 'perlovskaya', 'tayninskaya',
      'mytishchi', 'stroitel', 'chelyuskinskaya', 'tarasovskaya',
      'klyazma', 'mamontovskaya', 'pushkino', 'zavety_ilyicha',
      'pravda', 'zelenogradskaya', 'km43', 'sofrino', 'ashukinskaya',
      'kalistovo', 'radonezh', 'abramtsevo', 'hotkovo', 'semhoz',
      'sergiev_posad', 'km76', 'km81', 'km83', 'buzhaninovo',
      'km90', 'arsaki', 'strunino', 'aleksandrov', 'balakirevo',
    ],
  },
  {
    id: 'yar_monino',
    name: 'Монинский ход',
    color: '#E5231B',
    kind: 'cppk',
    path: [
      'mytishchi', 'podlipki', 'bolshevo',
      'valentinovka', 'zagoryanskaya', 'sokolovskaya', 'voronok',
      'shchelkovo', 'gagarinskaya', 'chkalovskaya', 'bakhchivandzhi',
      'tsiolkovskaya', 'monino', 'kashino', 'kolontaevo', 'lesnaya',
      'fryazevo',
    ],
  },
  {
    id: 'yar_fryazino',
    name: 'Фрязинский ход',
    color: '#E5231B',
    kind: 'cppk',
    path: [
      'bolshevo', 'fabrika1maya', 'zelyony_bor',
      'ivanteevka2', 'ivanteevka', 'detskaya',
      'fryazino_tov', 'fryazino',
    ],
  },
  {
    id: 'yar_krasnoarmeysk',
    name: 'Красноармейская ветка',
    color: '#E5231B',
    kind: 'cppk',
    path: ['sofrino', 'poselok_dalniy', 'rahmanovo', 'fedorovskoe', 'putilovo', 'krasnoarmeysk'],
  },

  // ══════════════════════════════════════════════════════════════
  // ПАВЕЛЕЦКОЕ НАПРАВЛЕНИЕ
  // ══════════════════════════════════════════════════════════════
  {
    id: 'pav',
    name: 'Павелецкое направление',
    color: '#00A651',
    kind: 'cppk',
    path: [
      'm_pav', 'derbenevskaya', 'tulskaya', 'varshavskaya',
      'verhnie_kotly', 'nagatinskaya', 'chertanovo',
      'biryulyovo_tov', 'biryulyovo_pass', 'bulatnikovo',
      'rastorguevo', 'kalinina', 'leninskaya', 'km32',
      'domodedovo', 'vzlyotnaya', 'vostryakovo',
      'belye_stolby', 'barybino', 'danilovo_52', 'privalovo',
      'velyaminovo', 'mihnevo', 'shugarovo', 'km85', 'zhilyovo',
      'sitenka', 'stupino', 'akri', 'belopesotsky', 'kashira',
      'tesna', 'ozherelye', 'zubovo_121', 'purlovo',
      'kolmenka_131', 'topkanovo', 'km137', 'bogatishchevo',
      'km146', 'korovino', 'novosyolki_152', 'uzunovo',
    ],
  },
  {
    id: 'pav_aero',
    name: 'Аэроэкспресс в Домодедово',
    color: '#00A651',
    kind: 'cppk',
    path: ['m_pav', 'verhnie_kotly', 'domodedovo_junction', 'aeroport_domodedovo'],
  },
  {
    id: 'pav_aero_sub',
    name: 'Электричка до аэропорта',
    color: '#00A651',
    kind: 'cppk',
    path: ['domodedovo', 'domodedovo_junction', 'aviacionnaya', 'kosmos', 'aeroport_domodedovo'],
  },

  // ══════════════════════════════════════════════════════════════
  // БЕЛОРУССКОЕ НАПРАВЛЕНИЕ
  // ══════════════════════════════════════════════════════════════
  {
    id: 'bel',
    name: 'Белорусское направление',
    color: '#e1d8bb',
    kind: 'cppk',
    path: [
      'm_bel', 'begovaya', 'testovskaya', 'fili', 'slavyansky_bulvar',
      'kuntsevskaya', 'rabochiy_poselok', 'setun', 'nemchinovka', 'skolkovo',
      'bakovka', 'odintsovo', 'otradnoe', 'pionerskaya', 'perhushkovo',
      'zdravnitsa', 'zhavoronki', 'dachnoe', 'malye_vyazemy', 'golitsyno',
      'sushkinskaya', 'petelino', 'chastsovskaya', 'portnovskaya',
      'chapaevka', 'polushkino', 'sanatornaya', 'tuchkovo', 'teatralnaya',
      'sadovaya', 'dorohovo', 'partizanskaya', 'shalikovo', 'kukarinskaya',
      'pl109km', 'mozhaysk', 'borodino',
    ],
  },
  {
    id: 'bel_usovo',
    name: 'Усовская ветка',
    color: '#e1d8bb',
    kind: 'cppk',
    path: [
      'rabochiy_poselok', 'kuntsevo2', 'romashkovo', 'razdory',
      'barviha', 'ilyinskoe', 'usovo',
    ],
  },
  {
    id: 'bel_zven',
    name: 'Звенигородская ветка',
    color: '#e1d8bb',
    kind: 'cppk',
    path: ['golitsyno', 'zaharovo', 'hlyupino', 'skorotovo', 'zvenigorod'],
  },

  // ══════════════════════════════════════════════════════════════
  // САВЁЛОВСКОЕ НАПРАВЛЕНИЕ
  // ══════════════════════════════════════════════════════════════
  {
    id: 'sav',
    name: 'Савёловское направление',
    color: '#e1d8bb',
    kind: 'cppk',
    path: [
      'm_sav', 'timiryazevskaya', 'petrovsko_razumovskaya', 'okruzhnaya',
      'degunino', 'beskudnikovo', 'lianozovo', 'mark', 'novodachnaya',
      'dolgoprudnaya', 'vodniki', 'hlebnikovo', 'sheremetyevskaya',
      'lobnya', 'depo_sav', 'lugovaya', 'nekrasovskaya', 'katuar',
      'trudovaya', 'iksha', 'morozki', 'turist', 'yahroma', 'dmitrov',
      'kanalstroy', 'barsuchenko', 'orudevo', 'verbilki', 'nikulki',
      'zheltikovo', 'vlasovo', 'taldom', 'lebzino', 'pl124km', 'savelovo',
    ],
  },
  {
    id: 'sav_dubna',
    name: 'Ветка Вербилки — Дубна',
    color: '#e1d8bb',
    kind: 'cppk',
    path: [
      'verbilki', 'sorevnovanie', 'zaprudnya', 'tempy', 'meldino',
      'zhivopisnoe', 'karmanovo', 'bolshaya_volga', 'dubna',
    ],
  },
  {
    id: 'sav_aero',
    name: 'Аэроэкспресс в Шереметьево',
    color: '#E5231B',
    kind: 'cppk',
    path: [
      'odintsovo', 'bakovka', 'skolkovo', 'nemchinovka', 'setun',
      'rabochiy_poselok', 'kuntsevskaya', 'slavyansky_bulvar', 'fili',
      'testovskaya', 'begovaya', 'm_bel', 'm_sav', 'okruzhnaya',
      'lianozovo', 'sheremetyevo_junction', 'sheremetyevo_south', 'sheremetyevo_north',
    ],
  },
  // ══════════════════════════════════════════════════════════════
  // КУРСКОЕ НАПРАВЛЕНИЕ
  // ══════════════════════════════════════════════════════════════
  {
    id: 'kursk',
    name: 'Курское направление',
    color: '#f754e1',
    kind: 'cppk',
    path: [
      'm_kursk', 'moskva_tovarnaya', 'kalitniki', 'novokhokhlovskaya',
      'tekstilshchiki', 'pechatniki', 'lyublino', 'depo_kursk',
      'pererva', 'kuryanovo', 'moskvorechye', 'tsaritsyno',
      'pokrovskoe', 'krasny_stroitel', 'bittsa', 'butovo',
      'shcherbinka', 'ostafyevo', 'silikatnaya', 'podolsk',
      'kutuzovskaya_k', 'vesennyaya', 'grivno', 'lvovskaya',
      'molodi', 'stolbovaya', 'ivachkovo', 'chepelyovo', 'chekhov',
      'luch', 'sharapova_okhota', 'km92_k', 'avangard', 'serpukhov',
      'oka', 'km107_k', 'priokskaya', 'romanovskie_dachi', 'tarusskaya',
      'aleksandrovka', 'pakhomovo', 'shulgino', 'prostor', 'yasnogorsk',
      'shemetovo', 'baranovo', 'revyakino', 'baydiki', 'khomyakovo',
      'rodnichok', 'tula',
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // РИЖСКОЕ НАПРАВЛЕНИЕ
  // Идёт от Курского через Площадь Трёх Вокзалов, потом на СЗ.
  // ══════════════════════════════════════════════════════════════
  {
    id: 'riga',
    name: 'Рижское направление',
    color: '#f754e1',
    kind: 'cppk',
    path: [
      'm_kursk', 'ploshchad_trekh_vokzalov', 'rizhskaya',
      'marya_roshcha', 'dmitrovskaya',
      'grazhdanskaya', 'krasny_balties', 'streshnevo', 'shchukinskaya',
      'tushinskaya', 'trikotazhnaya', 'volokolamskaya', 'penyagino',
      'pavshino', 'krasnogorskaya', 'opalikha', 'anikeevka', 'nahabino',
      'malinovka', 'dedovsk', 'miitovskaya', 'snegiri', 'km50_riga',
      'manikhino1', 'troitskaya', 'istra', 'novoierusalimskaya',
      'chekhovskaya_riga', 'kholshcheviki', 'km73_riga', 'yadroshino',
      'kursakovskaya', 'rumyantsevo', 'novopetrovskaya', 'ustinovka',
      'km91_riga', 'lesodolgorukovo', 'chismena', 'matryonino',
      'dubosekovo', 'volokolamsk', 'km133_riga', 'blagoveshchenskoe',
      'moskvich', 'bukholovo', 'podmoskovnye_dachi', 'shakhovskaya',
    ],
  },
  {
    id: 'riga_m',
    name: 'Ветка на Рижский вокзал',
    color: '#f754e1',
    kind: 'cppk',
    path: ['dmitrovskaya', 'm_riga'],
  },

    // ══════════════════════════════════════════════════════════════
  // ГОРЬКОВСКОЕ НАПРАВЛЕНИЕ
  // ══════════════════════════════════════════════════════════════
  {
    id: 'gorky',
    name: 'Горьковское направление',
    color: '#1bc7e5',
    kind: 'cppk',
    path: [
      'm_kursk', 'moskva_tovarnaya', 'nizhegorodskaya', 'chukhlinka',
      'kuskovo', 'novogireevo', 'reutov', 'nikolskoe', 'saltykovskaya',
      'kuchino', 'olgino', 'zheleznodorozhnaya', 'chernoye', 'zarya',
      'kupavna', 'vishnyakovo', 'elektrougli', 'poselok_vorovskogo',
      'khrapunovo', 'esino', 'fryazevo', 'kazanskoe', 'vokhna',
      'lenskaya', 'nazarevo', 'drezna', 'kabanovo', 'malinovskie_luga',
      'orekhovo_zuevo', 'krutoe', 'voynovo', 'usad', 'glubokovo',
      'pokrov', 'novoe_perepochino', 'omutishche', 'leonovo', 'petushki',
      'kosterovo', 'boldino', 'sushnevo', 'krasnaya_okhota', 'undol',
      'ugor', 'koloksha', 'yuryevets', 'vladimir'
    ],
  },
  {
    id: 'gorky_balashikha',
    name: 'Ветка в Балашиху',
    color: '#1bc7e5',
    kind: 'cppk',
    path: ['reutov', 'stroyka', 'gorneki', 'balashikha'],
  },
  {
    id: 'gorky_zakharovo',
    name: 'Ветка в Захарово',
    color: '#1bc7e5',
    kind: 'cppk',
    path: ['fryazevo', 'metallurg', 'elektrostal', 'mashinostroitel', 'noginsk', 'zakharovo'],
  },
  {
    id: 'gorky_elektrogorsk',
    name: 'Ветка в Электрогорск',
    color: '#1bc7e5',
    kind: 'cppk',
    path: ['lenskaya', 'kovrigino', 'km14_gorky', 'elektrogorsk'],
  },
  
  // ══════════════════════════════════════════════════════════════
  // МЦД-1 (Лобня — Одинцово) — overlay поверх Савёловского и Белорусского
  // ══════════════════════════════════════════════════════════════
  {
    id: 'mcd1',
    name: 'МЦД-1',
    color: '#F5A623',   // оранжевый
    kind: 'mcd',
    path: [
      'lobnya', 'sheremetyevskaya', 'hlebnikovo', 'vodniki',
      'dolgoprudnaya', 'novodachnaya', 'mark', 'lianozovo',
      'beskudnikovo', 'degunino', 'okruzhnaya', 'timiryazevskaya',
      'm_sav', 'm_bel', 'begovaya', 'testovskaya', 'fili', 'slavyansky_bulvar',
      'kuntsevskaya', 'rabochiy_poselok', 'setun', 'nemchinovka',
      'skolkovo', 'bakovka', 'odintsovo',
    ],
  },
  // ══════════════════════════════════════════════════════════════
  // МЦД-2 (Нахабино — Подольск) — overlay поверх Рижского и Курского
  // ══════════════════════════════════════════════════════════════
  {
    id: 'mcd2',
    name: 'МЦД-2',
    color: '#E91E63',   // насыщенный розовый
    kind: 'mcd',
    path: [
      'nahabino', 'anikeevka', 'opalikha', 'krasnogorskaya',
      'pavshino', 'penyagino', 'volokolamskaya', 'trikotazhnaya',
      'tushinskaya', 'shchukinskaya', 'streshnevo', 'krasny_balties',
      'grazhdanskaya', 'dmitrovskaya', 'marya_roshcha', 'rizhskaya',
      'ploshchad_trekh_vokzalov', 'm_kursk', 'moskva_tovarnaya',
      'kalitniki', 'novokhokhlovskaya', 'tekstilshchiki', 'pechatniki',
      'lyublino', 'depo_kursk', 'pererva', 'kuryanovo', 'moskvorechye',
      'tsaritsyno', 'pokrovskoe', 'krasny_stroitel', 'bittsa', 'butovo',
      'shcherbinka', 'ostafyevo', 'silikatnaya', 'podolsk',
    ],
  },
    // ══════════════════════════════════════════════════════════════
  // ЛЕНИНГРАДСКОЕ НАПРАВЛЕНИЕ
  // ══════════════════════════════════════════════════════════════
  {
    id: 'len',
    name: 'Ленинградское направление',
    color: '#8B7355',
    kind: 'cppk',
    path: [
      'ploshchad_trekh_vokzalov', 'ostankino', 'petrovsko_razumovskaya', 'likhobory',
      'mosselsmash', 'grachyovskaya', 'hovrino', 'levoberezhnaya',
      'himki', 'molzhaninovo', 'novopodrezkovo', 'podrezkovo', 'shodnya',
      'firsanovskaya', 'malino', 'zelenograd_krukovo', 'alabushevo',
      'radishchevo', 'povarovka', 'povarovo1', 'beryozki_dachnye',
      'podsolnechnaya', 'senezh', 'golovkovo', 'pokrovka', 'frolovskoe',
      'streglovo', 'klin', 'yamuga', 'reshetnikovo', 'chernichnaya',
      'zavidovo', 'moskovskoe_more', 'redkino', 'mezhevo', 'kuzminka',
      'chupriyanovka', 'lazurnaya', 'tver',
    ],
  },
  {
    id: 'len_konakovo',
    name: 'Ветка в Конаково',
    color: '#8B7355',
    kind: 'cppk',
    path: [
      'reshetnikovo', 'puteprovodnaya', 'konakovskiy_moh',
      'donhovka', 'konakovo_gres',
    ],
  },
  // ══════════════════════════════════════════════════════════════
  // МЦД-3 (Митьково, между Ленинградским и Казанским)
  // ══════════════════════════════════════════════════════════════
  {
    id: 'mcd3',
    name: 'МЦД-3',
    color: '#E5231B',
    kind: 'mcd',
    path: [
      'petrovsko_razumovskaya', 'ostankino', 'mitkovo',
      'elektrozavodskaya', 'sortirovochnaya', 'aviamotornaya',
      'andronovka', 'perovo', 'plyushchevo', 'veshnyaki',
      'vykhino', 'kosino', 'ukhtomskaya', 'lyubertsy1',
      'panki', 'tomilino', 'kraskovo', 'malakhovka', 'udelnaya',
      'bykovo', 'ilyinskaya', 'otdykh', 'kratovo', 'eseninskaya',
      'fabrichnaya', 'ramenskoye', 'ippodrom',
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // КАЗАНСКОЕ НАПРАВЛЕНИЕ
  // От Комсомольской площади на ЮВ. Пока только до Люберец-1.
  // ══════════════════════════════════════════════════════════════
  {
    id: 'kaz',
    name: 'Казанское направление',
    color: '#00A651',
    kind: 'cppk',
    path: [
      'ploshchad_trekh_vokzalov',
      'elektrozavodskaya', 'sortirovochnaya', 'aviamotornaya',
      'andronovka', 'perovo', 'plyushchevo', 'veshnyaki',
      'vykhino', 'kosino', 'ukhtomskaya', 'lyubertsy1',
      'panki', 'tomilino', 'kraskovo', 'malakhovka', 'udelnaya',
      'bykovo', 'ilyinskaya', 'otdykh', 'kratovo', 'eseninskaya',
      'fabrichnaya', 'ramenskoye', 'ippodrom',
      'sovkhoz', 'zagornovo', 'bronnitsy', 'raduga', 'tsibino_63',
      'beloozerskaya', 'faustovo', 'zolotovo', 'vinogradovo',
      'konobeevo', 'trofimovo_84', 'km88', 'voskresensk',
      'lopatino', 'shifernaya', 'ilyinsky_pogost', 'tsemgigant',
      'peski', 'konev_bor', 'khoroshevo', 'amerevo_113', 'kolomna',
      'golutvin', 'shchurovo', 'chyornaya',
      'lukhovitsy', 'km142', 'podlipki_kaz', 'fruktovaya', 'alpatyevo',
      'slyomy', 'divovo', 'istodniki', 'km179', 'rybnoye',
      'khodynino', 'depo_ryazan', 'ryazan_sort', 'km187', 'km189',
      'nedostoevo', 'dyagilevo', 'lagerny', 'ryazan_1',
    ],
  },
  // ══════════════════════════════════════════════════════════════
  // ВЕТКА В РЯЗАНЬ-2
  // Ответвление от Лагерного на СВ, на Мичуринец, Ростов-на-Дону и т.д.
  // ══════════════════════════════════════════════════════════════
  {
    id: 'kaz_ryazan2',
    name: 'Ветка в Рязань-2',
    color: '#00A651',
    kind: 'cppk',
    path: ['lagerny', 'ryazan_2'],
  },

  // ══════════════════════════════════════════════════════════════
  // КАЗАНСКИЙ ХОД
  // Ответвление от Люберец-1 через Люберцы-2, идёт параллельно
  // основному Рязанскому ходу. Пока только до Куровской.
  // ══════════════════════════════════════════════════════════════
  {
    id: 'kaz_khod',
    name: 'Казанский ход',
    color: '#00A651',
    kind: 'cppk',
      path: [
      'lyubertsy1', 'lyubertsy2',
      'korenyovo', 'ovrazhki', 'rodniki', 'vyalki',
      'khripan', 'km41_kaz', 'donino',
      'igumnovo_49', 'km52', 'grigorovo', 'gzhel_istochniki_55',
      'gzhel', 'ignatyevo', 'kuzyayevo',
      'shevlyagino', 'smolevo',
      'antsiferovo', 'podosinki',
      'kurovskaya',
      'lokomotivnoe_depo_90', 'belivo', 'avsyunino',
      'zapolitsy', 'zaputnaya', 'shaturtorf', 'shatura',
      'botino', 'krivandino',
      'tugolesye', 'voymezhny', 'cherusti',
      'struya', 'tasin', 'ilichyov', 'torfoprodukt',
      'miltsevo', 'nechaevskaya', 'vekovka',
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // ВЕТКА В РЯЗАНОВКУ
  // Ответвление от Кривандина на СВ. Тройка не работает.
  // ══════════════════════════════════════════════════════════════
  {
    id: 'kaz_ryazanovka',
    name: 'Ветка в Рязановку',
    color: '#00A651',
    kind: 'cppk',
    path: [
      'krivandino',
      'osanovo', 'km15_kaz', 'pozhoga', 'km29_kaz',
      'barmino', 'sazonovo', 'km47_kaz', 'ryazanovka',
    ],
  },
  // ══════════════════════════════════════════════════════════════
  // ВЕТКА В ОЗЁРЫ
  // Ответвление от Голутвина на ЮЗ. Тройка не работает.
  // ══════════════════════════════════════════════════════════════
  {
    id: 'kaz_ozery',
    name: 'Ветка в Озёры',
    color: '#00A651',
    kind: 'cppk',
    path: [
      'golutvin',
      'bachmanovo', 'proezd_stankostroiteley_6', 'sychyovo', 'lystsevskaya',
      'semyonovsky',
      'posyolok_lesnoy_18', 'karasyovo', 'kudryavtsevo', 'danilovskaya',
      'kholmy_30', 'km38_kaz', 'ozyory',
    ],
  },

      // ══════════════════════════════════════════════════════════════
  // МЦД-4
  // Западный участок (Апрелевка — Поклонная — Кутузовская —
  // Тестовская) подключён в маршрутизатор. Восточный (через
  // Курский и Комсомольскую) пока только на схеме.
  // ══════════════════════════════════════════════════════════════
  {
    id: 'mcd4',
    name: 'МЦД-4',
    color: '#7DC242',
    kind: 'mcd',
    path: [
      'aprelevka',                // Западная конечная МЦД-4, граница МЦД
      'pobeda',
      'krekshino',
      'sanino',
      'kokoshkino',
      'tolstopaltsevo',
      'lesnoy_gorodok',
      'vnukovo',
      'michurinets',
      'peredelkino',
      'solnechnaya',
      'meshcherskaya',
      'ochakovo',
      'aminievskaya',
      'matveevskaya',
      'minskaya',
      'poklonnaya',               // стыковка с Киевским направлением
      'kutuzovskaya_4',           // Кутузовская (в будущем — МЦК)
      'testovskaya',              // Москва-Сити
      'm_bel',                    // Белорусский вокзал
      'm_sav',                    // Савёловский вокзал
      'marya_roshcha',            // Марьина Роща
      'ploshchad_trekh_vokzalov', // Комсомольская площадь
      'm_kursk',                  // Курский вокзал
      'moskva_tovarnaya',         // Серп и Молот
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // КИЕВСКОЕ НАПРАВЛЕНИЕ
  // ══════════════════════════════════════════════════════════════
  {
    id: 'kiev',
    name: 'Киевское направление',
    color: '#3B82F6',
    kind: 'cppk',
    path: [
      'm_kiev', 'poklonnaya', 'minskaya', 'matveevskaya', 'aminievskaya',
      'ochakovo', 'meshcherskaya', 'solnechnaya', 'peredelkino',
      'michurinets', 'vnukovo', 'lesnoy_gorodok', 'tolstopaltsevo',
      'kokoshkino', 'sanino', 'krekshino', 'pobeda', 'aprelevka',
      'dachnaya', 'alabino', 'selyatino', 'rassudovo', 'ozhigovo',
      'bekasovo_1', 'zosimova_pustyn', 'nara', 'latyshskaya', 'bashkino',
      'vorsino', 'balabanovo', 'obninskoe', 'shemyakino', 'maloyaroslavets',
      'erdenevo', 'km140', 'suhodrev', 'rodinka', 'slyadnevo',
      'km167', 'tikhonova_pustyn', 'muratovka', 'sadovaya_k', 'azarovo',
      'kaluga_1',
    ],
  },
  {
    id: 'kiev_novoperedelkino',
    name: 'Ветка на Новопеределкино',
    color: '#3B82F6',
    kind: 'cppk',
    path: ['solnechnaya', 'novoperedelkino'],
  },
  {
    id: 'kiev_aero',
    name: 'Экспресс в аэропорт Внуково',
    color: '#3B82F6',
    kind: 'cppk',
    path: ['lesnoy_gorodok', 'vnukovo_junction', 'aeroport_staraya', 'vnukovo_airport'],
  },
];