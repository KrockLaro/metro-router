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
      'm_sav', 'm_bel', 'begovaya', 'testovskaya', 'fili',
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
    path: ['m_len', 'mitkovo', 'm_kaz'],
  },
];