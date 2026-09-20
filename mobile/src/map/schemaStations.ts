export type Accessibility = 'full' | 'partial' | 'none';
export type StationOrientation = 'right' | 'left' | 'bottom' | 'top';

export interface StationFacilities {
  wheelchair: Accessibility;
  ticketOffice: boolean;
  ticketMachines: boolean;
  turnstiles: boolean;
  lifts: number;
  escalators: number;
  wc: boolean;
  waitingRoom: boolean;
  wifi: boolean;
  parking: boolean;
  bikeRacks: boolean;
  luggageStorage: boolean;
  helpDesk: boolean;
  troikaPayment: boolean;
}

export interface SchemaStation {
  id: string;
  name: string;
  x: number;
  y: number;
  lines: string[];
  facilities: StationFacilities;
  lat: number;
  lon: number;
  orientation?: StationOrientation;
  zone?: number;
  expressStop?: boolean;
  isBranch?: boolean;
  branchId?: string;
}

const baseStation: Omit<
  SchemaStation,
  'id' | 'name' | 'x' | 'y' | 'lines' | 'lat' | 'lon'
> = {
  facilities: {
    wheelchair: 'partial',
    ticketOffice: true,
    ticketMachines: true,
    turnstiles: true,
    lifts: 0,
    escalators: 0,
    wc: false,
    waitingRoom: false,
    wifi: false,
    parking: false,
    bikeRacks: true,
    luggageStorage: false,
    helpDesk: false,
    troikaPayment: true,
  },
  zone: 1,
  expressStop: false,
  isBranch: false,
  orientation: 'right',
};

const expressStations = [
  'm_yar', 'rostokino', 'losinoostrovskaya', 'mytishchi', 'podlipki',
  'bolshevo', 'ivanteevka2', 'fryazino',
  'pushkino', 'sofrino', 'hotkovo', 'sergiev_posad',
  'aleksandrov', 'balakirevo',
  'monino', 'fryazevo',
];

const S = (
  id: string,
  name: string,
  x: number,
  y: number,
  lineId: string,
  zone: number,
  options: Partial<SchemaStation> = {},
): SchemaStation => {
  const base: SchemaStation = {
    ...baseStation,
    id,
    name,
    x,
    y,
    lines: [lineId],
    zone,
    lat: 0,
    lon: 0,
    expressStop: expressStations.includes(id),
  };
  return { ...base, ...options };
};

export const STATIONS: Record<string, SchemaStation> = {
  // ============================================================
  // ОСНОВНОЙ ХОД (вертикальный, X = 1000)
  // ============================================================
  m_yar: S('m_yar', 'Москва Ярославская', 1000, 100, 'yar', 0, { orientation: 'right', expressStop: true }),
  moscow3: S('moscow3', 'Москва-3', 1000, 140, 'yar', 0, { orientation: 'right' }),
  malenkovskaya: S('malenkovskaya', 'Маленковская', 1000, 180, 'yar', 0, { orientation: 'right' }),
  yauza: S('yauza', 'Яуза', 1000, 220, 'yar', 0, { orientation: 'right' }),
  rostokino: S('rostokino', 'Ростокино', 1000, 260, 'yar', 1, { orientation: 'right' }),
  losinoostrovskaya: S('losinoostrovskaya', 'Лосиноостровская', 1000, 300, 'yar', 1, { orientation: 'right', expressStop: true }),
  los: S('los', 'Лось', 1000, 340, 'yar', 2, { orientation: 'right' }),
  perlovskaya: S('perlovskaya', 'Перловская', 1000, 380, 'yar', 2, { orientation: 'right' }),
  tayninskaya: S('tayninskaya', 'Тайнинская', 1000, 420, 'yar', 3, { orientation: 'left' }),
  mytishchi: S('mytishchi', 'Мытищи', 1000, 460, 'yar', 3, { orientation: 'left', expressStop: true }),
  stroitel: S('stroitel', 'Строитель', 1000, 500, 'yar', 3, { orientation: 'right' }),
  chelyuskinskaya: S('chelyuskinskaya', 'Челюскинская', 1000, 540, 'yar', 3, { orientation: 'right' }),
  tarasovskaya: S('tarasovskaya', 'Тарасовская', 1000, 580, 'yar', 4, { orientation: 'right' }),
  klyazma: S('klyazma', 'Клязьма', 1000, 620, 'yar', 4, { orientation: 'right' }),
  mamontovskaya: S('mamontovskaya', 'Мамонтовская', 1000, 660, 'yar', 4, { orientation: 'right' }),
  pushkino: S('pushkino', 'Пушкино', 1000, 700, 'yar', 4, { orientation: 'right', expressStop: true }),
  zavety_ilyicha: S('zavety_ilyicha', 'Заветы Ильича', 1000, 740, 'yar', 5, { orientation: 'right' }),
  pravda: S('pravda', 'Правда', 1000, 780, 'yar', 5, { orientation: 'right' }),
  zelenogradskaya: S('zelenogradskaya', 'Зеленоградская', 1000, 820, 'yar', 5, { orientation: 'right' }),
  km43: S('km43', 'Нагорное (43 км)', 1000, 860, 'yar', 5, { orientation: 'right' }),
  sofrino: S('sofrino', 'Софрино', 1000, 900, 'yar', 6, { orientation: 'left', expressStop: true }),
  ashukinskaya: S('ashukinskaya', 'Ашукинская', 1000, 940, 'yar', 6, { orientation: 'right' }),
  kalistovo: S('kalistovo', 'Калистово', 1000, 980, 'yar', 6, { orientation: 'right' }),
  radonezh: S('radonezh', 'Радонеж', 1000, 1020, 'yar', 6, { orientation: 'right' }),
  abramtsevo: S('abramtsevo', 'Абрамцево', 1000, 1060, 'yar', 7, { orientation: 'right' }),
  hotkovo: S('hotkovo', 'Хотьково', 1000, 1100, 'yar', 7, { orientation: 'right', expressStop: true }),
  semhoz: S('semhoz', 'Семхоз', 1000, 1140, 'yar', 8, { orientation: 'right' }),
  sergiev_posad: S('sergiev_posad', 'Сергиев Посад', 1000, 1180, 'yar', 8, { orientation: 'right', expressStop: true }),

  // После Сергиева Посада — Тройка не работает
  km76: S('km76', 'Топорково (76 км)', 1000, 1220, 'yar', 9, {
    orientation: 'right',
    facilities: { ...baseStation.facilities, troikaPayment: false },
  }),
  km81: S('km81', 'Дубининское (81 км)', 1000, 1260, 'yar', 9, {
    orientation: 'right',
    facilities: { ...baseStation.facilities, troikaPayment: false },
  }),
  km83: S('km83', '83 км', 1000, 1300, 'yar', 9, {
    orientation: 'right',
    facilities: { ...baseStation.facilities, troikaPayment: false },
  }),
  buzhaninovo: S('buzhaninovo', 'Бужаниново', 1000, 1340, 'yar', 10, {
    orientation: 'right',
    facilities: { ...baseStation.facilities, troikaPayment: false },
  }),
  km90: S('km90', 'Шубино (90 км)', 1000, 1380, 'yar', 10, {
    orientation: 'right',
    facilities: { ...baseStation.facilities, troikaPayment: false },
  }),
  arsaki: S('arsaki', 'Арсаки', 1000, 1420, 'yar', 11, {
    orientation: 'right',
    facilities: { ...baseStation.facilities, troikaPayment: false },
  }),
  strunino: S('strunino', 'Струнино', 1000, 1460, 'yar', 11, {
    orientation: 'right',
    facilities: { ...baseStation.facilities, troikaPayment: false },
  }),
  aleksandrov: S('aleksandrov', 'Александров-1', 1000, 1500, 'yar', 12, {
    orientation: 'right',
    expressStop: true,
    facilities: { ...baseStation.facilities, troikaPayment: false },
  }),
  balakirevo: S('balakirevo', 'Балакирево', 1000, 1540, 'yar', 14, {
    orientation: 'right',
    expressStop: true,
    facilities: { ...baseStation.facilities, troikaPayment: false },
  }),

  // ============================================================
  // МОНИНСКИЙ ХОД — вправо от Мытищ (Y = 460)
  // ============================================================
  podlipki: S('podlipki', 'Подлипки-Дачные', 1100, 460, 'yar', 3, {
    orientation: 'top',
    expressStop: true,
    isBranch: true,
    branchId: 'monino',
  }),
  bolshevo: S('bolshevo', 'Болшево', 1200, 460, 'yar', 3, {
    orientation: 'bottom',
    expressStop: true,
  }),
  valentinovka: S('valentinovka', 'Валентиновка', 1300, 460, 'yar', 4, {
    orientation: 'top',
    isBranch: true,
    branchId: 'monino',
  }),
  zagoryanskaya: S('zagoryanskaya', 'Загорянская', 1400, 460, 'yar', 4, {
    orientation: 'bottom',
    isBranch: true,
    branchId: 'monino',
  }),
  sokolovskaya: S('sokolovskaya', 'Соколовская', 1500, 460, 'yar', 4, {
    orientation: 'top',
    isBranch: true,
    branchId: 'monino',
  }),
  voronok: S('voronok', 'Воронок', 1600, 460, 'yar', 5, {
    orientation: 'bottom',
    isBranch: true,
    branchId: 'monino',
  }),
  shchelkovo: S('shchelkovo', 'Щёлково', 1700, 460, 'yar', 5, {
    orientation: 'top',
    isBranch: true,
    branchId: 'monino',
  }),
  gagarinskaya: S('gagarinskaya', 'Гагаринская', 1800, 460, 'yar', 5, {
    orientation: 'bottom',
    isBranch: true,
    branchId: 'monino',
  }),
  chkalovskaya: S('chkalovskaya', 'Чкаловская', 1900, 460, 'yar', 5, {
    orientation: 'top',
    isBranch: true,
    branchId: 'monino',
  }),
  bakhchivandzhi: S('bakhchivandzhi', 'Бахчиванджи', 2000, 460, 'yar', 5, {
    orientation: 'bottom',
    isBranch: true,
    branchId: 'monino',
  }),
  tsiolkovskaya: S('tsiolkovskaya', 'Циолковская', 2100, 460, 'yar', 6, {
    orientation: 'top',
    isBranch: true,
    branchId: 'monino',
  }),
  monino: S('monino', 'Монино', 2200, 460, 'yar', 6, {
    orientation: 'bottom',
    expressStop: true,
    isBranch: true,
    branchId: 'monino',
  }),

  // После Монино — Тройка не работает
  kashino: S('kashino', 'Кашино', 2300, 460, 'yar', 7, {
    orientation: 'top',
    isBranch: true,
    branchId: 'monino',
    facilities: { ...baseStation.facilities, troikaPayment: false },
  }),
  kolontaevo: S('kolontaevo', 'Колонтаево', 2400, 460, 'yar', 7, {
    orientation: 'bottom',
    isBranch: true,
    branchId: 'monino',
    facilities: { ...baseStation.facilities, troikaPayment: false },
  }),
  lesnaya: S('lesnaya', 'Лесная', 2500, 460, 'yar', 7, {
    orientation: 'top',
    isBranch: true,
    branchId: 'monino',
    facilities: { ...baseStation.facilities, troikaPayment: false },
  }),
  fryazevo: S('fryazevo', 'Фрязево', 2600, 460, 'yar', 8, {
    orientation: 'bottom',
    expressStop: true,
    isBranch: true,
    branchId: 'monino',
    facilities: { ...baseStation.facilities, troikaPayment: false },
  }),

  // ============================================================
  // ФРЯЗИНСКИЙ ХОД — от Болшево вверх, потом вправо (Y = 350)
  // ============================================================
  fabrika1maya: S('fabrika1maya', 'Фабрика 1 Мая', 1200, 350, 'yar', 3, {
    orientation: 'top',
    isBranch: true,
    branchId: 'fryazino',
  }),
  zelyony_bor: S('zelyony_bor', 'Зелёный Бор', 1350, 350, 'yar', 3, {
    orientation: 'bottom',
    isBranch: true,
    branchId: 'fryazino',
  }),
  ivanteevka2: S('ivanteevka2', 'Ивантеевка-2', 1500, 350, 'yar', 4, {
    orientation: 'top',
    expressStop: true,
    isBranch: true,
    branchId: 'fryazino',
  }),
  ivanteevka: S('ivanteevka', 'Ивантеевка', 1650, 350, 'yar', 4, {
    orientation: 'bottom',
    isBranch: true,
    branchId: 'fryazino',
  }),
  detskaya: S('detskaya', 'Детская', 1800, 350, 'yar', 4, {
    orientation: 'top',
    isBranch: true,
    branchId: 'fryazino',
  }),
  fryazino_tov: S('fryazino_tov', 'Фрязино-Тов.', 1950, 350, 'yar', 4, {
    orientation: 'bottom',
    isBranch: true,
    branchId: 'fryazino',
  }),
  fryazino: S('fryazino', 'Фрязино-Пасс.', 2100, 350, 'yar', 4, {
    orientation: 'top',
    expressStop: true,
    isBranch: true,
    branchId: 'fryazino',
  }),

  // ============================================================
  // КРАСНОАРМЕЙСКАЯ ВЕТКА — вправо от Софрино (Y = 900)
  // Тройка не работает на всей ветке
  // ============================================================
  poselok_dalniy: S('poselok_dalniy', 'Посёлок Дальний', 1150, 900, 'yar', 7, {
    orientation: 'top',
    isBranch: true,
    branchId: 'krasnoarmeysk',
    facilities: { ...baseStation.facilities, troikaPayment: false },
  }),
  rahmanovo: S('rahmanovo', 'Рахманово', 1300, 900, 'yar', 7, {
    orientation: 'bottom',
    isBranch: true,
    branchId: 'krasnoarmeysk',
    facilities: { ...baseStation.facilities, troikaPayment: false },
  }),
  fedorovskoe: S('fedorovskoe', 'Фёдоровское', 1450, 900, 'yar', 7, {
    orientation: 'top',
    isBranch: true,
    branchId: 'krasnoarmeysk',
    facilities: { ...baseStation.facilities, troikaPayment: false },
  }),
  putilovo: S('putilovo', 'Путилово', 1600, 900, 'yar', 7, {
    orientation: 'bottom',
    isBranch: true,
    branchId: 'krasnoarmeysk',
    facilities: { ...baseStation.facilities, troikaPayment: false },
  }),
  krasnoarmeysk: S('krasnoarmeysk', 'Красноармейск', 1750, 900, 'yar', 7, {
    orientation: 'top',
    isBranch: true,
    branchId: 'krasnoarmeysk',
    facilities: { ...baseStation.facilities, troikaPayment: false },
  }),
};