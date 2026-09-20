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
    id: 'monino',
    name: 'Монинский ход',
    color: '#E5231B',
    kind: 'cppk',
    path: [
      'mytishchi', 'podlipki', 'bolshevo', 'valentinovka',
      'zagoryanskaya', 'sokolovskaya', 'voronok', 'shchelkovo',
      'gagarinskaya', 'chkalovskaya', 'bakhchivandzhi', 'tsiolkovskaya',
      'monino', 'kashino', 'kolontaevo', 'lesnaya', 'fryazevo',
    ],
  },
  {
    id: 'fryazino',
    name: 'Фрязинский ход',
    color: '#E5231B',
    kind: 'cppk',
    path: [
      'bolshevo', 'fabrika1maya', 'zelyony_bor', 'ivanteevka2',
      'ivanteevka', 'detskaya', 'fryazino_tov', 'fryazino',
    ],
  },
  {
    id: 'krasnoarmeysk',
    name: 'Красноармейская ветка',
    color: '#E5231B',
    kind: 'cppk',
    path: [
      'sofrino', 'poselok_dalniy', 'rahmanovo',
      'fedorovskoe', 'putilovo', 'krasnoarmeysk',
    ],
  },
];