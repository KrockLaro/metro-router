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

export interface SubStationInfo {
  id: string;
  name: string;
  shortName: string;
  kind: 'railway' | 'mcd' | 'metro' | 'platform';
  description?: string;
  facilities: StationFacilities;
  scheduleStationId?: string;
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
  isHubNode?: boolean;
  subStations?: SubStationInfo[];
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
  // ЯРОСЛАВСКОЕ — ОСНОВНОЙ ХОД
  // ============================================================
  moscow3: S('moscow3', 'Москва-3', 52, -58, 'yar', 0, { orientation: 'right' }),
  malenkovskaya: S('malenkovskaya', 'Маленковская', 72, -65, 'yar', 0, { orientation: 'right' }),
  yauza: S('yauza', 'Яуза', 92, -72, 'yar', 0, { orientation: 'right' }),
  rostokino: S('rostokino', 'Ростокино', 112, -79, 'yar', 1, { expressStop: true, orientation: 'right' }),
  losinoostrovskaya: S('losinoostrovskaya', 'Лосиноостровская', 132, -86, 'yar', 1, { expressStop: true, orientation: 'right' }),
  los: S('los', 'Лось', 152, -93, 'yar', 2, { orientation: 'right' }),
  perlovskaya: S('perlovskaya', 'Перловская', 172, -100, 'yar', 2, { orientation: 'right' }),
  tayninskaya: S('tayninskaya', 'Тайнинская', 192, -107, 'yar', 3, { orientation: 'right' }),
  mytishchi: S('mytishchi', 'Мытищи', 212, -114, 'yar', 3, { expressStop: true, orientation: 'right' }),
  stroitel: S('stroitel', 'Строитель', 232, -121, 'yar', 3, { orientation: 'right' }),
  chelyuskinskaya: S('chelyuskinskaya', 'Челюскинская', 252, -128, 'yar', 3, { orientation: 'right' }),
  tarasovskaya: S('tarasovskaya', 'Тарасовская', 272, -135, 'yar', 4, { orientation: 'right' }),
  klyazma: S('klyazma', 'Клязьма', 292, -142, 'yar', 4, { orientation: 'right' }),
  mamontovskaya: S('mamontovskaya', 'Мамонтовская', 312, -149, 'yar', 4, { orientation: 'right' }),
  pushkino: S('pushkino', 'Пушкино', 332, -156, 'yar', 4, { expressStop: true, orientation: 'right' }),
  zavety_ilyicha: S('zavety_ilyicha', 'Заветы Ильича', 352, -163, 'yar', 5, { orientation: 'right' }),
  pravda: S('pravda', 'Правда', 372, -170, 'yar', 5, { orientation: 'right' }),
  zelenogradskaya: S('zelenogradskaya', 'Зеленоградская', 392, -177, 'yar', 5, { orientation: 'right' }),
  km43: S('km43', 'Нагорное (43 км)', 412, -184, 'yar', 5, { orientation: 'right' }),
  sofrino: S('sofrino', 'Софрино', 432, -191, 'yar', 6, { expressStop: true, orientation: 'right' }),
  ashukinskaya: S('ashukinskaya', 'Ашукинская', 452, -198, 'yar', 6, { orientation: 'right' }),
  kalistovo: S('kalistovo', 'Калистово', 472, -205, 'yar', 6, { orientation: 'right' }),
  radonezh: S('radonezh', 'Радонеж', 492, -212, 'yar', 6, { orientation: 'right' }),
  abramtsevo: S('abramtsevo', 'Абрамцево', 512, -219, 'yar', 7, { orientation: 'right' }),
  hotkovo: S('hotkovo', 'Хотьково', 532, -226, 'yar', 7, { expressStop: true, orientation: 'right' }),
  semhoz: S('semhoz', 'Семхоз', 552, -233, 'yar', 8, { orientation: 'right' }),
  sergiev_posad: S('sergiev_posad', 'Сергиев Посад', 572, -240, 'yar', 8, { expressStop: true, orientation: 'right' }),
  km76: S('km76', '76 км', 592, -247, 'yar', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km81: S('km81', '81 км', 612, -254, 'yar', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km83: S('km83', '83 км', 632, -261, 'yar', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  buzhaninovo: S('buzhaninovo', 'Бужаниново', 652, -268, 'yar', 10, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km90: S('km90', '90 км', 672, -275, 'yar', 10, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  arsaki: S('arsaki', 'Арсаки', 692, -282, 'yar', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  strunino: S('strunino', 'Струнино', 712, -289, 'yar', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  aleksandrov: S('aleksandrov', 'Александров-1', 732, -296, 'yar', 12, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  balakirevo: S('balakirevo', 'Балакирево', 752, -303, 'yar', 14, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ============================================================
  // МОНИНСКИЙ ХОД
  // Плавно спускается от Мытищ (Y = -114) к Фрязево (Y = -41)
  // ============================================================
  podlipki: S('podlipki', 'Подлипки-Дачные', 232, -114, 'yar_monino', 3, { orientation: 'bottom', expressStop: true, isBranch: true, branchId: 'monino' }),
  bolshevo: S('bolshevo', 'Болшево', 252, -114, 'yar_monino', 3, { orientation: 'top', expressStop: true }),
  valentinovka: S('valentinovka', 'Валентиновка', 272, -114, 'yar_monino', 4, { orientation: 'bottom', isBranch: true, branchId: 'monino' }),
  zagoryanskaya: S('zagoryanskaya', 'Загорянская', 292, -114, 'yar_monino', 4, { orientation: 'top', isBranch: true, branchId: 'monino' }),
  sokolovskaya: S('sokolovskaya', 'Соколовская', 312, -114, 'yar_monino', 4, { orientation: 'bottom', isBranch: true, branchId: 'monino' }),
  voronok: S('voronok', 'Воронок', 332, -114, 'yar_monino', 5, { orientation: 'top', isBranch: true, branchId: 'monino' }),
  shchelkovo: S('shchelkovo', 'Щёлково', 352, -114, 'yar_monino', 5, { orientation: 'bottom', isBranch: true, branchId: 'monino' }),
  gagarinskaya: S('gagarinskaya', 'Гагаринская', 372, -114, 'yar_monino', 5, { orientation: 'top', isBranch: true, branchId: 'monino' }),
  chkalovskaya: S('chkalovskaya', 'Чкаловская', 392, -108, 'yar_monino', 5, { orientation: 'top', isBranch: true, branchId: 'monino' }),
  bakhchivandzhi: S('bakhchivandzhi', 'Бахчиванджи', 412, -102, 'yar_monino', 5, { orientation: 'top', isBranch: true, branchId: 'monino' }),
  tsiolkovskaya: S('tsiolkovskaya', 'Циолковская', 432, -96, 'yar_monino', 6, { orientation: 'top', isBranch: true, branchId: 'monino' }),
  monino: S('monino', 'Монино', 452, -90, 'yar_monino', 6, { orientation: 'top', expressStop: true, isBranch: true, branchId: 'monino' }),
  kashino: S('kashino', 'Кашино', 472, -84, 'yar_monino', 7, { orientation: 'top', isBranch: true, branchId: 'monino', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  kolontaevo: S('kolontaevo', 'Колонтаево', 492, -78, 'yar_monino', 7, { orientation: 'top', isBranch: true, branchId: 'monino', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  lesnaya: S('lesnaya', 'Лесная', 512, -72, 'yar_monino', 7, { orientation: 'top', isBranch: true, branchId: 'monino', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  
  // ============================================================
  // ФРЯЗИНСКИЙ ХОД
  // ============================================================
  fabrika1maya: S('fabrika1maya', 'Фабрика 1 Мая', 272, -90, 'yar_fryazino', 3, { orientation: 'top', isBranch: true, branchId: 'fryazino' }),
  zelyony_bor: S('zelyony_bor', 'Зелёный Бор', 292, -90, 'yar_fryazino', 3, { orientation: 'bottom', isBranch: true, branchId: 'fryazino' }),
  ivanteevka2: S('ivanteevka2', 'Ивантеевка-2', 312, -90, 'yar_fryazino', 4, { orientation: 'top', expressStop: true, isBranch: true, branchId: 'fryazino' }),
  ivanteevka: S('ivanteevka', 'Ивантеевка', 332, -90, 'yar_fryazino', 4, { orientation: 'bottom', isBranch: true, branchId: 'fryazino' }),
  detskaya: S('detskaya', 'Детская', 352, -90, 'yar_fryazino', 4, { orientation: 'top', isBranch: true, branchId: 'fryazino' }),
  fryazino_tov: S('fryazino_tov', 'Фрязино-Тов.', 372, -90, 'yar_fryazino', 4, { orientation: 'bottom', isBranch: true, branchId: 'fryazino' }),
  fryazino: S('fryazino', 'Фрязино-Пасс.', 392, -90, 'yar_fryazino', 4, { orientation: 'right', expressStop: true, isBranch: true, branchId: 'fryazino' }),

  // ============================================================
  // КРАСНОАРМЕЙСКАЯ ВЕТКА
  // ============================================================
  poselok_dalniy: S('poselok_dalniy', 'Посёлок Дальний', 452, -191, 'yar_krasnoarmeysk', 7, { orientation: 'top', isBranch: true, branchId: 'krasnoarmeysk', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  rahmanovo: S('rahmanovo', 'Рахманово', 472, -191, 'yar_krasnoarmeysk', 7, { orientation: 'bottom', isBranch: true, branchId: 'krasnoarmeysk', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  fedorovskoe: S('fedorovskoe', 'Фёдоровское', 492, -191, 'yar_krasnoarmeysk', 7, { orientation: 'top', isBranch: true, branchId: 'krasnoarmeysk', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  putilovo: S('putilovo', 'Путилово', 512, -191, 'yar_krasnoarmeysk', 7, { orientation: 'bottom', isBranch: true, branchId: 'krasnoarmeysk', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  krasnoarmeysk: S('krasnoarmeysk', 'Красноармейск', 532, -191, 'yar_krasnoarmeysk', 7, { orientation: 'right', isBranch: true, branchId: 'krasnoarmeysk', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ============================================================
  // ПАВЕЛЕЦКОЕ
  // ============================================================
  m_pav: S('m_pav', 'Москва Павелецкая', 21, 77, 'pav', 0, { expressStop: true, aeroexpress: true, orientation: 'left' }),
  derbenevskaya: S('derbenevskaya', 'Дербеневская', 27, 96, 'pav', 1, { orientation: 'right' }),
  tulskaya: S('tulskaya', 'Тульская', 33, 115, 'pav', 1, { orientation: 'right' }),
  varshavskaya: S('varshavskaya', 'Варшавская', 39, 134, 'pav', 1, { expressStop: true, orientation: 'right' }),
  verhnie_kotly: S('verhnie_kotly', 'Верхние Котлы', 45, 153, 'pav', 1, { expressStop: true, aeroexpress: true, orientation: 'right' }),
  nagatinskaya: S('nagatinskaya', 'Нагатинская', 51, 172, 'pav', 2, { expressStop: true, orientation: 'right' }),
  chertanovo: S('chertanovo', 'Чертаново', 57, 191, 'pav', 2, { orientation: 'right' }),
  biryulyovo_tov: S('biryulyovo_tov', 'Бирюлёво-Товарная', 63, 210, 'pav', 2, { orientation: 'right' }),
  biryulyovo_pass: S('biryulyovo_pass', 'Бирюлёво-Пасс.', 69, 229, 'pav', 2, { expressStop: true, orientation: 'right' }),
  bulatnikovo: S('bulatnikovo', 'Булатниково', 75, 248, 'pav', 3, { orientation: 'right' }),
  rastorguevo: S('rastorguevo', 'Расторгуево', 81, 267, 'pav', 3, { expressStop: true, orientation: 'right' }),
  kalinina: S('kalinina', 'Калинина', 87, 286, 'pav', 4, { orientation: 'right' }),
  leninskaya: S('leninskaya', 'Ленинская', 93, 305, 'pav', 4, { orientation: 'right' }),
  km32: S('km32', '32 км', 99, 324, 'pav', 4, { orientation: 'right' }),
  domodedovo: S('domodedovo', 'Домодедово', 105, 343, 'pav', 5, { expressStop: true, orientation: 'right' }),

  domodedovo_junction: S('domodedovo_junction', 'Junction', 105, 343, [], 0, { isJunction: true }),
  aviacionnaya: S('aviacionnaya', 'Авиационная', 119, 357, 'pav_aero_sub', 5, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  kosmos: S('kosmos', 'Космос', 133, 371, 'pav_aero_sub', 6, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  aeroport_domodedovo: S('aeroport_domodedovo', 'Аэропорт Домодедово', 147, 385, ['pav_aero', 'pav_aero_sub'], 4, { aeroexpress: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  vzlyotnaya: S('vzlyotnaya', 'Взлётная', 111, 362, 'pav', 5, { orientation: 'left', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  vostryakovo: S('vostryakovo', 'Востряково', 117, 381, 'pav', 5, { orientation: 'left', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  belye_stolby: S('belye_stolby', 'Белые Столбы', 123, 400, 'pav', 6, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  barybino: S('barybino', 'Барыбино', 129, 419, 'pav', 7, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  danilovo_52: S('danilovo_52', 'Данилово (52 км)', 135, 438, 'pav', 6, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  privalovo: S('privalovo', 'Привалово', 141, 457, 'pav', 8, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  velyaminovo: S('velyaminovo', 'Вельяминово', 147, 476, 'pav', 7, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  mihnevo: S('mihnevo', 'Михнево', 153, 495, 'pav', 8, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  shugarovo: S('shugarovo', 'Шугарово', 159, 514, 'pav', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km85: S('km85', '85 км', 165, 533, 'pav', 10, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  zhilyovo: S('zhilyovo', 'Жилёво', 171, 552, 'pav', 10, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  sitenka: S('sitenka', 'Ситенка', 177, 571, 'pav', 10, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  stupino: S('stupino', 'Ступино', 183, 590, 'pav', 11, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  akri: S('akri', 'Акри', 189, 609, 'pav', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  belopesotsky: S('belopesotsky', 'Белопесоцкий', 195, 628, 'pav', 12, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  kashira: S('kashira', 'Кашира', 201, 647, 'pav', 12, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  tesna: S('tesna', 'Тесна', 207, 666, 'pav', 12, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  ozherelye: S('ozherelye', 'Ожерелье', 213, 685, 'pav', 13, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  zubovo_121: S('zubovo_121', 'Зубово (121 км)', 219, 704, 'pav', 13, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  purlovo: S('purlovo', 'Пурлово', 225, 723, 'pav', 14, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  kolmenka_131: S('kolmenka_131', 'Колменка (131 км)', 231, 742, 'pav', 14, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  topkanovo: S('topkanovo', 'Топканово', 237, 761, 'pav', 15, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km137: S('km137', '137 км', 243, 780, 'pav', 15, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  bogatishchevo: S('bogatishchevo', 'Богатищево', 249, 799, 'pav', 15, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km146: S('km146', '146 км', 255, 818, 'pav', 15, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  korovino: S('korovino', 'Коровино', 261, 837, 'pav', 16, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  novosyolki_152: S('novosyolki_152', 'Новосёлки (152 км)', 267, 856, 'pav', 16, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  uzunovo: S('uzunovo', 'Узуново', 273, 875, 'pav', 16, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ─── Белорусское ───
  m_bel: S('m_bel', 'Москва Белорусская', -135, -120, ['bel', 'mcd1', 'mcd4'], 0, { expressStop: true, orientation: 'left' }),
  begovaya: S('begovaya', 'Беговая', -145, -110, 'bel', 1, { orientation: 'right' }),
  testovskaya: S('testovskaya', 'Москва-Сити', -155, -100, ['bel', 'mcd1', 'mcd4'], 1, { orientation: 'left' }),
  fili: S('fili', 'Фили', -165, -90, 'bel', 2, { expressStop: true, orientation: 'right' }),
  slavyansky_bulvar: S('slavyansky_bulvar', 'Славянский Бульвар', -175, -75, 'bel', 2, { orientation: 'right' }),
  kuntsevskaya: S('kuntsevskaya', 'Кунцевская', -185, -60, 'bel', 2, { expressStop: true, orientation: 'left' }),
  rabochiy_poselok: S('rabochiy_poselok', 'Рабочий Посёлок', -195, -45, 'bel', 2, { orientation: 'right' }),
  setun: S('setun', 'Сетунь', -205, -30, 'bel', 2, { orientation: 'right' }),
  nemchinovka: S('nemchinovka', 'Немчиновка', -215, -15, 'bel', 3, { orientation: 'right' }),
  skolkovo: S('skolkovo', 'Сколково', -225, 0, 'bel', 3, { orientation: 'right' }),
  bakovka: S('bakovka', 'Баковка', -235, 15, 'bel', 3, { orientation: 'right' }),
  odintsovo: S('odintsovo', 'Одинцово', -245, 30, ['bel', 'mcd1'], 3, { expressStop: true, orientation: 'right' }),
  otradnoe: S('otradnoe', 'Отрадное', -255, 50, 'bel', 4, { orientation: 'right' }),
  pionerskaya: S('pionerskaya', 'Пионерская', -265, 70, 'bel', 4, { orientation: 'right' }),
  perhushkovo: S('perhushkovo', 'Перхушково', -275, 90, 'bel', 4, { orientation: 'right' }),
  zdravnitsa: S('zdravnitsa', 'Здравница', -285, 110, 'bel', 4, { orientation: 'right' }),
  zhavoronki: S('zhavoronki', 'Жаворонки', -295, 130, 'bel', 5, { orientation: 'right' }),
  dachnoe: S('dachnoe', 'Дачное', -305, 150, 'bel', 5, { orientation: 'right' }),
  malye_vyazemy: S('malye_vyazemy', 'Малые Вязёмы', -315, 170, 'bel', 5, { orientation: 'right' }),
  golitsyno: S('golitsyno', 'Голицыно', -325, 190, 'bel', 5, { expressStop: true, orientation: 'right' }),
  sushkinskaya: S('sushkinskaya', 'Сушкинская', -335, 205, 'bel', 6, { orientation: 'right' }),
  petelino: S('petelino', 'Петелино', -345, 220, 'bel', 6, { orientation: 'right' }),
  chastsovskaya: S('chastsovskaya', 'Часцовская', -355, 235, 'bel', 7, { orientation: 'right' }),
  portnovskaya: S('portnovskaya', 'Портновская', -365, 250, 'bel', 7, { orientation: 'right' }),
  kubinka1: S('kubinka1', 'Кубинка-1', -375, 265, 'bel', 8, { expressStop: true, orientation: 'right' }),
  chapaevka: S('chapaevka', 'Чапаевка', -385, 280, 'bel', 8, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  polushkino: S('polushkino', 'Полушкино', -395, 295, 'bel', 8, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  sanatornaya: S('sanatornaya', 'Санаторная', -405, 310, 'bel', 8, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  tuchkovo: S('tuchkovo', 'Тучково', -415, 325, 'bel', 9, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  teatralnaya: S('teatralnaya', 'Театральная', -425, 340, 'bel', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  sadovaya: S('sadovaya', 'Садовая', -435, 355, 'bel', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  dorohovo: S('dorohovo', 'Дорохово', -445, 370, 'bel', 10, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  partizanskaya: S('partizanskaya', 'Партизанская', -455, 385, 'bel', 10, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  shalikovo: S('shalikovo', 'Шаликово', -465, 400, 'bel', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  kukarinskaya: S('kukarinskaya', 'Кукаринская', -475, 415, 'bel', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  pl109km: S('pl109km', 'Платовская (109 км)', -485, 430, 'bel', 12, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  mozhaysk: S('mozhaysk', 'Можайск', -495, 445, 'bel', 12, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  borodino: S('borodino', 'Бородино', -505, 460, 'bel', 13, { expressStop: true, orientation: 'bottom', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ─── Усовская ветка ───
  // Уходит круто на юго-запад, значительно левее основного хода
  kuntsevo2: S('kuntsevo2', 'Кунцево-2', -225, -30, 'bel_usovo', 2, { expressStop: true, orientation: 'left', isBranch: true, branchId: 'usovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  romashkovo: S('romashkovo', 'Ромашково', -240, -15, 'bel_usovo', 2, { orientation: 'left', isBranch: true, branchId: 'usovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  razdory: S('razdory', 'Раздоры', -255, 0, 'bel_usovo', 2, { expressStop: true, orientation: 'left', isBranch: true, branchId: 'usovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  barviha: S('barviha', 'Барвиха', -270, 15, 'bel_usovo', 2, { expressStop: true, orientation: 'left', isBranch: true, branchId: 'usovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  ilyinskoe: S('ilyinskoe', 'Ильинское', -285, 30, 'bel_usovo', 2, { orientation: 'left', isBranch: true, branchId: 'usovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  usovo: S('usovo', 'Усово', -300, 45, 'bel_usovo', 2, { expressStop: true, orientation: 'bottom', isBranch: true, branchId: 'usovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ─── Звенигородская ветка ───
  zaharovo: S('zaharovo', 'Захарово', -345, 205, 'bel_zven', 5, { orientation: 'bottom', isBranch: true, branchId: 'zvenigorod' }),
  hlyupino: S('hlyupino', 'Хлюпино', -365, 220, 'bel_zven', 5, { orientation: 'right', isBranch: true, branchId: 'zvenigorod' }),
  skorotovo: S('skorotovo', 'Скоротово', -385, 235, 'bel_zven', 5, { orientation: 'right', isBranch: true, branchId: 'zvenigorod' }),
  zvenigorod: S('zvenigorod', 'Звенигород', -405, 250, 'bel_zven', 5, { expressStop: true, orientation: 'bottom', isBranch: true, branchId: 'zvenigorod' }),

  // ══════════════════════════════════════════════════════════════
  // САВЁЛОВСКОЕ НАПРАВЛЕНИЕ
  // ══════════════════════════════════════════════════════════════
  m_sav: S('m_sav', 'Москва Савёловская', -70, -125, ['sav', 'mcd1', 'mcd4'], 0, { expressStop: true, orientation: 'left' }),
  timiryazevskaya: S('timiryazevskaya', 'Тимирязевская', -50, -135, 'sav', 1, { orientation: 'right' }),
  petrovsko_razumovskaya: S('petrovsko_razumovskaya', 'Петровско-Разумовская', -30, -145, ['sav', 'len', 'mcd3'], 1, { orientation: 'left' }),
  okruzhnaya: S('okruzhnaya', 'Окружная', -10, -165, ['sav', 'mcd1', 'sav_aero',], 2, { expressStop: true, orientation: 'right' }),
  degunino: S('degunino', 'Дегунино', 0, -180, 'sav', 2, { orientation: 'right' }),
  beskudnikovo: S('beskudnikovo', 'Бескудниково', 0, -200, 'sav', 2, { orientation: 'right' }),
  lianozovo: S('lianozovo', 'Лианозово', 0, -220, ['sav', 'mcd1', 'sav_aero',], 2, { expressStop: true, orientation: 'right' }),
  mark: S('mark', 'Марк', 0, -240, 'sav', 2, { orientation: 'right' }),
  novodachnaya: S('novodachnaya', 'Новодачная', 0, -260, 'sav', 3, { orientation: 'right' }),
  dolgoprudnaya: S('dolgoprudnaya', 'Долгопрудная', 0, -280, 'sav', 3, { expressStop: true, orientation: 'right' }),
  vodniki: S('vodniki', 'Водники', 0, -300, 'sav', 3, { orientation: 'right' }),
  hlebnikovo: S('hlebnikovo', 'Хлебниково', 0, -320, 'sav', 3, { orientation: 'right' }),
  sheremetyevskaya: S('sheremetyevskaya', 'Шереметьевская', 0, -340, 'sav', 3, { orientation: 'right' }),
  lobnya: S('lobnya', 'Лобня', 0, -360, ['sav', 'mcd1'], 4, { expressStop: true, orientation: 'left' }),
  depo_sav: S('depo_sav', 'Депо', 0, -380, 'sav', 4, { orientation: 'right' }),
  lugovaya: S('lugovaya', 'Луговая', 0, -400, 'sav', 4, { orientation: 'right' }),
  nekrasovskaya: S('nekrasovskaya', 'Некрасовская', 0, -420, 'sav', 4, { orientation: 'right' }),
  katuar: S('katuar', 'Катуар', 0, -440, 'sav', 4, { orientation: 'right' }),
  trudovaya: S('trudovaya', 'Трудовая', 0, -460, 'sav', 5, { orientation: 'right' }),
  iksha: S('iksha', 'Икша', 0, -480, 'sav', 5, { expressStop: true, orientation: 'right' }),
  morozki: S('morozki', 'Морозки', 0, -500, 'sav', 6, { orientation: 'right' }),
  turist: S('turist', 'Турист', 0, -520, 'sav', 6, { orientation: 'right' }),
  yahroma: S('yahroma', 'Яхрома', 0, -540, 'sav', 7, { expressStop: true, orientation: 'right' }),
  dmitrov: S('dmitrov', 'Дмитров', 0, -560, 'sav', 7, { expressStop: true, orientation: 'right' }),
  kanalstroy: S('kanalstroy', 'Каналстрой', 0, -580, 'sav', 8, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  barsuchenko: S('barsuchenko', 'Имени Барсученко', 0, -600, 'sav', 8, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  orudevo: S('orudevo', 'Орудьево', 0, -620, 'sav', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  verbilki: S('verbilki', 'Вербилки', 0, -640, 'sav', 10, { expressStop: true, orientation: 'left', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  nikulki: S('nikulki', 'Никулки', 0, -660, 'sav', 10, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  zheltikovo: S('zheltikovo', 'Жёлтиково', 0, -680, 'sav', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  vlasovo: S('vlasovo', 'Власово', 0, -700, 'sav', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  taldom: S('taldom', 'Талдом', 0, -720, 'sav', 12, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  lebzino: S('lebzino', 'Лебзино', 0, -740, 'sav', 13, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  pl124km: S('pl124km', '124 км', 0, -760, 'sav', 14, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  savelovo: S('savelovo', 'Савёлово', 0, -780, 'sav', 15, { expressStop: true, orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ─── Ветка Вербилки — Дубна ───
  sorevnovanie: S('sorevnovanie', 'Соревнование', 20, -660, 'sav_dubna', 10, { orientation: 'top', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  zaprudnya: S('zaprudnya', 'Запрудня', 40, -680, 'sav_dubna', 10, { orientation: 'bottom', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  tempy: S('tempy', 'Темпы', 60, -700, 'sav_dubna', 10, { orientation: 'right', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  meldino: S('meldino', 'Мельдино', 80, -720, 'sav_dubna', 11, { orientation: 'right', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  zhivopisnoe: S('zhivopisnoe', 'Живописное (119 км)', 100, -740, 'sav_dubna', 11, { orientation: 'right', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  karmanovo: S('karmanovo', 'Карманово (122 км)', 120, -760, 'sav_dubna', 12, { orientation: 'right', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  bolshaya_volga: S('bolshaya_volga', 'Большая Волга', 140, -780, 'sav_dubna', 12, { expressStop: true, orientation: 'right', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  dubna: S('dubna', 'Дубна', 160, -800, 'sav_dubna', 13, { expressStop: true, orientation: 'top', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ─── Аэроэкспресс в Шереметьево ───
  sheremetyevo_junction: S('sheremetyevo_junction', 'Junction', 0, -340, [], 0, { isJunction: true }),
  sheremetyevo_south: S('sheremetyevo_south', 'Шереметьево — Юг (D, E, F)', 40, -360, 'sav_aero', 3, { aeroexpress: true, orientation: 'top', isBranch: true, branchId: 'sheremetyevo' }),
  sheremetyevo_north: S('sheremetyevo_north', 'Шереметьево — Север (B, C)', 60, -380, 'sav_aero', 3, { aeroexpress: true, orientation: 'bottom', isBranch: true, branchId: 'sheremetyevo' }),

  // ══════════════════════════════════════════════════════════════
  // ЛЕНИНГРАДСКОЕ НАПРАВЛЕНИЕ
  // ══════════════════════════════════════════════════════════════
  ostankino: S('ostankino', 'Останкино', 5, -100, ['len', 'mcd3'], 2, { orientation: 'right' }),
  likhobory: S('likhobory', 'Лихоборы', -36, -165, 'len', 2, { orientation: 'right' }),
  mosselsmash: S('mosselsmash', 'Моссельмаш', -42, -185, 'len', 2, { orientation: 'right' }),
  grachyovskaya: S('grachyovskaya', 'Грачёвская', -48, -205, 'len', 2, { orientation: 'right' }),
  hovrino: S('hovrino', 'Ховрино', -54, -225, 'len', 2, { orientation: 'right' }),
  levoberezhnaya: S('levoberezhnaya', 'Левобережная', -60, -245, 'len', 3, { orientation: 'right' }),
  himki: S('himki', 'Химки', -66, -265, 'len', 3, { expressStop: true, orientation: 'right' }),
  molzhaninovo: S('molzhaninovo', 'Молжаниново', -72, -285, 'len', 3, { orientation: 'right' }),
  novopodrezkovo: S('novopodrezkovo', 'Новоподрезково', -78, -305, 'len', 4, { orientation: 'right' }),
  podrezkovo: S('podrezkovo', 'Подрезково', -84, -325, 'len', 4, { orientation: 'right' }),
  shodnya: S('shodnya', 'Сходня', -90, -345, 'len', 4, { expressStop: true, orientation: 'right' }),
  firsanovskaya: S('firsanovskaya', 'Фирсановская', -96, -365, 'len', 4, { orientation: 'right' }),
  malino: S('malino', 'Малино', -102, -385, 'len', 5, { orientation: 'right' }),
  zelenograd_krukovo: S('zelenograd_krukovo', 'Зеленоград-Крюково', -108, -405, ['len', 'mcd3'], 5, { expressStop: true, orientation: 'right' }),
  alabushevo: S('alabushevo', 'Алабушево', -114, -425, 'len', 5, { orientation: 'right' }),
  radishchevo: S('radishchevo', 'Радищево', -120, -445, 'len', 6, { orientation: 'right' }),
  povarovka: S('povarovka', 'Поваровка', -126, -465, 'len', 6, { orientation: 'right' }),
  povarovo1: S('povarovo1', 'Поварово-1', -132, -485, 'len', 6, { orientation: 'right' }),
  beryozki_dachnye: S('beryozki_dachnye', 'Берёзки-Дачные', -138, -505, 'len', 6, { orientation: 'right' }),
  podsolnechnaya: S('podsolnechnaya', 'Подсолнечная', -144, -525, 'len', 7, { expressStop: true, orientation: 'right' }),
  senezh: S('senezh', 'Сенеж', -150, -545, 'len', 8, { orientation: 'right' }),
  golovkovo: S('golovkovo', 'Головково', -156, -565, 'len', 8, { orientation: 'right' }),
  pokrovka: S('pokrovka', 'Покровка', -162, -585, 'len', 8, { orientation: 'right' }),
  frolovskoe: S('frolovskoe', 'Фроловское', -168, -605, 'len', 9, { orientation: 'right' }),
  streglovo: S('streglovo', 'Стреглово', -174, -625, 'len', 9, { orientation: 'right' }),
  klin: S('klin', 'Клин', -180, -645, 'len', 10, { expressStop: true, orientation: 'right' }),
  yamuga: S('yamuga', 'Ямуга', -186, -665, 'len', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  reshetnikovo: S('reshetnikovo', 'Решетниково', -192, -685, 'len', 11, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  chernichnaya: S('chernichnaya', 'Черничная', -198, -705, 'len', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  zavidovo: S('zavidovo', 'Завидово', -204, -725, 'len', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  moskovskoe_more: S('moskovskoe_more', 'Московское Море', -210, -745, 'len', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  redkino: S('redkino', 'Редкино', -216, -765, 'len', 11, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  mezhevo: S('mezhevo', 'Межево', -222, -785, 'len', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  kuzminka: S('kuzminka', 'Кузьминка', -228, -805, 'len', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  chupriyanovka: S('chupriyanovka', 'Чуприяновка', -234, -825, 'len', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  lazurnaya: S('lazurnaya', 'Лазурная', -240, -845, 'len', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  tver: S('tver', 'Тверь', -246, -865, 'len', 11, { expressStop: true, orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ─── Ветка в Конаково ───
  puteprovodnaya: S('puteprovodnaya', 'Путепроводная', -180, -701, 'len_konakovo', 11, { orientation: 'top', isBranch: true, branchId: 'konakovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  konakovskiy_moh: S('konakovskiy_moh', 'Конаковский Мох', -168, -717, 'len_konakovo', 11, { orientation: 'left', isBranch: true, branchId: 'konakovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  donhovka: S('donhovka', 'Донховка', -156, -733, 'len_konakovo', 11, { orientation: 'right', isBranch: true, branchId: 'konakovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  konakovo_gres: S('konakovo_gres', 'Конаково ГРЭС', -144, -749, 'len_konakovo', 11, { expressStop: true, orientation: 'right', isBranch: true, branchId: 'konakovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  mitkovo: S('mitkovo', 'Митьково', 45, -55, 'mcd3', 0, { expressStop: true, orientation: 'right' }),

  // ══════════════════════════════════════════════════════════════
  // КАЗАНСКОЕ
  // ══════════════════════════════════════════════════════════════
  elektrozavodskaya: S('elektrozavodskaya', 'Электрозаводская', 75, -20, 'kaz', 1, { expressStop: true, orientation: 'right' }),
  sortirovochnaya: S('sortirovochnaya', 'Сортировочная', 95, 0, 'kaz', 1, { orientation: 'right' }),
  aviamotornaya: S('aviamotornaya', 'Авиамоторная', 115, 20, 'kaz', 2, { expressStop: true, orientation: 'right' }),
  andronovka: S('andronovka', 'Андроновка', 135, 40, 'kaz', 2, { orientation: 'right' }),
  perovo: S('perovo', 'Перово', 155, 60, 'kaz', 2, { orientation: 'right' }),
  plyushchevo: S('plyushchevo', 'Плющево', 175, 80, 'kaz', 2, { orientation: 'right' }),
  veshnyaki: S('veshnyaki', 'Вешняки', 195, 100, 'kaz', 2, { orientation: 'right' }),
  vykhino: S('vykhino', 'Выхино', 215, 120, 'kaz', 2, { expressStop: true, orientation: 'right' }),
  kosino: S('kosino', 'Косино', 235, 140, 'kaz', 2, { orientation: 'right' }),
  ukhtomskaya: S('ukhtomskaya', 'Ухтомская', 255, 160, 'kaz', 3, { orientation: 'right' }),
  lyubertsy1: S('lyubertsy1', 'Люберцы-1', 275, 180, 'kaz', 3, { expressStop: true, orientation: 'left' }),
  panki: S('panki', 'Панки', 289, 194, 'kaz', 3, { orientation: 'top' }),
  tomilino: S('tomilino', 'Томилино', 303, 208, 'kaz', 4, { orientation: 'bottom' }),
  kraskovo: S('kraskovo', 'Красково', 317, 222, 'kaz', 4, { orientation: 'top' }),
  malakhovka: S('malakhovka', 'Малаховка', 331, 236, 'kaz', 4, { orientation: 'bottom' }),
  udelnaya: S('udelnaya', 'Удельная', 345, 250, 'kaz', 4, { orientation: 'top' }),
  bykovo: S('bykovo', 'Быково', 359, 264, 'kaz', 4, { orientation: 'bottom' }),
  ilyinskaya: S('ilyinskaya', 'Ильинская', 373, 278, 'kaz', 4, { orientation: 'top' }),
  otdykh: S('otdykh', 'Отдых', 387, 292, 'kaz', 5, { orientation: 'bottom' }),
  kratovo: S('kratovo', 'Кратово', 401, 306, 'kaz', 5, { orientation: 'top' }),
  eseninskaya: S('eseninskaya', 'Есенинская', 415, 320, 'kaz', 5, { orientation: 'bottom' }),
  fabrichnaya: S('fabrichnaya', 'Фабричная', 429, 334, 'kaz', 5, { orientation: 'top' }),
  ramenskoye: S('ramenskoye', 'Раменское', 443, 348, 'kaz', 5, { expressStop: true, orientation: 'right' }),
  ippodrom: S('ippodrom', 'Ипподром', 457, 362, 'kaz', 6, { expressStop: true, orientation: 'right' }),
  sovkhoz: S('sovkhoz', 'Совхоз', 471, 376, 'kaz', 6, { orientation: 'top' }),
  zagornovo: S('zagornovo', 'Загорново', 485, 390, 'kaz', 6, { orientation: 'bottom' }),
  bronnitsy: S('bronnitsy', 'Бронницы', 499, 404, 'kaz', 7, { orientation: 'top' }),
  raduga: S('raduga', 'Радуга', 513, 418, 'kaz', 7, { orientation: 'bottom' }),
  tsibino_63: S('tsibino_63', 'Цибино (63 км)', 527, 432, 'kaz', 7, { orientation: 'top' }),
  beloozerskaya: S('beloozerskaya', 'Белоозёрская', 541, 446, 'kaz', 7, { orientation: 'bottom' }),
  faustovo: S('faustovo', 'Фаустово', 555, 460, 'kaz', 8, { orientation: 'top' }),
  zolotovo: S('zolotovo', 'Золотово', 569, 474, 'kaz', 8, { orientation: 'bottom' }),
  vinogradovo: S('vinogradovo', 'Виноградово', 583, 488, 'kaz', 8, { orientation: 'top' }),
  konobeevo: S('konobeevo', 'Конобеево', 597, 502, 'kaz', 9, { orientation: 'bottom' }),
  trofimovo_84: S('trofimovo_84', 'Трофимово (84 км)', 611, 516, 'kaz', 9, { orientation: 'top' }),
  km88: S('km88', '88 км', 625, 530, 'kaz', 10, { orientation: 'bottom' }),
  voskresensk: S('voskresensk', 'Воскресенск', 639, 544, 'kaz', 10, { expressStop: true, orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  lopatino: S('lopatino', 'Лопатино', 653, 558, 'kaz', 10, { orientation: 'bottom', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  shifernaya: S('shifernaya', 'Шиферная', 667, 572, 'kaz', 10, { orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  ilyinsky_pogost: S('ilyinsky_pogost', 'Ильинский Погост', 681, 586, 'kaz', 11, { orientation: 'bottom', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  tsemgigant: S('tsemgigant', 'Цемгигант', 695, 600, 'kaz', 11, { orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  peski: S('peski', 'Пески', 709, 614, 'kaz', 11, { orientation: 'bottom', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  konev_bor: S('konev_bor', 'Конев Бор', 723, 628, 'kaz', 11, { orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  khoroshevo: S('khoroshevo', 'Хорошево', 737, 642, 'kaz', 12, { orientation: 'bottom', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  amerevo_113: S('amerevo_113', 'Амерево (113 км)', 751, 656, 'kaz', 12, { orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  kolomna: S('kolomna', 'Коломна', 765, 670, 'kaz', 12, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  golutvin: S('golutvin', 'Голутвин', 779, 684, ['kaz', 'kaz_ozery'], 13, { expressStop: true, orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  shchurovo: S('shchurovo', 'Щурово', 793, 698, 'kaz', 13, { orientation: 'bottom', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  chyornaya: S('chyornaya', 'Чёрная', 807, 712, 'kaz', 14, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  lukhovitsy: S('lukhovitsy', 'Луховицы', 835, 740, 'kaz', 15, { expressStop: true, orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km142: S('km142', '142 км', 849, 754, 'kaz', 15, { orientation: 'bottom', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  podlipki_kaz: S('podlipki_kaz', 'Подлипки', 863, 768, 'kaz', 15, { orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  fruktovaya: S('fruktovaya', 'Фруктовая', 877, 782, 'kaz', 16, { orientation: 'bottom', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  alpatyevo: S('alpatyevo', 'Алпатьево', 891, 796, 'kaz', 16, { orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  slyomy: S('slyomy', 'Слёмы', 905, 810, 'kaz', 17, { orientation: 'bottom', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  divovo: S('divovo', 'Дивово', 919, 824, 'kaz', 17, { orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  istodniki: S('istodniki', 'Истодники', 933, 838, 'kaz', 19, { orientation: 'bottom', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km179: S('km179', '179 км', 947, 852, 'kaz', 19, { orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  rybnoye: S('rybnoye', 'Рыбное', 961, 866, 'kaz', 19, { orientation: 'bottom', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  khodynino: S('khodynino', 'Ходынино', 975, 880, 'kaz', 19, { orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  depo_ryazan: S('depo_ryazan', 'Депо', 989, 894, 'kaz', 19, { orientation: 'bottom', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  ryazan_sort: S('ryazan_sort', 'Рязань-Сорт. (Жилые дома)', 1003, 908, 'kaz', 19, { orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km187: S('km187', '187 км', 1017, 922, 'kaz', 19, { orientation: 'bottom', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km189: S('km189', '189 км', 1031, 936, 'kaz', 19, { orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  nedostoevo: S('nedostoevo', 'Недостоево', 1045, 950, 'kaz', 19, { orientation: 'bottom', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  dyagilevo: S('dyagilevo', 'Дягилево', 1059, 964, 'kaz', 19, { orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  lagerny: S('lagerny', 'Лагерный', 1073, 978, 'kaz', 19, { orientation: 'bottom', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  ryazan_1: S('ryazan_1', 'Рязань-1', 1101, 1006, 'kaz', 19, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  ryazan_2: S('ryazan_2', 'Рязань-2', 1101, 1030, 'kaz_ryazan2', 19, { expressStop: true, orientation: 'bottom', isBranch: true, branchId: 'ryazan2', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ─── Казанский ход (ответвление от Люберец-1) ───
  lyubertsy2: S('lyubertsy2', 'Люберцы-2', 340, 195, 'kaz_khod', 3, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  korenyovo: S('korenyovo', 'Коренёво', 360, 209, 'kaz_khod', 4, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  ovrazhki: S('ovrazhki', 'Овражки', 380, 223, 'kaz_khod', 4, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  rodniki: S('rodniki', 'Родники', 400, 237, 'kaz_khod', 4, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  vyalki: S('vyalki', 'Вялки', 420, 251, 'kaz_khod', 4, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  khripan: S('khripan', 'Хрипань', 440, 265, 'kaz_khod', 5, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km41_kaz: S('km41_kaz', '41 км', 460, 279, 'kaz_khod', 5, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  donino: S('donino', 'Донино', 480, 293, 'kaz_khod', 5, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  igumnovo_49: S('igumnovo_49', 'Игумново (49 км)', 500, 307, 'kaz_khod', 6, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km52: S('km52', '52 км', 520, 321, 'kaz_khod', 6, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  grigorovo: S('grigorovo', 'Григорово', 540, 335, 'kaz_khod', 6, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  gzhel_istochniki_55: S('gzhel_istochniki_55', 'Гжельские Источники (55 км)', 560, 349, 'kaz_khod', 6, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  gzhel: S('gzhel', 'Гжель', 580, 363, 'kaz_khod', 7, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  ignatyevo: S('ignatyevo', 'Игнатьево', 600, 377, 'kaz_khod', 7, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  kuzyayevo: S('kuzyayevo', 'Кузяево', 620, 391, 'kaz_khod', 7, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  shevlyagino: S('shevlyagino', 'Шевлягино', 640, 405, 'kaz_khod', 8, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  smolevo: S('smolevo', 'Смолево', 660, 419, 'kaz_khod', 8, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  antsiferovo: S('antsiferovo', 'Анциферово', 680, 433, 'kaz_khod', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  podosinki: S('podosinki', 'Подосинки', 700, 447, 'kaz_khod', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  kurovskaya: S('kurovskaya', 'Куровская', 720, 461, 'kaz_khod', 10, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  lokomotivnoe_depo_90: S('lokomotivnoe_depo_90', 'Локомотивное депо (90 км)', 740, 475, 'kaz_khod', 10, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  belivo: S('belivo', 'Беливо', 760, 489, 'kaz_khod', 10, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  avsyunino: S('avsyunino', 'Авсюнино', 780, 503, 'kaz_khod', 11, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  zapolitsy: S('zapolitsy', 'Заполицы', 800, 517, 'kaz_khod', 12, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  zaputnaya: S('zaputnaya', 'Запутная', 820, 531, 'kaz_khod', 12, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  shaturtorf: S('shaturtorf', 'Шатурторф', 840, 545, 'kaz_khod', 13, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  shatura: S('shatura', 'Шатура', 860, 559, 'kaz_khod', 13, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  botino: S('botino', 'Ботино', 880, 573, 'kaz_khod', 14, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  krivandino: S('krivandino', 'Кривандино', 900, 587, ['kaz_khod', 'kaz_ryazanovka'], 14, { expressStop: true, orientation: 'left', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  tugolesye: S('tugolesye', 'Туголесье', 940, 615, 'kaz_khod', 15, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  voymezhny: S('voymezhny', 'Воймежный', 960, 629, 'kaz_khod', 15, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  cherusti: S('cherusti', 'Черусти', 980, 643, 'kaz_khod', 16, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  struya: S('struya', 'Струя', 1000, 657, 'kaz_khod', 17, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  tasin: S('tasin', 'Тасин', 1020, 671, 'kaz_khod', 17, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  ilichyov: S('ilichyov', 'Ильичёв', 1040, 685, 'kaz_khod', 17, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  torfoprodukt: S('torfoprodukt', 'Торфопродукт', 1060, 699, 'kaz_khod', 17, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  miltsevo: S('miltsevo', 'Мильцево', 1080, 713, 'kaz_khod', 17, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  nechaevskaya: S('nechaevskaya', 'Нечаевская', 1100, 727, 'kaz_khod', 17, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  vekovka: S('vekovka', 'Вековка', 1120, 741, 'kaz_khod', 19, { expressStop: true, orientation: 'bottom', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ─── Ветка в Рязановку ───
  osanovo: S('osanovo', 'Осаново', 985, 575, 'kaz_ryazanovka', 15, { orientation: 'right', isBranch: true, branchId: 'ryazanovka', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km15_kaz: S('km15_kaz', '15 км', 1010, 563, 'kaz_ryazanovka', 15, { orientation: 'right', isBranch: true, branchId: 'ryazanovka', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  pozhoga: S('pozhoga', 'Пожога', 1035, 551, 'kaz_ryazanovka', 16, { orientation: 'right', isBranch: true, branchId: 'ryazanovka', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km29_kaz: S('km29_kaz', '29 км', 1060, 539, 'kaz_ryazanovka', 17, { orientation: 'right', isBranch: true, branchId: 'ryazanovka', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  barmino: S('barmino', 'Бармино', 1085, 527, 'kaz_ryazanovka', 18, { orientation: 'right', isBranch: true, branchId: 'ryazanovka', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  sazonovo: S('sazonovo', 'Сазоново', 1110, 515, 'kaz_ryazanovka', 18, { orientation: 'right', isBranch: true, branchId: 'ryazanovka', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km47_kaz: S('km47_kaz', '47 км', 1135, 503, 'kaz_ryazanovka', 19, { orientation: 'right', isBranch: true, branchId: 'ryazanovka', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  ryazanovka: S('ryazanovka', 'Рязановка', 1160, 491, 'kaz_ryazanovka', 19, { expressStop: true, orientation: 'top', isBranch: true, branchId: 'ryazanovka', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ─── Ветка в Озёры ───
  bachmanovo: S('bachmanovo', 'Бачманово', 759, 698, 'kaz_ozery', 13, { orientation: 'right', isBranch: true, branchId: 'ozery', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  proezd_stankostroiteley_6: S('proezd_stankostroiteley_6', 'Проезд Станкостроителей (6 км)', 739, 712, 'kaz_ozery', 13, { orientation: 'left', isBranch: true, branchId: 'ozery', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  sychyovo: S('sychyovo', 'Сычёво', 719, 726, 'kaz_ozery', 14, { orientation: 'right', isBranch: true, branchId: 'ozery', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  lystsevskaya: S('lystsevskaya', 'Лысцовская', 699, 740, 'kaz_ozery', 14, { orientation: 'right', isBranch: true, branchId: 'ozery', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  semyonovsky: S('semyonovsky', 'Семёновский', 679, 754, 'kaz_ozery', 14, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  posyolok_lesnoy_18: S('posyolok_lesnoy_18', 'Посёлок Лесной (18 км)', 659, 768, 'kaz_ozery', 15, { orientation: 'right', isBranch: true, branchId: 'ozery', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  karasyovo: S('karasyovo', 'Карасёво', 639, 782, 'kaz_ozery', 15, { orientation: 'right', isBranch: true, branchId: 'ozery', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  kudryavtsevo: S('kudryavtsevo', 'Кудрявцево', 619, 796, 'kaz_ozery', 15, { orientation: 'right', isBranch: true, branchId: 'ozery', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  danilovskaya: S('danilovskaya', 'Даниловская', 599, 810, 'kaz_ozery', 15, { orientation: 'right', isBranch: true, branchId: 'ozery', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  kholmy_30: S('kholmy_30', 'Холмы (30 км)', 579, 824, 'kaz_ozery', 16, { orientation: 'right', isBranch: true, branchId: 'ozery', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km38_kaz: S('km38_kaz', '38 км', 559, 838, 'kaz_ozery', 16, { orientation: 'right', isBranch: true, branchId: 'ozery', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  ozyory: S('ozyory', 'Озёры', 539, 852, 'kaz_ozery', 16, { expressStop: true, orientation: 'bottom', isBranch: true, branchId: 'ozery', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ══════════════════════════════════════════════════════════════
  // КУРСКОЕ
  // ══════════════════════════════════════════════════════════════
  m_kursk: S('m_kursk', 'Москва Курская', 5, 5, ['kursk', 'mcd4', 'gorky'], 0, { expressStop: true, orientation: 'left' }),
  moskva_tovarnaya: S('moskva_tovarnaya', 'Серп и Молот (Москва-Товарная)', -6, 22, ['kursk', 'mcd4', 'gorky'], 1, { orientation: 'right' }),
  kalitniki: S('kalitniki', 'Калитники', -17, 39, 'kursk', 1, { orientation: 'right' }),
  novokhokhlovskaya: S('novokhokhlovskaya', 'Новохохловская', -28, 56, 'kursk', 2, { expressStop: true, orientation: 'right' }),
  tekstilshchiki: S('tekstilshchiki', 'Текстильщики', -39, 73, 'kursk', 2, { expressStop: true, orientation: 'right' }),
  pechatniki: S('pechatniki', 'Печатники', -50, 90, 'kursk', 2, { orientation: 'right' }),
  lyublino: S('lyublino', 'Люблино', -61, 107, 'kursk', 2, { expressStop: true, orientation: 'right' }),
  depo_kursk: S('depo_kursk', 'Депо', -72, 124, 'kursk', 2, { orientation: 'right' }),
  pererva: S('pererva', 'Перерва', -83, 141, 'kursk', 2, { orientation: 'right' }),
  kuryanovo: S('kuryanovo', 'Курьяново', -94, 158, 'kursk', 2, { orientation: 'right' }),
  moskvorechye: S('moskvorechye', 'Москворечье', -105, 175, 'kursk', 3, { orientation: 'right' }),
  tsaritsyno: S('tsaritsyno', 'Царицыно', -116, 192, 'kursk', 3, { expressStop: true, orientation: 'right' }),
  pokrovskoe: S('pokrovskoe', 'Покровское', -115, 212, 'kursk', 3, { orientation: 'right' }),
  krasny_stroitel: S('krasny_stroitel', 'Красный Строитель', -114, 232, 'kursk', 4, { orientation: 'right' }),
  bittsa: S('bittsa', 'Битца', -113, 252, 'kursk', 4, { expressStop: true, orientation: 'right' }),
  butovo: S('butovo', 'Бутово', -112, 272, 'kursk', 4, { orientation: 'right' }),
  shcherbinka: S('shcherbinka', 'Щербинка', -111, 292, 'kursk', 4, { expressStop: true, orientation: 'right' }),
  ostafyevo: S('ostafyevo', 'Остафьево', -110, 312, 'kursk', 4, { orientation: 'right' }),
  silikatnaya: S('silikatnaya', 'Силикатная', -109, 332, 'kursk', 5, { orientation: 'right' }),
  podolsk: S('podolsk', 'Подольск', -108, 352, 'kursk', 5, { expressStop: true, orientation: 'right' }),
  kutuzovskaya_k: S('kutuzovskaya_k', 'Кутузовская', -114, 371, 'kursk', 6, { orientation: 'right' }),
  vesennyaya: S('vesennyaya', 'Весенняя', -120, 390, 'kursk', 6, { orientation: 'right' }),
  grivno: S('grivno', 'Гривно', -126, 409, 'kursk', 6, { expressStop: true, orientation: 'right' }),
  lvovskaya: S('lvovskaya', 'Львовская', -132, 428, 'kursk', 7, { expressStop: true, orientation: 'right' }),
  molodi: S('molodi', 'Молоди', -138, 447, 'kursk', 7, { orientation: 'right' }),
  stolbovaya: S('stolbovaya', 'Столбовая', -144, 466, 'kursk', 7, { expressStop: true, orientation: 'right' }),
  ivachkovo: S('ivachkovo', 'Ивачково (66 км)', -150, 485, 'kursk', 8, { orientation: 'right' }),
  chepelyovo: S('chepelyovo', 'Чепелёво', -156, 504, 'kursk', 8, { orientation: 'right' }),
  chekhov: S('chekhov', 'Чехов', -162, 523, 'kursk', 8, { expressStop: true, orientation: 'right' }),
  luch: S('luch', 'Луч', -167, 542, 'kursk', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  sharapova_okhota: S('sharapova_okhota', 'Шарапова Охота', -172, 561, 'kursk', 10, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km92_k: S('km92_k', '92 км', -177, 580, 'kursk', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  avangard: S('avangard', 'Авангард', -182, 599, 'kursk', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  serpukhov: S('serpukhov', 'Серпухов', -187, 618, 'kursk', 11, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  oka: S('oka', 'Ока', -192, 637, 'kursk', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km107_k: S('km107_k', '107 км', -197, 656, 'kursk', 12, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  priokskaya: S('priokskaya', 'Приокская', -202, 675, 'kursk', 12, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  romanovskie_dachi: S('romanovskie_dachi', 'Романовские дачи', -207, 694, 'kursk', 13, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  tarusskaya: S('tarusskaya', 'Тарусская', -212, 713, 'kursk', 13, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  aleksandrovka: S('aleksandrovka', 'Александровка (132 км)', -217, 732, 'kursk', 14, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  pakhomovo: S('pakhomovo', 'Пахомово', -222, 751, 'kursk', 15, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  shulgino: S('shulgino', 'Шульгино', -227, 770, 'kursk', 15, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  prostor: S('prostor', 'Простор (153 км)', -232, 789, 'kursk', 16, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  yasnogorsk: S('yasnogorsk', 'Ясногорск', -237, 808, 'kursk', 16, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  shemetovo: S('shemetovo', 'Шеметово', -242, 827, 'kursk', 17, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  baranovo: S('baranovo', 'Бараново', -247, 846, 'kursk', 17, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  revyakino: S('revyakino', 'Ревякино', -252, 865, 'kursk', 18, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  baydiki: S('baydiki', 'Байдики', -257, 884, 'kursk', 18, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  khomyakovo: S('khomyakovo', 'Хомяково', -262, 903, 'kursk', 19, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  rodnichok: S('rodnichok', 'Родничок (191 км)', -267, 922, 'kursk', 19, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  tula: S('tula', 'Тула (Московский вокзал)', -272, 941, 'kursk', 20, { expressStop: true, orientation: 'bottom', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ══════════════════════════════════════════════════════════════
  // РИЖСКОЕ
  // ══════════════════════════════════════════════════════════════
    ploshchad_trekh_vokzalov: S('ploshchad_trekh_vokzalov', 'Комсомольская площадь', 32, -38, ['yar', 'len', 'riga', 'mcd4'], 0, {
    expressStop: true, orientation: 'right', isHubNode: true,
    subStations: [
      { 
        id: 'm_yar', 
        name: 'Ярославский вокзал', 
        shortName: 'Ярославский', 
        kind: 'railway', 
        description: 'Ярославское направление, экспрессы в Сергиев Посад, Александров', 
        scheduleStationId: 'm_yar', // <--- ДОБАВЛЕНО
        facilities: { wheelchair: 'full', ticketOffice: true, ticketMachines: true, turnstiles: true, lifts: 2, escalators: 4, wc: true, waitingRoom: true, wifi: true, parking: false, bikeRacks: false, luggageStorage: true, helpDesk: true, troikaPayment: true } 
      },
      { 
        id: 'm_len', 
        name: 'Ленинградский вокзал', 
        shortName: 'Ленинградский', 
        kind: 'railway', 
        description: 'Ленинградское направление, «Сапсан», «Ласточка» в Тверь и Крюково', 
        scheduleStationId: 'm_len', // <--- ДОБАВЛЕНО
        facilities: { wheelchair: 'full', ticketOffice: true, ticketMachines: true, turnstiles: true, lifts: 3, escalators: 6, wc: true, waitingRoom: true, wifi: true, parking: false, bikeRacks: false, luggageStorage: true, helpDesk: true, troikaPayment: true } 
      },
      { 
        id: 'm_kaz', 
        name: 'Казанский вокзал', 
        shortName: 'Казанский', 
        kind: 'railway', 
        description: 'Казанское и Рязанское направления, экспрессы в Рязань', 
        scheduleStationId: 'm_kaz', // <--- ДОБАВЛЕНО
        facilities: { wheelchair: 'full', ticketOffice: true, ticketMachines: true, turnstiles: true, lifts: 2, escalators: 5, wc: true, waitingRoom: true, wifi: true, parking: false, bikeRacks: false, luggageStorage: true, helpDesk: true, troikaPayment: true } 
      },
      { 
        id: 'treh', 
        name: 'Площадь Трёх Вокзалов (МЦД-2, МЦД-4)', 
        shortName: 'МЦД', 
        kind: 'mcd', 
        description: 'Платформа МЦД-2 и МЦД-4, выход к трём вокзалам', 
        scheduleStationId: 'ploshchad_trekh_vokzalov', // <--- ДОБАВЛЕНО
        facilities: { wheelchair: 'partial', ticketOffice: false, ticketMachines: true, turnstiles: true, lifts: 0, escalators: 0, wc: false, waitingRoom: false, wifi: false, parking: false, bikeRacks: true, luggageStorage: false, helpDesk: false, troikaPayment: true } 
      }
    ],
  }),
  m_riga: S('m_riga', 'Москва Рижская', -85, -95, 'riga_m', 0, { orientation: 'right' }),
  rizhskaya: S('rizhskaya', 'Рижская', 5, -55, 'riga', 0, { expressStop: true, orientation: 'top' }),
  marya_roshcha: S('marya_roshcha', 'Марьина Роща', -15, -75, ['riga', 'mcd4'], 1, { orientation: 'bottom' }),
  dmitrovskaya: S('dmitrovskaya', 'Дмитровская', -125, -140, 'riga', 1, { expressStop: true, orientation: 'top' }),
  grazhdanskaya: S('grazhdanskaya', 'Гражданская', -137, -156, 'riga', 2, { orientation: 'bottom' }),
  krasny_balties: S('krasny_balties', 'Красный Балтиец', -149, -172, 'riga', 2, { orientation: 'top' }),
  streshnevo: S('streshnevo', 'Стрешнево', -161, -188, 'riga', 2, { orientation: 'bottom' }),
  shchukinskaya: S('shchukinskaya', 'Щукинская', -173, -204, 'riga', 2, { orientation: 'top' }),
  tushinskaya: S('tushinskaya', 'Тушинская', -185, -220, 'riga', 2, { expressStop: true, orientation: 'bottom' }),
  trikotazhnaya: S('trikotazhnaya', 'Трикотажная', -197, -236, 'riga', 2, { orientation: 'top' }),
  volokolamskaya: S('volokolamskaya', 'Волоколамская', -209, -252, 'riga', 2, { orientation: 'bottom' }),
  penyagino: S('penyagino', 'Пенягино', -221, -268, 'riga', 3, { orientation: 'top' }),
  pavshino: S('pavshino', 'Павшино', -233, -284, 'riga', 3, { expressStop: true, orientation: 'bottom' }),
  krasnogorskaya: S('krasnogorskaya', 'Красногорская', -245, -300, 'riga', 3, { orientation: 'top' }),
  opalikha: S('opalikha', 'Опалиха', -257, -316, 'riga', 4, { orientation: 'bottom' }),
  anikeevka: S('anikeevka', 'Аникеевка', -269, -332, 'riga', 4, { orientation: 'top' }),
  nahabino: S('nahabino', 'Нахабино', -281, -348, 'riga', 4, { expressStop: true, orientation: 'bottom' }),
  malinovka: S('malinovka', 'Малиновка', -293, -364, 'riga', 5, { orientation: 'top' }),
  dedovsk: S('dedovsk', 'Дедовск', -305, -380, 'riga', 5, { orientation: 'bottom' }),
  miitovskaya: S('miitovskaya', 'Миитовская', -317, -396, 'riga', 5, { orientation: 'top' }),
  snegiri: S('snegiri', 'Снегири', -329, -412, 'riga', 5, { orientation: 'bottom' }),
  km50_riga: S('km50_riga', '50 км', -341, -428, 'riga', 6, { orientation: 'top' }),
  manikhino1: S('manikhino1', 'Манихино 1', -353, -444, 'riga', 6, { expressStop: true, orientation: 'bottom' }),
  troitskaya: S('troitskaya', 'Троицкая', -365, -460, 'riga', 6, { orientation: 'top' }),
  istra: S('istra', 'Истра', -377, -476, 'riga', 7, { expressStop: true, orientation: 'bottom' }),
  novoierusalimskaya: S('novoierusalimskaya', 'Новоиерусалимская', -389, -492, 'riga', 7, { expressStop: true, orientation: 'top' }),
  chekhovskaya_riga: S('chekhovskaya_riga', 'Чеховская', -401, -508, 'riga', 7, { orientation: 'bottom' }),
  kholshcheviki: S('kholshcheviki', 'Холщёвики', -413, -524, 'riga', 8, { orientation: 'top' }),
  km73_riga: S('km73_riga', '73 км', -425, -540, 'riga', 8, { orientation: 'bottom' }),
  yadroshino: S('yadroshino', 'Ядрошино', -437, -556, 'riga', 8, { orientation: 'top' }),
  kursakovskaya: S('kursakovskaya', 'Курсаковская', -449, -572, 'riga', 9, { orientation: 'bottom' }),
  rumyantsevo: S('rumyantsevo', 'Румянцево', -461, -588, 'riga', 9, { expressStop: true, orientation: 'top' }),
  novopetrovskaya: S('novopetrovskaya', 'Новопетровская', -473, -604, 'riga', 9, { expressStop: true, orientation: 'bottom' }),
  ustinovka: S('ustinovka', 'Устиновка', -485, -620, 'riga', 10, { orientation: 'top' }),
  km91_riga: S('km91_riga', '91 км', -497, -636, 'riga', 10, { orientation: 'bottom' }),
  lesodolgorukovo: S('lesodolgorukovo', 'Лесодолгоруково', -509, -652, 'riga', 11, { expressStop: true, orientation: 'top' }),
  chismena: S('chismena', 'Чисмена', -521, -668, 'riga', 11, { orientation: 'bottom' }),
  matryonino: S('matryonino', 'Матрёнино', -533, -684, 'riga', 12, { orientation: 'top' }),
  dubosekovo: S('dubosekovo', 'Дубосеково', -545, -700, 'riga', 13, { orientation: 'bottom' }),
  volokolamsk: S('volokolamsk', 'Волоколамск', -557, -716, 'riga', 14, { expressStop: true, orientation: 'top' }),
  km133_riga: S('km133_riga', '133 км', -569, -732, 'riga', 14, { orientation: 'bottom' }),
  blagoveshchenskoe: S('blagoveshchenskoe', 'Благовещенское', -581, -748, 'riga', 14, { orientation: 'top' }),
  moskvich: S('moskvich', 'Москвич (141 км)', -593, -764, 'riga', 15, { orientation: 'bottom' }),
  bukholovo: S('bukholovo', 'Бухолово', -605, -780, 'riga', 15, { orientation: 'top' }),
  podmoskovnye_dachi: S('podmoskovnye_dachi', 'Подмосковные дачи (149 км)', -617, -796, 'riga', 15, { orientation: 'left' }),
  shakhovskaya: S('shakhovskaya', 'Шаховская', -629, -812, 'riga', 16, { expressStop: true, orientation: 'top' }),

  // ══════════════════════════════════════════════════════════════
  // МЦД-4
  // ══════════════════════════════════════════════════════════════
  kutuzovskaya_4: S('kutuzovskaya_4', 'Кутузовская', -120, -33, 'mcd4', 1, { orientation: 'right' }),

  // ══════════════════════════════════════════════════════════════
  // КИЕВСКОЕ НАПРАВЛЕНИЕ
  // ══════════════════════════════════════════════════════════════
  m_kiev: S('m_kiev', 'Москва Киевская', -60, 30, 'kiev', 0, { expressStop: true, orientation: 'right' }),
  poklonnaya: S('poklonnaya', 'Поклонная', -70, 50, ['kiev', 'mcd4'], 1, { orientation: 'right' }),
  minskaya: S('minskaya', 'Минская', -80, 70, 'kiev', 2, { orientation: 'right' }),
  matveevskaya: S('matveevskaya', 'Матвеевская', -90, 90, 'kiev', 2, { orientation: 'right' }),
  aminievskaya: S('aminievskaya', 'Аминьевская', -100, 110, 'kiev', 2, { orientation: 'right' }),
  ochakovo: S('ochakovo', 'Очаково', -110, 130, 'kiev', 2, { expressStop: true, orientation: 'right' }),
  meshcherskaya: S('meshcherskaya', 'Мещерская', -120, 150, 'kiev', 2, { orientation: 'right' }),
  solnechnaya: S('solnechnaya', 'Солнечная', -130, 170, 'kiev', 2, { expressStop: true, orientation: 'right' }),
  peredelkino: S('peredelkino', 'Переделкино', -140, 190, 'kiev', 2, { orientation: 'right' }),
  michurinets: S('michurinets', 'Мичуринец', -150, 210, 'kiev', 3, { orientation: 'right' }),
  vnukovo: S('vnukovo', 'Внуково', -160, 230, 'kiev', 3, { orientation: 'right' }),
  lesnoy_gorodok: S('lesnoy_gorodok', 'Лесной Городок', -170, 250, 'kiev', 4, { expressStop: true, orientation: 'right' }),
  tolstopaltsevo: S('tolstopaltsevo', 'Толстопальцево', -180, 270, 'kiev', 4, { orientation: 'left' }),
  kokoshkino: S('kokoshkino', 'Кокошкино', -190, 290, 'kiev', 4, { orientation: 'right' }),
  sanino: S('sanino', 'Санино', -200, 310, 'kiev', 4, { orientation: 'right' }),
  krekshino: S('krekshino', 'Крёкшино', -210, 330, 'kiev', 5, { orientation: 'right' }),
  pobeda: S('pobeda', 'Победа', -220, 350, 'kiev', 5, { orientation: 'right' }),
  aprelevka: S('aprelevka', 'Апрелевка', -230, 370, ['kiev', 'mcd4'], 5, { expressStop: true, orientation: 'right' }),
  dachnaya: S('dachnaya', 'Дачная', -240, 390, 'kiev', 5, { orientation: 'right' }),
  alabino: S('alabino', 'Алабино', -250, 410, 'kiev', 6, { orientation: 'right' }),
  selyatino: S('selyatino', 'Селятино', -260, 430, 'kiev', 6, { expressStop: true, orientation: 'right' }),
  rassudovo: S('rassudovo', 'Рассудово', -270, 450, 'kiev', 6, { orientation: 'right' }),
  ozhigovo: S('ozhigovo', 'Ожигово', -280, 470, 'kiev', 7, { orientation: 'right' }),
  bekasovo_1: S('bekasovo_1', 'Бекасово-1', -290, 490, 'kiev', 7, { orientation: 'right' }),
  zosimova_pustyn: S('zosimova_pustyn', 'Зосимова Пустынь', -300, 510, 'kiev', 7, { orientation: 'right' }),
  nara: S('nara', 'Нара', -310, 530, 'kiev', 8, { expressStop: true, orientation: 'right' }),
  latyshskaya: S('latyshskaya', 'Латышская', -320, 550, 'kiev', 8, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  bashkino: S('bashkino', 'Башкино', -330, 570, 'kiev', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  vorsino: S('vorsino', 'Ворсино', -340, 590, 'kiev', 10, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  balabanovo: S('balabanovo', 'Балабаново', -350, 610, 'kiev', 11, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  obninskoe: S('obninskoe', 'Обнинское', -360, 630, 'kiev', 12, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  shemyakino: S('shemyakino', 'Шемякино', -370, 650, 'kiev', 12, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  maloyaroslavets: S('maloyaroslavets', 'Малоярославец', -380, 670, 'kiev', 13, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  erdenevo: S('erdenevo', 'Ерденево', -390, 690, 'kiev', 14, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km140: S('km140', '140 км', -400, 710, 'kiev', 15, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  suhodrev: S('suhodrev', 'Суходрев', -410, 730, 'kiev', 15, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  rodinka: S('rodinka', 'Родинка', -420, 750, 'kiev', 16, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  slyadnevo: S('slyadnevo', 'Сляднево', -430, 770, 'kiev', 16, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km167: S('km167', '167 км', -440, 790, 'kiev', 16, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  tikhonova_pustyn: S('tikhonova_pustyn', 'Тихонова Пустынь', -450, 810, 'kiev', 17, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  muratovka: S('muratovka', 'Муратовка', -460, 830, 'kiev', 18, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  sadovaya_k: S('sadovaya_k', 'Садовая', -470, 850, 'kiev', 18, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  azarovo: S('azarovo', 'Азарово', -480, 870, 'kiev', 19, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  kaluga_1: S('kaluga_1', 'Калуга-1', -490, 890, 'kiev', 19, { expressStop: true, orientation: 'bottom', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  novoperedelkino: S('novoperedelkino', 'Новопеределкино', -130, 220, 'kiev_novoperedelkino', 2, { orientation: 'top', isBranch: true, branchId: 'novoperedelkino' }),
  vnukovo_junction: S('vnukovo_junction', 'Junction', -170, 250, [], 0, { isJunction: true }),
  aeroport_staraya: S('aeroport_staraya', 'Аэропорт (Старая платф.)', -160, 285, 'kiev_aero', 4, { orientation: 'right', isBranch: true, branchId: 'vnukovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  vnukovo_airport: S('vnukovo_airport', 'Аэропорт Внуково', -160, 320, 'kiev_aero', 4, { expressStop: true, orientation: 'right', isBranch: true, branchId: 'vnukovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),

    // ══════════════════════════════════════════════════════════════
  // ГОРЬКОВСКОЕ НАПРАВЛЕНИЕ
  // ══════════════════════════════════════════════════════════════
  nizhegorodskaya: S('nizhegorodskaya', 'Нижегородская', 37, 29, 'gorky', 2, { orientation: 'right' }),
  chukhlinka: S('chukhlinka', 'Чухлинка', 148, 57, 'gorky', 2, { orientation: 'left' }),
  kuskovo: S('kuskovo', 'Кусково', 168, 57, 'gorky', 2, { orientation: 'bottom' }),
  novogireevo: S('novogireevo', 'Новогиреево', 188, 57, 'gorky', 2, { orientation: 'bottom' }),
  reutov: S('reutov', 'Реутов', 208, 57, 'gorky', 3, { orientation: 'right' }),
  nikolskoe: S('nikolskoe', 'Никольское', 231, 50, 'gorky', 3, { orientation: 'bottom' }),
  saltykovskaya: S('saltykovskaya', 'Салтыковская', 254, 43, 'gorky', 3, { orientation: 'bottom' }),
  kuchino: S('kuchino', 'Кучино', 277, 36, 'gorky', 3, { orientation: 'bottom' }),
  olgino: S('olgino', 'Ольгино', 300, 29, 'gorky', 3, { orientation: 'bottom' }),
  zheleznodorozhnaya: S('zheleznodorozhnaya', 'Железнодорожная', 323, 22, 'gorky', 3, { expressStop: true, orientation: 'bottom' }),
  chernoye: S('chernoye', 'Чёрное', 346, 15, 'gorky', 4, { orientation: 'bottom' }),
  zarya: S('zarya', 'Заря', 369, 8, 'gorky', 4, { orientation: 'bottom' }),
  kupavna: S('kupavna', 'Купавна', 392, 1, 'gorky', 4, { orientation: 'bottom' }),
  vishnyakovo: S('vishnyakovo', 'Вишняково (33 км)', 415, -6, 'gorky', 4, { orientation: 'bottom' }),
  elektrougli: S('elektrougli', 'Электроугли', 438, -13, 'gorky', 5, { expressStop: true, orientation: 'bottom' }),
  poselok_vorovskogo: S('poselok_vorovskogo', 'Поселок Воровского (43 км)', 461, -20, 'gorky', 5, { orientation: 'bottom' }),
  khrapunovo: S('khrapunovo', 'Храпуново', 484, -27, 'gorky', 6, { orientation: 'bottom' }),
  esino: S('esino', 'Есино', 507, -34, 'gorky', 6, { orientation: 'bottom' }),
  fryazevo: S('fryazevo', 'Фрязево', 530, -41, ['yar_monino', 'gorky'], 8, { orientation: 'right', expressStop: true, isBranch: true, branchId: 'monino', facilities: { ...baseStation.facilities, troikaPayment: true } }),
  kazanskoe: S('kazanskoe', 'Казанское', 550, -48, 'gorky', 7, { orientation: 'top' }),
  vokhna: S('vokhna', 'Вохна', 570, -55, 'gorky', 8, { orientation: 'top' }),
  lenskaya: S('lenskaya', 'Ленская', 590, -62, 'gorky', 8, { orientation: 'top' }),
  nazarevo: S('nazarevo', 'Назарьево', 610, -69, 'gorky', 8, { orientation: 'top' }),
  drezna: S('drezna', 'Дрезна', 630, -76, 'gorky', 9, { orientation: 'top' }),
  kabanovo: S('kabanovo', 'Кабаново', 650, -83, 'gorky', 9, { orientation: 'top' }),
  malinovskie_luga: S('malinovskie_luga', 'Малиновские Луга (87 км)', 670, -90, 'gorky', 10, { orientation: 'top' }),
  orekhovo_zuevo: S('orekhovo_zuevo', 'Орехово-Зуево', 690, -97, 'gorky', 10, { expressStop: true, orientation: 'top' }),
  krutoe: S('krutoe', 'Крутое', 710, -104, 'gorky', 10, { orientation: 'top' }),
  
  voynovo: S('voynovo', 'Войново', 730, -111, 'gorky', 10, { orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  usad: S('usad', 'Усад', 750, -118, 'gorky', 11, { orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  glubokovo: S('glubokovo', 'Глубоково', 770, -125, 'gorky', 12, { orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  pokrov: S('pokrov', 'Покров', 790, -132, 'gorky', 12, { orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  novoe_perepochino: S('novoe_perepochino', 'Новое Перепечино (113 км)', 810, -139, 'gorky', 12, { orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  omutishche: S('omutishche', 'Омутище', 830, -146, 'gorky', 13, { orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  leonovo: S('leonovo', 'Леоново', 850, -153, 'gorky', 13, { orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  petushki: S('petushki', 'Петушки', 870, -160, 'gorky', 14, { expressStop: true, orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  kosterovo: S('kosterovo', 'Костерёво', 890, -167, 'gorky', 14, { orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  boldino: S('boldino', 'Болдино', 910, -174, 'gorky', 15, { orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  sushnevo: S('sushnevo', 'Сушнево', 930, -181, 'gorky', 16, { orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  krasnaya_okhota: S('krasnaya_okhota', 'Красная Охота', 950, -188, 'gorky', 16, { orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  undol: S('undol', 'Ундол', 970, -195, 'gorky', 17, { orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  ugor: S('ugor', 'Угор (170 км)', 990, -202, 'gorky', 18, { orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  koloksha: S('koloksha', 'Колокша', 1010, -209, 'gorky', 18, { orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  yuryevets: S('yuryevets', 'Юрьевец', 1030, -216, 'gorky', 19, { orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  vladimir: S('vladimir', 'Владимир', 1050, -223, 'gorky', 20, { expressStop: true, orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  
  // ─── Ветка в Балашиху (от Реутово вниз) ───
  stroyka: S('stroyka', 'Стройка', 218, 77, 'gorky_balashikha', 3, { orientation: 'right', isBranch: true, branchId: 'balashikha', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  gorneki: S('gorneki', 'Горнеки', 228, 97, 'gorky_balashikha', 3, { orientation: 'right', isBranch: true, branchId: 'balashikha', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  balashikha: S('balashikha', 'Балашиха', 238, 117, 'gorky_balashikha', 4, { orientation: 'right', isBranch: true, branchId: 'balashikha', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ─── Ветка в Захарово (от Фрязево вниз) ───
  metallurg: S('metallurg', 'Металлург', 540, -21, 'gorky_zakharovo', 7, { orientation: 'right', isBranch: true, branchId: 'zakharovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  elektrostal: S('elektrostal', 'Электросталь', 550, -1, 'gorky_zakharovo', 7, { orientation: 'right', isBranch: true, branchId: 'zakharovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  mashinostroitel: S('mashinostroitel', 'Машиностроитель', 560, 19, 'gorky_zakharovo', 7, { orientation: 'right', isBranch: true, branchId: 'zakharovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  noginsk: S('noginsk', 'Ногинск', 570, 39, 'gorky_zakharovo', 8, { orientation: 'right', isBranch: true, branchId: 'zakharovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  zakharovo: S('zakharovo', 'Захарово', 580, 59, 'gorky_zakharovo', 8, { orientation: 'right', isBranch: true, branchId: 'zakharovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ─── Ветка в Электрогорск (от Ленской вниз) ───
  kovrigino: S('kovrigino', 'Ковригино', 600, -42, 'gorky_elektrogorsk', 8, { orientation: 'right', isBranch: true, branchId: 'elektrogorsk', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km14_gorky: S('km14_gorky', '14 км', 610, -22, 'gorky_elektrogorsk', 9, { orientation: 'right', isBranch: true, branchId: 'elektrogorsk', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  elektrogorsk: S('elektrogorsk', 'Электрогорск', 620, -2, 'gorky_elektrogorsk', 9, { orientation: 'right', isBranch: true, branchId: 'elektrogorsk', facilities: { ...baseStation.facilities, troikaPayment: false } }),
};