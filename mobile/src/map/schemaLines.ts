export interface SchemaLine {
  id: string;
  name: string;
  color: string;
  kind: 'cppk' | 'mcd' | 'mcc' | 'metro';
  path: string[];
}

export const LINES: SchemaLine[] = [
  {
    id: 'yar',
    name: 'Ярославское направление',
    color: '#E5231B',
    kind: 'cppk',
    path: [
      'm_yar', 'moscow3', 'malenkovskaya', 'yauza', 'rostokino',
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
  {
    id: 'pav',
    name: 'Павелецкое направление',
    color: '#00A651',
    kind: 'cppk',
    path: [
      'm_pav', 'derbenevskaya', 'tulskaya', 'varshavskaya',
      'verhnie_kotly', 'nagatinskaya', 'kolomenskoye', 'chertanovo',
      'biryulyovo_tov', 'biryulyovo_pass', 'bulatnikovo', 'rastorguevo', 'kalinina',
      'leninskaya', 'km32', 'domodedovo', 'aviacionnaya', 'kosmos', 'aeroport_domodedovo',
      'vzlyotnaya', 'vostryakovo', 'belye_stolby', 'barybino',
      'danilovo_52', 'privalovo', 'velyaminovo', 'mihnevo', 'shugarovo',
      'km85', 'zhilyovo', 'sitenka',
      'stupino', 'akri', 'belopesotsky', 'kashira',
      'tesna', 'ozherelye', 'zubovo_121',
      'purlovo', 'kolmenka_131', 'topkanovo', 'km137',
      'bogatishchevo', 'km146', 'korovino',
      'novosyolki_152', 'uzunovo',
    ],
  },
// ─── АЭРОЭКСПРЕСС (отдельная линия) ─────────────────────
  {
    id: 'pav_aero',
    name: 'Аэроэкспресс',
    color: '#00A651',
    kind: 'cppk',
    path: ['m_pav', 'verhnie_kotly', 'aviacionnaya', 'kosmos', 'aeroport_domodedovo'],
  },
  
  {
    id: 'pav_aero_sub',
    name: 'Электричка до аэропорта',
    color: '#00A651',
    kind: 'cppk',
    path: ["domodedovo", 'aviacionnaya', "kosmos", "aeroport_domodedovo"],
  },
];