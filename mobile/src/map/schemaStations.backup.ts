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
  m_yar: S('m_yar', 'Москва Ярославская', 32, -38, 'yar', 0, { expressStop: true, orientation: 'right' }),
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
  // МОНИНСКИЙ ХОД (Мытищи → восток)
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
  // ФРЯЗИНСКИЙ ХОД (Болшево → вверх)
  // ============================================================
  fabrika1maya: S('fabrika1maya', 'Фабрика 1 Мая', 185, -163, 'yar', 3, { orientation: 'left', isBranch: true, branchId: 'fryazino' }),
  zelyony_bor: S('zelyony_bor', 'Зелёный Бор', 216, -181, 'yar', 3, { orientation: 'top', isBranch: true, branchId: 'fryazino' }),
  ivanteevka2: S('ivanteevka2', 'Ивантеевка-2', 247, -199, 'yar', 4, { orientation: 'top', expressStop: true, isBranch: true, branchId: 'fryazino' }),
  ivanteevka: S('ivanteevka', 'Ивантеевка', 278, -216, 'yar', 4, { orientation: 'top', isBranch: true, branchId: 'fryazino' }),
  detskaya: S('detskaya', 'Детская', 309, -234, 'yar', 4, { orientation: 'bottom', isBranch: true, branchId: 'fryazino' }),
  fryazino_tov: S('fryazino_tov', 'Фрязино-Тов.', 340, -252, 'yar', 4, { orientation: 'top', isBranch: true, branchId: 'fryazino' }),
  fryazino: S('fryazino', 'Фрязино-Пасс.', 371, -270, 'yar', 4, { orientation: 'right', expressStop: true, isBranch: true, branchId: 'fryazino' }),

  // ============================================================
  // КРАСНОАРМЕЙСКАЯ ВЕТКА (Софрино → восток)
  // ============================================================
  poselok_dalniy: S('poselok_dalniy', 'Посёлок Дальний', 225, -289, 'yar', 7, { orientation: 'bottom', isBranch: true, branchId: 'krasnoarmeysk', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  rahmanovo: S('rahmanovo', 'Рахманово', 238, -326, 'yar', 7, { orientation: 'top', isBranch: true, branchId: 'krasnoarmeysk', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  fedorovskoe: S('fedorovskoe', 'Фёдоровское', 252, -364, 'yar', 7, { orientation: 'bottom', isBranch: true, branchId: 'krasnoarmeysk', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  putilovo: S('putilovo', 'Путилово', 266, -401, 'yar', 7, { orientation: 'top', isBranch: true, branchId: 'krasnoarmeysk', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  krasnoarmeysk: S('krasnoarmeysk', 'Красноармейск', 279, -439, 'yar', 7, { orientation: 'bottom', isBranch: true, branchId: 'krasnoarmeysk', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ============================================================
  // ПАВЕЛЕЦКОЕ — вертикально
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
  
  // --- ПУТЕВАЯ ТОЧКА ДЛЯ ВЕТКИ НА АЭРОПОРТ ---
  domodedovo_junction: S('domodedovo_junction', 'Junction', 100, 290, [], 0, { isJunction: true }),

  // --- ВЕТКА НА АЭРОПОРТ ---
  aviacionnaya: S('aviacionnaya', 'Авиационная', 130, 315, 'pav_aero_sub', 5, { orientation: 'bottom', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  kosmos: S('kosmos', 'Космос', 160, 340, 'pav_aero_sub', 6, { orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  aeroport_domodedovo: S('aeroport_domodedovo', 'Аэропорт Домодедово', 190, 365, ['pav_aero', 'pav_aero_sub'], 4, { aeroexpress: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // --- ПРОДОЛЖЕНИЕ ПАВЕЛЕЦКОГО НАПРАВЛЕНИЯ (Тройка отключена) ---
  vzlyotnaya: S('vzlyotnaya', 'Взлётная', 73, 274, 'pav', 5, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  vostryakovo: S('vostryakovo', 'Востряково', 77, 287, 'pav', 5, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
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


  // ══════════════════════════════════════════════════════════════
  // БЕЛОРУССКОЕ НАПРАВЛЕНИЕ (диагональ на юго-запад)
  // m_bel (0, 200) — выше Павелецкого и левее
  // ══════════════════════════════════════════════════════════════
  m_bel: S('m_bel', 'Москва Белорусская', 27, -177, 'bel', 0, { expressStop: true, orientation: 'left' }),
  begovaya: S('begovaya', 'Беговая', 24, -170, 'bel', 1, { orientation: 'right' }),
  testovskaya: S('testovskaya', 'Москва-Сити', 22, -164, 'bel', 1, { orientation: 'right' }),
  fili: S('fili', 'Фили', 19, -157, 'bel', 2, { expressStop: true, orientation: 'right' }),
  slavyansky_bulvar: S('slavyansky_bulvar', 'Славянский Бульвар', 17, -150, 'bel', 2, { orientation: 'right' }),
  kuntsevskaya: S('kuntsevskaya', 'Кунцевская', 14, -144, 'bel', 2, { expressStop: true, orientation: 'right' }),
  rabochiy_poselok: S('rabochiy_poselok', 'Рабочий Посёлок', 12, -137, 'bel', 2, { orientation: 'right' }),
  setun: S('setun', 'Сетунь', 10, -131, 'bel', 2, { orientation: 'right' }),
  nemchinovka: S('nemchinovka', 'Немчиновка', 7, -124, 'bel', 3, { orientation: 'right' }),
  skolkovo: S('skolkovo', 'Сколково', 5, -117, 'bel', 3, { orientation: 'right' }),
  bakovka: S('bakovka', 'Баковка', 2, -111, 'bel', 3, { orientation: 'right' }),
  odintsovo: S('odintsovo', 'Одинцово', 0, -104, 'bel', 3, { expressStop: true, orientation: 'right' }),
  otradnoe: S('otradnoe', 'Отрадное', -191, 134, 'bel', 4, { orientation: 'right' }),
  pionerskaya: S('pionerskaya', 'Пионерская', -200, 140, 'bel', 4, { orientation: 'right' }),
  perhushkovo: S('perhushkovo', 'Перхушково', -209, 147, 'bel', 4, { orientation: 'right' }),
  zdravnitsa: S('zdravnitsa', 'Здравница', -218, 153, 'bel', 4, { orientation: 'right' }),
  zhavoronki: S('zhavoronki', 'Жаворонки', -228, 159, 'bel', 5, { orientation: 'right' }),
  dachnoe: S('dachnoe', 'Дачное', -237, 166, 'bel', 5, { orientation: 'right' }),
  malye_vyazemy: S('malye_vyazemy', 'Малые Вязёмы', -246, 172, 'bel', 5, { orientation: 'right' }),
  golitsyno: S('golitsyno', 'Голицыно', -255, 178, 'bel', 5, { expressStop: true, orientation: 'right' }),
  sushkinskaya: S('sushkinskaya', 'Сушкинская', -264, 185, 'bel', 6, { orientation: 'right' }),
  petelino: S('petelino', 'Петелино', -273, 191, 'bel', 6, { orientation: 'right' }),
  chastsovskaya: S('chastsovskaya', 'Часцовская', -282, 198, 'bel', 7, { orientation: 'right' }),
  portnovskaya: S('portnovskaya', 'Портновская', -291, 204, 'bel', 7, { orientation: 'right' }),
  kubinka1: S('kubinka1', 'Кубинка-1', -295, 207, 'bel', 8, { expressStop: true, orientation: 'right' }),
  chapaevka: S('chapaevka', 'Чапаевка', -300, 210, 'bel', 8, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  polushkino: S('polushkino', 'Полушкино', -309, 217, 'bel', 8, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  sanatornaya: S('sanatornaya', 'Санаторная', -319, 223, 'bel', 8, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  tuchkovo: S('tuchkovo', 'Тучково', -328, 229, 'bel', 9, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  teatralnaya: S('teatralnaya', 'Театральная', -337, 236, 'bel', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  sadovaya: S('sadovaya', 'Садовая', -346, 242, 'bel', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  dorohovo: S('dorohovo', 'Дорохово', -355, 249, 'bel', 10, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  partizanskaya: S('partizanskaya', 'Партизанская', -364, 255, 'bel', 10, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  shalikovo: S('shalikovo', 'Шаликово', -373, 261, 'bel', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  kukarinskaya: S('kukarinskaya', 'Кукаринская', -382, 268, 'bel', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  pl109km: S('pl109km', '109 км (Платовская)', -391, 274, 'bel', 12, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  mozhaysk: S('mozhaysk', 'Можайск', -400, 280, 'bel', 12, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  borodino: S('borodino', 'Бородино', -410, 287, 'bel', 13, { expressStop: true, orientation: 'bottom', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ─── Усовская ветка (от Рабочего Посёлка на северо-запад) ───
  // Тройка не действует
  kuntsevo2: S('kuntsevo2', 'Кунцево-2', -176, 110, 'bel_usovo', 2, { expressStop: true, orientation: 'bottom', isBranch: true, branchId: 'usovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  romashkovo: S('romashkovo', 'Ромашково', -215, 125, 'bel_usovo', 2, { orientation: 'bottom', isBranch: true, branchId: 'usovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  razdory: S('razdory', 'Раздоры', -254, 139, 'bel_usovo', 2, { expressStop: true, orientation: 'bottom', isBranch: true, branchId: 'usovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  barviha: S('barviha', 'Барвиха', -294, 153, 'bel_usovo', 2, { expressStop: true, orientation: 'bottom', isBranch: true, branchId: 'usovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  ilyinskoe: S('ilyinskoe', 'Ильинское', -333, 167, 'bel_usovo', 2, { orientation: 'bottom', isBranch: true, branchId: 'usovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  usovo: S('usovo', 'Усово', -372, 182, 'bel_usovo', 2, { expressStop: true, orientation: 'bottom', isBranch: true, branchId: 'usovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ─── Звенигородская ветка (от Голицыно на юго-запад) ───
  zaharovo: S('zaharovo', 'Захарово', -287, 216, 'bel_zven', 5, { orientation: 'bottom', isBranch: true, branchId: 'zvenigorod' }),
  hlyupino: S('hlyupino', 'Хлюпино', -319, 255, 'bel_zven', 5, { orientation: 'bottom', isBranch: true, branchId: 'zvenigorod' }),
  skorotovo: S('skorotovo', 'Скоротово', -351, 293, 'bel_zven', 5, { orientation: 'bottom', isBranch: true, branchId: 'zvenigorod' }),
  zvenigorod: S('zvenigorod', 'Звенигород', -384, 331, 'bel_zven', 5, { expressStop: true, orientation: 'bottom', isBranch: true, branchId: 'zvenigorod' }),

  // ══════════════════════════════════════════════════════════════
  // САВЁЛОВСКОЕ НАПРАВЛЕНИЕ (вертикаль на север)
  // x=100 — параллельно Павелецкому. m_sav (100, 200) — выше m_pav.
  // ══════════════════════════════════════════════════════════════
  m_sav: S('m_sav', 'Москва Савёловская', 0, -40, 'sav', 0, { expressStop: true, orientation: 'right' }),
  timiryazevskaya: S('timiryazevskaya', 'Тимирязевская', 0, -42, 'sav', 1, { orientation: 'right' }),
  petrovsko_razumovskaya: S('petrovsko_razumovskaya', 'Петровско-Разумовская', -49, -49, 'sav', 1, { orientation: 'right' }),
  okruzhnaya: S('okruzhnaya', 'Окружная', 31, -190, 'sav', 2, { expressStop: true, orientation: 'right' }),
  degunino: S('degunino', 'Дегунино', 0, -79, 'sav', 2, { orientation: 'right' }),
  beskudnikovo: S('beskudnikovo', 'Бескудниково', 0, -92, 'sav', 2, { orientation: 'right' }),
  lianozovo: S('lianozovo', 'Лианозово', 34, -197, 'sav', 2, { expressStop: true, orientation: 'right' }),
  mark: S('mark', 'Марк', 0, -116, 'sav', 2, { orientation: 'right' }),
  novodachnaya: S('novodachnaya', 'Новодачная', 0, -129, 'sav', 3, { orientation: 'right' }),
  dolgoprudnaya: S('dolgoprudnaya', 'Долгопрудная', 0, -141, 'sav', 3, { expressStop: true, orientation: 'right' }),
  vodniki: S('vodniki', 'Водники', 0, -154, 'sav', 3, { orientation: 'right' }),
  hlebnikovo: S('hlebnikovo', 'Хлебниково', 0, -166, 'sav', 3, { orientation: 'right' }),
  sheremetyevskaya: S('sheremetyevskaya', 'Шереметьевская', 0, -178, 'sav', 3, { orientation: 'right' }),
  lobnya: S('lobnya', 'Лобня', 0, -191, 'sav', 4, { expressStop: true, orientation: 'right' }),
  depo_sav: S('depo_sav', 'Депо', 0, -203, 'sav', 4, { orientation: 'right' }),
  lugovaya: S('lugovaya', 'Луговая', 0, -215, 'sav', 4, { orientation: 'right' }),
  nekrasovskaya: S('nekrasovskaya', 'Некрасовская', 0, -228, 'sav', 4, { orientation: 'right' }),
  katuar: S('katuar', 'Катуар', 0, -240, 'sav', 4, { orientation: 'right' }),
  trudovaya: S('trudovaya', 'Трудовая', 0, -252, 'sav', 5, { orientation: 'right' }),
  iksha: S('iksha', 'Икша', 0, -265, 'sav', 5, { expressStop: true, orientation: 'right' }),
  morozki: S('morozki', 'Морозки', 0, -277, 'sav', 6, { orientation: 'right' }),
  turist: S('turist', 'Турист', 0, -289, 'sav', 6, { orientation: 'right' }),
  yahroma: S('yahroma', 'Яхрома', 0, -302, 'sav', 7, { expressStop: true, orientation: 'right' }),
  dmitrov: S('dmitrov', 'Дмитров', 0, -314, 'sav', 7, { expressStop: true, orientation: 'right' }),
  // ─── После Дмитрова Тройка не действует ───
  kanalstroy: S('kanalstroy', 'Каналстрой', 0, -326, 'sav', 8, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  barsuchenko: S('barsuchenko', 'Имени Барсученко', 0, -339, 'sav', 8, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  orudevo: S('orudevo', 'Орудьево', 0, -351, 'sav', 9, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  verbilki: S('verbilki', 'Вербилки', 0, -364, 'sav', 10, { expressStop: true, orientation: 'left', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  nikulki: S('nikulki', 'Никулки', 0, -376, 'sav', 10, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  zheltikovo: S('zheltikovo', 'Жёлтиково', 0, -388, 'sav', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  vlasovo: S('vlasovo', 'Власово', 0, -401, 'sav', 11, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  taldom: S('taldom', 'Талдом', 0, -413, 'sav', 12, { expressStop: true, orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  lebzino: S('lebzino', 'Лебзино', 0, -425, 'sav', 13, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  pl124km: S('pl124km', '124 км', 0, -438, 'sav', 14, { orientation: 'right', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  savelovo: S('savelovo', 'Савёлово', 0, -450, 'sav', 15, { expressStop: true, orientation: 'top', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ─── Ветка Вербилки — Дубна (вправо от Вербилок) ───
  sorevnovanie: S('sorevnovanie', 'Соревнование', 19, -380, 'sav_dubna', 10, { orientation: 'top', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  zaprudnya: S('zaprudnya', 'Запрудня', 38, -396, 'sav_dubna', 10, { orientation: 'bottom', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  tempy: S('tempy', 'Темпы', 57, -412, 'sav_dubna', 10, { orientation: 'top', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  meldino: S('meldino', 'Мельдино', 77, -428, 'sav_dubna', 11, { orientation: 'right', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  zhivopisnoe: S('zhivopisnoe', 'Живописное (119 км)', 96, -444, 'sav_dubna', 11, { orientation: 'right', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  karmanovo: S('karmanovo', 'Карманово (122 км)', 115, -460, 'sav_dubna', 12, { orientation: 'right', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  bolshaya_volga: S('bolshaya_volga', 'Большая Волга', 134, -476, 'sav_dubna', 12, { expressStop: true, orientation: 'right', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  dubna: S('dubna', 'Дубна', 153, -493, 'sav_dubna', 13, { expressStop: true, orientation: 'top', isBranch: true, branchId: 'dubna', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ─── Аэроэкспресс в Шереметьево (от Лианозово, y=20) ───
  sheremetyevo_junction: S('sheremetyevo_junction', 'Junction', 36, -203, [], 0, { isJunction: true }),
  sheremetyevo_south: S('sheremetyevo_south', 'Шереметьево — Юг (D, E, F)', 39, -210, 'sav_aero', 3, { aeroexpress: true, orientation: 'top', isBranch: true, branchId: 'sheremetyevo' }),
  sheremetyevo_north: S('sheremetyevo_north', 'Шереметьево — Север (B, C)', 41, -217, 'sav_aero', 3, { aeroexpress: true, orientation: 'bottom', isBranch: true, branchId: 'sheremetyevo' }),

  // ══════════════════════════════════════════════════════════════
  // ЛЕНИНГРАДСКОЕ НАПРАВЛЕНИЕ
  // m_len (150, 100) — рядом с Ярославским (Комсомольская пл.)
  // После Петровско-Разумовской (100, 80) идёт диагональю вниз-влево
  // ══════════════════════════════════════════════════════════════
  m_len: S('m_len', 'Москва Ленинградская', -28, -28, 'len', 0, { expressStop: true, orientation: 'right' }),
  ostankino: S('ostankino', 'Останкино', -39, -39, 'len', 2, { orientation: 'right' }),
  // petrovsko_razumovskaya — общая точка, определена в Савёловском блоке
  likhobory: S('likhobory', 'Лихоборы', -60, -60, 'len', 2, { orientation: 'left' }),
  mosselsmash: S('mosselsmash', 'Моссельмаш', -70, -70, 'len', 2, { orientation: 'left' }),
  grachyovskaya: S('grachyovskaya', 'Грачёвская', -80, -80, 'len', 2, { orientation: 'left' }),
  hovrino: S('hovrino', 'Ховрино', -91, -91, 'len', 2, { orientation: 'left' }),
  levoberezhnaya: S('levoberezhnaya', 'Левобережная', -101, -101, 'len', 3, { orientation: 'left' }),
  himki: S('himki', 'Химки', -112, -112, 'len', 3, { expressStop: true, orientation: 'left' }),
  molzhaninovo: S('molzhaninovo', 'Молжаниново', -122, -122, 'len', 3, { orientation: 'left' }),
  novopodrezkovo: S('novopodrezkovo', 'Новоподрезково', -132, -132, 'len', 4, { orientation: 'left' }),
  podrezkovo: S('podrezkovo', 'Подрезково', -143, -143, 'len', 4, { orientation: 'left' }),
  shodnya: S('shodnya', 'Сходня', -153, -153, 'len', 4, { expressStop: true, orientation: 'left' }),
  firsanovskaya: S('firsanovskaya', 'Фирсановская', -164, -164, 'len', 4, { orientation: 'left' }),
  malino: S('malino', 'Малино', -174, -174, 'len', 5, { orientation: 'left' }),
  zelenograd_krukovo: S('zelenograd_krukovo', 'Зеленоград-Крюково', -185, -185, 'len', 5, { expressStop: true, orientation: 'left' }),
  alabushevo: S('alabushevo', 'Алабушево', -195, -195, 'len', 5, { orientation: 'left' }),
  radishchevo: S('radishchevo', 'Радищево', -205, -205, 'len', 6, { orientation: 'left' }),
  povarovka: S('povarovka', 'Поваровка', -216, -216, 'len', 6, { orientation: 'left' }),
  povarovo1: S('povarovo1', 'Поварово-1', -226, -226, 'len', 6, { orientation: 'left' }),
  beryozki_dachnye: S('beryozki_dachnye', 'Берёзки-Дачные', -237, -237, 'len', 6, { orientation: 'left' }),
  podsolnechnaya: S('podsolnechnaya', 'Подсолнечная', -247, -247, 'len', 7, { expressStop: true, orientation: 'left' }),
  senezh: S('senezh', 'Сенеж', -258, -258, 'len', 8, { orientation: 'left' }),
  golovkovo: S('golovkovo', 'Головково', -268, -268, 'len', 8, { orientation: 'left' }),
  pokrovka: S('pokrovka', 'Покровка', -278, -278, 'len', 8, { orientation: 'left' }),
  frolovskoe: S('frolovskoe', 'Фроловское', -289, -289, 'len', 9, { orientation: 'left' }),
  streglovo: S('streglovo', 'Стреглово', -299, -299, 'len', 9, { orientation: 'left' }),
  klin: S('klin', 'Клин', -310, -310, 'len', 10, { expressStop: true, orientation: 'left' }),
  yamuga: S('yamuga', 'Ямуга', -320, -320, 'len', 11, { orientation: 'left', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  reshetnikovo: S('reshetnikovo', 'Решетниково', -330, -330, 'len', 11, { expressStop: true, orientation: 'left', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  chernichnaya: S('chernichnaya', 'Черничная', -341, -341, 'len', 11, { orientation: 'left', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  zavidovo: S('zavidovo', 'Завидово', -351, -351, 'len', 11, { orientation: 'left', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  moskovskoe_more: S('moskovskoe_more', 'Московское Море', -362, -362, 'len', 11, { orientation: 'left', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  redkino: S('redkino', 'Редкино', -372, -372, 'len', 11, { expressStop: true, orientation: 'left', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  mezhevo: S('mezhevo', 'Межево', -383, -383, 'len', 11, { orientation: 'left', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  kuzminka: S('kuzminka', 'Кузьминка', -393, -393, 'len', 11, { orientation: 'left', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  chupriyanovka: S('chupriyanovka', 'Чуприяновка', -403, -403, 'len', 11, { orientation: 'left', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  lazurnaya: S('lazurnaya', 'Лазурная', -414, -414, 'len', 11, { orientation: 'left', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  tver: S('tver', 'Тверь', -424, -424, 'len', 11, { expressStop: true, orientation: 'bottom', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ─── Ветка в Конаково (от Решетникова, на северо-восток) ───
  puteprovodnaya: S('puteprovodnaya', 'Путепроводная', -303, -357, 'len_konakovo', 11, { orientation: 'top', isBranch: true, branchId: 'konakovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  konakovskiy_moh: S('konakovskiy_moh', 'Конаковский Мох', -277, -383, 'len_konakovo', 11, { orientation: 'top', isBranch: true, branchId: 'konakovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  donhovka: S('donhovka', 'Донховка', -250, -410, 'len_konakovo', 11, { orientation: 'top', isBranch: true, branchId: 'konakovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),
  konakovo_gres: S('konakovo_gres', 'Конаково ГРЭС', -224, -436, 'len_konakovo', 11, { expressStop: true, orientation: 'top', isBranch: true, branchId: 'konakovo', facilities: { ...baseStation.facilities, troikaPayment: false } }),

  // ─── Митьково (МЦД-3, между Ленинградским и Казанским) ───
  mitkovo: S('mitkovo', 'Митьково', 250, 160, 'mcd3', 0, { expressStop: true, orientation: 'bottom' }),

    // ══════════════════════════════════════════════════════════════
  // КАЗАНСКОЕ НАПРАВЛЕНИЕ
  // Идёт от Комсомольской площади на ЮВ, МЦД-3
  // ══════════════════════════════════════════════════════════════
  elektrozavodskaya: S('elektrozavodskaya', 'Электрозаводская', 75, -20, 'kaz', 1, { expressStop: true, orientation: 'top' }),
  sortirovochnaya: S('sortirovochnaya', 'Сортировочная', 95, 0, 'kaz', 1, { orientation: 'bottom' }),
  aviamotornaya: S('aviamotornaya', 'Авиамоторная', 115, 20, 'kaz', 2, { expressStop: true, orientation: 'top' }),
  andronovka: S('andronovka', 'Андроновка', 135, 40, 'kaz', 2, { orientation: 'bottom' }),
  perovo: S('perovo', 'Перово', 155, 60, 'kaz', 2, { orientation: 'top' }),
  plyushchevo: S('plyushchevo', 'Плющево', 175, 80, 'kaz', 2, { orientation: 'bottom' }),
  veshnyaki: S('veshnyaki', 'Вешняки', 195, 100, 'kaz', 2, { orientation: 'top' }),
  vykhino: S('vykhino', 'Выхино', 215, 120, 'kaz', 2, { expressStop: true, orientation: 'bottom' }),
  kosino: S('kosino', 'Косино', 235, 140, 'kaz', 2, { orientation: 'top' }),
  ukhtomskaya: S('ukhtomskaya', 'Ухтомская', 255, 160, 'kaz', 3, { orientation: 'bottom' }),
  lyubertsy1: S('lyubertsy1', 'Люберцы-1', 275, 180, 'kaz', 3, { expressStop: true, orientation: 'top' }),

 

  // ══════════════════════════════════════════════════════════════
  // КУРСКОЕ НАПРАВЛЕНИЕ (вертикаль на юг)
  // x=450 — между Павелецким (100) и Савёловским (100).
  // Отдельно от Ярославского. Длинное — до Тулы.
  // ══════════════════════════════════════════════════════════════
  m_kursk: S('m_kursk', 'Москва Курская', -100, -46, 'kursk', 0, { expressStop: true, orientation: 'right' }),
  moskva_tovarnaya: S('moskva_tovarnaya', 'Москва-Товарная', -21, 80, 'kursk', 1, { orientation: 'right' }),
  kalitniki: S('kalitniki', 'Калитники', -25, 92, 'kursk', 1, { orientation: 'right' }),
  novokhokhlovskaya: S('novokhokhlovskaya', 'Новохохловская', -28, 104, 'kursk', 2, { expressStop: true, orientation: 'right' }),
  tekstilshchiki: S('tekstilshchiki', 'Текстильщики', -31, 116, 'kursk', 2, { expressStop: true, orientation: 'right' }),
  pechatniki: S('pechatniki', 'Печатники', -34, 128, 'kursk', 2, { orientation: 'right' }),
  lyublino: S('lyublino', 'Люблино', -38, 141, 'kursk', 2, { expressStop: true, orientation: 'right' }),
  depo_kursk: S('depo_kursk', 'Депо', -41, 153, 'kursk', 2, { orientation: 'right' }),
  pererva: S('pererva', 'Перерва', -44, 165, 'kursk', 2, { orientation: 'right' }),
  kuryanovo: S('kuryanovo', 'Курьяново', -47, 177, 'kursk', 2, { orientation: 'right' }),
  moskvorechye: S('moskvorechye', 'Москворечье', -51, 189, 'kursk', 3, { orientation: 'right' }),
  tsaritsyno: S('tsaritsyno', 'Царицыно', -54, 201, 'kursk', 3, { expressStop: true, orientation: 'right' }),
  pokrovskoe: S('pokrovskoe', 'Покровское', -57, 214, 'kursk', 3, { orientation: 'right' }),
  krasny_stroitel: S('krasny_stroitel', 'Красный Строитель', -61, 226, 'kursk', 4, { orientation: 'right' }),
  bittsa: S('bittsa', 'Битца', -64, 238, 'kursk', 4, { expressStop: true, orientation: 'right' }),
  butovo: S('butovo', 'Бутово', -67, 250, 'kursk', 4, { orientation: 'right' }),
  shcherbinka: S('shcherbinka', 'Щербинка', -70, 262, 'kursk', 4, { expressStop: true, orientation: 'right' }),
  ostafyevo: S('ostafyevo', 'Остафьево', -74, 275, 'kursk', 4, { orientation: 'right' }),
  silikatnaya: S('silikatnaya', 'Силикатная', -77, 287, 'kursk', 5, { orientation: 'right' }),
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
  // ─── После Чехова Тройка не действует ───
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
  // РИЖСКОЕ НАПРАВЛЕНИЕ
  // Площадь Трёх Вокзалов → на запад через Дмитровскую
  // Дмитровская (100, 150) — между Савёловской и Тимирязевской
  // ══════════════════════════════════════════════════════════════
  ploshchad_trekh_vokzalov: S('ploshchad_trekh_vokzalov', 'Площадь Трёх Вокзалов', -108, -56, ['kursk', 'riga'], 0, { expressStop: true, orientation: 'right' }),
  rizhskaya: S('rizhskaya', 'Рижская', -111, -52, 'riga', 0, { expressStop: true, orientation: 'top' }),
  marya_roshcha: S('marya_roshcha', 'Марьина Роща', -117, -54, 'riga', 1, { orientation: 'bottom' }),
  dmitrovskaya: S('dmitrovskaya', 'Дмитровская', -123, -57, 'riga', 1, { expressStop: true, orientation: 'left' }),
  m_riga: S('m_riga', 'Москва Рижская', -157, -63, 'riga_m', 0, { expressStop: true, orientation: 'right' }),

  // ─── Дальше на запад ───
  grazhdanskaya: S('grazhdanskaya', 'Гражданская', -128, -60, 'riga', 2, { orientation: 'top' }),
  krasny_balties: S('krasny_balties', 'Красный Балтиец', -134, -62, 'riga', 2, { orientation: 'bottom' }),
  streshnevo: S('streshnevo', 'Стрешнево', -140, -65, 'riga', 2, { orientation: 'top' }),
  shchukinskaya: S('shchukinskaya', 'Щукинская', -145, -68, 'riga', 2, { orientation: 'bottom' }),
  tushinskaya: S('tushinskaya', 'Тушинская', -151, -70, 'riga', 2, { expressStop: true, orientation: 'top' }),
  trikotazhnaya: S('trikotazhnaya', 'Трикотажная', -157, -73, 'riga', 2, { orientation: 'bottom' }),
  volokolamskaya: S('volokolamskaya', 'Волоколамская', -163, -76, 'riga', 2, { orientation: 'top' }),
  penyagino: S('penyagino', 'Пенягино', -168, -78, 'riga', 3, { orientation: 'bottom' }),
  pavshino: S('pavshino', 'Павшино', -174, -81, 'riga', 3, { expressStop: true, orientation: 'top' }),
  krasnogorskaya: S('krasnogorskaya', 'Красногорская', -180, -84, 'riga', 3, { orientation: 'bottom' }),
  opalikha: S('opalikha', 'Опалиха', -185, -86, 'riga', 4, { orientation: 'top' }),
  anikeevka: S('anikeevka', 'Аникеевка', -191, -89, 'riga', 4, { orientation: 'bottom' }),
  nahabino: S('nahabino', 'Нахабино', -197, -92, 'riga', 4, { expressStop: true, orientation: 'top' }),
  malinovka: S('malinovka', 'Малиновка', -203, -94, 'riga', 5, { orientation: 'bottom' }),
  dedovsk: S('dedovsk', 'Дедовск', -208, -97, 'riga', 5, { orientation: 'top' }),
  miitovskaya: S('miitovskaya', 'Миитовская', -214, -100, 'riga', 5, { orientation: 'bottom' }),
  snegiri: S('snegiri', 'Снегири', -220, -102, 'riga', 5, { orientation: 'top' }),
  km50_riga: S('km50_riga', '50 км', -225, -105, 'riga', 6, { orientation: 'bottom' }),
  manikhino1: S('manikhino1', 'Манихино 1', -231, -108, 'riga', 6, { expressStop: true, orientation: 'top' }),
  troitskaya: S('troitskaya', 'Троицкая', -237, -110, 'riga', 6, { orientation: 'bottom' }),
  istra: S('istra', 'Истра', -243, -113, 'riga', 7, { expressStop: true, orientation: 'top' }),
  novoierusalimskaya: S('novoierusalimskaya', 'Новоиерусалимская', -248, -116, 'riga', 7, { expressStop: true, orientation: 'bottom' }),
  chekhovskaya_riga: S('chekhovskaya_riga', 'Чеховская', -254, -118, 'riga', 7, { orientation: 'top' }),
  kholshcheviki: S('kholshcheviki', 'Холщёвики', -260, -121, 'riga', 8, { orientation: 'bottom' }),
  km73_riga: S('km73_riga', '73 км', -265, -124, 'riga', 8, { orientation: 'top' }),
  yadroshino: S('yadroshino', 'Ядрошино', -271, -126, 'riga', 8, { orientation: 'bottom' }),
  kursakovskaya: S('kursakovskaya', 'Курсаковская', -277, -129, 'riga', 9, { orientation: 'top' }),
  rumyantsevo: S('rumyantsevo', 'Румянцево', -283, -132, 'riga', 9, { expressStop: true, orientation: 'bottom' }),
  novopetrovskaya: S('novopetrovskaya', 'Новопетровская', -288, -134, 'riga', 9, { expressStop: true, orientation: 'top' }),
  ustinovka: S('ustinovka', 'Устиновка', -294, -137, 'riga', 10, { orientation: 'bottom' }),
  km91_riga: S('km91_riga', '91 км', -300, -140, 'riga', 10, { orientation: 'top' }),
  lesodolgorukovo: S('lesodolgorukovo', 'Лесодолгоруково', -305, -142, 'riga', 11, { expressStop: true, orientation: 'bottom' }),
  chismena: S('chismena', 'Чисмена', -311, -145, 'riga', 11, { orientation: 'top' }),
  matryonino: S('matryonino', 'Матрёнино', -317, -148, 'riga', 12, { orientation: 'bottom' }),
  dubosekovo: S('dubosekovo', 'Дубосеково', -323, -150, 'riga', 13, { orientation: 'top' }),
  volokolamsk: S('volokolamsk', 'Волоколамск', -328, -153, 'riga', 14, { expressStop: true, orientation: 'bottom' }),
  km133_riga: S('km133_riga', '133 км', -334, -156, 'riga', 14, { orientation: 'top' }),
  blagoveshchenskoe: S('blagoveshchenskoe', 'Благовещенское', -340, -158, 'riga', 14, { orientation: 'bottom' }),
  moskvich: S('moskvich', 'Москвич (141 км)', -345, -161, 'riga', 15, { orientation: 'top' }),
  bukholovo: S('bukholovo', 'Бухолово', -351, -164, 'riga', 15, { orientation: 'bottom' }),
  podmoskovnye_dachi: S('podmoskovnye_dachi', 'Подмосковные дачи (149 км)', -357, -166, 'riga', 15, { orientation: 'top' }),
  shakhovskaya: S('shakhovskaya', 'Шаховская', -363, -169, 'riga', 16, { expressStop: true, orientation: 'bottom' }),
};