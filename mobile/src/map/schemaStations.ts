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
  // Ярославское
  'm_yar', 'losinoostrovskaya', 'mytishchi', 'podlipki', 'bolshevo',
  'ivanteevka2', 'fryazino',
  'pushkino', 'sofrino', 'hotkovo', 'sergiev_posad',
  'aleksandrov', 'balakirevo',
  'monino', 'fryazevo',
  // Павелецкое
  'm_pav', 'domodedovo', 'barybino', 'mihnevo',
  'zhilyovo', 'stupino', 'kashira', 'tesna',
  'ozherelye', 'uzunovo',
  'rastorguevo', 'biryulyovo_pass', 'varshavskaya',
  'nagatinskaya', 'verhnie_kotly',
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
    id,
    name,
    x,
    y,
    lines,
    zone,
    lat: 0,
    lon: 0,
    expressStop: expressStations.includes(id),
    aeroexpress: aeroexpressStations.includes(id),
  };
  return { ...base, ...options };
};

export const STATIONS: Record<string, SchemaStation> = {
  // ============================================================
  // ЯРОСЛАВСКОЕ — ОСНОВНОЙ ХОД (диагональ на северо-восток)
  // ============================================================
  m_yar: S('m_yar', 'Москва Ярославская', 400, 1000, 'yar', 0, { expressStop: true }),
  moscow3: S('moscow3', 'Москва-3', 435, 975, 'yar', 0),
  malenkovskaya: S('malenkovskaya', 'Маленковская', 470, 950, 'yar', 0),
  yauza: S('yauza', 'Яуза', 505, 925, 'yar', 0),
  rostokino: S('rostokino', 'Ростокино', 540, 900, 'yar', 1),
  losinoostrovskaya: S('losinoostrovskaya', 'Лосиноостровская', 575, 875, 'yar', 1, { expressStop: true }),
  los: S('los', 'Лось', 610, 850, 'yar', 2),
  perlovskaya: S('perlovskaya', 'Перловская', 645, 825, 'yar', 2),
  tayninskaya: S('tayninskaya', 'Тайнинская', 680, 800, 'yar', 3),
  mytishchi: S('mytishchi', 'Мытищи', 715, 775, 'yar', 3, { expressStop: true, orientation: 'top' }),
  stroitel: S('stroitel', 'Строитель', 750, 750, 'yar', 3),
  chelyuskinskaya: S('chelyuskinskaya', 'Челюскинская', 785, 725, 'yar', 3),
  tarasovskaya: S('tarasovskaya', 'Тарасовская', 820, 700, 'yar', 4),
  klyazma: S('klyazma', 'Клязьма', 855, 675, 'yar', 4),
  mamontovskaya: S('mamontovskaya', 'Мамонтовская', 890, 650, 'yar', 4),
  pushkino: S('pushkino', 'Пушкино', 925, 625, 'yar', 4, { expressStop: true }),
  zavety_ilyicha: S('zavety_ilyicha', 'Заветы Ильича', 960, 600, 'yar', 5),
  pravda: S('pravda', 'Правда', 995, 575, 'yar', 5),
  zelenogradskaya: S('zelenogradskaya', 'Зеленоградская', 1030, 550, 'yar', 5),
  km43: S('km43', 'Нагорное (43 км)', 1065, 525, 'yar', 5),
  sofrino: S('sofrino', 'Софрино', 1100, 500, 'yar', 6, { expressStop: true }),
  ashukinskaya: S('ashukinskaya', 'Ашукинская', 1135, 475, 'yar', 6),
  kalistovo: S('kalistovo', 'Калистово', 1170, 450, 'yar', 6),
  radonezh: S('radonezh', 'Радонеж', 1205, 425, 'yar', 6),
  abramtsevo: S('abramtsevo', 'Абрамцево', 1240, 400, 'yar', 7),
  hotkovo: S('hotkovo', 'Хотьково', 1275, 375, 'yar', 7, { expressStop: true }),
  semhoz: S('semhoz', 'Семхоз', 1310, 350, 'yar', 8),
  sergiev_posad: S('sergiev_posad', 'Сергиев Посад', 1345, 325, 'yar', 8, { expressStop: true }),
  km76: S('km76', '76 км', 1380, 300, 'yar', 9, { facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km81: S('km81', '81 км', 1415, 275, 'yar', 9, { facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km83: S('km83', '83 км', 1450, 250, 'yar', 9, { facilities: { ...baseStation.facilities, troikaPayment: false } }),
  buzhaninovo: S('buzhaninovo', 'Бужаниново', 1485, 225, 'yar', 10, { facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km90: S('km90', '90 км', 1520, 200, 'yar', 10, { facilities: { ...baseStation.facilities, troikaPayment: false } }),
  arsaki: S('arsaki', 'Арсаки', 1555, 175, 'yar', 11, { facilities: { ...baseStation.facilities, troikaPayment: false } }),
  strunino: S('strunino', 'Струнино', 1590, 150, 'yar', 11, { facilities: { ...baseStation.facilities, troikaPayment: false } }),
  aleksandrov: S('aleksandrov', 'Александров-1', 1625, 125, 'yar', 12, { expressStop: true, facilities: { ...baseStation.facilities, troikaPayment: false } }),
  balakirevo: S('balakirevo', 'Балакирево', 1660, 100, 'yar', 14, { expressStop: true, facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ============================================================
  // МОНИНСКИЙ ХОД (Мытищи → восток)
  // ============================================================
  podlipki: S('podlipki', 'Подлипки-Дачные', 805, 775, 'yar', 3, { orientation: 'bottom', expressStop: true, isBranch: true, branchId: 'monino' }),
  bolshevo: S('bolshevo', 'Болшево', 895, 775, 'yar', 3, { orientation: 'top', expressStop: true }),
  valentinovka: S('valentinovka', 'Валентиновка', 985, 775, 'yar', 4, { orientation: 'bottom', isBranch: true, branchId: 'monino' }),
  zagoryanskaya: S('zagoryanskaya', 'Загорянская', 1075, 775, 'yar', 4, { orientation: 'bottom', isBranch: true, branchId: 'monino' }),
  sokolovskaya: S('sokolovskaya', 'Соколовская', 1165, 775, 'yar', 4, { orientation: 'bottom', isBranch: true, branchId: 'monino' }),
  voronok: S('voronok', 'Воронок', 1255, 775, 'yar', 5, { orientation: 'bottom', isBranch: true, branchId: 'monino' }),
  shchelkovo: S('shchelkovo', 'Щёлково', 1345, 775, 'yar', 5, { orientation: 'bottom', isBranch: true, branchId: 'monino' }),
  gagarinskaya: S('gagarinskaya', 'Гагаринская', 1435, 775, 'yar', 5, { orientation: 'bottom', isBranch: true, branchId: 'monino' }),
  chkalovskaya: S('chkalovskaya', 'Чкаловская', 1525, 775, 'yar', 5, { orientation: 'bottom', isBranch: true, branchId: 'monino' }),
  bakhchivandzhi: S('bakhchivandzhi', 'Бахчиванджи', 1615, 775, 'yar', 5, { orientation: 'bottom', isBranch: true, branchId: 'monino' }),
  tsiolkovskaya: S('tsiolkovskaya', 'Циолковская', 1705, 775, 'yar', 6, { orientation: 'bottom', isBranch: true, branchId: 'monino' }),
  monino: S('monino', 'Монино', 1795, 775, 'yar', 6, { orientation: 'bottom', expressStop: true, isBranch: true, branchId: 'monino' }),
  kashino: S('kashino', 'Кашино', 1885, 775, 'yar', 7, { orientation: 'bottom', isBranch: true, branchId: 'monino', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  kolontaevo: S('kolontaevo', 'Колонтаево', 1975, 775, 'yar', 7, { orientation: 'bottom', isBranch: true, branchId: 'monino', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  lesnaya: S('lesnaya', 'Лесная', 2065, 775, 'yar', 7, { orientation: 'bottom', isBranch: true, branchId: 'monino', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  fryazevo: S('fryazevo', 'Фрязево', 2155, 775, 'yar', 8, { orientation: 'bottom', expressStop: true, isBranch: true, branchId: 'monino', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ============================================================
  // ФРЯЗИНСКИЙ ХОД (Болшево → вверх → восток)
  // ============================================================
  fabrika1maya: S('fabrika1maya', 'Фабрика 1 Мая', 895, 400, 'yar', 3, { orientation: 'top', isBranch: true, branchId: 'fryazino' }),
  zelyony_bor: S('zelyony_bor', 'Зелёный Бор', 995, 400, 'yar', 3, { orientation: 'top', isBranch: true, branchId: 'fryazino' }),
  ivanteevka2: S('ivanteevka2', 'Ивантеевка-2', 1095, 400, 'yar', 4, { orientation: 'top', expressStop: true, isBranch: true, branchId: 'fryazino' }),
  ivanteevka: S('ivanteevka', 'Ивантеевка', 1195, 400, 'yar', 4, { orientation: 'top', isBranch: true, branchId: 'fryazino' }),
  detskaya: S('detskaya', 'Детская', 1295, 400, 'yar', 4, { orientation: 'top', isBranch: true, branchId: 'fryazino' }),
  fryazino_tov: S('fryazino_tov', 'Фрязино-Тов.', 1395, 400, 'yar', 4, { orientation: 'top', isBranch: true, branchId: 'fryazino' }),
  fryazino: S('fryazino', 'Фрязино-Пасс.', 1495, 400, 'yar', 4, { orientation: 'top', expressStop: true, isBranch: true, branchId: 'fryazino' }),

  // ============================================================
  // КРАСНОАРМЕЙСКАЯ ВЕТКА (Софрино → восток, y=600)
  // ============================================================
  poselok_dalniy: S('poselok_dalniy', 'Посёлок Дальний', 1250, 600, 'yar', 7, { orientation: 'bottom', isBranch: true, branchId: 'krasnoarmeysk', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  rahmanovo: S('rahmanovo', 'Рахманово', 1400, 600, 'yar', 7, { orientation: 'bottom', isBranch: true, branchId: 'krasnoarmeysk', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  fedorovskoe: S('fedorovskoe', 'Фёдоровское', 1550, 600, 'yar', 7, { orientation: 'bottom', isBranch: true, branchId: 'krasnoarmeysk', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  putilovo: S('putilovo', 'Путилово', 1700, 600, 'yar', 7, { orientation: 'bottom', isBranch: true, branchId: 'krasnoarmeysk', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  krasnoarmeysk: S('krasnoarmeysk', 'Красноармейск', 1850, 600, 'yar', 7, { orientation: 'bottom', isBranch: true, branchId: 'krasnoarmeysk', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ============================================================
  // ПАВЕЛЕЦКОЕ — вертикально, Москва сверху, Узуново снизу
  // ============================================================
  m_pav: S('m_pav', 'Москва Павелецкая', 150, 300, 'pav', 0, { expressStop: true, aeroexpress: true }),
  derbenevskaya: S('derbenevskaya', 'Дербеневская', 150, 345, 'pav', 1),
  tulskaya: S('tulskaya', 'Тульская', 150, 390, 'pav', 1),
  varshavskaya: S('varshavskaya', 'Варшавская', 150, 435, 'pav', 1, { expressStop: true }),
  verhnie_kotly: S('verhnie_kotly', 'Верхние Котлы', 150, 480, 'pav', 1, { expressStop: true, aeroexpress: true }),
  nagatinskaya: S('nagatinskaya', 'Нагатинская', 150, 525, 'pav', 2, { expressStop: true }),
  kolomenskoye: S('kolomenskoye', 'Коломенское', 150, 570, 'pav', 2),
  chertanovo: S('chertanovo', 'Чертаново', 150, 615, 'pav', 2),
  biryulyovo_tov: S('biryulyovo_tov', 'Бирюлёво-Товарная', 150, 660, 'pav', 2),
  biryulyovo_pass: S('biryulyovo_pass', 'Бирюлёво-Пасс.', 150, 705, 'pav', 2, { expressStop: true }),
  bulatnikovo: S('bulatnikovo', 'Булатниково', 150, 730, 'pav', 3),
  rastorguevo: S('rastorguevo', 'Расторгуево', 150, 750, 'pav', 3, { expressStop: true }),
  kalinina: S('kalinina', 'Калинина', 150, 795, 'pav', 4),
  leninskaya: S('leninskaya', 'Ленинская', 150, 840, 'pav', 4),
  km32: S('km32', '32 км', 150, 885, 'pav', 4),
  domodedovo: S('domodedovo', 'Домодедово', 150, 930, 'pav', 5, { expressStop: true }),
  aviacionnaya: S('aviacionnaya', 'Авиационная', 210, 930, 'pav_aero_sub', 5), 
  kosmos: S('kosmos', 'Космос', 210, 1020, 'pav_aero_sub', 6),
 aeroport_domodedovo: S(
    'aeroport_domodedovo',
    'Аэропорт Домодедово',
    280, 975,
    ['pav_aero', 'pav_aero_sub'],
    4,
    { aeroexpress: true },
  ),
  vzlyotnaya: S('vzlyotnaya', 'Взлётная', 150, 1020, 'pav', 5),
  vostryakovo: S('vostryakovo', 'Востряково', 150, 1065, 'pav', 5),
  belye_stolby: S('belye_stolby', 'Белые Столбы', 150, 1110, 'pav', 6),
  barybino: S('barybino', 'Барыбино', 150, 1200, 'pav', 7, { expressStop: true }),
  danilovo_52: S('danilovo_52', 'Данилово (52 км)', 150, 1155, 'pav', 6),
  privalovo: S('privalovo', 'Привалово', 150, 1290, 'pav', 8),
  velyaminovo: S('velyaminovo', 'Вельяминово', 150, 1245, 'pav', 7),
  mihnevo: S('mihnevo', 'Михнево', 150, 1335, 'pav', 8, { expressStop: true }),
  shugarovo: S('shugarovo', 'Шугарово', 150, 1350, 'pav', 9),
  km85: S('km85', '85 км', 150, 1380, 'pav', 10),
  zhilyovo: S('zhilyovo', 'Жилёво', 150, 1470, 'pav', 10, { expressStop: true }),
  sitenka: S('sitenka', 'Ситенка', 150, 1515, 'pav', 10),
  stupino: S('stupino', 'Ступино', 150, 1605, 'pav', 11, { expressStop: true }),
  akri: S('akri', 'Акри', 150, 1650, 'pav', 11),
  belopesotsky: S('belopesotsky', 'Белопесоцкий', 150, 1740, 'pav', 12),
  kashira: S('kashira', 'Кашира', 150, 1785, 'pav', 12, { expressStop: true }),
  tesna: S('tesna', 'Тесна', 150, 1830, 'pav', 12, { expressStop: true }),
  ozherelye: S('ozherelye', 'Ожерелье', 150, 1920, 'pav', 13, { expressStop: true }),
  zubovo_121: S('zubovo_121', 'Зубово (121 км)', 150, 1965, 'pav', 13),
  purlovo: S('purlovo', 'Пурлово', 150, 2055, 'pav', 14),
  kolmenka_131: S('kolmenka_131', 'Колменка (131 км)', 150, 2100, 'pav', 14),
  topkanovo: S('topkanovo', 'Топканово', 150, 2190, 'pav', 15),
  km137: S('km137', '137 км', 150, 2235, 'pav', 15),
  bogatishchevo: S('bogatishchevo', 'Богатищево', 150, 2280, 'pav', 15),
  km146: S('km146', '146 км', 150, 2325, 'pav', 15),
  korovino: S('korovino', 'Коровино', 150, 2415, 'pav', 16),
  novosyolki_152: S('novosyolki_152', 'Новосёлки (152 км)', 150, 2460, 'pav', 16),
  uzunovo: S('uzunovo', 'Узуново', 150, 2505, 'pav', 16, { expressStop: true }),
};