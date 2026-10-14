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

/**
 * Одна физическая станция внутри ТПУ (например, конкретный вокзал
 * на Комсомольской площади). Используется для агрегатных станций-хабов.
 */
export interface SubStationInfo {
  id: string;
  name: string;
  shortName: string;
  kind: 'railway' | 'mcd' | 'metro' | 'platform';
  description?: string;
  facilities: StationFacilities;
  /**
   * ID станции в GTFS/бэкенде для загрузки расписания.
   * Если undefined — ScheduleBlock не рендерится (нет данных).
   */
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
  /** Если true — это агрегатный ТПУ (набор подстанций). */
  isHubNode?: boolean;
  /** Список подстанций. Имеет смысл только при isHubNode: true. */
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
  moscow3: S('moscow3', 'Москва-3', 41, -49, 'yar', 0, { orientation: 'right' }),
  malenkovskaya: S('malenkovskaya', 'Маленковская', 50, -60, 'yar', 0, { orientation: 'right' }),
  yauza: S('yauza', 'Яуза', 59, -70, 'yar', 0, { orientation: 'right' }),
  rostokino: S('rostokino', 'Ростокино', 68, -81, 'yar', 1, { expressStop: true, orientation: 'right' }),
  losinoostrovskaya: S('losinoostrovskaya', 'Лосиноостровская', 77, -91, 'yar', 1, { expressStop: true, orientation: 'right' }),
  los: S('los', 'Лось', 86, -102, 'yar', 2, { orientation: 'left' }),
  perlovskaya: S('perlovskaya', 'Перловская', 95, -113, 'yar', 2, { orientation: 'left' }),
  tayninskaya: S('tayninskaya', 'Тайнинская', 104, -123, 'yar', 3, { orientation: 'left' }),
  mytishchi: S('mytishchi', 'Мытищи', 112, -134, 'yar', 3, { expressStop: true, orientation: 'left' }),
  stroitel: S('stroitel', 'Строитель', 121, -145, 'yar', 3, { orientation: 'left' }),
  chelyuskinskaya: S('chelyuskinskaya', 'Челюскинская', 130, -155, 'yar', 3, { orientation: 'left' }),
  tarasovskaya: S('tarasovskaya', 'Тарасовская', 139, -166, 'yar', 4, { orientation: 'left' }),
  klyazma: S('klyazma', 'Клязьма', 148, -177, 'yar', 4, { orientation: 'left' }),
  mamontovskaya: S('mamontovskaya', 'Мамонтовская', 157, -187, 'yar', 4, { orientation: 'left' }),
  pushkino: S('pushkino', 'Пушкино', 166, -198, 'yar', 4, { expressStop: true, orientation: 'left' }),
  zavety_ilyicha: S('zavety_ilyicha', 'Заветы Ильича', 175, -209, 'yar', 5, { orientation: 'left' }),
  pravda: S('pravda', 'Правда', 184, -219, 'yar', 5, { orientation: 'left' }),
  zelenogradskaya: S('zelenogradskaya', 'Зеленоградская', 193, -230, 'yar', 5, { orientation: 'left' }),
  km43: S('km43', 'Нагорное (43 км)', 202, -240, 'yar', 5, { orientation: 'left' }),
  sofrino: S('sofrino', 'Софрино', 211, -251, 'yar', 6, { expressStop: true, orientation: 'left' }),
  ashukinskaya: S('ashukinskaya', 'Ашукинская', 220, -262, 'yar', 6, { orientation: 'left' }),
  kalistovo: S('kalistovo', 'Калистово', 229, -272, 'yar', 6, { orientation: 'left' }),
  radonezh: S('radonezh', 'Радонеж', 237, -283, 'yar', 6, { orientation: 'left' }),
  abramtsevo: S('abramtsevo', 'Абрамцево', 246, -294, 'yar', 7, { orientation: 'right' }),
  hotkovo: S('hotkovo', 'Хотьково', 255, -304, 'yar', 7, { expressStop: true, orientation: 'right' }),
  semhoz: S('semhoz', 'Семхоз', 264, -315, 'yar', 8, { orientation: 'right' }),
  sergiev_posad: S('sergiev_posad', 'Сергиев Посад', 273, -326, 'yar', 8, { expressStop: true, orientation: 'right' }),
  km76: S('km76', '76 км', 282, -336, 'yar', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km81: S('km81', '81 км', 291, -347, 'yar', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km83: S('km83', '83 км', 300, -357, 'yar', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  buzhaninovo: S('buzhaninovo', 'Бужаниново', 309, -368, 'yar', 10, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km90: S('km90', '90 км', 318, -379, 'yar', 10, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  arsaki: S('arsaki', 'Арсаки', 327, -389, 'yar', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  strunino: S('strunino', 'Струнино', 336, -400, 'yar', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  aleksandrov: S('aleksandrov', 'Александров-1', 345, -411, 'yar', 12, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  balakirevo: S('balakirevo', 'Балакирево', 354, -421, 'yar', 14, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ============================================================
  // МОНИНСКИЙ ХОД
  // ============================================================
  podlipki: S('podlipki', 'Подлипки-Дачные', 133, -140, 'yar', 3, { orientation: 'left', expressStop: true, isBranch: true, branchId: 'monino' }),
  bolshevo: S('bolshevo', 'Болшево', 154, -145, 'yar', 3, { orientation: 'bottom', expressStop: true }),
  valentinovka: S('valentinovka', 'Валентиновка', 175, -151, 'yar', 4, { orientation: 'top', isBranch: true, branchId: 'monino' }),
  zagoryanskaya: S('zagoryanskaya', 'Загорянская', 197, -157, 'yar', 4, { orientation: 'bottom', isBranch: true, branchId: 'monino' }),
  sokolovskaya: S('sokolovskaya', 'Соколовская', 218, -162, 'yar', 4, { orientation: 'top', isBranch: true, branchId: 'monino' }),
  voronok: S('voronok', 'Воронок', 239, -168, 'yar', 5, { orientation: 'bottom', isBranch: true, branchId: 'monino' }),
  shchelkovo: S('shchelkovo', 'Щёлково', 260, -174, 'yar', 5, { orientation: 'top', isBranch: true, branchId: 'monino' }),
  gagarinskaya: S('gagarinskaya', 'Гагаринская', 281, -179, 'yar', 5, { orientation: 'bottom', isBranch: true, branchId: 'monino' }),
  chkalovskaya: S('chkalovskaya', 'Чкаловская', 302, -185, 'yar', 5, { orientation: 'top', isBranch: true, branchId: 'monino' }),
  bakhchivandzhi: S('bakhchivandzhi', 'Бахчиванджи', 323, -191, 'yar', 5, { orientation: 'bottom', isBranch: true, branchId: 'monino' }),
  tsiolkovskaya: S('tsiolkovskaya', 'Циолковская', 344, -196, 'yar', 6, { orientation: 'top', isBranch: true, branchId: 'monino' }),
  monino: S('monino', 'Монино', 366, -202, 'yar', 6, { orientation: 'bottom', expressStop: true, isBranch: true, branchId: 'monino' }),
  kashino: S('kashino', 'Кашино', 387, -208, 'yar', 7, { orientation: 'top', isBranch: true, branchId: 'monino', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  kolontaevo: S('kolontaevo', 'Колонтаево', 408, -213, 'yar', 7, { orientation: 'bottom', isBranch: true, branchId: 'monino', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  lesnaya: S('lesnaya', 'Лесная', 429, -219, 'yar', 7, { orientation: 'top', isBranch: true, branchId: 'monino', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  fryazevo: S('fryazevo', 'Фрязево', 450, -225, 'yar', 8, { orientation: 'bottom', expressStop: true, isBranch: true, branchId: 'monino', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ============================================================
  // ФРЯЗИНСКИЙ ХОД
  // ============================================================
  fabrika1maya: S('fabrika1maya', 'Фабрика 1 Мая', 185, -163, 'yar', 3, { orientation: 'left', isBranch: true, branchId: 'fryazino' }),
  zelyony_bor: S('zelyony_bor', 'Зелёный Бор', 216, -181, 'yar', 3, { orientation: 'top', isBranch: true, branchId: 'fryazino' }),
  ivanteevka2: S('ivanteevka2', 'Ивантеевка-2', 247, -199, 'yar', 4, { orientation: 'top', expressStop: true, isBranch: true, branchId: 'fryazino' }),
  ivanteevka: S('ivanteevka', 'Ивантеевка', 278, -216, 'yar', 4, { orientation: 'top', isBranch: true, branchId: 'fryazino' }),
  detskaya: S('detskaya', 'Детская', 309, -234, 'yar', 4, { orientation: 'bottom', isBranch: true, branchId: 'fryazino' }),
  fryazino_tov: S('fryazino_tov', 'Фрязино-Тов.', 340, -252, 'yar', 4, { orientation: 'top', isBranch: true, branchId: 'fryazino' }),
  fryazino: S('fryazino', 'Фрязино-Пасс.', 371, -270, 'yar', 4, { orientation: 'right', expressStop: true, isBranch: true, branchId: 'fryazino' }),

  // ============================================================
  // КРАСНОАРМЕЙСКАЯ ВЕТКА
  // ============================================================
  poselok_dalniy: S('poselok_dalniy', 'Посёлок Дальний', 225, -289, 'yar', 7, { orientation: 'bottom', isBranch: true, branchId: 'krasnoarmeysk', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  rahmanovo: S('rahmanovo', 'Рахманово', 238, -326, 'yar', 7, { orientation: 'top', isBranch: true, branchId: 'krasnoarmeysk', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  fedorovskoe: S('fedorovskoe', 'Фёдоровское', 252, -364, 'yar', 7, { orientation: 'bottom', isBranch: true, branchId: 'krasnoarmeysk', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  putilovo: S('putilovo', 'Путилово', 266, -401, 'yar', 7, { orientation: 'top', isBranch: true, branchId: 'krasnoarmeysk', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  krasnoarmeysk: S('krasnoarmeysk', 'Красноармейск', 279, -439, 'yar', 7, { orientation: 'bottom', isBranch: true, branchId: 'krasnoarmeysk', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ============================================================
  // ПАВЕЛЕЦКОЕ
  // ============================================================
  m_pav: S('m_pav', 'Москва Павелецкая', 21, 77, 'pav', 0, { expressStop: true, aeroexpress: true, orientation: 'right' }),
  derbenevskaya: S('derbenevskaya', 'Дербеневская', 24, 90, 'pav', 1, { orientation: 'right' }),
  tulskaya: S('tulskaya', 'Тульская', 28, 103, 'pav', 1, { orientation: 'right' }),
  varshavskaya: S('varshavskaya', 'Варшавская', 31, 117, 'pav', 1, { expressStop: true, orientation: 'right' }),
  verhnie_kotly: S('verhnie_kotly', 'Верхние Котлы', 35, 130, 'pav', 1, { expressStop: true, aeroexpress: true, orientation: 'right' }),
  nagatinskaya: S('nagatinskaya', 'Нагатинская', 38, 143, 'pav', 2, { expressStop: true, orientation: 'right' }),
  chertanovo: S('chertanovo', 'Чертаново', 42, 156, 'pav', 2, { orientation: 'right' }),
  biryulyovo_tov: S('biryulyovo_tov', 'Бирюлёво-Товарная', 45, 169, 'pav', 2, { orientation: 'right' }),
  biryulyovo_pass: S('biryulyovo_pass', 'Бирюлёво-Пасс.', 49, 182, 'pav', 2, { expressStop: true, orientation: 'right' }),
  bulatnikovo: S('bulatnikovo', 'Булатниково', 52, 195, 'pav', 3, { orientation: 'right' }),
  rastorguevo: S('rastorguevo', 'Расторгуево', 56, 208, 'pav', 3, { expressStop: true, orientation: 'right' }),
  kalinina: S('kalinina', 'Калинина', 59, 221, 'pav', 4, { orientation: 'right' }),
  leninskaya: S('leninskaya', 'Ленинская', 63, 235, 'pav', 4, { orientation: 'right' }),
  km32: S('km32', '32 км', 66, 248, 'pav', 4, { orientation: 'right' }),
  domodedovo: S('domodedovo', 'Домодедово', 70, 261, 'pav', 5, { expressStop: true, orientation: 'right', isJunction: true }),

  domodedovo_junction: S('domodedovo_junction', 'Junction', 70, 261, [], 0, { isJunction: true }),

  aviacionnaya: S('aviacionnaya', 'Авиационная', 130, 315, 'pav_aero_sub', 5, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  kosmos: S('kosmos', 'Космос', 160, 340, 'pav_aero_sub', 6, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  aeroport_domodedovo: S('aeroport_domodedovo', 'Аэропорт Домодедово', 190, 365, ['pav_aero', 'pav_aero_sub'], 4, { aeroexpress: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  vzlyotnaya: S('vzlyotnaya', 'Взлётная', 73, 274, 'pav', 5, { orientation: 'left', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  vostryakovo: S('vostryakovo', 'Востряково', 77, 287, 'pav', 5, { orientation: 'left', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  belye_stolby: S('belye_stolby', 'Белые Столбы', 80, 300, 'pav', 6, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  barybino: S('barybino', 'Барыбино', 84, 313, 'pav', 7, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  danilovo_52: S('danilovo_52', 'Данилово (52 км)', 87, 326, 'pav', 6, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  privalovo: S('privalovo', 'Привалово', 91, 339, 'pav', 8, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  velyaminovo: S('velyaminovo', 'Вельяминово', 94, 353, 'pav', 7, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  mihnevo: S('mihnevo', 'Михнево', 98, 366, 'pav', 8, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  shugarovo: S('shugarovo', 'Шугарово', 101, 379, 'pav', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km85: S('km85', '85 км', 105, 392, 'pav', 10, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  zhilyovo: S('zhilyovo', 'Жилёво', 109, 405, 'pav', 10, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  sitenka: S('sitenka', 'Ситенка', 112, 418, 'pav', 10, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  stupino: S('stupino', 'Ступино', 116, 431, 'pav', 11, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  akri: S('akri', 'Акри', 119, 444, 'pav', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  belopesotsky: S('belopesotsky', 'Белопесоцкий', 123, 457, 'pav', 12, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  kashira: S('kashira', 'Кашира', 126, 471, 'pav', 12, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  tesna: S('tesna', 'Тесна', 130, 484, 'pav', 12, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  ozherelye: S('ozherelye', 'Ожерелье', 133, 497, 'pav', 13, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  zubovo_121: S('zubovo_121', 'Зубово (121 км)', 137, 510, 'pav', 13, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  purlovo: S('purlovo', 'Пурлово', 140, 523, 'pav', 14, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  kolmenka_131: S('kolmenka_131', 'Колменка (131 км)', 144, 536, 'pav', 14, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  topkanovo: S('topkanovo', 'Топканово', 147, 549, 'pav', 15, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km137: S('km137', '137 км', 151, 562, 'pav', 15, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  bogatishchevo: S('bogatishchevo', 'Богатищево', 154, 575, 'pav', 15, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km146: S('km146', '146 км', 158, 589, 'pav', 15, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  korovino: S('korovino', 'Коровино', 161, 602, 'pav', 16, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  novosyolki_152: S('novosyolki_152', 'Новосёлки (152 км)', 165, 615, 'pav', 16, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  uzunovo: S('uzunovo', 'Узуново', 168, 628, 'pav', 16, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  m_bel: S('m_bel', 'Москва Белорусская', -135, -130, ['bel', 'mcd1', 'mcd4'], 0, { expressStop: true, orientation: 'left' }),
  begovaya: S('begovaya', 'Беговая', -125, -122, 'bel', 1, { orientation: 'right' }),
  testovskaya: S('testovskaya', 'Москва-Сити', -170, -115, ['bel', 'mcd1', 'mcd4'], 1, { orientation: 'bottom' }),
    fili: S('fili', 'Фили', -148, -110, 'bel', 2, { expressStop: true, orientation: 'right' }),
  slavyansky_bulvar: S('slavyansky_bulvar', 'Славянский Бульвар', -140, -105, 'bel', 2, { orientation: 'right' }),
  kuntsevskaya: S('kuntsevskaya', 'Кунцевская', -120, -80, 'bel', 2, { expressStop: true, orientation: 'right' }),
  rabochiy_poselok: S('rabochiy_poselok', 'Рабочий Посёлок', -130, -70, 'bel', 2, { orientation: 'right' }),
  setun: S('setun', 'Сетунь', -140, -60, 'bel', 2, { orientation: 'right' }),
  nemchinovka: S('nemchinovka', 'Немчиновка', -150, -50, 'bel', 3, { orientation: 'right' }),
  skolkovo: S('skolkovo', 'Сколково', -160, -40, 'bel', 3, { orientation: 'right' }),
  bakovka: S('bakovka', 'Баковка', -170, -30, 'bel', 3, { orientation: 'right' }),
  odintsovo: S('odintsovo', 'Одинцово', -180, -20, ['bel', 'mcd1'], 3, { expressStop: true, orientation: 'right' }),

  otradnoe: S('otradnoe', 'Отрадное', -190, 20, 'bel', 4, { orientation: 'right' }),
  pionerskaya: S('pionerskaya', 'Пионерская', -220, 52, 'bel', 4, { orientation: 'right' }),
  perhushkovo: S('perhushkovo', 'Перхушково', -250, 84, 'bel', 4, { orientation: 'right' }),
  zdravnitsa: S('zdravnitsa', 'Здравница', -280, 116, 'bel', 4, { orientation: 'right' }),
  zhavoronki: S('zhavoronki', 'Жаворонки', -310, 148, 'bel', 5, { orientation: 'right' }),
  dachnoe: S('dachnoe', 'Дачное', -340, 180, 'bel', 5, { orientation: 'right' }),
  malye_vyazemy: S('malye_vyazemy', 'Малые Вязёмы', -370, 212, 'bel', 5, { orientation: 'right' }),
  golitsyno: S('golitsyno', 'Голицыно', -400, 244, 'bel', 5, { expressStop: true, orientation: 'right' }),

  sushkinskaya: S('sushkinskaya', 'Сушкинская', -415, 255, 'bel', 6, { orientation: 'right' }),
  petelino: S('petelino', 'Петелино', -430, 265, 'bel', 6, { orientation: 'right' }),
  chastsovskaya: S('chastsovskaya', 'Часцовская', -445, 275, 'bel', 7, { orientation: 'right' }),
  portnovskaya: S('portnovskaya', 'Портновская', -460, 285, 'bel', 7, { orientation: 'right' }),
  kubinka1: S('kubinka1', 'Кубинка-1', -475, 295, 'bel', 8, { expressStop: true, orientation: 'right' }),
  chapaevka: S('chapaevka', 'Чапаевка', -490, 305, 'bel', 8, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  polushkino: S('polushkino', 'Полушкино', -505, 315, 'bel', 8, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  sanatornaya: S('sanatornaya', 'Санаторная', -520, 325, 'bel', 8, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  tuchkovo: S('tuchkovo', 'Тучково', -535, 335, 'bel', 9, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  teatralnaya: S('teatralnaya', 'Театральная', -550, 345, 'bel', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  sadovaya: S('sadovaya', 'Садовая', -565, 355, 'bel', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  dorohovo: S('dorohovo', 'Дорохово', -580, 365, 'bel', 10, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  partizanskaya: S('partizanskaya', 'Партизанская', -595, 375, 'bel', 10, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  shalikovo: S('shalikovo', 'Шаликово', -610, 385, 'bel', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  kukarinskaya: S('kukarinskaya', 'Кукаринская', -625, 395, 'bel', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  pl109km: S('pl109km', '109 км (Платовская)', -640, 405, 'bel', 12, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  mozhaysk: S('mozhaysk', 'Можайск', -655, 415, 'bel', 12, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  borodino: S('borodino', 'Бородино', -670, 425, 'bel', 13, { expressStop: true, orientation: 'bottom', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ─── Усовская ветка ───
  kuntsevo2: S('kuntsevo2', 'Кунцево-2', -160, -95, 'bel_usovo', 2, { expressStop: true, orientation: 'left', isBranch: true, branchId: 'usovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  romashkovo: S('romashkovo', 'Ромашково', -190, -110, 'bel_usovo', 2, { orientation: 'left', isBranch: true, branchId: 'usovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  razdory: S('razdory', 'Раздоры', -220, -125, 'bel_usovo', 2, { expressStop: true, orientation: 'left', isBranch: true, branchId: 'usovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  barviha: S('barviha', 'Барвиха', -250, -140, 'bel_usovo', 2, { expressStop: true, orientation: 'left', isBranch: true, branchId: 'usovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  ilyinskoe: S('ilyinskoe', 'Ильинское', -280, -155, 'bel_usovo', 2, { orientation: 'left', isBranch: true, branchId: 'usovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  usovo: S('usovo', 'Усово', -310, -170, 'bel_usovo', 2, { expressStop: true, orientation: 'top', isBranch: true, branchId: 'usovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ─── Звенигородская ветка ───
  zaharovo: S('zaharovo', 'Захарово', -425, 275, 'bel_zven', 5, { orientation: 'bottom', isBranch: true, branchId: 'zvenigorod' }),
  hlyupino: S('hlyupino', 'Хлюпино', -450, 306, 'bel_zven', 5, { orientation: 'right', isBranch: true, branchId: 'zvenigorod' }),
  skorotovo: S('skorotovo', 'Скоротово', -475, 337, 'bel_zven', 5, { orientation: 'right', isBranch: true, branchId: 'zvenigorod' }),
  zvenigorod: S('zvenigorod', 'Звенигород', -500, 368, 'bel_zven', 5, { expressStop: true, orientation: 'bottom', isBranch: true, branchId: 'zvenigorod' }),

  // ══════════════════════════════════════════════════════════════
  // САВЁЛОВСКОЕ НАПРАВЛЕНИЕ
  // Вокзал — на СЗ, ось медленно выравнивается к x=0
  // ══════════════════════════════════════════════════════════════
  m_sav: S('m_sav', 'Москва Савёловская', -70, -125, ['sav', 'mcd4'], 0, { expressStop: true, orientation: 'left' }),
  timiryazevskaya: S('timiryazevskaya', 'Тимирязевская', -45, -128, 'sav', 1, { orientation: 'right' }),
  petrovsko_razumovskaya: S('petrovsko_razumovskaya', 'Петровско-Разумовская', -20, -140, ['sav', 'len', 'mcd3'], 1, { orientation: 'left' }),
  okruzhnaya: S('okruzhnaya', 'Окружная', -5, -156, 'sav', 2, { expressStop: true, orientation: 'right' }),
  degunino: S('degunino', 'Дегунино', 0, -170, 'sav', 2, { orientation: 'right' }),
  beskudnikovo: S('beskudnikovo', 'Бескудниково', 0, -184, 'sav', 2, { orientation: 'right' }),
  lianozovo: S('lianozovo', 'Лианозово', 0, -198, 'sav', 2, { expressStop: true, orientation: 'right' }),
  mark: S('mark', 'Марк', 0, -212, 'sav', 2, { orientation: 'right' }),
  novodachnaya: S('novodachnaya', 'Новодачная', 0, -294, 'sav', 3, { orientation: 'right' }),
  dolgoprudnaya: S('dolgoprudnaya', 'Долгопрудная', 0, -308, 'sav', 3, { expressStop: true, orientation: 'right' }),
  vodniki: S('vodniki', 'Водники', 0, -322, 'sav', 3, { orientation: 'right' }),
  hlebnikovo: S('hlebnikovo', 'Хлебниково', 0, -336, 'sav', 3, { orientation: 'right' }),
  sheremetyevskaya: S('sheremetyevskaya', 'Шереметьевская', 0, -350, 'sav', 3, { orientation: 'right' }),
  lobnya: S('lobnya', 'Лобня', 0, -364, 'sav', 4, { expressStop: true, orientation: 'left' }),
  depo_sav: S('depo_sav', 'Депо', 0, -378, 'sav', 4, { orientation: 'right' }),
  lugovaya: S('lugovaya', 'Луговая', 0, -392, 'sav', 4, { orientation: 'right' }),
  nekrasovskaya: S('nekrasovskaya', 'Некрасовская', 0, -406, 'sav', 4, { orientation: 'right' }),
  katuar: S('katuar', 'Катуар', 0, -420, 'sav', 4, { orientation: 'right' }),
  trudovaya: S('trudovaya', 'Трудовая', 0, -434, 'sav', 5, { orientation: 'right' }),
  iksha: S('iksha', 'Икша', 0, -448, 'sav', 5, { expressStop: true, orientation: 'right' }),
  morozki: S('morozki', 'Морозки', 0, -462, 'sav', 6, { orientation: 'right' }),
  turist: S('turist', 'Турист', 0, -476, 'sav', 6, { orientation: 'right' }),
  yahroma: S('yahroma', 'Яхрома', 0, -490, 'sav', 7, { expressStop: true, orientation: 'right' }),
  dmitrov: S('dmitrov', 'Дмитров', 0, -504, 'sav', 7, { expressStop: true, orientation: 'right' }),
  kanalstroy: S('kanalstroy', 'Каналстрой', 0, -518, 'sav', 8, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  barsuchenko: S('barsuchenko', 'Имени Барсученко', 0, -532, 'sav', 8, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  orudevo: S('orudevo', 'Орудьево', 0, -546, 'sav', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  verbilki: S('verbilki', 'Вербилки', 0, -560, 'sav', 10, { expressStop: true, orientation: 'left', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  nikulki: S('nikulki', 'Никулки', 0, -574, 'sav', 10, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  zheltikovo: S('zheltikovo', 'Жёлтиково', 0, -588, 'sav', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  vlasovo: S('vlasovo', 'Власово', 0, -602, 'sav', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  taldom: S('taldom', 'Талдом', 0, -616, 'sav', 12, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  lebzino: S('lebzino', 'Лебзино', 0, -630, 'sav', 13, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  pl124km: S('pl124km', '124 км', 0, -644, 'sav', 14, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  savelovo: S('savelovo', 'Савёлово', 0, -658, 'sav', 15, { expressStop: true, orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ─── Ветка Вербилки — Дубна (сдвинута под новую позицию verbilki -560) ───
  sorevnovanie: S('sorevnovanie', 'Соревнование', 19, -574, 'sav_dubna', 10, { orientation: 'top', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  zaprudnya: S('zaprudnya', 'Запрудня', 38, -590, 'sav_dubna', 10, { orientation: 'bottom', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  tempy: S('tempy', 'Темпы', 57, -606, 'sav_dubna', 10, { orientation: 'right', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  meldino: S('meldino', 'Мельдино', 77, -622, 'sav_dubna', 11, { orientation: 'right', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  zhivopisnoe: S('zhivopisnoe', 'Живописное (119 км)', 96, -638, 'sav_dubna', 11, { orientation: 'right', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  karmanovo: S('karmanovo', 'Карманово (122 км)', 115, -654, 'sav_dubna', 12, { orientation: 'right', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  bolshaya_volga: S('bolshaya_volga', 'Большая Волга', 134, -670, 'sav_dubna', 12, { expressStop: true, orientation: 'right', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  dubna: S('dubna', 'Дубна', 153, -687, 'sav_dubna', 13, { expressStop: true, orientation: 'top', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ─── Аэроэкспресс в Шереметьево (сдвинут под новое lianozovo -266) ───
  sheremetyevo_junction: S('sheremetyevo_junction', 'Junction', 0, -350, [], 0, { isJunction: true }),
  sheremetyevo_south: S('sheremetyevo_south', 'Шереметьево — Юг (D, E, F)', 39, -377, 'sav_aero', 3, { aeroexpress: true, orientation: 'top', isBranch: true, branchId: 'sheremetyevo' }),
  sheremetyevo_north: S('sheremetyevo_north', 'Шереметьево — Север (B, C)', 41, -404, 'sav_aero', 3, { aeroexpress: true, orientation: 'bottom', isBranch: true, branchId: 'sheremetyevo' }),

  // ══════════════════════════════════════════════════════════════
  // ЛЕНИНГРАДСКОЕ НАПРАВЛЕНИЕ
  // Общая с Савёловским точка — Петровско-Разумовская (0, -210)
  // ══════════════════════════════════════════════════════════════
  ostankino: S('ostankino', 'Останкино', 5, -100, 'len', 2, { orientation: 'right' }),
  likhobory: S('likhobory', 'Лихоборы', -14, -224, 'len', 2, { orientation: 'right' }),
  mosselsmash: S('mosselsmash', 'Моссельмаш', -28, -238, 'len', 2, { orientation: 'right' }),
  grachyovskaya: S('grachyovskaya', 'Грачёвская', -42, -252, 'len', 2, { orientation: 'right' }),
  hovrino: S('hovrino', 'Ховрино', -56, -266, 'len', 2, { orientation: 'right' }),
  levoberezhnaya: S('levoberezhnaya', 'Левобережная', -70, -280, 'len', 3, { orientation: 'right' }),
  himki: S('himki', 'Химки', -84, -294, 'len', 3, { expressStop: true, orientation: 'right' }),
  molzhaninovo: S('molzhaninovo', 'Молжаниново', -98, -308, 'len', 3, { orientation: 'right' }),
  novopodrezkovo: S('novopodrezkovo', 'Новоподрезково', -112, -322, 'len', 4, { orientation: 'right' }),
  podrezkovo: S('podrezkovo', 'Подрезково', -126, -336, 'len', 4, { orientation: 'right' }),
  shodnya: S('shodnya', 'Сходня', -140, -350, 'len', 4, { expressStop: true, orientation: 'right' }),
  firsanovskaya: S('firsanovskaya', 'Фирсановская', -154, -364, 'len', 4, { orientation: 'right' }),
  malino: S('malino', 'Малино', -168, -378, 'len', 5, { orientation: 'right' }),
  zelenograd_krukovo: S('zelenograd_krukovo', 'Зеленоград-Крюково', -182, -392, 'len', 5, { expressStop: true, orientation: 'right' }),
  alabushevo: S('alabushevo', 'Алабушево', -196, -406, 'len', 5, { orientation: 'right' }),
  radishchevo: S('radishchevo', 'Радищево', -210, -420, 'len', 6, { orientation: 'right' }),
  povarovka: S('povarovka', 'Поваровка', -224, -434, 'len', 6, { orientation: 'right' }),
  povarovo1: S('povarovo1', 'Поварово-1', -238, -448, 'len', 6, { orientation: 'right' }),
  beryozki_dachnye: S('beryozki_dachnye', 'Берёзки-Дачные', -252, -462, 'len', 6, { orientation: 'right' }),
  podsolnechnaya: S('podsolnechnaya', 'Подсолнечная', -266, -476, 'len', 7, { expressStop: true, orientation: 'right' }),
  senezh: S('senezh', 'Сенеж', -280, -490, 'len', 8, { orientation: 'right' }),
  golovkovo: S('golovkovo', 'Головково', -294, -504, 'len', 8, { orientation: 'right' }),
  pokrovka: S('pokrovka', 'Покровка', -308, -518, 'len', 8, { orientation: 'right' }),
  frolovskoe: S('frolovskoe', 'Фроловское', -322, -532, 'len', 9, { orientation: 'right' }),
  streglovo: S('streglovo', 'Стреглово', -336, -546, 'len', 9, { orientation: 'right' }),
  klin: S('klin', 'Клин', -350, -560, 'len', 10, { expressStop: true, orientation: 'right' }),
  yamuga: S('yamuga', 'Ямуга', -364, -574, 'len', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  reshetnikovo: S('reshetnikovo', 'Решетниково', -378, -588, 'len', 11, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  chernichnaya: S('chernichnaya', 'Черничная', -392, -602, 'len', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  zavidovo: S('zavidovo', 'Завидово', -406, -616, 'len', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  moskovskoe_more: S('moskovskoe_more', 'Московское Море', -420, -630, 'len', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  redkino: S('redkino', 'Редкино', -434, -644, 'len', 11, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  mezhevo: S('mezhevo', 'Межево', -448, -658, 'len', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  kuzminka: S('kuzminka', 'Кузьминка', -462, -672, 'len', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  chupriyanovka: S('chupriyanovka', 'Чуприяновка', -476, -686, 'len', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  lazurnaya: S('lazurnaya', 'Лазурная', -490, -700, 'len', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  tver: S('tver', 'Тверь', -504, -714, 'len', 11, { expressStop: true, orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ─── Ветка в Конаково (от нового reshetnikovo -588) ───
  puteprovodnaya: S('puteprovodnaya', 'Путепроводная', -398, -570, 'len_konakovo', 11, { orientation: 'top', isBranch: true, branchId: 'konakovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  konakovskiy_moh: S('konakovskiy_moh', 'Конаковский Мох', -418, -552, 'len_konakovo', 11, { orientation: 'left', isBranch: true, branchId: 'konakovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  donhovka: S('donhovka', 'Донховка', -438, -534, 'len_konakovo', 11, { orientation: 'right', isBranch: true, branchId: 'konakovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  konakovo_gres: S('konakovo_gres', 'Конаково ГРЭС', -458, -516, 'len_konakovo', 11, { expressStop: true, orientation: 'right', isBranch: true, branchId: 'konakovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),

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

  // ─── Линия в Рязань ───
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
  golutvin: S('golutvin', 'Голутвин', 779, 684, ['kaz', 'kaz_ozery',], 13, { expressStop: true, orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
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
  // Рязань-1 — конец основного хода
  ryazan_1: S('ryazan_1', 'Рязань-1', 1101, 1006, 'kaz', 19, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  // Рязань-2 — тупик на отдельной ветке, ответвление от Лагерного
  ryazan_2: S('ryazan_2', 'Рязань-2', 1101, 1030, 'kaz_ryazan2', 19, { expressStop: true, orientation: 'bottom', isBranch: true, branchId: 'ryazan2', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ─── Казанский ход (ответвление от Люберец-1) ───
  // Шаг по x растянут (20/14), чтобы линия расходилась с основным ходом
  // Тройка на всём ходу не действует — см. ТЗ
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

  // ─── Ветка в Рязановку (от Кривандина на СВ) ───
  osanovo: S('osanovo', 'Осаново', 985, 575, 'kaz_ryazanovka', 15, { orientation: 'right', isBranch: true, branchId: 'ryazanovka', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km15_kaz: S('km15_kaz', '15 км', 1010, 563, 'kaz_ryazanovka', 15, { orientation: 'right', isBranch: true, branchId: 'ryazanovka', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  pozhoga: S('pozhoga', 'Пожога', 1035, 551, 'kaz_ryazanovka', 16, { orientation: 'right', isBranch: true, branchId: 'ryazanovka', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km29_kaz: S('km29_kaz', '29 км', 1060, 539, 'kaz_ryazanovka', 17, { orientation: 'right', isBranch: true, branchId: 'ryazanovka', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  barmino: S('barmino', 'Бармино', 1085, 527, 'kaz_ryazanovka', 18, { orientation: 'right', isBranch: true, branchId: 'ryazanovka', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  sazonovo: S('sazonovo', 'Сазоново', 1110, 515, 'kaz_ryazanovka', 18, { orientation: 'right', isBranch: true, branchId: 'ryazanovka', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km47_kaz: S('km47_kaz', '47 км', 1135, 503, 'kaz_ryazanovka', 19, { orientation: 'right', isBranch: true, branchId: 'ryazanovka', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  ryazanovka: S('ryazanovka', 'Рязановка', 1160, 491, 'kaz_ryazanovka', 19, { expressStop: true, orientation: 'top', isBranch: true, branchId: 'ryazanovka', facilities: { ...baseStation.facilities, troikaPayment: false } }),

    // ─── Ветка в Озёры (от Голутвина на ЮЗ) ───
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
  m_kursk: S('m_kursk', 'Москва Курская', 5, 5, ['kursk', 'mcd4'], 0, { expressStop: true, orientation: 'left' }),
  moskva_tovarnaya: S('moskva_tovarnaya', 'Серп и Молот (Москва-Товарная)', -4, 19, ['kursk', 'mcd4'], 1, { orientation: 'right' }),
  kalitniki: S('kalitniki', 'Калитники', -13, 32, 'kursk', 1, { orientation: 'right' }),
  novokhokhlovskaya: S('novokhokhlovskaya', 'Новохохловская', -21, 46, 'kursk', 2, { expressStop: true, orientation: 'right' }),
  tekstilshchiki: S('tekstilshchiki', 'Текстильщики', -29, 59, 'kursk', 2, { expressStop: true, orientation: 'right' }),
  pechatniki: S('pechatniki', 'Печатники', -38, 73, 'kursk', 2, { orientation: 'right' }),
  lyublino: S('lyublino', 'Люблино', -46, 86, 'kursk', 2, { expressStop: true, orientation: 'right' }),
  depo_kursk: S('depo_kursk', 'Депо', -55, 100, 'kursk', 2, { orientation: 'right' }),
  pererva: S('pererva', 'Перерва', -63, 113, 'kursk', 2, { orientation: 'right' }),
  kuryanovo: S('kuryanovo', 'Курьяново', -72, 127, 'kursk', 2, { orientation: 'right' }),
  moskvorechye: S('moskvorechye', 'Москворечье', -80, 140, 'kursk', 3, { orientation: 'right' }),
  tsaritsyno: S('tsaritsyno', 'Царицыно', -89, 153, 'kursk', 3, { expressStop: true, orientation: 'right' }),
  pokrovskoe: S('pokrovskoe', 'Покровское', -88, 171, 'kursk', 3, { orientation: 'right' }),
  krasny_stroitel: S('krasny_stroitel', 'Красный Строитель', -87, 189, 'kursk', 4, { orientation: 'right' }),
  bittsa: S('bittsa', 'Битца', -86, 207, 'kursk', 4, { expressStop: true, orientation: 'right' }),
  butovo: S('butovo', 'Бутово', -85, 225, 'kursk', 4, { orientation: 'right' }),
  shcherbinka: S('shcherbinka', 'Щербинка', -84, 243, 'kursk', 4, { expressStop: true, orientation: 'right' }),
  ostafyevo: S('ostafyevo', 'Остафьево', -83, 261, 'kursk', 4, { orientation: 'right' }),
  silikatnaya: S('silikatnaya', 'Силикатная', -82, 280, 'kursk', 5, { orientation: 'right' }),
  podolsk: S('podolsk', 'Подольск', -80, 299, 'kursk', 5, { expressStop: true, orientation: 'right' }),
  kutuzovskaya_k: S('kutuzovskaya_k', 'Кутузовская', -83, 311, 'kursk', 6, { orientation: 'right' }),
  vesennyaya: S('vesennyaya', 'Весенняя', -87, 323, 'kursk', 6, { orientation: 'right' }),
  grivno: S('grivno', 'Гривно', -90, 335, 'kursk', 6, { expressStop: true, orientation: 'right' }),
  lvovskaya: S('lvovskaya', 'Львовская', -93, 348, 'kursk', 7, { expressStop: true, orientation: 'right' }),
  molodi: S('molodi', 'Молоди', -96, 360, 'kursk', 7, { orientation: 'right' }),
  stolbovaya: S('stolbovaya', 'Столбовая', -100, 372, 'kursk', 7, { expressStop: true, orientation: 'right' }),
  ivachkovo: S('ivachkovo', 'Ивачково (66 км)', -103, 384, 'kursk', 8, { orientation: 'right' }),
  chepelyovo: S('chepelyovo', 'Чепелёво', -106, 396, 'kursk', 8, { orientation: 'right' }),
  chekhov: S('chekhov', 'Чехов', -109, 408, 'kursk', 8, { expressStop: true, orientation: 'right' }),
  luch: S('luch', 'Луч', -113, 421, 'kursk', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  sharapova_okhota: S('sharapova_okhota', 'Шарапова Охота', -116, 433, 'kursk', 10, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km92_k: S('km92_k', '92 км', -119, 445, 'kursk', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  avangard: S('avangard', 'Авангард', -122, 457, 'kursk', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  serpukhov: S('serpukhov', 'Серпухов', -126, 469, 'kursk', 11, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  oka: S('oka', 'Ока', -129, 481, 'kursk', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  km107_k: S('km107_k', '107 км', -132, 494, 'kursk', 12, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  priokskaya: S('priokskaya', 'Приокская', -136, 506, 'kursk', 12, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  romanovskie_dachi: S('romanovskie_dachi', 'Романовские дачи', -139, 518, 'kursk', 13, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  tarusskaya: S('tarusskaya', 'Тарусская', -142, 530, 'kursk', 13, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  aleksandrovka: S('aleksandrovka', 'Александровка (132 км)', -145, 542, 'kursk', 14, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  pakhomovo: S('pakhomovo', 'Пахомово', -149, 554, 'kursk', 15, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  shulgino: S('shulgino', 'Шульгино', -152, 567, 'kursk', 15, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  prostor: S('prostor', 'Простор (153 км)', -155, 579, 'kursk', 16, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  yasnogorsk: S('yasnogorsk', 'Ясногорск', -158, 591, 'kursk', 16, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  shemetovo: S('shemetovo', 'Шеметово', -162, 603, 'kursk', 17, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  baranovo: S('baranovo', 'Бараново', -165, 615, 'kursk', 17, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  revyakino: S('revyakino', 'Ревякино', -168, 627, 'kursk', 18, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  baydiki: S('baydiki', 'Байдики', -171, 640, 'kursk', 18, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  khomyakovo: S('khomyakovo', 'Хомяково', -175, 652, 'kursk', 19, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  rodnichok: S('rodnichok', 'Родничок (191 км)', -178, 664, 'kursk', 19, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  tula: S('tula', 'Тула (Московский вокзал)', -181, 676, 'kursk', 20, { expressStop: true, orientation: 'bottom', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ══════════════════════════════════════════════════════════════
  // РИЖСКОЕ
  // ══════════════════════════════════════════════════════════════
      ploshchad_trekh_vokzalov: S('ploshchad_trekh_vokzalov', 'Комсомольская площадь', 32, -38, ['yar', 'len'], 0, {
    expressStop: true,
    orientation: 'right',
    isHubNode: true,
    subStations: [
      {
        id: 'm_yar',
        name: 'Ярославский вокзал',
        shortName: 'Ярославский',
        kind: 'railway',
        description: 'Ярославское направление, экспрессы в Сергиев Посад, Александров',
        facilities: {
          wheelchair: 'full',
          ticketOffice: true,
          ticketMachines: true,
          turnstiles: true,
          lifts: 2,
          escalators: 4,
          wc: true,
          waitingRoom: true,
          wifi: true,
          parking: false,
          bikeRacks: false,
          luggageStorage: true,
          helpDesk: true,
          troikaPayment: true,
        },
      },
      {
        id: 'm_len',
        name: 'Ленинградский вокзал',
        shortName: 'Ленинградский',
        kind: 'railway',
        description: 'Ленинградское направление, «Сапсан», «Ласточка» в Тверь и Крюково',
        facilities: {
          wheelchair: 'full',
          ticketOffice: true,
          ticketMachines: true,
          turnstiles: true,
          lifts: 3,
          escalators: 6,
          wc: true,
          waitingRoom: true,
          wifi: true,
          parking: false,
          bikeRacks: false,
          luggageStorage: true,
          helpDesk: true,
          troikaPayment: true,
        },
      },
      {
        id: 'm_kaz',
        name: 'Казанский вокзал',
        shortName: 'Казанский',
        kind: 'railway',
        description: 'Казанское и Рязанское направления, экспрессы в Рязань',
        facilities: {
          wheelchair: 'full',
          ticketOffice: true,
          ticketMachines: true,
          turnstiles: true,
          lifts: 2,
          escalators: 5,
          wc: true,
          waitingRoom: true,
          wifi: true,
          parking: false,
          bikeRacks: false,
          luggageStorage: true,
          helpDesk: true,
          troikaPayment: true,
        },
      },
      {
        id: 'treh',
        name: 'Площадь Трёх Вокзалов (МЦД-2, МЦД-4)',
        shortName: 'МЦД',
        kind: 'mcd',
        description: 'Платформа МЦД-2 и МЦД-4, выход к трём вокзалам',
        facilities: {
          wheelchair: 'partial',
          ticketOffice: false,
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
      },
    ],
  }),
  m_riga: S('m_riga', 'Москва Рижская', -20, -70, 'riga_m', 0, { orientation: 'right' }),
  rizhskaya: S('rizhskaya', 'Рижская', -35, -95, 'riga', 0, { expressStop: true, orientation: 'top' }),
  marya_roshcha: S('marya_roshcha', 'Марьина Роща', 0, -105, ['riga', 'mcd4'], 1, { orientation: 'bottom' }),
  dmitrovskaya: S('dmitrovskaya', 'Дмитровская', -54, -125, 'riga', 1, { expressStop: true, orientation: 'top' }),
  grazhdanskaya: S('grazhdanskaya', 'Гражданская', -66, -125, 'riga', 2, { orientation: 'bottom' }),
  krasny_balties: S('krasny_balties', 'Красный Балтиец', -78, -135, 'riga', 2, { orientation: 'top' }),
  streshnevo: S('streshnevo', 'Стрешнево', -90, -145, 'riga', 2, { orientation: 'bottom' }),
  shchukinskaya: S('shchukinskaya', 'Щукинская', -102, -155, 'riga', 2, { orientation: 'top' }),
  tushinskaya: S('tushinskaya', 'Тушинская', -114, -165, 'riga', 2, { expressStop: true, orientation: 'bottom' }),
  trikotazhnaya: S('trikotazhnaya', 'Трикотажная', -126, -175, 'riga', 2, { orientation: 'top' }),
  volokolamskaya: S('volokolamskaya', 'Волоколамская', -138, -185, 'riga', 2, { orientation: 'bottom' }),
  penyagino: S('penyagino', 'Пенягино', -150, -195, 'riga', 3, { orientation: 'top' }),
  pavshino: S('pavshino', 'Павшино', -162, -205, 'riga', 3, { expressStop: true, orientation: 'bottom' }),
  krasnogorskaya: S('krasnogorskaya', 'Красногорская', -174, -215, 'riga', 3, { orientation: 'top' }),
  opalikha: S('opalikha', 'Опалиха', -186, -225, 'riga', 4, { orientation: 'bottom' }),
  anikeevka: S('anikeevka', 'Аникеевка', -198, -235, 'riga', 4, { orientation: 'top' }),
  nahabino: S('nahabino', 'Нахабино', -210, -245, 'riga', 4, { expressStop: true, orientation: 'bottom' }),
  malinovka: S('malinovka', 'Малиновка', -222, -255, 'riga', 5, { orientation: 'top' }),
  dedovsk: S('dedovsk', 'Дедовск', -234, -265, 'riga', 5, { orientation: 'bottom' }),
  miitovskaya: S('miitovskaya', 'Миитовская', -246, -275, 'riga', 5, { orientation: 'top' }),
  snegiri: S('snegiri', 'Снегири', -258, -285, 'riga', 5, { orientation: 'bottom' }),
  km50_riga: S('km50_riga', '50 км', -270, -295, 'riga', 6, { orientation: 'top' }),
  manikhino1: S('manikhino1', 'Манихино 1', -282, -305, 'riga', 6, { expressStop: true, orientation: 'bottom' }),
  troitskaya: S('troitskaya', 'Троицкая', -294, -315, 'riga', 6, { orientation: 'top' }),
  istra: S('istra', 'Истра', -306, -325, 'riga', 7, { expressStop: true, orientation: 'bottom' }),
  novoierusalimskaya: S('novoierusalimskaya', 'Новоиерусалимская', -318, -335, 'riga', 7, { expressStop: true, orientation: 'top' }),
  chekhovskaya_riga: S('chekhovskaya_riga', 'Чеховская', -330, -345, 'riga', 7, { orientation: 'bottom' }),
  kholshcheviki: S('kholshcheviki', 'Холщёвики', -342, -355, 'riga', 8, { orientation: 'top' }),
  km73_riga: S('km73_riga', '73 км', -354, -365, 'riga', 8, { orientation: 'bottom' }),
  yadroshino: S('yadroshino', 'Ядрошино', -366, -375, 'riga', 8, { orientation: 'top' }),
  kursakovskaya: S('kursakovskaya', 'Курсаковская', -378, -385, 'riga', 9, { orientation: 'bottom' }),
  rumyantsevo: S('rumyantsevo', 'Румянцево', -390, -395, 'riga', 9, { expressStop: true, orientation: 'top' }),
  novopetrovskaya: S('novopetrovskaya', 'Новопетровская', -402, -405, 'riga', 9, { expressStop: true, orientation: 'bottom' }),
  ustinovka: S('ustinovka', 'Устиновка', -414, -415, 'riga', 10, { orientation: 'top' }),
  km91_riga: S('km91_riga', '91 км', -426, -425, 'riga', 10, { orientation: 'bottom' }),
  lesodolgorukovo: S('lesodolgorukovo', 'Лесодолгоруково', -438, -435, 'riga', 11, { expressStop: true, orientation: 'top' }),
  chismena: S('chismena', 'Чисмена', -450, -445, 'riga', 11, { orientation: 'bottom' }),
  matryonino: S('matryonino', 'Матрёнино', -462, -455, 'riga', 12, { orientation: 'top' }),
  dubosekovo: S('dubosekovo', 'Дубосеково', -474, -465, 'riga', 13, { orientation: 'bottom' }),
  volokolamsk: S('volokolamsk', 'Волоколамск', -486, -475, 'riga', 14, { expressStop: true, orientation: 'top' }),
  km133_riga: S('km133_riga', '133 км', -498, -485, 'riga', 14, { orientation: 'bottom' }),
  blagoveshchenskoe: S('blagoveshchenskoe', 'Благовещенское', -510, -495, 'riga', 14, { orientation: 'top' }),
  moskvich: S('moskvich', 'Москвич (141 км)', -522, -505, 'riga', 15, { orientation: 'bottom' }),
  bukholovo: S('bukholovo', 'Бухолово', -534, -515, 'riga', 15, { orientation: 'top' }),
  podmoskovnye_dachi: S('podmoskovnye_dachi', 'Подмосковные дачи (149 км)', -546, -525, 'riga', 15, { orientation: 'left' }),
  shakhovskaya: S('shakhovskaya', 'Шаховская', -558, -535, 'riga', 16, { expressStop: true, orientation: 'top' }),
};