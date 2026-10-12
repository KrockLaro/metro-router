#!/usr/bin/env node
/**
 * Аудит данных схемы metro-router.
 *
 * Использование:
 *   node scripts/audit-stations.js [schemaStations.ts] [schemaLines.ts]
 *
 * Если аргументы не указаны, берутся пути по умолчанию:
 *   mobile/src/map/schemaStations.ts
 *   mobile/src/map/schemaLines.ts   (опционально)
 */

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const stationsPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(root, 'mobile/src/map/schemaStations.ts');
const linesPath = process.argv[3]
  ? path.resolve(process.argv[3])
  : path.resolve(root, 'mobile/src/map/schemaLines.ts');

// ---------- Утилиты вывода ----------
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
};
const h = (t) => `\n${C.bold}${C.cyan}══ ${t} ══${C.reset}`;
const ok = (t) => `${C.green}✓${C.reset} ${t}`;
const warn = (t) => `${C.yellow}!${C.reset} ${t}`;
const err = (t) => `${C.red}✗${C.reset} ${t}`;

// ---------- Парсинг ----------
function parseStations(file) {
  const src = fs.readFileSync(file, 'utf8');
  const re =
    /S\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(\[[^\]]*\]|'[^']*')\s*,\s*(\d+)/g;
  const out = [];
  let m;
  while ((m = re.exec(src)) !== null) {
    out.push({
      id: m[1],
      name: m[2],
      x: parseFloat(m[3]),
      y: parseFloat(m[4]),
      linesRaw: m[5],
      zone: parseInt(m[6], 10),
      isJunction: /isJunction:\s*true/.test(src.slice(m.index, m.index + 400)),
    });
  }
  return out;
}

function parseLines(file) {
  if (!fs.existsSync(file)) return null;
  const src = fs.readFileSync(file, 'utf8');
  const re = /id:\s*'([^']+)'[\s\S]*?path:\s*\[([^\]]+)\]/g;
  const out = [];
  let m;
  while ((m = re.exec(src)) !== null) {
    out.push({
      id: m[1],
      path: m[2]
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean),
    });
  }
  return out;
}

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function quartiles(arr) {
  const s = [...arr].sort((a, b) => a - b);
  const q1 = s[Math.floor(s.length * 0.25)];
  const q3 = s[Math.floor(s.length * 0.75)];
  const iqr = q3 - q1;
  return { q1, q3, iqr, lo: q1 - 1.5 * iqr, hi: q3 + 1.5 * iqr };
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// ---------- Основной анализ ----------
const stations = parseStations(stationsPath);
const lines = parseLines(linesPath);

console.log(h(`Аудит ${path.relative(root, stationsPath)}`));
console.log(`Станций найдено: ${C.bold}${stations.length}${C.reset}`);
if (lines) {
  console.log(`Линий найдено:   ${C.bold}${lines.length}${C.reset}`);
} else {
  console.log(warn(`schemaLines.ts не найден (${linesPath}) — проверка связности пропущена`));
}

// 1. Дубликаты id
const idCount = new Map();
for (const s of stations) idCount.set(s.id, (idCount.get(s.id) ?? 0) + 1);
const dupIds = [...idCount.entries()].filter(([, c]) => c > 1);
console.log(h('1. Дубликаты id'));
if (!dupIds.length) console.log(ok('нет'));
else dupIds.forEach(([id, c]) => console.log(err(`${id} — ${c} раз`)));

// 2. Выбросы по координатам
console.log(h('2. Выбросы по x / y (IQR, вне 1.5×IQR)'));
const xs = stations.map((s) => s.x);
const ys = stations.map((s) => s.y);
const qx = quartiles(xs);
const qy = quartiles(ys);
console.log(
  C.dim +
    `  x: q1=${qx.q1} q3=${qx.q3} iqr=${qx.iqr.toFixed(0)} → [${qx.lo.toFixed(0)}, ${qx.hi.toFixed(0)}]` +
    C.reset,
);
console.log(
  C.dim +
    `  y: q1=${qy.q1} q3=${qy.q3} iqr=${qy.iqr.toFixed(0)} → [${qy.lo.toFixed(0)}, ${qy.hi.toFixed(0)}]` +
    C.reset,
);

const outliers = stations.filter(
  (s) => s.x < qx.lo || s.x > qx.hi || s.y < qy.lo || s.y > qy.hi,
);
if (!outliers.length) console.log(ok('нет'));
else {
  console.log(err(`найдено ${outliers.length}`));
  outliers
    .sort((a, b) => Math.hypot(b.x, b.y) - Math.hypot(a.x, a.y))
    .forEach((s) => {
      const flags = [];
      if (s.x < qx.lo || s.x > qx.hi) flags.push(`x=${s.x}`);
      if (s.y < qy.lo || s.y > qy.hi) flags.push(`y=${s.y}`);
      console.log(`   ${s.id.padEnd(28)} ${s.name.padEnd(28)} ${flags.join(' ')}`);
    });
}

// 3. Слипшиеся пары (ближе 5 единиц)
console.log(h('3. Слипшиеся пары (расстояние < 5)'));
const tooClose = [];
for (let i = 0; i < stations.length; i++) {
  for (let j = i + 1; j < stations.length; j++) {
    if (stations[i].isJunction || stations[j].isJunction) continue;
    const d = dist(stations[i], stations[j]);
    if (d < 5) tooClose.push([stations[i], stations[j], d]);
  }
}
if (!tooClose.length) console.log(ok('нет'));
else {
  console.log(warn(`найдено ${tooClose.length}`));
  tooClose
    .sort((a, b) => a[2] - b[2])
    .forEach(([a, b, d]) =>
      console.log(`   ${a.id.padEnd(24)} ↔ ${b.id.padEnd(24)} ${d.toFixed(2)}`),
    );
}

// 4. Шаги по линиям
if (lines) {
  console.log(h('4. Аномальные шаги между соседями на линии'));

  const allSteps = [];
  const stepsPerLine = new Map();

  for (const line of lines) {
    const pts = line.path.map((id) => stations.find((s) => s.id === id));
    const missing = line.path.filter((id, i) => !pts[i]);
    if (missing.length) {
      console.log(err(`линия ${line.id}: отсутствуют в STATIONS → ${missing.join(', ')}`));
    }
    const steps = [];
    for (let i = 1; i < pts.length; i++) {
      if (!pts[i - 1] || !pts[i]) continue;
      steps.push({ a: pts[i - 1], b: pts[i], d: dist(pts[i - 1], pts[i]) });
    }
    stepsPerLine.set(line.id, steps);
    allSteps.push(...steps.map((s) => s.d));
  }

  const med = median(allSteps);
  console.log(C.dim + `  медиана шага по всем линиям: ${med.toFixed(1)}` + C.reset);

  let flagged = 0;
  for (const [lineId, steps] of stepsPerLine) {
    const anomalies = steps.filter((s) => s.d > med * 5 || (s.d > 0.01 && s.d < med * 0.2));
    if (!anomalies.length) continue;
    flagged += anomalies.length;
    console.log(err(`линия ${lineId}:`));
    anomalies.forEach(({ a, b, d }) => {
      const kind = d > med * 5 ? 'длинный' : 'короткий';
      console.log(
        `   ${kind.padEnd(9)} ${d.toFixed(1).padStart(7)}  ${a.id} (${a.x},${a.y}) → ${b.id} (${b.x},${b.y})`,
      );
    });
  }
  if (!flagged) console.log(ok('аномалий нет'));

  // 5. Резкие повороты направления (более 90°)
  console.log(h('5. Резкие смены направления (>90° между сегментами)'));
  let turns = 0;
  for (const line of lines) {
    const pts = line.path.map((id) => stations.find((s) => s.id === id)).filter(Boolean);
    for (let i = 2; i < pts.length; i++) {
      const a = pts[i - 2],
        b = pts[i - 1],
        c = pts[i];
      const v1 = { x: b.x - a.x, y: b.y - a.y };
      const v2 = { x: c.x - b.x, y: c.y - b.y };
      const m1 = Math.hypot(v1.x, v1.y);
      const m2 = Math.hypot(v2.x, v2.y);
      if (m1 < 1 || m2 < 1) continue;
      const cos = (v1.x * v2.x + v1.y * v2.y) / (m1 * m2);
      const angle = (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
      if (angle > 90) {
        turns++;
        console.log(
          `   ${line.id}: ${a.id} → ${b.id} → ${c.id}  (${angle.toFixed(0)}°)`,
        );
      }
    }
  }
  if (!turns) console.log(ok('нет резких разворотов'));
}

// 6. Странные имена
console.log(h('6. Подозрительные имена'));
const suspicious = stations.filter(
  (s) => !s.name || (s.name === 'Junction' && !s.isJunction) || /undefined|null/.test(s.name),
);
if (!suspicious.length) console.log(ok('нет'));
else suspicious.forEach((s) => console.log(warn(`${s.id} — "${s.name}"`)));

console.log('\n' + C.dim + 'Аудит завершён.' + C.reset);