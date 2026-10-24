export interface MetroLine {
  id: number;      // Номер линии (1-15)
  name: string;    // Название
  shortName?: string; // Сокращение (для БКЛ и МЦК)
}

export const METRO_TRANSFERS: Record<string, MetroLine[]> = {
  // ─── Вокзалы ───
  m_kursk: [
    { id: 3, name: 'Арбатско-Покровская' },
    { id: 5, name: 'Кольцевая' },
    { id: 10, name: 'Люблинско-Дмитровская' },
  ],
  ploshchad_trekh_vokzalov: [
    { id: 1, name: 'Сокольническая' },
    { id: 5, name: 'Кольцевая' },
  ],
  m_bel: [
    { id: 2, name: 'Замоскворецкая' },
    { id: 5, name: 'Кольцевая' },
  ],
  m_kiev: [
    { id: 3, name: 'Арбатско-Покровская' },
    { id: 4, name: 'Филёвская' },
    { id: 5, name: 'Кольцевая' },
  ],
  m_pav: [
    { id: 2, name: 'Замоскворецкая' },
    { id: 5, name: 'Кольцевая' },
  ],
  m_kaz: [
    { id: 1, name: 'Сокольническая' },
  ],
  m_yar: [
    { id: 1, name: 'Сокольническая' },
    { id: 5, name: 'Кольцевая' },
  ],
  m_sav: [
    { id: 9, name: 'Серпуховско-Тимирязевская' },
    { id: 11, name: 'Большая Кольцевая Линия', shortName: 'БКЛ' },
  ],
  m_len: [
    { id: 1, name: 'Сокольническая' },
    { id: 5, name: 'Кольцевая' },
  ],
  m_riga: [
    { id: 6, name: 'Калужско-Рижская' },
    { id: 11, name: 'Большая Кольцевая Линия', shortName: 'БКЛ' },
  ],

  // ─── Крупные узлы и МЦД ───
  kutuzovskaya_4: [
    { id: 4, name: 'Филёвская' },
    { id: 14, name: 'Московское центральное кольцо', shortName: 'МЦК' },
  ],
  testovskaya: [
    { id: 4, name: 'Филёвская' }, // Выставочная
    { id: 11, name: 'Большая Кольцевая Линия', shortName: 'БКЛ' }, // Деловой центр
    { id: 14, name: 'Московское центральное кольцо', shortName: 'МЦК' },
  ],
  rostokino: [
    { id: 14, name: 'Московское центральное кольцо', shortName: 'МЦК' },
  ],
  rizhskaya: [
    { id: 6, name: 'Калужско-Рижская' },
    { id: 11, name: 'Большая Кольцевая Линия', shortName: 'БКЛ' },
  ],
  marya_roshcha: [
    { id: 10, name: 'Люблинско-Дмитровская' },
    { id: 11, name: 'Большая Кольцевая Линия', shortName: 'БКЛ' },
  ],
  poklonnaya: [
    { id: 3, name: 'Арбатско-Покровская' }, // Парк Победы
    { id: 8, name: 'Солнцевская' }, // Парк Победы
    { id: 11, name: 'Большая Кольцевая Линия', shortName: 'БКЛ' },
  ],
  minskaya: [
    { id: 8, name: 'Калининско-Солнцевская' },
  ],
  aminievskaya: [
    { id: 11, name: 'Большая Кольцевая Линия', shortName: 'БКЛ' },
  ],
  solnechnaya: [
    { id: 8, name: 'Солнцевская' }, // Солнцево
  ],
  novoperedelkino: [
    { id: 8, name: 'Солнцевская' },
  ],
  tsaritsyno: [
    { id: 2, name: 'Замоскворецкая' },
  ],
  tekstilshchiki: [
    { id: 7, name: 'Таганско-Краснопресненская' },
  ],
  pechatniki: [
    { id: 10, name: 'Люблинско-Дмитровская' },
    { id: 11, name: 'Большая Кольцевая Линия', shortName: 'БКЛ' },
  ],
  fili: [
    { id: 4, name: 'Филёвская' },
  ],
  butovo: [
    { id: 12, name: 'Бутовская'},
  ],
  krasny_stroitel: [
    { id: 9, name: 'Серпуховско-Тимирязевская' },
  ],
  kuntsevskaya: [
    { id: 3, name: 'Арбатско-Покровская' },
    { id: 4, name: 'Филёвская' },
    { id: 11, name: 'Большая Кольцевая Линия', shortName: 'БКЛ' },
  ],
  slavyansky_bulvar: [
    { id: 3, name: 'Арбатско-Покровская' },
  ],
  vykhino: [
    { id: 7, name: 'Таганско-Краснопресненская' },
  ],
  kosino: [
    { id: 7, name: 'Таганско-Краснопресненская' }, // Лермонтовский проспект
    { id: 15, name: 'Некрасовская' }, // Косино
  ],
  elektrozavodskaya: [
    { id: 3, name: 'Арбатско-Покровская' },
    { id: 11, name: 'Большая Кольцевая Линия', shortName: 'БКЛ' },
  ],
  aviamotornaya: [
    { id: 8, name: 'Калининская' },
    { id: 11, name: 'Большая Кольцевая Линия', shortName: 'БКЛ' },
  ],
  nizhegorodskaya: [
    { id: 11, name: 'Большая Кольцевая Линия', shortName: 'БКЛ' },
    { id: 14, name: 'Московское Центральное Кольцо', shortName: 'МЦК' },
    { id: 15, name: 'Некрасовская' },
  ],
  okruzhnaya: [
    { id:10 ,name: 'Люблинско-Дмитровская'},
    { id: 14, name: 'Московское Центральное Кольцо', shortName: 'МЦК' },
  ],
  andronovka: [
    { id: 14, name: 'Московское Центральное Кольцо', shortName: 'МЦК' },
  ],
  novokhokhlovskaya: [
    { id: 14, name: 'Московское Центральное Кольцо', shortName: 'МЦК' },
  ],
  likhobory: [
    { id: 14, name: 'Московское Центральное Кольцо', shortName: 'МЦК' },
  ],
  begovaya: [
    { id: 7, name: 'Таганско-Краснопресненская' },
  ],
  verhnie_kotly: [
    { id: 9, name: 'Серпуховско-Тимирязевская' },
    { id: 14, name: 'Московское Центральное Кольцо', shortName: 'МЦК' },
  ],
  streshnevo: [
    { id: 2, name: 'Замоскворецкая' },
    { id: 14, name: 'Московское Центральное Кольцо', shortName: 'МЦК' },
  ],
  tulskaya: [
    { id: 9, name: 'Серпуховско-Тимирязевская' },
  ],
  nagatinskaya: [
    { id: 9, name: 'Серпуховско-Тимирязевская' },
  ],
  varshavskaya: [
    { id: 11, name: 'Большая Кольцевая Линия', shortName: 'БКЛ' },
  ],
  petrovsko_razumovskaya: [
    { id: 9, name: 'Серпуховско-Тимирязевская' },
    { id: 10, name: 'Люблинско-Дмитровская' },
  ],
  dmitrovskaya: [
    { id: 9, name: 'Серпуховско-Тимирязевская' },
  ],
  timiryazevskaya: [
    { id: 9, name: 'Серпуховско-Тимирязевская' },
  ],
  shchukinskaya: [
    { id: 7, name: 'Таганско-Краснопресненская' },
  ],
  moskva_tovarnaya: [
    { id: 8, name: 'Калининская' },
    { id: 10, name: 'Люблинско-Дмитровская' },
  ],
  tushinskaya: [
    { id: 7, name: 'Таганско-Краснопресненская' },
  ],
  volokolamskaya: [
    { id: 3, name: 'Арбатско-Покровская' },
  ],
  hovrino: [
    { id: 2, name: 'Замоскворецкая' },
  ],
  mitkovo: [
    { id: 1, name: 'Сокольническая' },
    { id: 11, name: 'Большая Кольцевая Линия', shortName: 'БКЛ' },
  ],
  novogireevo: [
    { id: 8, name: 'Калининская' },
  ],
  reutov: [
    { id: 8, name: 'Калининская' },
  ],
  lianozovo: [
    { id: 10, name: 'Люблинско-Дмитровская' },
  ]
};