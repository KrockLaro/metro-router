import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import {
  Canvas, Group, Path, Circle, RoundedRect,
  Text as SkiaText, Skia, type SkFont, type SkPath,
} from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  useSharedValue, useDerivedValue, useAnimatedReaction,
  withTiming, withDecay, runOnJS,
} from 'react-native-reanimated';

import { STATIONS, SchemaStation, StationOrientation } from './schemaStations';
import { LINES } from './schemaLines';
import { useTheme } from '../theme/ThemeProvider';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const _bounds = (() => {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const s of Object.values(STATIONS)) {
    if (s.isJunction) continue;
    if (s.x < minX) minX = s.x;
    if (s.x > maxX) maxX = s.x;
    if (s.y < minY) minY = s.y;
    if (s.y > maxY) maxY = s.y;
  }
  const PAD = 150;
  return {
    x: minX - PAD,
    y: minY - PAD,
    w: (maxX - minX) + PAD * 2,
    h: (maxY - minY) + PAD * 2,
  };
})();

const BX = _bounds.x;
const BY = _bounds.y;
const BW = _bounds.w;
const BH = _bounds.h;

const TAP_RADIUS = 30;
const PAN_OVERSCROLL = 0.1; // Небольшой запас при перетаскивании

const STATION_R_HUB = 10;
const STATION_R_REG = 6;
const STATION_STROKE = 2;
const ACTIVE_GLOW_R = 20;

const BADGE_W = 16;
const BADGE_H = 13;
const BADGE_GAP = 5;

const FONT_SIZE_REG = 13;
const FONT_SIZE_HUB = 16;
const FONT_SIZE_BADGE = 10;

const FONT_SCALE_MIN = 0.7;
const FONT_SCALE_MAX = 1.4;
const FONT_SCALE_POW = 0.6;
const FONT_SCALE_BUCKET = 0.05;

const FALLBACK_SIZE_SCALE = 0.75;

type LodLevel = 0 | 1 | 2;

export interface SchematicMapHandle {
  focusStation: (id: string, targetScale?: number) => void;
  resetView: () => void;
}

interface Props {
  onStationPress: (station: SchemaStation) => void;
  onMapReady?: (api: SchematicMapHandle) => void;
  highlightedStationIds?: string[];
  activeStationId?: string | null;
}

function getStationPriority(s: SchemaStation): 1 | 2 | 3 {
  if (s.id.startsWith('m_')) return 3;
  if (s.expressStop) return 3;
  if (s.lines.length > 1) return 3;
  if ((s.zone ?? 99) <= 1) return 2;
  return 1;
}

interface LabelLayout {
  tx: number;
  ty: number;
  badgeX: number;
  badgeY: number;
}

function computeLabelLayout(
  cx: number,
  cy: number,
  hasBadge: boolean,
  size: number,
  textW: number,
  r: number,
  orientation: StationOrientation,
  fontScale: number,
): LabelLayout {
  const badgeW = BADGE_W * fontScale;
  const badgeH = BADGE_H * fontScale;
  const gap = hasBadge ? BADGE_GAP * fontScale : 0;
  const off = r + 4;

  switch (orientation) {
    case 'left':
      return {
        tx: cx - off - (hasBadge ? badgeW + gap : 0) - textW,
        ty: cy + size / 3,
        badgeX: cx - off - badgeW,
        badgeY: cy - badgeH / 2,
      };
    case 'top':
      return {
        tx: cx - textW / 2,
        ty: cy - off - (hasBadge ? badgeH + gap : 0),
        badgeX: cx - badgeW / 2,
        badgeY: cy - off - badgeH,
      };
    case 'bottom':
      return {
        tx: cx - textW / 2,
        ty: cy + off + (hasBadge ? badgeH + gap : 0) + size,
        badgeX: cx - badgeW / 2,
        badgeY: cy + off,
      };
    case 'right':
    default:
      return {
        tx: cx + off + (hasBadge ? badgeW + gap : 0),
        ty: cy + size / 3,
        badgeX: cx + off,
        badgeY: cy - badgeH / 2,
      };
  }
}

function candidateOrientations(preferred: StationOrientation | undefined): StationOrientation[] {
  switch (preferred ?? 'right') {
    case 'right': return ['right', 'left', 'top', 'bottom'];
    case 'left': return ['left', 'right', 'top', 'bottom'];
    case 'top': return ['top', 'bottom', 'right', 'left'];
    case 'bottom': return ['bottom', 'top', 'right', 'left'];
  }
}

interface Rect { x: number; y: number; w: number; h: number; }

function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

const SchematicMap: React.FC<Props> = ({
  onStationPress,
  onMapReady,
  highlightedStationIds,
  activeStationId,
}) => {
  const { theme } = useTheme();

  const viewW = useSharedValue(SCREEN_W);
  const viewH = useSharedValue(SCREEN_H);

  // Инициализация параметров масштабирования и положения
  const initZoom = Math.min(SCREEN_W / BW, SCREEN_H / BH);
  const minZoom = useSharedValue(initZoom);
  const maxZoom = useSharedValue(initZoom * 5);

  const zoom = useSharedValue(initZoom);
  const centerX = useSharedValue(BX + BW / 2);
  const centerY = useSharedValue(BY + BH / 2);

  const savedCenterX = useSharedValue(0);
  const savedCenterY = useSharedValue(0);
  const savedZoom = useSharedValue(1);

  const [lodLevel, setLodLevel] = useState<LodLevel>(2);
  const lodShared = useSharedValue<number>(2);

  const [fontScale, setFontScale] = useState(1.0);
  const fontScaleShared = useSharedValue<number>(1.0);

  const handleLayout = (e: any) => {
    const { width, height } = e.nativeEvent.layout;
    const fitZoom = Math.min(width / BW, height / BH);

    if (viewW.value !== width || viewH.value !== height) {
      viewW.value = width;
      viewH.value = height;
      minZoom.value = fitZoom;
      maxZoom.value = fitZoom * 5;
      
      // Если карта была в минимальном зуме, обновляем её под новые размеры
      if (Math.abs(zoom.value - minZoom.value) < 0.01) {
        zoom.value = fitZoom;
      }
    }
  };

  const transform = useDerivedValue(() => {
    return [
      { translateX: viewW.value / 2 },
      { translateY: viewH.value / 2 },
      { scale: zoom.value },
      { translateX: -centerX.value },
      { translateY: -centerY.value },
    ];
  });

  // LOD (Level of Detail) - зависит от зума
  useAnimatedReaction(
    () => zoom.value,
    (z) => {
      const ratio = z / minZoom.value;
      let next: number;
      if (ratio < 1.5) next = 0;
      else if (ratio < 3.0) next = 1;
      else next = 2;
      if (next !== lodShared.value) {
        lodShared.value = next;
        runOnJS(setLodLevel)(next as LodLevel);
      }
    },
  );

  // Масштабирование шрифта (чтобы при сильном зуме текст не становился гигантским)
  useAnimatedReaction(
    () => zoom.value,
    (z) => {
      const ratio = z / minZoom.value;
      const clampedRatio = Math.max(0.2, Math.min(5.0, ratio));
      const raw = Math.pow(1.0 / clampedRatio, FONT_SCALE_POW);
      const scaled = Math.max(FONT_SCALE_MIN, Math.min(FONT_SCALE_MAX, raw));
      const bucket = Math.round(scaled / FONT_SCALE_BUCKET) * FONT_SCALE_BUCKET;
      if (Math.abs(bucket - fontScaleShared.value) > FONT_SCALE_BUCKET / 2) {
        fontScaleShared.value = bucket;
        runOnJS(setFontScale)(bucket);
      }
    },
  );

  const labelFont = useMemo<SkFont | null>(() => {
    try {
      const tf = Skia.FontMgr.System().matchFamilyStyle('sans-serif', { weight: 400, width: 5, slant: 0 });
      return tf ? Skia.Font(tf, Math.round(FONT_SIZE_REG * fontScale)) : null;
    } catch { return null; }
  }, [fontScale]);

  const labelFontBold = useMemo<SkFont | null>(() => {
    try {
      const tf = Skia.FontMgr.System().matchFamilyStyle('sans-serif', { weight: 700, width: 5, slant: 0 });
      return tf ? Skia.Font(tf, Math.round(FONT_SIZE_HUB * fontScale)) : null;
    } catch { return null; }
  }, [fontScale]);

  const labelFontSmall = useMemo<SkFont | null>(() => {
    try {
      const tf = Skia.FontMgr.System().matchFamilyStyle('sans-serif', { weight: 400, width: 5, slant: 0 });
      return tf ? Skia.Font(tf, Math.max(8, Math.round(FONT_SIZE_REG * fontScale * FALLBACK_SIZE_SCALE))) : null;
    } catch { return null; }
  }, [fontScale]);

  const labelFontBoldSmall = useMemo<SkFont | null>(() => {
    try {
      const tf = Skia.FontMgr.System().matchFamilyStyle('sans-serif', { weight: 700, width: 5, slant: 0 });
      return tf ? Skia.Font(tf, Math.max(10, Math.round(FONT_SIZE_HUB * fontScale * FALLBACK_SIZE_SCALE))) : null;
    } catch { return null; }
  }, [fontScale]);

  const expressFont = useMemo<SkFont | null>(() => {
    try {
      const tf = Skia.FontMgr.System().matchFamilyStyle('sans-serif', { weight: 700, width: 5, slant: 0 });
      return tf ? Skia.Font(tf, Math.round(FONT_SIZE_BADGE * fontScale)) : null;
    } catch { return null; }
  }, [fontScale]);

  const linePaths = useMemo(() => {
    const sorted = [...LINES].sort((a, b) => {
      const aMcd = a.kind === 'mcd' ? 1 : 0;
      const bMcd = b.kind === 'mcd' ? 1 : 0;
      return aMcd - bMcd;
    });

    return sorted.map((line) => {
      const stations = line.path.map((id) => STATIONS[id]).filter(Boolean);
      let path: SkPath | null = null;
      if (stations.length > 0) {
        const builder = Skia.PathBuilder.Make();
        builder.moveTo(stations[0].x, stations[0].y);
        for (let i = 1; i < stations.length; i++) {
          builder.lineTo(stations[i].x, stations[i].y);
        }
        path = builder.build();
      }
      return { id: line.id, path, color: line.color, strokeWidth: line.kind === 'mcd' ? 3 : 6 };
    });
  }, []);

  const stationEntries = useMemo(
    () => Object.values(STATIONS).filter((s) => !s.isJunction),
    [],
  );

  const stationOffsets = useMemo(() => {
    const offsets = new Map<string, { dx: number; dy: number }>();

    const sorted = [...stationEntries].sort((a, b) => {
      const pa = getStationPriority(a);
      const pb = getStationPriority(b);
      if (pa !== pb) return pb - pa;
      return b.lines.length - a.lines.length;
    });

    const placed: Array<{ x: number; y: number; r: number }> = [];

    for (const s of sorted) {
      const r = s.lines.length > 1 ? STATION_R_HUB : STATION_R_REG;
      let x = s.x;
      let y = s.y;

      for (let iter = 0; iter < 30; iter++) {
        let moved = false;
        for (const p of placed) {
          const dx = x - p.x;
          const dy = y - p.y;
          const minDist = r + p.r + 2;
          const distSq = dx * dx + dy * dy;
          if (distSq < minDist * minDist) {
            const dist = Math.sqrt(distSq) || 0.001;
            const push = (minDist - dist) * 0.6;
            x += (dx / dist) * push;
            y += (dy / dist) * push;
            moved = true;
          }
        }
        if (!moved) break;
      }

      const totalDx = x - s.x;
      const totalDy = y - s.y;
      const totalDist = Math.hypot(totalDx, totalDy);
      const OFFSET_MAX = 15;
      if (totalDist > OFFSET_MAX) {
        const k = OFFSET_MAX / totalDist;
        x = s.x + totalDx * k;
        y = s.y + totalDy * k;
      }

      offsets.set(s.id, { dx: x - s.x, dy: y - s.y });
      placed.push({ x, y, r });
    }

    return offsets;
  }, [stationEntries]);

  const getOffset = useCallback(
    (id: string) => stationOffsets.get(id) ?? { dx: 0, dy: 0 },
    [stationOffsets],
  );

  const labels = useMemo(() => {
    if (!labelFont) return [];

    const DENSITY_RADIUS = 45;
    const DENSITY_THRESHOLD = 3;

    const densityMap = new Map<string, number>();
    for (const s of stationEntries) {
      let count = 0;
      for (const o of stationEntries) {
        if (o.id === s.id) continue;
        const dx = o.x - s.x;
        const dy = o.y - s.y;
        if (dx * dx + dy * dy <= DENSITY_RADIUS * DENSITY_RADIUS) count++;
      }
      densityMap.set(s.id, count);
    }

    const isDense = (s: SchemaStation) => (densityMap.get(s.id) ?? 0) >= DENSITY_THRESHOLD;

    const visible = stationEntries.filter((s) => {
      const p = getStationPriority(s);
      if (lodLevel === 0 && p < 3) return false;
      if (lodLevel === 1 && p < 2) return false;
      return true;
    });

    const sorted = [...visible].sort((a, b) => {
      const da = isDense(a) ? 1 : 0;
      const db = isDense(b) ? 1 : 0;
      if (da !== db) return db - da;
      const pa = getStationPriority(a);
      const pb = getStationPriority(b);
      if (pa !== pb) return pb - pa;
      return b.lines.length - a.lines.length;
    });

    const obstacles: Rect[] = [];

    for (const s of stationEntries) {
      const off = getOffset(s.id);
      const r = s.lines.length > 1 ? STATION_R_HUB : STATION_R_REG;
      obstacles.push({
        x: s.x + off.dx - r - 2,
        y: s.y + off.dy - r - 2,
        w: r * 2 + 4,
        h: r * 2 + 4,
      });
    }

    const badgeW = BADGE_W * fontScale;
    const badgeH = BADGE_H * fontScale;

    for (const s of visible) {
      if (!s.expressStop) continue;
      const off = getOffset(s.id);
      const isHub = s.lines.length > 1;
      const r = isHub ? STATION_R_HUB : STATION_R_REG;
      const cx = s.x + off.dx;
      const cy = s.y + off.dy;
      const bx = cx + r + 4;
      const by = cy - badgeH / 2;
      obstacles.push({ x: bx, y: by, w: badgeW, h: badgeH });
    }

    const placed: Array<{
      s: SchemaStation;
      tx: number;
      ty: number;
      font: SkFont;
      ori: StationOrientation;
    }> = [];

    for (const s of sorted) {
      const off = getOffset(s.id);
      const cx = s.x + off.dx;
      const cy = s.y + off.dy;

      const isHub = s.lines.length > 1;
      const r = isHub ? STATION_R_HUB : STATION_R_REG;
      const hasBadge = !!s.expressStop;

      const allowFallback = !hasBadge && isDense(s);
      const scales = allowFallback ? [1.0, FALLBACK_SIZE_SCALE] : [1.0];

      let placedOk = false;

      for (const sizeScale of scales) {
        if (placedOk) break;

        const size = (isHub ? FONT_SIZE_HUB : FONT_SIZE_REG) * fontScale * sizeScale;

        let font: SkFont;
        if (sizeScale === 1.0) {
          font = isHub && labelFontBold ? labelFontBold : labelFont;
        } else {
          font = (isHub && labelFontBoldSmall) ? labelFontBoldSmall : (labelFontSmall ?? labelFont);
        }

        const textW = font.measureText(s.name).width;
        const lineHeight = size * 1.1;

        const orients = candidateOrientations(s.orientation);
        for (const ori of orients) {
          const layout = computeLabelLayout(cx, cy, hasBadge, size, textW, r, ori, fontScale);
          const bbox: Rect = {
            x: layout.tx - 1,
            y: layout.ty - lineHeight + 2,
            w: textW + 2,
            h: lineHeight,
          };

          let hit = false;
          for (const o of obstacles) {
            if (overlaps(bbox, o)) { hit = true; break; }
          }
          if (hit) continue;

          placed.push({ s, tx: layout.tx, ty: layout.ty, font, ori });
          obstacles.push(bbox);
          placedOk = true;
          break;
        }
      }
    }

    return placed;
  }, [
    lodLevel,
    stationEntries,
    labelFont,
    labelFontBold,
    labelFontSmall,
    labelFontBoldSmall,
    fontScale,
    getOffset,
  ]);

  const placedIds = useMemo(
    () => new Set(labels.map((l) => l.s.id)),
    [labels],
  );

  const usedOrientation = useMemo(() => {
    const m = new Map<string, StationOrientation>();
    for (const l of labels) m.set(l.s.id, l.ori);
    return m;
  }, [labels]);

  const focusStation = useCallback(
    (stationId: string, targetScale?: number) => {
      const s = STATIONS[stationId];
      if (!s) return;
      const off = getOffset(stationId);
      const targetX = s.x + off.dx;
      const targetY = s.y + off.dy;
      
      // Если targetScale задан, берем его от минимального зума.
      // Но не отдаляем карту, если ты уже приблизил её сильнее.
      const targetZ = Math.max(
        zoom.value, 
        minZoom.value * (targetScale ?? 1.5)
      );
      
      zoom.value = withTiming(targetZ, { duration: 400 });
      centerX.value = withTiming(targetX, { duration: 400 });
      centerY.value = withTiming(targetY, { duration: 400 });
    },
    [zoom, minZoom, centerX, centerY, getOffset],
  );

  const resetView = useCallback(() => {
    zoom.value = withTiming(minZoom.value, { duration: 350 });
    centerX.value = withTiming(BX + BW / 2, { duration: 350 });
    centerY.value = withTiming(BY + BH / 2, { duration: 350 });
  }, [zoom, minZoom, centerX, centerY]);

  useEffect(() => {
    if (onMapReady) onMapReady({ focusStation, resetView });
  }, [onMapReady, focusStation, resetView]);

  const pan = Gesture.Pan()
    .maxPointers(1).averageTouches(true).minDistance(4)
    .onStart(() => {
      savedCenterX.value = centerX.value;
      savedCenterY.value = centerY.value;
    })
    .onUpdate((e) => {
      const dx = e.translationX / zoom.value;
      const dy = e.translationY / zoom.value;
      
      let nx = savedCenterX.value - dx;
      let ny = savedCenterY.value - dy;
      
      const halfVW = viewW.value / 2 / zoom.value;
      const halfVH = viewH.value / 2 / zoom.value;
      
      const minX = BX + halfVW;
      const maxX = BX + BW - halfVW;
      const minY = BY + halfVH;
      const maxY = BY + BH - halfVH;
      
      // Если карта меньше экрана, центрируем её. Иначе — не даём выехать за края.
      if (minX > maxX) nx = BX + BW / 2;
      else nx = Math.max(minX, Math.min(maxX, nx));
      
      if (minY > maxY) ny = BY + BH / 2;
      else ny = Math.max(minY, Math.min(maxY, ny));
      
      centerX.value = nx;
      centerY.value = ny;
    })
    .onEnd((e) => {
      const vx = e.velocityX / zoom.value;
      const vy = e.velocityY / zoom.value;
      
      const halfVW = viewW.value / 2 / zoom.value;
      const halfVH = viewH.value / 2 / zoom.value;
      
      const minX = BX + halfVW;
      const maxX = BX + BW - halfVW;
      const minY = BY + halfVH;
      const maxY = BY + BH - halfVH;

      if (minX <= maxX) {
        centerX.value = withDecay({ velocity: -vx, deceleration: 0.997, clamp: [minX, maxX] });
      }
      if (minY <= maxY) {
        centerY.value = withDecay({ velocity: -vy, deceleration: 0.997, clamp: [minY, maxY] });
      }
    });

  const pinch = Gesture.Pinch()
    .onStart((e) => {
      savedCenterX.value = centerX.value;
      savedCenterY.value = centerY.value;
      savedZoom.value = zoom.value;
    })
    .onUpdate((e) => {
      const newZoom = Math.max(minZoom.value, Math.min(maxZoom.value, savedZoom.value * e.scale));
      
      // Точка, на которую мы нацелились пальцами, должна остаться на месте
      const focalWorldX = (e.focalX - viewW.value / 2) / savedZoom.value + savedCenterX.value;
      const focalWorldY = (e.focalY - viewH.value / 2) / savedZoom.value + savedCenterY.value;
      
      const newCenterX = focalWorldX - (e.focalX - viewW.value / 2) / newZoom;
      const newCenterY = focalWorldY - (e.focalY - viewH.value / 2) / newZoom;
      
      zoom.value = newZoom;
      
      // Ограничиваем перемещение
      const halfVW = viewW.value / 2 / newZoom;
      const halfVH = viewH.value / 2 / newZoom;
      
      const minX = BX + halfVW;
      const maxX = BX + BW - halfVW;
      const minY = BY + halfVH;
      const maxY = BY + BH - halfVH;
      
      if (minX > maxX) centerX.value = BX + BW / 2;
      else centerX.value = Math.max(minX, Math.min(maxX, newCenterX));
      
      if (minY > maxY) centerY.value = BY + BH / 2;
      else centerY.value = Math.max(minY, Math.min(maxY, newCenterY));
    });

  const doubleTap = Gesture.Tap().numberOfTaps(2).maxDelay(300)
    .onEnd((e, success) => {
      if (!success) return;
      const isZoomedIn = zoom.value > minZoom.value * 1.5;
      const targetZ = isZoomedIn ? minZoom.value : minZoom.value * 2.5;
      
      const focalWorldX = (e.x - viewW.value / 2) / zoom.value + centerX.value;
      const focalWorldY = (e.y - viewH.value / 2) / zoom.value + centerY.value;
      
      const newCenterX = focalWorldX - (e.x - viewW.value / 2) / targetZ;
      const newCenterY = focalWorldY - (e.y - viewH.value / 2) / targetZ;
      
      zoom.value = withTiming(targetZ, { duration: 300 });
      centerX.value = withTiming(newCenterX, { duration: 300 });
      centerY.value = withTiming(newCenterY, { duration: 300 });
    });

  const offsetsRef = useSharedValue<Record<string, { dx: number; dy: number }>>({});
  useEffect(() => {
    const obj: Record<string, { dx: number; dy: number }> = {};
    stationOffsets.forEach((v, k) => { obj[k] = v; });
    offsetsRef.value = obj;
  }, [stationOffsets, offsetsRef]);

  const singleTap = Gesture.Tap().numberOfTaps(1).maxDelay(300)
    .onEnd((e, success) => {
      if (!success) return;
      const worldX = (e.x - viewW.value / 2) / zoom.value + centerX.value;
      const worldY = (e.y - viewH.value / 2) / zoom.value + centerY.value;
      
      // Радиус нажатия переводим из экранных пикселей в мировые единицы
      const worldRadius = TAP_RADIUS / zoom.value;
      
      const offs = offsetsRef.value;
      let closest: SchemaStation | null = null;
      let minDist = Infinity;
      for (const s of stationEntries) {
        const o = offs[s.id] ?? { dx: 0, dy: 0 };
        const dx = s.x + o.dx - worldX;
        const dy = s.y + o.dy - worldY;
        const d = Math.sqrt(dx * dx + dy * dy);
        const bonus = s.lines.length > 1 ? 0.6 : 1;
        const weighted = d * bonus;
        if (weighted < minDist) { minDist = weighted; closest = s; }
      }
      
      if (closest && minDist < worldRadius) {
        runOnJS(onStationPress)(closest);
      }
    });

  const taps = Gesture.Exclusive(doubleTap, singleTap);
  const gesture = Gesture.Simultaneous(pan, pinch, taps);

  const highlightSet = useMemo(
    () => new Set(highlightedStationIds ?? []),
    [highlightedStationIds],
  );

  const scaledBadgeW = BADGE_W * fontScale;
  const scaledBadgeH = BADGE_H * fontScale;

  return (
    <View
      style={[styles.container, { backgroundColor: theme.mapBg }]}
      onLayout={handleLayout}
    >
      <GestureDetector gesture={gesture}>
        <Canvas style={StyleSheet.absoluteFill}>
          <Group transform={transform}>
            {linePaths.map((item) =>
              item.path ? (
                <Path
                  key={item.id}
                  path={item.path}
                  color={item.color}
                  style="stroke"
                  strokeWidth={item.strokeWidth}
                  strokeCap="round"
                  strokeJoin="round"
                />
              ) : null,
            )}

            {stationEntries.map((s) => {
              const off = getOffset(s.id);
              const cx = s.x + off.dx;
              const cy = s.y + off.dy;
              const isHub = s.lines.length > 1;
              const isHighlighted = highlightSet.has(s.id);
              const isActive = s.id === activeStationId;
              const r = isHub ? STATION_R_HUB : STATION_R_REG;
              return (
                <React.Fragment key={s.id}>
                  {isActive && <Circle cx={cx} cy={cy} r={ACTIVE_GLOW_R} color={theme.accent} opacity={0.2} />}
                  <Circle cx={cx} cy={cy} r={r} color={isHighlighted ? theme.accent : theme.stationFill} />
                  <Circle cx={cx} cy={cy} r={r} color={theme.stationStroke} style="stroke" strokeWidth={STATION_STROKE} />
                </React.Fragment>
              );
            })}

            {stationEntries.map((s) => {
              if (s.facilities.wheelchair !== 'full') return null;
              const p = getStationPriority(s);
              if (lodLevel < 2 && p < 3) return null;
              const off = getOffset(s.id);
              const cx = s.x + off.dx + 10;
              const cy = s.y + off.dy - 10;
              return (
                <React.Fragment key={`acc-${s.id}`}>
                  <Circle cx={cx} cy={cy} r={6} color="#0A84FF" />
                  <Circle cx={cx} cy={cy} r={2} color="#FFFFFF" />
                </React.Fragment>
              );
            })}

            {stationEntries.map((s) => {
              if (!s.expressStop) return null;
              if (!placedIds.has(s.id)) return null;
              const off = getOffset(s.id);
              const cx = s.x + off.dx;
              const cy = s.y + off.dy;
              const isHub = s.lines.length > 1;
              const r = isHub ? STATION_R_HUB : STATION_R_REG;
              const size = (isHub ? FONT_SIZE_HUB : FONT_SIZE_REG) * fontScale;
              const w = (isHub && labelFontBold ? labelFontBold : labelFont)!.measureText(s.name).width;
              const ori = usedOrientation.get(s.id) ?? (s.orientation ?? 'right');
              const { badgeX, badgeY } = computeLabelLayout(cx, cy, true, size, w, r, ori, fontScale);
              return (
                <RoundedRect
                  key={`ex-${s.id}`}
                  x={badgeX}
                  y={badgeY}
                  width={scaledBadgeW}
                  height={scaledBadgeH}
                  r={3 * fontScale}
                  color="#E5231B"
                />
              );
            })}

            {expressFont && stationEntries.map((s) => {
              if (!s.expressStop) return null;
              if (!placedIds.has(s.id)) return null;
              const off = getOffset(s.id);
              const cx = s.x + off.dx;
              const cy = s.y + off.dy;
              const isHub = s.lines.length > 1;
              const r = isHub ? STATION_R_HUB : STATION_R_REG;
              const size = (isHub ? FONT_SIZE_HUB : FONT_SIZE_REG) * fontScale;
              const w = (isHub && labelFontBold ? labelFontBold : labelFont)!.measureText(s.name).width;
              const ori = usedOrientation.get(s.id) ?? (s.orientation ?? 'right');
              const { badgeX, badgeY } = computeLabelLayout(cx, cy, true, size, w, r, ori, fontScale);
              return (
                <SkiaText
                  key={`ext-${s.id}`}
                  x={badgeX + 5 * fontScale}
                  y={badgeY + 10 * fontScale}
                  text="Э"
                  font={expressFont}
                  color="#FFFFFF"
                />
              );
            })}

            {labels.map(({ s, tx, ty, font }) => (
              <SkiaText key={`lbl-${s.id}`} x={tx} y={ty} text={s.name} font={font} color={theme.text} />
            ))}
          </Group>
        </Canvas>
      </GestureDetector>
    </View>
  );
};

export default SchematicMap;

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
});