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
import { MapFilterType } from '../store/SettingsContext';

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
    x: minX - PAD, y: minY - PAD,
    w: (maxX - minX) + PAD * 2, h: (maxY - minY) + PAD * 2,
  };
})();

const BX = _bounds.x;
const BY = _bounds.y;
const BW = _bounds.w;
const BH = _bounds.h;

const TAP_RADIUS = 30;
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
  mapFilter?: MapFilterType;
  activeRouteStations?: string[];
  activeRouteLines?: string[];
}

function getStationPriority(s: SchemaStation): 1 | 2 | 3 {
  if (s.id.startsWith('m_')) return 3;
  if (s.expressStop) return 3;
  if (s.lines.length > 1) return 3;
  if ((s.zone ?? 99) <= 1) return 2;
  return 1;
}

function matchesFilter(s: SchemaStation, filter: MapFilterType | undefined): boolean {
  if (!filter) return true;
  if (filter === 'wheelchair') return s.facilities.wheelchair === 'full';
  return !!s.facilities[filter];
}

interface LabelLayout {
  tx: number; ty: number; badgeX: number; badgeY: number;
}

function computeLabelLayout(
  cx: number, cy: number, hasBadge: boolean, size: number,
  textW: number, r: number, orientation: StationOrientation, fontScale: number,
): LabelLayout {
  const badgeW = BADGE_W * fontScale;
  const badgeH = BADGE_H * fontScale;
  const gap = hasBadge ? BADGE_GAP * fontScale : 0;
  const off = r + 4;

  switch (orientation) {
    case 'left': return { tx: cx - off - (hasBadge ? badgeW + gap : 0) - textW, ty: cy + size / 3, badgeX: cx - off - badgeW, badgeY: cy - badgeH / 2 };
    case 'top': return { tx: cx - textW / 2, ty: cy - off - (hasBadge ? badgeH + gap : 0), badgeX: cx - badgeW / 2, badgeY: cy - off - badgeH };
    case 'bottom': return { tx: cx - textW / 2, ty: cy + off + (hasBadge ? badgeH + gap : 0) + size, badgeX: cx - badgeW / 2, badgeY: cy + off };
    case 'right':
    default: return { tx: cx + off + (hasBadge ? badgeW + gap : 0), ty: cy + size / 3, badgeX: cx + off, badgeY: cy - badgeH / 2 };
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
  onStationPress, onMapReady, highlightedStationIds,
  activeStationId, mapFilter, activeRouteStations, activeRouteLines,
}) => {
  const { theme } = useTheme();

  const viewW = useSharedValue(SCREEN_W);
  const viewH = useSharedValue(SCREEN_H);
  const isInitialized = useSharedValue(false);
  const minZoom = useSharedValue(1);
  const maxZoom = useSharedValue(5);

  const zoom = useSharedValue(1);
  const centerX = useSharedValue(BX + BW / 2);
  const centerY = useSharedValue(BY + BH / 2);

  const savedCenterX = useSharedValue(0);
  const savedCenterY = useSharedValue(0);
  const savedZoom = useSharedValue(1);
  const pinchStartWorldX = useSharedValue(0);
  const pinchStartWorldY = useSharedValue(0);

  const [lodLevel, setLodLevel] = useState<LodLevel>(2);
  const lodShared = useSharedValue<number>(2);
  const [fontScale, setFontScale] = useState(1.0);
  const fontScaleShared = useSharedValue<number>(1.0);

  const handleLayout = (e: any) => {
    const { width, height } = e.nativeEvent.layout;
    if (width === 0 || height === 0) return;
    const fitZoom = Math.min(width / BW, height / BH);
    viewW.value = width; viewH.value = height;
    minZoom.value = fitZoom; maxZoom.value = fitZoom * 5;
    if (!isInitialized.value || Math.abs(zoom.value - minZoom.value) < 0.05) {
      isInitialized.value = true;
      zoom.value = fitZoom;
      centerX.value = BX + BW / 2;
      centerY.value = BY + BH / 2;
    }
  };

  const transform = useDerivedValue(() => [
    { translateX: viewW.value / 2 }, { translateY: viewH.value / 2 },
    { scale: zoom.value }, { translateX: -centerX.value }, { translateY: -centerY.value },
  ]);

  useAnimatedReaction(() => zoom.value, (z) => {
    const ratio = z / minZoom.value;
    let next: number = ratio < 1.5 ? 0 : ratio < 3.0 ? 1 : 2;
    if (next !== lodShared.value) { lodShared.value = next; runOnJS(setLodLevel)(next as LodLevel); }
  });

  useAnimatedReaction(() => zoom.value, (z) => {
    const ratio = z / minZoom.value;
    const clampedRatio = Math.max(0.2, Math.min(5.0, ratio));
    const raw = Math.pow(1.0 / clampedRatio, FONT_SCALE_POW);
    const scaled = Math.max(FONT_SCALE_MIN, Math.min(FONT_SCALE_MAX, raw));
    const bucket = Math.round(scaled / FONT_SCALE_BUCKET) * FONT_SCALE_BUCKET;
    if (Math.abs(bucket - fontScaleShared.value) > FONT_SCALE_BUCKET / 2) {
      fontScaleShared.value = bucket; runOnJS(setFontScale)(bucket);
    }
  });

  const labelFont = useMemo<SkFont | null>(() => {
    try { const tf = Skia.FontMgr.System().matchFamilyStyle('sans-serif', { weight: 400, width: 5, slant: 0 }); return tf ? Skia.Font(tf, Math.round(FONT_SIZE_REG * fontScale)) : null; } catch { return null; }
  }, [fontScale]);

  const labelFontBold = useMemo<SkFont | null>(() => {
    try { const tf = Skia.FontMgr.System().matchFamilyStyle('sans-serif', { weight: 700, width: 5, slant: 0 }); return tf ? Skia.Font(tf, Math.round(FONT_SIZE_HUB * fontScale)) : null; } catch { return null; }
  }, [fontScale]);

  const labelFontSmall = useMemo<SkFont | null>(() => {
    try { const tf = Skia.FontMgr.System().matchFamilyStyle('sans-serif', { weight: 400, width: 5, slant: 0 }); return tf ? Skia.Font(tf, Math.max(8, Math.round(FONT_SIZE_REG * fontScale * FALLBACK_SIZE_SCALE))) : null; } catch { return null; }
  }, [fontScale]);

  const labelFontBoldSmall = useMemo<SkFont | null>(() => {
    try { const tf = Skia.FontMgr.System().matchFamilyStyle('sans-serif', { weight: 700, width: 5, slant: 0 }); return tf ? Skia.Font(tf, Math.max(10, Math.round(FONT_SIZE_HUB * fontScale * FALLBACK_SIZE_SCALE))) : null; } catch { return null; }
  }, [fontScale]);

  const expressFont = useMemo<SkFont | null>(() => {
    try { const tf = Skia.FontMgr.System().matchFamilyStyle('sans-serif', { weight: 700, width: 5, slant: 0 }); return tf ? Skia.Font(tf, Math.round(FONT_SIZE_BADGE * fontScale)) : null; } catch { return null; }
  }, [fontScale]);

  const linePaths = useMemo(() => {
    const sorted = [...LINES].sort((a, b) => (a.kind === 'mcd' ? 1 : 0) - (b.kind === 'mcd' ? 1 : 0));
    return sorted.map((line) => {
      const stations = line.path.map((id) => STATIONS[id]).filter(Boolean);
      let path: SkPath | null = null;
      if (stations.length > 0) {
        const builder = Skia.PathBuilder.Make();
        builder.moveTo(stations[0].x, stations[0].y);
        for (let i = 1; i < stations.length; i++) builder.lineTo(stations[i].x, stations[i].y);
        path = builder.build();
      }
      return { id: line.id, path, color: line.color, strokeWidth: line.kind === 'mcd' ? 3 : 6 };
    });
  }, []);

  const stationEntries = useMemo(() => Object.values(STATIONS).filter((s) => !s.isJunction), []);

  const stationOffsets = useMemo(() => {
    const offsets = new Map<string, { dx: number; dy: number }>();
    const sorted = [...stationEntries].sort((a, b) => {
      const pa = getStationPriority(a); const pb = getStationPriority(b);
      if (pa !== pb) return pb - pa;
      return b.lines.length - a.lines.length;
    });
    const placed: Array<{ x: number; y: number; r: number }> = [];
    for (const s of sorted) {
      const r = s.lines.length > 1 ? STATION_R_HUB : STATION_R_REG;
      let x = s.x; let y = s.y;
      for (let iter = 0; iter < 30; iter++) {
        let moved = false;
        for (const p of placed) {
          const dx = x - p.x; const dy = y - p.y;
          const minDist = r + p.r + 2; const distSq = dx * dx + dy * dy;
          if (distSq < minDist * minDist) {
            const dist = Math.sqrt(distSq) || 0.001; const push = (minDist - dist) * 0.6;
            x += (dx / dist) * push; y += (dy / dist) * push; moved = true;
          }
        }
        if (!moved) break;
      }
      const totalDx = x - s.x; const totalDy = y - s.y; const totalDist = Math.hypot(totalDx, totalDy);
      const OFFSET_MAX = 15;
      if (totalDist > OFFSET_MAX) { const k = OFFSET_MAX / totalDist; x = s.x + totalDx * k; y = s.y + totalDy * k; }
      offsets.set(s.id, { dx: x - s.x, dy: y - s.y });
      placed.push({ x, y, r });
    }
    return offsets;
  }, [stationEntries]);

  const getOffset = useCallback((id: string) => stationOffsets.get(id) ?? { dx: 0, dy: 0 }, [stationOffsets]);

  const labels = useMemo(() => {
    if (!labelFont) return [];
    const DENSITY_RADIUS = 45; const DENSITY_THRESHOLD = 3;
    const densityMap = new Map<string, number>();
    for (const s of stationEntries) {
      let count = 0;
      for (const o of stationEntries) {
        if (o.id === s.id) continue;
        const dx = o.x - s.x; const dy = o.y - s.y;
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
      const da = isDense(a) ? 1 : 0; const db = isDense(b) ? 1 : 0;
      if (da !== db) return db - da;
      const pa = getStationPriority(a); const pb = getStationPriority(b);
      if (pa !== pb) return pb - pa;
      return b.lines.length - a.lines.length;
    });
    const obstacles: Rect[] = [];
    for (const s of stationEntries) {
      const off = getOffset(s.id); const r = s.lines.length > 1 ? STATION_R_HUB : STATION_R_REG;
      obstacles.push({ x: s.x + off.dx - r - 2, y: s.y + off.dy - r - 2, w: r * 2 + 4, h: r * 2 + 4 });
    }
    const badgeW = BADGE_W * fontScale; const badgeH = BADGE_H * fontScale;
    for (const s of visible) {
      if (!s.expressStop) continue;
      const off = getOffset(s.id); const isHub = s.lines.length > 1;
      const r = isHub ? STATION_R_HUB : STATION_R_REG;
      const cx = s.x + off.dx; const cy = s.y + off.dy;
      obstacles.push({ x: cx + r + 4, y: cy - badgeH / 2, w: badgeW, h: badgeH });
    }
    const placed: Array<{ s: SchemaStation; tx: number; ty: number; font: SkFont; ori: StationOrientation; }> = [];
    for (const s of sorted) {
      const off = getOffset(s.id); const cx = s.x + off.dx; const cy = s.y + off.dy;
      const isHub = s.lines.length > 1; const r = isHub ? STATION_R_HUB : STATION_R_REG;
      const hasBadge = !!s.expressStop;
      const allowFallback = !hasBadge && isDense(s);
      const scales = allowFallback ? [1.0, FALLBACK_SIZE_SCALE] : [1.0];
      let placedOk = false;
      for (const sizeScale of scales) {
        if (placedOk) break;
        const size = (isHub ? FONT_SIZE_HUB : FONT_SIZE_REG) * fontScale * sizeScale;
        let font = (sizeScale === 1.0) ? (isHub && labelFontBold ? labelFontBold : labelFont) : ((isHub && labelFontBoldSmall) ? labelFontBoldSmall : (labelFontSmall ?? labelFont));
        const textW = font.measureText(s.name).width; const lineHeight = size * 1.1;
        for (const ori of candidateOrientations(s.orientation)) {
          const layout = computeLabelLayout(cx, cy, hasBadge, size, textW, r, ori, fontScale);
          const bbox: Rect = { x: layout.tx - 1, y: layout.ty - lineHeight + 2, w: textW + 2, h: lineHeight };
          let hit = false;
          for (const o of obstacles) { if (overlaps(bbox, o)) { hit = true; break; } }
          if (hit) continue;
          placed.push({ s, tx: layout.tx, ty: layout.ty, font, ori });
          obstacles.push(bbox); placedOk = true; break;
        }
      }
    }
    return placed;
  }, [lodLevel, stationEntries, labelFont, labelFontBold, labelFontSmall, labelFontBoldSmall, fontScale, getOffset]);

  const placedIds = useMemo(() => new Set(labels.map((l) => l.s.id)), [labels]);
  const usedOrientation = useMemo(() => {
    const m = new Map<string, StationOrientation>();
    for (const l of labels) m.set(l.s.id, l.ori);
    return m;
  }, [labels]);

  const focusStation = useCallback((stationId: string, targetScale?: number) => {
    const s = STATIONS[stationId]; if (!s) return;
    const off = getOffset(stationId);
    const targetZ = Math.max(zoom.value, minZoom.value * (targetScale ?? 1.5));
    const sheetYOffset = viewH.value * 0.3 / targetZ;
    zoom.value = withTiming(targetZ, { duration: 400 });
    centerX.value = withTiming(s.x + off.dx, { duration: 400 });
    centerY.value = withTiming(s.y + off.dy + sheetYOffset, { duration: 400 });
  }, [zoom, minZoom, centerX, centerY, getOffset, viewH]);

  const resetView = useCallback(() => {
    zoom.value = withTiming(minZoom.value, { duration: 350 });
    centerX.value = withTiming(BX + BW / 2, { duration: 350 });
    centerY.value = withTiming(BY + BH / 2, { duration: 350 });
  }, [zoom, minZoom, centerX, centerY]);

  useEffect(() => { if (onMapReady) onMapReady({ focusStation, resetView }); }, [onMapReady, focusStation, resetView]);

  // --- АВТОМАТИЧЕСКИЙ ЗУМ НА МАРШРУТ ---
  useEffect(() => {
    if (!activeRouteStations || activeRouteStations.length === 0) {
      return;
    }

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const id of activeRouteStations) {
      const s = STATIONS[id];
      if (!s) continue;
      const off = getOffset(id);
      const cx = s.x + off.dx;
      const cy = s.y + off.dy;
      if (cx < minX) minX = cx;
      if (cx > maxX) maxX = cx;
      if (cy < minY) minY = cy;
      if (cy > maxY) maxY = cy;
    }

    if (minX !== Infinity) {
      const PADDING_X = 100;
      const PADDING_Y = 150; 
      const BOTTOM_UI_SPACE = 200; // Место под нижнюю плашку маршрута

      const routeWidth = maxX - minX + PADDING_X * 2;
      const routeHeight = maxY - minY + PADDING_Y + BOTTOM_UI_SPACE;

      const targetCX = (minX + maxX) / 2;
      // Смещаем центр немного вверх, чтобы освободить место под плашку
      const targetCY = (minY + maxY) / 2 + (BOTTOM_UI_SPACE - PADDING_Y) / 2;

      const fitZoom = Math.min(viewW.value / routeWidth, viewH.value / routeHeight);
      const targetZ = Math.max(minZoom.value, Math.min(maxZoom.value * 0.8, fitZoom));

      zoom.value = withTiming(targetZ, { duration: 600 });
      centerX.value = withTiming(targetCX, { duration: 600 });
      centerY.value = withTiming(targetCY, { duration: 600 });
    }
  }, [activeRouteStations?.join(','), viewW.value, viewH.value, getOffset, zoom, centerX, centerY, minZoom, maxZoom]);

  const pan = Gesture.Pan().maxPointers(1).averageTouches(true).minDistance(4)
    .onStart(() => { savedCenterX.value = centerX.value; savedCenterY.value = centerY.value; })
    .onUpdate((e) => {
      const dx = e.translationX / zoom.value; const dy = e.translationY / zoom.value;
      let nx = savedCenterX.value - dx; let ny = savedCenterY.value - dy;
      const halfVW = viewW.value / 2 / zoom.value; const halfVH = viewH.value / 2 / zoom.value;
      const minX = BX + halfVW; const maxX = BX + BW - halfVW; const minY = BY + halfVH; const maxY = BY + BH - halfVH;
      if (minX > maxX) nx = BX + BW / 2; else nx = Math.max(minX, Math.min(maxX, nx));
      if (minY > maxY) ny = BY + BH / 2; else ny = Math.max(minY, Math.min(maxY, ny));
      centerX.value = nx; centerY.value = ny;
    })
    .onEnd((e) => {
      const vx = e.velocityX / zoom.value; const vy = e.velocityY / zoom.value;
      const halfVW = viewW.value / 2 / zoom.value; const halfVH = viewH.value / 2 / zoom.value;
      const minX = BX + halfVW; const maxX = BX + BW - halfVW; const minY = BY + halfVH; const maxY = BY + BH - halfVH;
      if (minX <= maxX) centerX.value = withDecay({ velocity: -vx, deceleration: 0.997, clamp: [minX, maxX] });
      if (minY <= maxY) centerY.value = withDecay({ velocity: -vy, deceleration: 0.997, clamp: [minY, maxY] });
    });

  const pinch = Gesture.Pinch().onStart((e) => {
    savedCenterX.value = centerX.value; savedCenterY.value = centerY.value; savedZoom.value = zoom.value;
    pinchStartWorldX.value = (e.focalX - viewW.value / 2) / savedZoom.value + savedCenterX.value;
    pinchStartWorldY.value = (e.focalY - viewH.value / 2) / savedZoom.value + savedCenterY.value;
  }).onUpdate((e) => {
    const newZoom = Math.max(minZoom.value, Math.min(maxZoom.value, savedZoom.value * e.scale));
    const newCenterX = pinchStartWorldX.value - (e.focalX - viewW.value / 2) / newZoom;
    const newCenterY = pinchStartWorldY.value - (e.focalY - viewH.value / 2) / newZoom;
    zoom.value = newZoom;
    const halfVW = viewW.value / 2 / newZoom; const halfVH = viewH.value / 2 / newZoom;
    const minX = BX + halfVW; const maxX = BX + BW - halfVW; const minY = BY + halfVH; const maxY = BY + BH - halfVH;
    if (minX > maxX) centerX.value = BX + BW / 2; else centerX.value = Math.max(minX, Math.min(maxX, newCenterX));
    if (minY > maxY) centerY.value = BY + BH / 2; else centerY.value = Math.max(minY, Math.min(maxY, newCenterY));
  });

  const doubleTap = Gesture.Tap().numberOfTaps(2).maxDelay(300).onEnd((e, success) => {
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

  const singleTap = Gesture.Tap().numberOfTaps(1).maxDelay(300).onEnd((e, success) => {
    if (!success) return;
    const worldX = (e.x - viewW.value / 2) / zoom.value + centerX.value;
    const worldY = (e.y - viewH.value / 2) / zoom.value + centerY.value;
    const worldRadius = TAP_RADIUS / zoom.value;
    const offs = offsetsRef.value;
    let closest: SchemaStation | null = null; let minDist = Infinity;
    for (const s of stationEntries) {
      const o = offs[s.id] ?? { dx: 0, dy: 0 };
      const dx = s.x + o.dx - worldX; const dy = s.y + o.dy - worldY;
      const d = Math.sqrt(dx * dx + dy * dy); const bonus = s.lines.length > 1 ? 0.6 : 1;
      const weighted = d * bonus; if (weighted < minDist) { minDist = weighted; closest = s; }
    }
    if (closest && minDist < worldRadius) runOnJS(onStationPress)(closest);
  });

  const taps = Gesture.Exclusive(doubleTap, singleTap);
  const gesture = Gesture.Simultaneous(pan, pinch, taps);

  const highlightSet = useMemo(() => new Set(highlightedStationIds ?? []), [highlightedStationIds]);
  const scaledBadgeW = BADGE_W * fontScale;
  const scaledBadgeH = BADGE_H * fontScale;

  const dimmedLineColor = theme.name === 'dark' ? '#2C2C2E' : '#E5E5EA';
  const dimmedStationColor = theme.name === 'dark' ? '#3A3A3C' : '#D1D1D6';
  
  const isRouteActive = !!activeRouteStations && activeRouteStations.length > 0;
  const routeStationsSet = useMemo(() => new Set(activeRouteStations || []), [activeRouteStations]);
  const routeLinesSet = useMemo(() => new Set(activeRouteLines || []), [activeRouteLines]);

  return (
    <View style={[styles.container, { backgroundColor: theme.mapBg }]} onLayout={handleLayout}>
      <GestureDetector gesture={gesture}>
        <Canvas style={StyleSheet.absoluteFill}>
          <Group transform={transform}>
            
            {/* ЛИНИИ */}
            {linePaths.map((item) => {
              const isRouteLine = isRouteActive && routeLinesSet.has(item.id);
              const isDimmed = (mapFilter || isRouteActive) && !isRouteLine;

              return item.path ? (
                <Path
                  key={item.id}
                  path={item.path}
                  color={isDimmed ? dimmedLineColor : item.color}
                  style="stroke"
                  strokeWidth={isRouteLine ? item.strokeWidth + 2 : item.strokeWidth}
                  strokeCap="round"
                  strokeJoin="round"
                  opacity={isDimmed ? 0.2 : 1}
                />
              ) : null;
            })}

            {/* СТАНЦИИ (КРУЖКИ) */}
            {stationEntries.map((s) => {
              const off = getOffset(s.id);
              const cx = s.x + off.dx;
              const cy = s.y + off.dy;
              const isHub = s.lines.length > 1;
              const isHighlighted = highlightSet.has(s.id);
              const isActive = s.id === activeStationId;
              const r = isHub ? STATION_R_HUB : STATION_R_REG;
              
              const isRouteStation = isRouteActive && routeStationsSet.has(s.id);
              const isFilterMatch = matchesFilter(s, mapFilter);
              
              let fillColor = isHighlighted ? theme.accent : theme.stationFill;
              let opacity = 1;
              let strokeCol = theme.stationStroke;

              if (isRouteActive) {
                if (isRouteStation) {
                  fillColor = '#FFD700'; // Золотой для станций маршрута
                  strokeCol = '#DAA520';
                } else {
                  fillColor = dimmedStationColor;
                  strokeCol = dimmedStationColor;
                  opacity = 0.2;
                }
              } else if (mapFilter) {
                if (isFilterMatch) {
                  fillColor = theme.accent;
                } else {
                  fillColor = dimmedStationColor;
                  strokeCol = dimmedStationColor;
                  opacity = 0.3;
                }
              }

              return (
                <React.Fragment key={s.id}>
                  {isActive && <Circle cx={cx} cy={cy} r={ACTIVE_GLOW_R} color={theme.accent} opacity={0.2} />}
                  <Circle cx={cx} cy={cy} r={r} color={fillColor} opacity={opacity} />
                  <Circle cx={cx} cy={cy} r={r} color={strokeCol} style="stroke" strokeWidth={STATION_STROKE} opacity={opacity} />
                </React.Fragment>
              );
            })}

            {/* БЕЙДЖИКИ "Э" */}
            {stationEntries.map((s) => {
              if (!s.expressStop) return null;
              if (!placedIds.has(s.id)) return null;
              if (mapFilter && !matchesFilter(s, mapFilter)) return null;
              if (isRouteActive && !routeStationsSet.has(s.id)) return null;

              const off = getOffset(s.id);
              const cx = s.x + off.dx; const cy = s.y + off.dy;
              const isHub = s.lines.length > 1; const r = isHub ? STATION_R_HUB : STATION_R_REG;
              const size = (isHub ? FONT_SIZE_HUB : FONT_SIZE_REG) * fontScale;
              const w = (isHub && labelFontBold ? labelFontBold : labelFont)!.measureText(s.name).width;
              const ori = usedOrientation.get(s.id) ?? (s.orientation ?? 'right');
              const { badgeX, badgeY } = computeLabelLayout(cx, cy, true, size, w, r, ori, fontScale);
              
              return (
                <RoundedRect
                  key={`ex-${s.id}`}
                  x={badgeX} y={badgeY} width={scaledBadgeW} height={scaledBadgeH}
                  r={3 * fontScale} color="#E5231B"
                />
              );
            })}

            {/* ТЕКСТ "Э" */}
            {expressFont && stationEntries.map((s) => {
              if (!s.expressStop) return null;
              if (!placedIds.has(s.id)) return null;
              if (mapFilter && !matchesFilter(s, mapFilter)) return null;
              if (isRouteActive && !routeStationsSet.has(s.id)) return null;

              const off = getOffset(s.id);
              const cx = s.x + off.dx; const cy = s.y + off.dy;
              const isHub = s.lines.length > 1; const r = isHub ? STATION_R_HUB : STATION_R_REG;
              const size = (isHub ? FONT_SIZE_HUB : FONT_SIZE_REG) * fontScale;
              const w = (isHub && labelFontBold ? labelFontBold : labelFont)!.measureText(s.name).width;
              const ori = usedOrientation.get(s.id) ?? (s.orientation ?? 'right');
              const { badgeX, badgeY } = computeLabelLayout(cx, cy, true, size, w, r, ori, fontScale);
              return (
                <SkiaText
                  key={`ext-${s.id}`}
                  x={badgeX + 5 * fontScale} y={badgeY + 10 * fontScale}
                  text="Э" font={expressFont} color="#FFFFFF"
                />
              );
            })}

            {/* ПОДПИСИ СТАНЦИЙ */}
            {labels.map(({ s, tx, ty, font }) => {
              if (mapFilter && !matchesFilter(s, mapFilter)) return null;
              
              if (isRouteActive && !routeStationsSet.has(s.id)) return null;

              return (
                <SkiaText 
                  key={`lbl-${s.id}`} 
                  x={tx} y={ty} 
                  text={s.name} 
                  font={font} 
                  color={isRouteActive ? '#FFD700' : theme.text} 
                />
              );
            })}
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