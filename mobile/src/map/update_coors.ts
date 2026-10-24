import { STATIONS, SchemaStation } from './schemaStations';
import { LINES } from './schemaLines';

// ───────────────────────────────────────────────────────
// НАСТРОЙКИ
// ───────────────────────────────────────────────────────
const STEP = 20;
const LINE_ID = 'bel'; // ← МЕНЯЙ ЗДЕСЬ
// ───────────────────────────────────────────────────────

const line = LINES.find((l) => l.id === LINE_ID);
if (!line) {
  throw new Error(`❌ Линия "${LINE_ID}" не найдена в schemaLines.ts`);
}

/** Собирает строку с опциями станции (Partial<SchemaStation>) */
function buildOpts(st: SchemaStation): string {
  const parts: string[] = [];
  if (st.orientation) parts.push(`orientation: '${st.orientation}'`);
  if (st.expressStop) parts.push('expressStop: true');
  if (st.aeroexpress) parts.push('aeroexpress: true');
  if (st.isJunction) parts.push('isJunction: true');
  if (st.isBranch) parts.push('isBranch: true');
  if (st.branchId) parts.push(`branchId: '${st.branchId}'`);
  if (st.isHubNode) parts.push('isHubNode: true');
  if (st.facilities && st.facilities.troikaPayment === false) {
    parts.push('facilities: { ...baseStation.facilities, troikaPayment: false }');
  }
  return parts.length ? `{ ${parts.join(', ')} }` : '{}';
}

/** Экранирует одиночные кавычки в именах станций */
function q(s: string): string {
  return `'${s.replace(/'/g, "\\'")}'`;
}

console.log(`\n// ══════════════════════════════════════════════════════════════`);
console.log(`// Линия: ${line.name} (${line.id})`);
console.log(`// Шаг:   ${STEP}`);
console.log(`// ══════════════════════════════════════════════════════════════\n`);

const firstId = line.path[0];
const firstStation = STATIONS[firstId];
if (!firstStation) throw new Error(`Станция "${firstId}" отсутствует в STATIONS`);

let prevNewX = firstStation.x;
let prevNewY = firstStation.y;
let prevOrig = firstStation;

// Первую станцию оставляем как есть — её координаты «прибиты» (вокзал/узел)
const firstLinesStr = JSON.stringify(firstStation.lines).replace(/"/g, "'");
console.log(
  `  ${firstId}: S(${q(firstId)}, ${q(firstStation.name)}, ${prevNewX}, ${prevNewY}, ${firstLinesStr}, ${firstStation.zone}, ${buildOpts(firstStation)}),`
);

for (let i = 1; i < line.path.length; i++) {
  const currId = line.path[i];
  const currOrig = STATIONS[currId];
  if (!currOrig) {
    console.warn(`// ⚠️  станция "${currId}" не найдена в STATIONS — пропуск`);
    continue;
  }

  const dx = currOrig.x - prevOrig.x;
  const dy = currOrig.y - prevOrig.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  let newX: number, newY: number;
  if (dist < 1e-6) {
    // Станция совпадает с предыдущей (например, junction) — оставляем как есть
    newX = Math.round(prevNewX);
    newY = Math.round(prevNewY);
  } else {
    newX = Math.round(prevNewX + (dx / dist) * STEP);
    newY = Math.round(prevNewY + (dy / dist) * STEP);
  }

  const linesStr = JSON.stringify(currOrig.lines).replace(/"/g, "'");
  console.log(
    `  ${currId}: S(${q(currId)}, ${q(currOrig.name)}, ${newX}, ${newY}, ${linesStr}, ${currOrig.zone}, ${buildOpts(currOrig)}),`
  );

  prevNewX = newX;
  prevNewY = newY;
  prevOrig = currOrig;
}

console.log(`\n// Готово. Скопируй блок выше и замени соответствующие строки в schemaStations.ts.\n`);