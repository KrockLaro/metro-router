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
  m_yar: S('m_yar', 'Москва Ярославская', 250, 100, 'yar', 0, { expressStop: true, orientation: 'right' }),
  moscow3: S('moscow3', 'Москва-3', 267, 70, 'yar', 0, { orientation: 'right' }),
  malenkovskaya: S('malenkovskaya', 'Маленковская', 284, 40, 'yar', 0, { orientation: 'right' }),
  yauza: S('yauza', 'Яуза', 301, 10, 'yar', 0, { orientation: 'right' }),
  rostokino: S('rostokino', 'Ростокино', 318, -20, 'yar', 1, { expressStop: true, orientation: 'right' }),
  losinoostrovskaya: S('losinoostrovskaya', 'Лосиноостровская', 335, -50, 'yar', 1, { expressStop: true, orientation: 'right' }),
  los: S('los', 'Лось', 352, -80, 'yar', 2, { orientation: 'left' }),
  perlovskaya: S('perlovskaya', 'Перловская', 369, -110, 'yar', 2, { orientation: 'left' }),
  tayninskaya: S('tayninskaya', 'Тайнинская', 386, -140, 'yar', 3, { orientation: 'left' }),
  mytishchi: S('mytishchi', 'Мытищи', 403, -170, 'yar', 3, { expressStop: true, orientation: 'left' }),
  stroitel: S('stroitel', 'Строитель', 420, -200, 'yar', 3, { orientation: 'left' }),
  chelyuskinskaya: S('chelyuskinskaya', 'Челюскинская', 437, -230, 'yar', 3, { orientation: 'left' }),
  tarasovskaya: S('tarasovskaya', 'Тарасовская', 454, -260, 'yar', 4, { orientation: 'left' }),
  klyazma: S('klyazma', 'Клязьма', 471, -290, 'yar', 4, { orientation: 'left' }),
  mamontovskaya: S('mamontovskaya', 'Мамонтовская', 488, -320, 'yar', 4, { orientation: 'left' }),
  pushkino: S('pushkino', 'Пушкино', 505, -350, 'yar', 4, { expressStop: true, orientation: 'left' }),
  zavety_ilyicha: S('zavety_ilyicha', 'Заветы Ильича', 522, -380, 'yar', 5, { orientation: 'left' }),
  pravda: S('pravda', 'Правда', 539, -410, 'yar', 5, { orientation: 'left' }),
  zelenogradskaya: S('zelenogradskaya', 'Зеленоградская', 556, -440, 'yar', 5, { orientation: 'left' }),
  km43: S('km43', 'Нагорное (43 км)', 573, -470, 'yar', 5, { orientation: 'left' }),
  sofrino: S('sofrino', 'Софрино', 590, -500, 'yar', 6, { expressStop: true, orientation: 'left' }),
  ashukinskaya: S('ashukinskaya', 'Ашукинская', 607, -530, 'yar', 6, { orientation: 'left' }),
  kalistovo: S('kalistovo', 'Калистово', 624, -560, 'yar', 6, { orientation: 'left' }),
  radonezh: S('radonezh', 'Радонеж', 641, -590, 'yar', 6, { orientation: 'left' }),
  abramtsevo: S('abramtsevo', 'Абрамцево', 658, -620, 'yar', 7, { orientation: 'right' }),
  hotkovo: S('hotkovo', 'Хотьково', 675, -650, 'yar', 7, { expressStop: true, orientation: 'right' }),
  semhoz: S('semhoz', 'Семхоз', 692, -680, 'yar', 8, { orientation: 'right' }),
  sergiev_posad: S('sergiev_posad', 'Сергиев Посад', 709, -710, 'yar', 8, { expressStop: true, orientation: 'right' }),
  km76: S('km76', '76 км', 726, -740, 'yar', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km81: S('km81', '81 км', 743, -770, 'yar', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km83: S('km83', '83 км', 760, -800, 'yar', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  buzhaninovo: S('buzhaninovo', 'Бужаниново', 777, -830, 'yar', 10, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km90: S('km90', '90 км', 794, -860, 'yar', 10, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  arsaki: S('arsaki', 'Арсаки', 811, -890, 'yar', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  strunino: S('strunino', 'Струнино', 828, -920, 'yar', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  aleksandrov: S('aleksandrov', 'Александров-1', 845, -950, 'yar', 12, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  balakirevo: S('balakirevo', 'Балакирево', 862, -980, 'yar', 14, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  // ============================================================
  // МОНИНСКИЙ ХОД (Мытищи → восток)
  // ============================================================
  podlipki: S('podlipki', 'Подлипки-Дачные', 625, -35, 'yar', 3, { orientation: 'left', expressStop: true, isBranch: true, branchId: 'monino' }),
  bolshevo: S('bolshevo', 'Болшево', 700, -35, 'yar', 3, { orientation: 'bottom', expressStop: true }),
  valentinovka: S('valentinovka', 'Валентиновка', 770, -35, 'yar', 4, { orientation: 'top', isBranch: true, branchId: 'monino' }),
  zagoryanskaya: S('zagoryanskaya', 'Загорянская', 840, -35, 'yar', 4, { orientation: 'bottom', isBranch: true, branchId: 'monino' }),
  sokolovskaya: S('sokolovskaya', 'Соколовская', 910, -35, 'yar', 4, { orientation: 'top', isBranch: true, branchId: 'monino' }),
  voronok: S('voronok', 'Воронок', 980, -35, 'yar', 5, { orientation: 'bottom', isBranch: true, branchId: 'monino' }),
  shchelkovo: S('shchelkovo', 'Щёлково', 1050, -35, 'yar', 5, { orientation: 'top', isBranch: true, branchId: 'monino' }),
  gagarinskaya: S('gagarinskaya', 'Гагаринская', 1120, -35, 'yar', 5, { orientation: 'bottom', isBranch: true, branchId: 'monino' }),
  chkalovskaya: S('chkalovskaya', 'Чкаловская', 1190, -35, 'yar', 5, { orientation: 'top', isBranch: true, branchId: 'monino' }),
  bakhchivandzhi: S('bakhchivandzhi', 'Бахчиванджи', 1260, -35, 'yar', 5, { orientation: 'bottom', isBranch: true, branchId: 'monino' }),
  tsiolkovskaya: S('tsiolkovskaya', 'Циолковская', 1330, -35, 'yar', 6, { orientation: 'top', isBranch: true, branchId: 'monino' }),
  monino: S('monino', 'Монино', 1400, -35, 'yar', 6, { orientation: 'bottom', expressStop: true, isBranch: true, branchId: 'monino' }),
  kashino: S('kashino', 'Кашино', 1470, -35, 'yar', 7, { orientation: 'top', isBranch: true, branchId: 'monino', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  kolontaevo: S('kolontaevo', 'Колонтаево', 1540, -35, 'yar', 7, { orientation: 'bottom', isBranch: true, branchId: 'monino', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  lesnaya: S('lesnaya', 'Лесная', 1610, -35, 'yar', 7, { orientation: 'top', isBranch: true, branchId: 'monino', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  fryazevo: S('fryazevo', 'Фрязево', 1680, -35, 'yar', 8, { orientation: 'bottom', expressStop: true, isBranch: true, branchId: 'monino', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ============================================================
  // ФРЯЗИНСКИЙ ХОД (Болшево → вверх)
  // ============================================================
  fabrika1maya: S('fabrika1maya', 'Фабрика 1 Мая', 700, -100, 'yar', 3, { orientation: 'left', isBranch: true, branchId: 'fryazino' }),
  zelyony_bor: S('zelyony_bor', 'Зелёный Бор', 770, -100, 'yar', 3, { orientation: 'top', isBranch: true, branchId: 'fryazino' }),
  ivanteevka2: S('ivanteevka2', 'Ивантеевка-2', 840, -100, 'yar', 4, { orientation: 'top', expressStop: true, isBranch: true, branchId: 'fryazino' }),
  ivanteevka: S('ivanteevka', 'Ивантеевка', 910, -100, 'yar', 4, { orientation: 'top', isBranch: true, branchId: 'fryazino' }),
  detskaya: S('detskaya', 'Детская', 980, -100, 'yar', 4, { orientation: 'bottom', isBranch: true, branchId: 'fryazino' }),
  fryazino_tov: S('fryazino_tov', 'Фрязино-Тов.', 1050, -100, 'yar', 4, { orientation: 'top', isBranch: true, branchId: 'fryazino' }),
  fryazino: S('fryazino', 'Фрязино-Пасс.', 1120, -100, 'yar', 4, { orientation: 'right', expressStop: true, isBranch: true, branchId: 'fryazino' }),

  // ============================================================
  // КРАСНОАРМЕЙСКАЯ ВЕТКА (Софрино → восток)
  // ============================================================
  poselok_dalniy: S('poselok_dalniy', 'Посёлок Дальний', 680, -440, 'yar', 7, { orientation: 'bottom', isBranch: true, branchId: 'krasnoarmeysk', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  rahmanovo: S('rahmanovo', 'Рахманово', 770, -440, 'yar', 7, { orientation: 'top', isBranch: true, branchId: 'krasnoarmeysk', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  fedorovskoe: S('fedorovskoe', 'Фёдоровское', 860, -440, 'yar', 7, { orientation: 'bottom', isBranch: true, branchId: 'krasnoarmeysk', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  putilovo: S('putilovo', 'Путилово', 950, -440, 'yar', 7, { orientation: 'top', isBranch: true, branchId: 'krasnoarmeysk', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  krasnoarmeysk: S('krasnoarmeysk', 'Красноармейск', 1040, -440, 'yar', 7, { orientation: 'bottom', isBranch: true, branchId: 'krasnoarmeysk', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ============================================================
  // ПАВЕЛЕЦКОЕ — вертикально
  // ============================================================
  m_pav: S('m_pav', 'Москва Павелецкая', 100, 300, 'pav', 0, { expressStop: true, aeroexpress: true, orientation: 'right' }),
  derbenevskaya: S('derbenevskaya', 'Дербеневская', 100, 325, 'pav', 1, { orientation: 'right' }),
  tulskaya: S('tulskaya', 'Тульская', 100, 350, 'pav', 1, { orientation: 'right' }),
  varshavskaya: S('varshavskaya', 'Варшавская', 100, 375, 'pav', 1, { expressStop: true, orientation: 'right' }),
  verhnie_kotly: S('verhnie_kotly', 'Верхние Котлы', 100, 400, 'pav', 1, { expressStop: true, aeroexpress: true, orientation: 'right' }),
  nagatinskaya: S('nagatinskaya', 'Нагатинская', 100, 425, 'pav', 2, { expressStop: true, orientation: 'right' }),
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


  // ══════════════════════════════════════════════════════════════
  // БЕЛОРУССКОЕ НАПРАВЛЕНИЕ (диагональ на юго-запад)
  // m_bel (0, 200) — выше Павелецкого и левее
  // ══════════════════════════════════════════════════════════════
  m_bel: S('m_bel', 'Москва Белорусская', 0, 200, 'bel', 0, { expressStop: true, orientation: 'left' }),
  begovaya: S('begovaya', 'Беговая', -17, 233, 'bel', 1, { orientation: 'right' }),
  testovskaya: S('testovskaya', 'Москва-Сити', -34, 266, 'bel', 1, { orientation: 'right' }),
  fili: S('fili', 'Фили', -51, 299, 'bel', 2, { expressStop: true, orientation: 'right' }),
  slavyansky_bulvar: S('slavyansky_bulvar', 'Славянский Бульвар', -68, 332, 'bel', 2, { orientation: 'right' }),
  kuntsevskaya: S('kuntsevskaya', 'Кунцевская', -85, 365, 'bel', 2, { expressStop: true, orientation: 'right' }),
  rabochiy_poselok: S('rabochiy_poselok', 'Рабочий Посёлок', -102, 398, 'bel', 2, { orientation: 'right' }),
  setun: S('setun', 'Сетунь', -119, 431, 'bel', 2, { orientation: 'right' }),
  nemchinovka: S('nemchinovka', 'Немчиновка', -136, 464, 'bel', 3, { orientation: 'right' }),
  skolkovo: S('skolkovo', 'Сколково', -153, 497, 'bel', 3, { orientation: 'right' }),
  bakovka: S('bakovka', 'Баковка', -170, 530, 'bel', 3, { orientation: 'right' }),
  odintsovo: S('odintsovo', 'Одинцово', -187, 563, 'bel', 3, { expressStop: true, orientation: 'right' }),
  otradnoe: S('otradnoe', 'Отрадное', -204, 596, 'bel', 4, { orientation: 'right' }),
  pionerskaya: S('pionerskaya', 'Пионерская', -221, 629, 'bel', 4, { orientation: 'right' }),
  perhushkovo: S('perhushkovo', 'Перхушково', -238, 662, 'bel', 4, { orientation: 'right' }),
  zdravnitsa: S('zdravnitsa', 'Здравница', -255, 695, 'bel', 4, { orientation: 'right' }),
  zhavoronki: S('zhavoronki', 'Жаворонки', -272, 728, 'bel', 5, { orientation: 'right' }),
  dachnoe: S('dachnoe', 'Дачное', -289, 761, 'bel', 5, { orientation: 'right' }),
  malye_vyazemy: S('malye_vyazemy', 'Малые Вязёмы', -306, 794, 'bel', 5, { orientation: 'right' }),
  golitsyno: S('golitsyno', 'Голицыно', -323, 827, 'bel', 5, { expressStop: true, orientation: 'right' }),
  sushkinskaya: S('sushkinskaya', 'Сушкинская', -340, 860, 'bel', 6, { orientation: 'right' }),
  petelino: S('petelino', 'Петелино', -357, 893, 'bel', 6, { orientation: 'right' }),
  chastsovskaya: S('chastsovskaya', 'Часцовская', -374, 926, 'bel', 7, { orientation: 'right' }),
  portnovskaya: S('portnovskaya', 'Портновская', -391, 959, 'bel', 7, { orientation: 'right' }),
  kubinka1: S('kubinka1', 'Кубинка-1', -408, 992, 'bel', 8, { expressStop: true, orientation: 'right' }),
  chapaevka: S('chapaevka', 'Чапаевка', -425, 1025, 'bel', 8, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  polushkino: S('polushkino', 'Полушкино', -442, 1058, 'bel', 8, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  sanatornaya: S('sanatornaya', 'Санаторная', -459, 1091, 'bel', 8, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  tuchkovo: S('tuchkovo', 'Тучково', -476, 1124, 'bel', 9, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  teatralnaya: S('teatralnaya', 'Театральная', -493, 1157, 'bel', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  sadovaya: S('sadovaya', 'Садовая', -510, 1190, 'bel', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  dorohovo: S('dorohovo', 'Дорохово', -527, 1223, 'bel', 10, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  partizanskaya: S('partizanskaya', 'Партизанская', -544, 1256, 'bel', 10, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  shalikovo: S('shalikovo', 'Шаликово', -561, 1289, 'bel', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  kukarinskaya: S('kukarinskaya', 'Кукаринская', -578, 1322, 'bel', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  pl109km: S('pl109km', '109 км (Платовская)', -595, 1355, 'bel', 12, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  mozhaysk: S('mozhaysk', 'Можайск', -612, 1388, 'bel', 12, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  borodino: S('borodino', 'Бородино', -629, 1421, 'bel', 13, { expressStop: true, orientation: 'bottom', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ─── Усовская ветка (от Рабочего Посёлка на северо-запад) ───
  // Тройка не действует
  kuntsevo2: S('kuntsevo2', 'Кунцево-2', -150, 360, 'bel_usovo', 2, { expressStop: true, orientation: 'bottom', isBranch: true, branchId: 'usovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  romashkovo: S('romashkovo', 'Ромашково', -198, 322, 'bel_usovo', 2, { orientation: 'bottom', isBranch: true, branchId: 'usovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  razdory: S('razdory', 'Раздоры', -246, 284, 'bel_usovo', 2, { expressStop: true, orientation: 'bottom', isBranch: true, branchId: 'usovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  barviha: S('barviha', 'Барвиха', -294, 246, 'bel_usovo', 2, { expressStop: true, orientation: 'bottom', isBranch: true, branchId: 'usovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  ilyinskoe: S('ilyinskoe', 'Ильинское', -342, 208, 'bel_usovo', 2, { orientation: 'bottom', isBranch: true, branchId: 'usovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  usovo: S('usovo', 'Усово', -390, 170, 'bel_usovo', 2, { expressStop: true, orientation: 'bottom', isBranch: true, branchId: 'usovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ─── Звенигородская ветка (от Голицыно на юго-запад) ───
  zaharovo: S('zaharovo', 'Захарово', -380, 790, 'bel_zven', 5, { orientation: 'bottom', isBranch: true, branchId: 'zvenigorod' }),
  hlyupino: S('hlyupino', 'Хлюпино', -437, 753, 'bel_zven', 5, { orientation: 'bottom', isBranch: true, branchId: 'zvenigorod' }),
  skorotovo: S('skorotovo', 'Скоротово', -494, 716, 'bel_zven', 5, { orientation: 'bottom', isBranch: true, branchId: 'zvenigorod' }),
  zvenigorod: S('zvenigorod', 'Звенигород', -551, 679, 'bel_zven', 5, { expressStop: true, orientation: 'bottom', isBranch: true, branchId: 'zvenigorod' }),

  // ══════════════════════════════════════════════════════════════
  // САВЁЛОВСКОЕ НАПРАВЛЕНИЕ (вертикаль на север)
  // x=100 — параллельно Павелецкому. m_sav (100, 200) — выше m_pav.
  // ══════════════════════════════════════════════════════════════
  m_sav: S('m_sav', 'Москва Савёловская', 100, 200, 'sav', 0, { expressStop: true, orientation: 'right' }),
  timiryazevskaya: S('timiryazevskaya', 'Тимирязевская', 100, 100, 'sav', 1, { orientation: 'right' }),
  petrovsko_razumovskaya: S('petrovsko_razumovskaya', 'Петровско-Разумовская', 100, 80, 'sav', 1, { orientation: 'right' }),
  okruzhnaya: S('okruzhnaya', 'Окружная', 100, 60, 'sav', 2, { expressStop: true, orientation: 'right' }),
  degunino: S('degunino', 'Дегунино', 100, 40, 'sav', 2, { orientation: 'right' }),
  beskudnikovo: S('beskudnikovo', 'Бескудниково', 100, 20, 'sav', 2, { orientation: 'right' }),
  lianozovo: S('lianozovo', 'Лианозово', 100, 0, 'sav', 2, { expressStop: true, orientation: 'right' }),
  mark: S('mark', 'Марк', 100, -10, 'sav', 2, { orientation: 'right' }),
  novodachnaya: S('novodachnaya', 'Новодачная', 100, -40, 'sav', 3, { orientation: 'right' }),
  dolgoprudnaya: S('dolgoprudnaya', 'Долгопрудная', 100, -70, 'sav', 3, { expressStop: true, orientation: 'right' }),
  vodniki: S('vodniki', 'Водники', 100, -100, 'sav', 3, { orientation: 'right' }),
  hlebnikovo: S('hlebnikovo', 'Хлебниково', 100, -130, 'sav', 3, { orientation: 'right' }),
  sheremetyevskaya: S('sheremetyevskaya', 'Шереметьевская', 100, -160, 'sav', 3, { orientation: 'right' }),
  lobnya: S('lobnya', 'Лобня', 100, -190, 'sav', 4, { expressStop: true, orientation: 'right' }),
  depo_sav: S('depo_sav', 'Депо', 100, -220, 'sav', 4, { orientation: 'right' }),
  lugovaya: S('lugovaya', 'Луговая', 100, -250, 'sav', 4, { orientation: 'right' }),
  nekrasovskaya: S('nekrasovskaya', 'Некрасовская', 100, -280, 'sav', 4, { orientation: 'right' }),
  katuar: S('katuar', 'Катуар', 100, -310, 'sav', 4, { orientation: 'right' }),
  trudovaya: S('trudovaya', 'Трудовая', 100, -340, 'sav', 5, { orientation: 'right' }),
  iksha: S('iksha', 'Икша', 100, -370, 'sav', 5, { expressStop: true, orientation: 'right' }),
  morozki: S('morozki', 'Морозки', 100, -400, 'sav', 6, { orientation: 'right' }),
  turist: S('turist', 'Турист', 100, -430, 'sav', 6, { orientation: 'right' }),
  yahroma: S('yahroma', 'Яхрома', 100, -460, 'sav', 7, { expressStop: true, orientation: 'right' }),
  dmitrov: S('dmitrov', 'Дмитров', 100, -490, 'sav', 7, { expressStop: true, orientation: 'right' }),
  // ─── После Дмитрова Тройка не действует ───
  kanalstroy: S('kanalstroy', 'Каналстрой', 100, -520, 'sav', 8, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  barsuchenko: S('barsuchenko', 'Имени Барсученко', 100, -550, 'sav', 8, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  orudevo: S('orudevo', 'Орудьево', 100, -580, 'sav', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  verbilki: S('verbilki', 'Вербилки', 100, -610, 'sav', 10, { expressStop: true, orientation: 'left', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  nikulki: S('nikulki', 'Никулки', 100, -640, 'sav', 10, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  zheltikovo: S('zheltikovo', 'Жёлтиково', 100, -670, 'sav', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  vlasovo: S('vlasovo', 'Власово', 100, -700, 'sav', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  taldom: S('taldom', 'Талдом', 100, -730, 'sav', 12, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  lebzino: S('lebzino', 'Лебзино', 100, -760, 'sav', 13, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  pl124km: S('pl124km', '124 км', 100, -790, 'sav', 14, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  savelovo: S('savelovo', 'Савёлово', 100, -820, 'sav', 15, { expressStop: true, orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ─── Ветка Вербилки — Дубна (вправо от Вербилок) ───
  sorevnovanie: S('sorevnovanie', 'Соревнование', 170, -610, 'sav_dubna', 10, { orientation: 'top', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  zaprudnya: S('zaprudnya', 'Запрудня', 240, -610, 'sav_dubna', 10, { orientation: 'bottom', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  tempy: S('tempy', 'Темпы', 310, -610, 'sav_dubna', 10, { orientation: 'top', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  meldino: S('meldino', 'Мельдино', 380, -640, 'sav_dubna', 11, { orientation: 'right', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  zhivopisnoe: S('zhivopisnoe', 'Живописное (119 км)', 450, -700, 'sav_dubna', 11, { orientation: 'right', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  karmanovo: S('karmanovo', 'Карманово (122 км)', 520, -760, 'sav_dubna', 12, { orientation: 'right', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  bolshaya_volga: S('bolshaya_volga', 'Большая Волга', 590, -820, 'sav_dubna', 12, { expressStop: true, orientation: 'right', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  dubna: S('dubna', 'Дубна', 660, -880, 'sav_dubna', 13, { expressStop: true, orientation: 'top', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ─── Аэроэкспресс в Шереметьево (от Лианозово, y=20) ───
  sheremetyevo_south: S('sheremetyevo_south', 'Шереметьево — Юг (D, E, F)', 0, 20, 'sav_aero', 3, { aeroexpress: true, orientation: 'top', isBranch: true, branchId: 'sheremetyevo' }),
  sheremetyevo_north: S('sheremetyevo_north', 'Шереметьево — Север (B, C)', -100, 20, 'sav_aero', 3, { aeroexpress: true, orientation: 'bottom', isBranch: true, branchId: 'sheremetyevo' }),

    // ══════════════════════════════════════════════════════════════
  // КУРСКОЕ НАПРАВЛЕНИЕ (вертикаль на юг)
  // x=450 — между Павелецким (100) и Савёловским (100).
  // Отдельно от Ярославского. Длинное — до Тулы.
  // ══════════════════════════════════════════════════════════════
  m_kursk: S('m_kursk', 'Москва Курская', 450, 200, 'kursk', 0, { expressStop: true, orientation: 'right' }),
  moskva_tovarnaya: S('moskva_tovarnaya', 'Москва-Товарная', 450, 240, 'kursk', 1, { orientation: 'right' }),
  kalitniki: S('kalitniki', 'Калитники', 450, 280, 'kursk', 1, { orientation: 'right' }),
  novokhokhlovskaya: S('novokhokhlovskaya', 'Новохохловская', 450, 320, 'kursk', 2, { expressStop: true, orientation: 'right' }),
  tekstilshchiki: S('tekstilshchiki', 'Текстильщики', 450, 360, 'kursk', 2, { expressStop: true, orientation: 'right' }),
  pechatniki: S('pechatniki', 'Печатники', 450, 400, 'kursk', 2, { orientation: 'right' }),
  lyublino: S('lyublino', 'Люблино', 450, 440, 'kursk', 2, { expressStop: true, orientation: 'right' }),
  depo_kursk: S('depo_kursk', 'Депо', 450, 480, 'kursk', 2, { orientation: 'right' }),
  pererva: S('pererva', 'Перерва', 450, 520, 'kursk', 2, { orientation: 'right' }),
  kuryanovo: S('kuryanovo', 'Курьяново', 450, 560, 'kursk', 2, { orientation: 'right' }),
  moskvorechye: S('moskvorechye', 'Москворечье', 450, 600, 'kursk', 3, { orientation: 'right' }),
  tsaritsyno: S('tsaritsyno', 'Царицыно', 450, 640, 'kursk', 3, { expressStop: true, orientation: 'right' }),
  pokrovskoe: S('pokrovskoe', 'Покровское', 450, 680, 'kursk', 3, { orientation: 'right' }),
  krasny_stroitel: S('krasny_stroitel', 'Красный Строитель', 450, 720, 'kursk', 4, { orientation: 'right' }),
  bittsa: S('bittsa', 'Битца', 450, 760, 'kursk', 4, { expressStop: true, orientation: 'right' }),
  butovo: S('butovo', 'Бутово', 450, 800, 'kursk', 4, { orientation: 'right' }),
  shcherbinka: S('shcherbinka', 'Щербинка', 450, 840, 'kursk', 4, { expressStop: true, orientation: 'right' }),
  ostafyevo: S('ostafyevo', 'Остафьево', 450, 880, 'kursk', 4, { orientation: 'right' }),
  silikatnaya: S('silikatnaya', 'Силикатная', 450, 920, 'kursk', 5, { orientation: 'right' }),
  podolsk: S('podolsk', 'Подольск', 450, 960, 'kursk', 5, { expressStop: true, orientation: 'right' }),
  kutuzovskaya_k: S('kutuzovskaya_k', 'Кутузовская', 450, 1000, 'kursk', 6, { orientation: 'right' }),
  vesennyaya: S('vesennyaya', 'Весенняя', 450, 1040, 'kursk', 6, { orientation: 'right' }),
  grivno: S('grivno', 'Гривно', 450, 1080, 'kursk', 6, { expressStop: true, orientation: 'right' }),
  lvovskaya: S('lvovskaya', 'Львовская', 450, 1120, 'kursk', 7, { expressStop: true, orientation: 'right' }),
  molodi: S('molodi', 'Молоди', 450, 1160, 'kursk', 7, { orientation: 'right' }),
  stolbovaya: S('stolbovaya', 'Столбовая', 450, 1200, 'kursk', 7, { expressStop: true, orientation: 'right' }),
  ivachkovo: S('ivachkovo', 'Ивачково (66 км)', 450, 1240, 'kursk', 8, { orientation: 'right' }),
  chepelyovo: S('chepelyovo', 'Чепелёво', 450, 1280, 'kursk', 8, { orientation: 'right' }),
  chekhov: S('chekhov', 'Чехов', 450, 1320, 'kursk', 8, { expressStop: true, orientation: 'right' }),
  // ─── После Чехова Тройка не действует ───
  luch: S('luch', 'Луч', 450, 1360, 'kursk', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  sharapova_okhota: S('sharapova_okhota', 'Шарапова Охота', 450, 1400, 'kursk', 10, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km92_k: S('km92_k', '92 км', 450, 1440, 'kursk', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  avangard: S('avangard', 'Авангард', 450, 1480, 'kursk', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  serpukhov: S('serpukhov', 'Серпухов', 450, 1520, 'kursk', 11, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  oka: S('oka', 'Ока', 450, 1560, 'kursk', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km107_k: S('km107_k', '107 км', 450, 1600, 'kursk', 12, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  priokskaya: S('priokskaya', 'Приокская', 450, 1640, 'kursk', 12, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  romanovskie_dachi: S('romanovskie_dachi', 'Романовские дачи', 450, 1680, 'kursk', 13, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  tarusskaya: S('tarusskaya', 'Тарусская', 450, 1720, 'kursk', 13, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  aleksandrovka: S('aleksandrovka', 'Александровка (132 км)', 450, 1760, 'kursk', 14, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  pakhomovo: S('pakhomovo', 'Пахомово', 450, 1800, 'kursk', 15, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  shulgino: S('shulgino', 'Шульгино', 450, 1840, 'kursk', 15, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  prostor: S('prostor', 'Простор (153 км)', 450, 1880, 'kursk', 16, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  yasnogorsk: S('yasnogorsk', 'Ясногорск', 450, 1920, 'kursk', 16, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  shemetovo: S('shemetovo', 'Шеметово', 450, 1960, 'kursk', 17, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  baranovo: S('baranovo', 'Бараново', 450, 2000, 'kursk', 17, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  revyakino: S('revyakino', 'Ревякино', 450, 2040, 'kursk', 18, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  baydiki: S('baydiki', 'Байдики', 450, 2080, 'kursk', 18, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  khomyakovo: S('khomyakovo', 'Хомяково', 450, 2120, 'kursk', 19, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  rodnichok: S('rodnichok', 'Родничок (191 км)', 450, 2160, 'kursk', 19, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  tula: S('tula', 'Тула (Московский вокзал)', 450, 2200, 'kursk', 20, { expressStop: true, orientation: 'bottom', facilities: { ...baseStation.facilities, troikaPayment: false } }),

   // ══════════════════════════════════════════════════════════════
  // РИЖСКОЕ НАПРАВЛЕНИЕ
  // Площадь Трёх Вокзалов → на запад через Дмитровскую
  // Дмитровская (100, 150) — между Савёловской и Тимирязевской
  // ══════════════════════════════════════════════════════════════
  ploshchad_trekh_vokzalov: S('ploshchad_trekh_vokzalov', 'Площадь Трёх Вокзалов', 350, 160, ['kursk', 'riga'], 0, { expressStop: true, orientation: 'right' }),
  rizhskaya: S('rizhskaya', 'Рижская', 280, 155, 'riga', 0, { expressStop: true, orientation: 'top' }),
  marya_roshcha: S('marya_roshcha', 'Марьина Роща', 190, 150, 'riga', 1, { orientation: 'bottom' }),
  dmitrovskaya: S('dmitrovskaya', 'Дмитровская', 100, 150, 'riga', 1, { expressStop: true, orientation: 'left' }),
  m_riga: S('m_riga', 'Москва Рижская', 145, 175, 'riga_m', 0, { expressStop: true, orientation: 'right' }),

  // ─── Дальше на запад ───
  grazhdanskaya: S('grazhdanskaya', 'Гражданская', 65, 148, 'riga', 2, { orientation: 'top' }),
  krasny_balties: S('krasny_balties', 'Красный Балтиец', 30, 146, 'riga', 2, { orientation: 'bottom' }),
  streshnevo: S('streshnevo', 'Стрешнево', -5, 144, 'riga', 2, { orientation: 'top' }),
  shchukinskaya: S('shchukinskaya', 'Щукинская', -40, 142, 'riga', 2, { orientation: 'bottom' }),
  tushinskaya: S('tushinskaya', 'Тушинская', -75, 140, 'riga', 2, { expressStop: true, orientation: 'top' }),
  trikotazhnaya: S('trikotazhnaya', 'Трикотажная', -110, 138, 'riga', 2, { orientation: 'bottom' }),
  volokolamskaya: S('volokolamskaya', 'Волоколамская', -145, 136, 'riga', 2, { orientation: 'top' }),
  penyagino: S('penyagino', 'Пенягино', -180, 134, 'riga', 3, { orientation: 'bottom' }),
  pavshino: S('pavshino', 'Павшино', -215, 132, 'riga', 3, { expressStop: true, orientation: 'top' }),
  krasnogorskaya: S('krasnogorskaya', 'Красногорская', -250, 130, 'riga', 3, { orientation: 'bottom' }),
  opalikha: S('opalikha', 'Опалиха', -285, 128, 'riga', 4, { orientation: 'top' }),
  anikeevka: S('anikeevka', 'Аникеевка', -320, 126, 'riga', 4, { orientation: 'bottom' }),
  nahabino: S('nahabino', 'Нахабино', -355, 124, 'riga', 4, { expressStop: true, orientation: 'top' }),
  malinovka: S('malinovka', 'Малиновка', -390, 122, 'riga', 5, { orientation: 'bottom' }),
  dedovsk: S('dedovsk', 'Дедовск', -425, 120, 'riga', 5, { orientation: 'top' }),
  miitovskaya: S('miitovskaya', 'Миитовская', -460, 118, 'riga', 5, { orientation: 'bottom' }),
  snegiri: S('snegiri', 'Снегири', -495, 116, 'riga', 5, { orientation: 'top' }),
  km50_riga: S('km50_riga', '50 км', -530, 114, 'riga', 6, { orientation: 'bottom' }),
  manikhino1: S('manikhino1', 'Манихино 1', -565, 112, 'riga', 6, { expressStop: true, orientation: 'top' }),
  troitskaya: S('troitskaya', 'Троицкая', -600, 110, 'riga', 6, { orientation: 'bottom' }),
  istra: S('istra', 'Истра', -635, 108, 'riga', 7, { expressStop: true, orientation: 'top' }),
  novoierusalimskaya: S('novoierusalimskaya', 'Новоиерусалимская', -670, 106, 'riga', 7, { expressStop: true, orientation: 'bottom' }),
  chekhovskaya_riga: S('chekhovskaya_riga', 'Чеховская', -705, 104, 'riga', 7, { orientation: 'top' }),
  kholshcheviki: S('kholshcheviki', 'Холщёвики', -740, 102, 'riga', 8, { orientation: 'bottom' }),
  km73_riga: S('km73_riga', '73 км', -775, 100, 'riga', 8, { orientation: 'top' }),
  yadroshino: S('yadroshino', 'Ядрошино', -810, 98, 'riga', 8, { orientation: 'bottom' }),
  kursakovskaya: S('kursakovskaya', 'Курсаковская', -845, 96, 'riga', 9, { orientation: 'top' }),
  rumyantsevo: S('rumyantsevo', 'Румянцево', -880, 94, 'riga', 9, { expressStop: true, orientation: 'bottom' }),
  novopetrovskaya: S('novopetrovskaya', 'Новопетровская', -915, 92, 'riga', 9, { expressStop: true, orientation: 'top' }),
  ustinovka: S('ustinovka', 'Устиновка', -950, 90, 'riga', 10, { orientation: 'bottom' }),
  km91_riga: S('km91_riga', '91 км', -985, 88, 'riga', 10, { orientation: 'top' }),
  lesodolgorukovo: S('lesodolgorukovo', 'Лесодолгоруково', -1020, 86, 'riga', 11, { expressStop: true, orientation: 'bottom' }),
  chismena: S('chismena', 'Чисмена', -1055, 84, 'riga', 11, { orientation: 'top' }),
  matryonino: S('matryonino', 'Матрёнино', -1090, 82, 'riga', 12, { orientation: 'bottom' }),
  dubosekovo: S('dubosekovo', 'Дубосеково', -1125, 80, 'riga', 13, { orientation: 'top' }),
  volokolamsk: S('volokolamsk', 'Волоколамск', -1160, 78, 'riga', 14, { expressStop: true, orientation: 'bottom' }),
  km133_riga: S('km133_riga', '133 км', -1195, 76, 'riga', 14, { orientation: 'top' }),
  blagoveshchenskoe: S('blagoveshchenskoe', 'Благовещенское', -1230, 74, 'riga', 14, { orientation: 'bottom' }),
  moskvich: S('moskvich', 'Москвич (141 км)', -1265, 72, 'riga', 15, { orientation: 'top' }),
  bukholovo: S('bukholovo', 'Бухолово', -1300, 70, 'riga', 15, { orientation: 'bottom' }),
  podmoskovnye_dachi: S('podmoskovnye_dachi', 'Подмосковные дачи (149 км)', -1335, 68, 'riga', 15, { orientation: 'top' }),
  shakhovskaya: S('shakhovskaya', 'Шаховская', -1370, 66, 'riga', 16, { expressStop: true, orientation: 'bottom' }),
};