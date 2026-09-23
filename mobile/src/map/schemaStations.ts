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
  aeroexpress?: boolean;
  isBranch?: boolean;
  branchId?: string;
  isJunction?: boolean;
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
  aeroexpress: false,
  isBranch: false,
  orientation: 'right',
};

const expressStations = [
  'm_yar', 'losinoostrovskaya', 'mytishchi', 'podlipki', 'bolshevo',
  'ivanteevka2', 'fryazino', 'pushkino', 'sofrino', 'hotkovo', 'sergiev_posad',
  'aleksandrov', 'balakirevo', 'monino', 'fryazevo',
  'm_pav', 'domodedovo', 'barybino', 'mihnevo', 'zhilyovo', 'stupino',
  'kashira', 'tesna', 'ozherelye', 'uzunovo', 'rastorguevo', 'biryulyovo_pass',
  'varshavskaya', 'nagatinskaya', 'verhnie_kotly',
];

const aeroexpressStations = ['m_pav', 'verhnie_kotly', 'aeroport_domodedovo'];

const S = (
  id: string,
  name: string,
  x: number,
  y: number,
  lineId: string | string[],
  zone: number,
  options: Partial<SchemaStation> = {},
): SchemaStation => {
  const lines = Array.isArray(lineId) ? lineId : [lineId];
  const base: SchemaStation = {
    ...baseStation,
    id, name, x, y, lines, zone,
    lat: 0, lon: 0,
    expressStop: expressStations.includes(id),
    aeroexpress: aeroexpressStations.includes(id),
  };
  return { ...base, ...options };
};

export const STATIONS: Record<string, SchemaStation> = {
  // ============================================================
  // ЯРОСЛАВСКОЕ — ОСНОВНОЙ ХОД (диагональ на северо-восток)
  // Подписи слева от линии (от Перловской до Радонежа)
  // ============================================================
  m_yar: S('m_yar', 'Москва Ярославская', 300, 200, 'yar', 0, { expressStop: true, orientation: 'right' }),
  moscow3: S('moscow3', 'Москва-3', 325, 185, 'yar', 0, { orientation: 'right' }),
  malenkovskaya: S('malenkovskaya', 'Маленковская', 350, 170, 'yar', 0, { orientation: 'right' }),
  yauza: S('yauza', 'Яуза', 375, 155, 'yar', 0, { orientation: 'right' }),
  rostokino: S('rostokino', 'Ростокино', 400, 140, 'yar', 1, { orientation: 'right' }),
  losinoostrovskaya: S('losinoostrovskaya', 'Лосиноостровская', 425, 125, 'yar', 1, { expressStop: true, orientation: 'right' }),
  los: S('los', 'Лось', 450, 110, 'yar', 2, { orientation: 'left' }), // Начинаем менять на left
  perlovskaya: S('perlovskaya', 'Перловская', 475, 95, 'yar', 2, { orientation: 'left' }),
  tayninskaya: S('tayninskaya', 'Тайнинская', 500, 80, 'yar', 3, { orientation: 'left' }),
  mytishchi: S('mytishchi', 'Мытищи', 525, 65, 'yar', 3, { expressStop: true, orientation: 'left' }),
  stroitel: S('stroitel', 'Строитель', 550, 50, 'yar', 3, { orientation: 'left' }),
  chelyuskinskaya: S('chelyuskinskaya', 'Челюскинская', 575, 35, 'yar', 3, { orientation: 'left' }),
  tarasovskaya: S('tarasovskaya', 'Тарасовская', 600, 20, 'yar', 4, { orientation: 'left' }),
  klyazma: S('klyazma', 'Клязьма', 625, 5, 'yar', 4, { orientation: 'left' }),
  mamontovskaya: S('mamontovskaya', 'Мамонтовская', 650, -10, 'yar', 4, { orientation: 'left' }),
  pushkino: S('pushkino', 'Пушкино', 675, -25, 'yar', 4, { expressStop: true, orientation: 'left' }),
  zavety_ilyicha: S('zavety_ilyicha', 'Заветы Ильича', 700, -40, 'yar', 5, { orientation: 'left' }),
  pravda: S('pravda', 'Правда', 725, -55, 'yar', 5, { orientation: 'left' }),
  zelenogradskaya: S('zelenogradskaya', 'Зеленоградская', 750, -70, 'yar', 5, { orientation: 'left' }),
  km43: S('km43', 'Нагорное (43 км)', 775, -85, 'yar', 5, { orientation: 'left' }),
  sofrino: S('sofrino', 'Софрино', 800, -100, 'yar', 6, { expressStop: true, orientation: 'left' }),
  ashukinskaya: S('ashukinskaya', 'Ашукинская', 825, -115, 'yar', 6, { orientation: 'left' }),
  kalistovo: S('kalistovo', 'Калистово', 850, -130, 'yar', 6, { orientation: 'left' }),
  radonezh: S('radonezh', 'Радонеж', 875, -145, 'yar', 6, { orientation: 'left' }),
  abramtsevo: S('abramtsevo', 'Абрамцево', 900, -160, 'yar', 7, { orientation: 'right' }), // Возвращаем right
  hotkovo: S('hotkovo', 'Хотьково', 925, -175, 'yar', 7, { expressStop: true, orientation: 'right' }),
  semhoz: S('semhoz', 'Семхоз', 950, -190, 'yar', 8, { orientation: 'right' }),
  sergiev_posad: S('sergiev_posad', 'Сергиев Посад', 975, -205, 'yar', 8, { expressStop: true, orientation: 'right' }),
  km76: S('km76', '76 км', 1000, -220, 'yar', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km81: S('km81', '81 км', 1025, -235, 'yar', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km83: S('km83', '83 км', 1050, -250, 'yar', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  buzhaninovo: S('buzhaninovo', 'Бужаниново', 1075, -265, 'yar', 10, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km90: S('km90', '90 км', 1100, -280, 'yar', 10, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  arsaki: S('arsaki', 'Арсаки', 1125, -295, 'yar', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  strunino: S('strunino', 'Струнино', 1150, -310, 'yar', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  aleksandrov: S('aleksandrov', 'Александров-1', 1175, -325, 'yar', 12, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  balakirevo: S('balakirevo', 'Балакирево', 1200, -340, 'yar', 14, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ============================================================
  // МОНИНСКИЙ ХОД (Мытищи → восток)
  // Сдвинут вправо на 50 единиц, чтобы увеличить расстояние от Мытищ
  // ============================================================
  podlipki: S('podlipki', 'Подлипки-Дачные', 625, 65, 'yar', 3, { orientation: 'bottom', expressStop: true, isBranch: true, branchId: 'monino' }), // x: 575 -> 625
  bolshevo: S('bolshevo', 'Болшево', 700, 65, 'yar', 3, { orientation: 'bottom', expressStop: true }), // x: 640 -> 700
  valentinovka: S('valentinovka', 'Валентиновка', 770, 65, 'yar', 4, { orientation: 'top', isBranch: true, branchId: 'monino' }),
  zagoryanskaya: S('zagoryanskaya', 'Загорянская', 840, 65, 'yar', 4, { orientation: 'bottom', isBranch: true, branchId: 'monino' }),
  sokolovskaya: S('sokolovskaya', 'Соколовская', 910, 65, 'yar', 4, { orientation: 'top', isBranch: true, branchId: 'monino' }),
  voronok: S('voronok', 'Воронок', 980, 65, 'yar', 5, { orientation: 'bottom', isBranch: true, branchId: 'monino' }),
  shchelkovo: S('shchelkovo', 'Щёлково', 1050, 65, 'yar', 5, { orientation: 'top', isBranch: true, branchId: 'monino' }),
  gagarinskaya: S('gagarinskaya', 'Гагаринская', 1120, 65, 'yar', 5, { orientation: 'bottom', isBranch: true, branchId: 'monino' }),
  chkalovskaya: S('chkalovskaya', 'Чкаловская', 1190, 65, 'yar', 5, { orientation: 'top', isBranch: true, branchId: 'monino' }),
  bakhchivandzhi: S('bakhchivandzhi', 'Бахчиванджи', 1260, 65, 'yar', 5, { orientation: 'bottom', isBranch: true, branchId: 'monino' }),
  tsiolkovskaya: S('tsiolkovskaya', 'Циолковская', 1330, 65, 'yar', 6, { orientation: 'top', isBranch: true, branchId: 'monino' }),
  monino: S('monino', 'Монино', 1400, 65, 'yar', 6, { orientation: 'bottom', expressStop: true, isBranch: true, branchId: 'monino' }),
  kashino: S('kashino', 'Кашино', 1470, 65, 'yar', 7, { orientation: 'top', isBranch: true, branchId: 'monino', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  kolontaevo: S('kolontaevo', 'Колонтаево', 1540, 65, 'yar', 7, { orientation: 'bottom', isBranch: true, branchId: 'monino', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  lesnaya: S('lesnaya', 'Лесная', 1610, 65, 'yar', 7, { orientation: 'top', isBranch: true, branchId: 'monino', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  fryazevo: S('fryazevo', 'Фрязево', 1680, 65, 'yar', 8, { orientation: 'bottom', expressStop: true, isBranch: true, branchId: 'monino', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ============================================================
  // ФРЯЗИНСКИЙ ХОД (Болшево → вверх)
  // Сдвинут вправо вместе с Болшево
  // ============================================================
  fabrika1maya: S('fabrika1maya', 'Фабрика 1 Мая', 700, 0, 'yar', 3, { orientation: 'top', isBranch: true, branchId: 'fryazino' }),
  zelyony_bor: S('zelyony_bor', 'Зелёный Бор', 770, 0, 'yar', 3, { orientation: 'top', isBranch: true, branchId: 'fryazino' }),
  ivanteevka2: S('ivanteevka2', 'Ивантеевка-2', 840, 0, 'yar', 4, { orientation: 'top', expressStop: true, isBranch: true, branchId: 'fryazino' }),
  ivanteevka: S('ivanteevka', 'Ивантеевка', 910, 0, 'yar', 4, { orientation: 'top', isBranch: true, branchId: 'fryazino' }),
  detskaya: S('detskaya', 'Детская', 980, 0, 'yar', 4, { orientation: 'top', isBranch: true, branchId: 'fryazino' }),
  fryazino_tov: S('fryazino_tov', 'Фрязино-Тов.', 1050, 0, 'yar', 4, { orientation: 'top', isBranch: true, branchId: 'fryazino' }),
  fryazino: S('fryazino', 'Фрязино-Пасс.', 1120, 0, 'yar', 4, { orientation: 'top', expressStop: true, isBranch: true, branchId: 'fryazino' }),

  // ============================================================
  // КРАСНОАРМЕЙСКАЯ ВЕТКА (Софрино → восток)
  // ============================================================
  poselok_dalniy: S('poselok_dalniy', 'Посёлок Дальний', 880, -100, 'yar', 7, { orientation: 'bottom', isBranch: true, branchId: 'krasnoarmeysk', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  rahmanovo: S('rahmanovo', 'Рахманово', 960, -100, 'yar', 7, { orientation: 'top', isBranch: true, branchId: 'krasnoarmeysk', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  fedorovskoe: S('fedorovskoe', 'Фёдоровское', 1040, -100, 'yar', 7, { orientation: 'bottom', isBranch: true, branchId: 'krasnoarmeysk', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  putilovo: S('putilovo', 'Путилово', 1120, -100, 'yar', 7, { orientation: 'top', isBranch: true, branchId: 'krasnoarmeysk', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  krasnoarmeysk: S('krasnoarmeysk', 'Красноармейск', 1200, -100, 'yar', 7, { orientation: 'bottom', isBranch: true, branchId: 'krasnoarmeysk', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ============================================================
  // ПАВЕЛЕЦКОЕ — вертикально
  // ============================================================
  m_pav: S('m_pav', 'Москва Павелецкая', 100, 300, 'pav', 0, { expressStop: true, aeroexpress: true, orientation: 'right' }),
  derbenevskaya: S('derbenevskaya', 'Дербеневская', 100, 325, 'pav', 1, { orientation: 'right' }),
  tulskaya: S('tulskaya', 'Тульская', 100, 350, 'pav', 1, { orientation: 'right' }),
  varshavskaya: S('varshavskaya', 'Варшавская', 100, 375, 'pav', 1, { expressStop: true, orientation: 'right' }),
  verhnie_kotly: S('verhnie_kotly', 'Верхние Котлы', 100, 400, 'pav', 1, { expressStop: true, aeroexpress: true, orientation: 'right' }),
  nagatinskaya: S('nagatinskaya', 'Нагатинская', 100, 425, 'pav', 2, { expressStop: true, orientation: 'right' }),
  kolomenskoye: S('kolomenskoye', 'Коломенское', 100, 450, 'pav', 2, { orientation: 'right' }),
  chertanovo: S('chertanovo', 'Чертаново', 100, 475, 'pav', 2, { orientation: 'right' }),
  biryulyovo_tov: S('biryulyovo_tov', 'Бирюлёво-Товарная', 100, 500, 'pav', 2, { orientation: 'right' }),
  biryulyovo_pass: S('biryulyovo_pass', 'Бирюлёво-Пасс.', 100, 525, 'pav', 2, { expressStop: true, orientation: 'right' }),
  bulatnikovo: S('bulatnikovo', 'Булатниково', 100, 550, 'pav', 3, { orientation: 'right' }),
  rastorguevo: S('rastorguevo', 'Расторгуево', 100, 575, 'pav', 3, { expressStop: true, orientation: 'right' }),
  kalinina: S('kalinina', 'Калинина', 100, 600, 'pav', 4, { orientation: 'right' }),
  leninskaya: S('leninskaya', 'Ленинская', 100, 625, 'pav', 4, { orientation: 'right' }),
  km32: S('km32', '32 км', 100, 650, 'pav', 4, { orientation: 'right' }),
  domodedovo: S('domodedovo', 'Домодедово', 100, 675, 'pav', 5, { expressStop: true, orientation: 'right', isJunction: true }),
  
  // --- ПУТЕВАЯ ТОЧКА ДЛЯ ВЕТКИ НА АЭРОПОРТ ---
  domodedovo_junction: S('domodedovo_junction', 'Junction', 140, 675, [], 0, { isJunction: true }),

  // --- ВЕТКА НА АЭРОПОРТ ---
  aviacionnaya: S('aviacionnaya', 'Авиационная', 200, 675, 'pav_aero_sub', 5, { orientation: 'bottom', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  kosmos: S('kosmos', 'Космос', 260, 675, 'pav_aero_sub', 6, { orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  aeroport_domodedovo: S('aeroport_domodedovo', 'Аэропорт Домодедово', 320, 675, ['pav_aero', 'pav_aero_sub'], 4, { aeroexpress: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // --- ПРОДОЛЖЕНИЕ ПАВЕЛЕЦКОГО НАПРАВЛЕНИЯ (Тройка отключена) ---
  vzlyotnaya: S('vzlyotnaya', 'Взлётная', 100, 725, 'pav', 5, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  vostryakovo: S('vostryakovo', 'Востряково', 100, 750, 'pav', 5, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  belye_stolby: S('belye_stolby', 'Белые Столбы', 100, 775, 'pav', 6, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  barybino: S('barybino', 'Барыбино', 100, 825, 'pav', 7, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  danilovo_52: S('danilovo_52', 'Данилово (52 км)', 100, 800, 'pav', 6, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  privalovo: S('privalovo', 'Привалово', 100, 900, 'pav', 8, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  velyaminovo: S('velyaminovo', 'Вельяминово', 100, 875, 'pav', 7, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  mihnevo: S('mihnevo', 'Михнево', 100, 925, 'pav', 8, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  shugarovo: S('shugarovo', 'Шугарово', 100, 950, 'pav', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km85: S('km85', '85 км', 100, 975, 'pav', 10, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  zhilyovo: S('zhilyovo', 'Жилёво', 100, 1025, 'pav', 10, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  sitenka: S('sitenka', 'Ситенка', 100, 1050, 'pav', 10, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  stupino: S('stupino', 'Ступино', 100, 1100, 'pav', 11, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  akri: S('akri', 'Акри', 100, 1125, 'pav', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  belopesotsky: S('belopesotsky', 'Белопесоцкий', 100, 1175, 'pav', 12, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  kashira: S('kashira', 'Кашира', 100, 1200, 'pav', 12, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  tesna: S('tesna', 'Тесна', 100, 1225, 'pav', 12, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  ozherelye: S('ozherelye', 'Ожерелье', 100, 1275, 'pav', 13, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  zubovo_121: S('zubovo_121', 'Зубово (121 км)', 100, 1300, 'pav', 13, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  purlovo: S('purlovo', 'Пурлово', 100, 1350, 'pav', 14, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  kolmenka_131: S('kolmenka_131', 'Колменка (131 км)', 100, 1375, 'pav', 14, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  topkanovo: S('topkanovo', 'Топканово', 100, 1425, 'pav', 15, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km137: S('km137', '137 км', 100, 1450, 'pav', 15, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  bogatishchevo: S('bogatishchevo', 'Богатищево', 100, 1475, 'pav', 15, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km146: S('km146', '146 км', 100, 1500, 'pav', 15, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  korovino: S('korovino', 'Коровино', 100, 1550, 'pav', 16, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  novosyolki_152: S('novosyolki_152', 'Новосёлки (152 км)', 100, 1575, 'pav', 16, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  uzunovo: S('uzunovo', 'Узуново', 100, 1600, 'pav', 16, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
};