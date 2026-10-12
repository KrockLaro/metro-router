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

import { STATIONS, SchemaStation } from './schemaStations';
import { LINES } from './schemaLines';
import { useTheme } from '../theme/ThemeProvider';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const ASPECT = SCREEN_W / SCREEN_H;

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

const BOUNDS_ASPECT = BW / BH;

let initVbW: number;
let initVbH: number;
if (BOUNDS_ASPECT > ASPECT) {
  initVbW = BW;
  initVbH = BW / ASPECT;
} else {
  initVbH = BH;
  initVbW = BH * ASPECT;
}
const initVbX = BX + BW / 2 - initVbW / 2;
const initVbY = BY + BH / 2 - initVbH / 2;

const TAP_RADIUS = 30;
const MIN_VB_W = BW / 5;
const MAX_VB_W = BW * 1.5;
const PAN_OVERSCROLL = 0.25;

// ------------------------------------------------------------------
// Размеры элементов схемы (уменьшены — станции больше не сливаются)
// ------------------------------------------------------------------
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

// Пороги LOD относительно initVbW (см. getStationPriority)
const LOD_FAR = 0.7;
const LOD_MID = 0.35;

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

/**
 * Приоритет станции для LOD:
 *   3 — всегда показываем подпись (вокзалы, экспрессы, хабы)
 *   2 — показываем от среднего зума (зона 1)
 *   1 — показываем только при близком зуме
 */
function getStationPriority(s: SchemaStation): 1 | 2 | 3 {
  if (s.id.startsWith('m_')) return 3;
  if (s.expressStop) return 3;
  if (s.lines.length > 1) return 3;
  if ((s.zone ?? 99) <= 1) return 2;
  return 1;
}

const estimateWidth = (text: string, size: number) => text.length * size * 0.55;

interface LabelLayout {
  tx: number;
  ty: number;
  badgeX: number;
  badgeY: number;
}

function computeLabelLayout(
  s: SchemaStation,
  size: number,
  textW: number,
  r: number,
): LabelLayout {
  const hasBadge = !!s.expressStop;
  const gap = hasBadge ? BADGE_GAP : 0;
  const off = r + 4;

  switch (s.orientation) {
    case 'left':
      return {
        tx: s.x - off - (hasBadge ? BADGE_W + gap : 0) - textW,
        ty: s.y + size / 3,
        badgeX: s.x - off - BADGE_W,
        badgeY: s.y - BADGE_H / 2,
      };
    case 'top':
      return {
        tx: s.x - textW / 2,
        ty: s.y - off - (hasBadge ? BADGE_H + gap : 0),
        badgeX: s.x - BADGE_W / 2,
        badgeY: s.y - off - BADGE_H,
      };
    case 'bottom':
      return {
        tx: s.x - textW / 2,
        ty: s.y + off + (hasBadge ? BADGE_H + gap : 0) + size,
        badgeX: s.x - BADGE_W / 2,
        badgeY: s.y + off,
      };
    case 'right':
    default:
      return {
        tx: s.x + off + (hasBadge ? BADGE_W + gap : 0),
        ty: s.y + size / 3,
        badgeX: s.x + off,
        badgeY: s.y - BADGE_H / 2,
      };
  }
}

const SchematicMap: React.FC<Props> = ({
  onStationPress,
  onMapReady,
  highlightedStationIds,
  activeStationId,
}) => {
  const { theme } = useTheme();

  const vbX = useSharedValue(initVbX);
  const vbY = useSharedValue(initVbY);
  const vbW = useSharedValue(initVbW);
  const vbH = useSharedValue(initVbH);

  const savedVbX = useSharedValue(initVbX);
  const savedVbY = useSharedValue(initVbY);
  const savedVbW = useSharedValue(initVbW);
  const savedVbH = useSharedValue(initVbH);

  const pinchAnchorX = useSharedValue(initVbX);
  const pinchAnchorY = useSharedValue(initVbY);

  // LOD-уровень: 0 — далеко, 1 — средне, 2 — близко
  type LodLevel = 0 | 1 | 2;
  const [lodLevel, setLodLevel] = useState<LodLevel>(2);
  const lodShared = useSharedValue<LodLevel>(2);
  const transform = useDerivedValue(() => {
    const scale = SCREEN_W / vbW.value;
    return [
      { translateX: -vbX.value * scale },
      { translateY: -vbY.value * scale },
      { scale },
    ];
  });

  // Отслеживаем зум → меняем LOD только при пересечении порога
  useAnimatedReaction(
    () => vbW.value,
    (w) => {
      let next: 0 | 1 | 2;
      if (w > initVbW * LOD_FAR) next = 0;
      else if (w > initVbW * LOD_MID) next = 1;
      else next = 2;
      if (next !== lodShared.value) {
        lodShared.value = next;
        runOnJS(setLodLevel)(next);
      }
    },
  );

  const labelFont = useMemo<SkFont | null>(() => {
    try {
      const tf = Skia.FontMgr.System().matchFamilyStyle('sans-serif', { weight: 400, width: 5, slant: 0 });
      return tf ? Skia.Font(tf, FONT_SIZE_REG) : null;
    } catch { return null; }
  }, []);

  const labelFontBold = useMemo<SkFont | null>(() => {
    try {
      const tf = Skia.FontMgr.System().matchFamilyStyle('sans-serif', { weight: 700, width: 5, slant: 0 });
      return tf ? Skia.Font(tf, FONT_SIZE_HUB) : null;
    } catch { return null; }
  }, []);

  const expressFont = useMemo<SkFont | null>(() => {
    try {
      const tf = Skia.FontMgr.System().matchFamilyStyle('sans-serif', { weight: 700, width: 5, slant: 0 });
      return tf ? Skia.Font(tf, FONT_SIZE_BADGE) : null;
    } catch { return null; }
  }, []);

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

      return {
        id: line.id,
        path,
        color: line.color,
        strokeWidth: line.kind === 'mcd' ? 3 : 6,
      };
    });
  }, []);

  // -----------------------------------------------------------------
  // Программное управление камерой
  // -----------------------------------------------------------------

  const focusStation = useCallback(
    (stationId: string, targetScale = 1.4) => {
      const s = STATIONS[stationId];
      if (!s) return;

      const targetW = initVbW / targetScale;
      const targetH = initVbH / targetScale;
      const cx = s.x;
      const cy = s.y;

      const padX = targetW * 0.5;
      const padY = targetH * 0.5;
      const minX = BX - padX;
      const maxX = BX + BW - targetW + padX;
      const minY = BY - padY;
      const maxY = BY + BH - targetH + padY;

      const nx = cx - targetW / 2;
      const ny = cy - targetH / 2;
      const clampedX = Math.max(minX, Math.min(maxX, nx));
      const clampedY = Math.max(minY, Math.min(maxY, ny));

      vbW.value = withTiming(targetW, { duration: 400 });
      vbH.value = withTiming(targetH, { duration: 400 });
      vbX.value = withTiming(clampedX, { duration: 400 });
      vbY.value = withTiming(clampedY, { duration: 400 });
    },
    [vbX, vbY, vbW, vbH],
  );

  const resetView = useCallback(() => {
    vbX.value = withTiming(initVbX, { duration: 350 });
    vbY.value = withTiming(initVbY, { duration: 350 });
    vbW.value = withTiming(initVbW, { duration: 350 });
    vbH.value = withTiming(initVbH, { duration: 350 });
  }, [vbX, vbY, vbW, vbH]);

  useEffect(() => {
    if (onMapReady) onMapReady({ focusStation, resetView });
  }, [onMapReady, focusStation, resetView]);

  // -----------------------------------------------------------------
  // Жесты
  // -----------------------------------------------------------------

  const pan = Gesture.Pan()
    .maxPointers(1)
    .averageTouches(true)
    .minDistance(4)
    .onStart(() => {
      savedVbX.value = vbX.value;
      savedVbY.value = vbY.value;
      savedVbW.value = vbW.value;
      savedVbH.value = vbH.value;
    })
    .onUpdate((e) => {
      const w = savedVbW.value;
      const h = savedVbH.value;
      const dx = (e.translationX / SCREEN_W) * w;
      const dy = (e.translationY / SCREEN_H) * h;

      const padX = w * PAN_OVERSCROLL;
      const padY = h * PAN_OVERSCROLL;
      const minX = BX - padX;
      const maxX = BX + BW - w + padX;
      const minY = BY - padY;
      const maxY = BY + BH - h + padY;

      const nx = savedVbX.value - dx;
      const ny = savedVbY.value - dy;

      vbX.value = Math.max(minX, Math.min(maxX, nx));
      vbY.value = Math.max(minY, Math.min(maxY, ny));
    })
    .onEnd((e) => {
      const w = savedVbW.value;
      const h = savedVbH.value;
      const vx = (e.velocityX / SCREEN_W) * w;
      const vy = (e.velocityY / SCREEN_H) * h;

      const padX = w * PAN_OVERSCROLL;
      const padY = h * PAN_OVERSCROLL;
      const minX = BX - padX;
      const maxX = BX + BW - w + padX;
      const minY = BY - padY;
      const maxY = BY + BH - h + padY;

      vbX.value = withDecay({
        velocity: -vx,
        deceleration: 0.997,
        clamp: [minX, maxX],
      });
      vbY.value = withDecay({
        velocity: -vy,
        deceleration: 0.997,
        clamp: [minY, maxY],
      });
    });

  const pinch = Gesture.Pinch()
    .onStart((e) => {
      savedVbW.value = vbW.value;
      savedVbH.value = vbH.value;
      savedVbX.value = vbX.value;
      savedVbY.value = vbY.value;
      pinchAnchorX.value = vbX.value + (e.focalX / SCREEN_W) * vbW.value;
      pinchAnchorY.value = vbY.value + (e.focalY / SCREEN_H) * vbH.value;
    })
    .onUpdate((e) => {
      const factor = Math.max(0.3, Math.min(5, e.scale));
      const newW = savedVbW.value / factor;
      const newH = savedVbH.value / factor;

      const padX = newW * PAN_OVERSCROLL;
      const padY = newH * PAN_OVERSCROLL;
      const minX = BX - padX;
      const maxX = BX + BW - newW + padX;
      const minY = BY - padY;
      const maxY = BY + BH - newH + padY;

      const nx = pinchAnchorX.value - (e.focalX / SCREEN_W) * newW;
      const ny = pinchAnchorY.value - (e.focalY / SCREEN_H) * newH;

      vbW.value = newW;
      vbH.value = newH;
      vbX.value = Math.max(minX, Math.min(maxX, nx));
      vbY.value = Math.max(minY, Math.min(maxY, ny));
    })
    .onEnd(() => {
      const currentW = vbW.value;
      const currentH = vbH.value;

      let targetW = currentW;
      let targetH = currentH;

      if (currentW > MAX_VB_W) {
        const f = MAX_VB_W / currentW;
        targetW = MAX_VB_W;
        targetH = currentH * f;
      } else if (currentW < MIN_VB_W) {
        const f = MIN_VB_W / currentW;
        targetW = MIN_VB_W;
        targetH = currentH * f;
      }

      if (targetW === currentW && targetH === currentH) return;

      const cx = vbX.value + currentW / 2;
      const cy = vbY.value + currentH / 2;

      const padX = targetW * PAN_OVERSCROLL;
      const padY = targetH * PAN_OVERSCROLL;
      const minX = BX - padX;
      const maxX = BX + BW - targetW + padX;
      const minY = BY - padY;
      const maxY = BY + BH - targetH + padY;

      const nx = cx - targetW / 2;
      const ny = cy - targetH / 2;
      const clampedX = Math.max(minX, Math.min(maxX, nx));
      const clampedY = Math.max(minY, Math.min(maxY, ny));

      vbW.value = withTiming(targetW, { duration: 250 });
      vbH.value = withTiming(targetH, { duration: 250 });
      vbX.value = withTiming(clampedX, { duration: 250 });
      vbY.value = withTiming(clampedY, { duration: 250 });
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(300)
    .onEnd((e, success) => {
      if (!success) return;

      const isZoomedIn = vbW.value < initVbW * 0.6;
      const factor = isZoomedIn ? 1.0 : 1.8;
      const targetW = isZoomedIn ? initVbW : initVbW / factor;
      const targetH = isZoomedIn ? initVbH : initVbH / factor;

      const tapX = vbX.value + (e.x / SCREEN_W) * vbW.value;
      const tapY = vbY.value + (e.y / SCREEN_H) * vbH.value;

      const padX = targetW * PAN_OVERSCROLL;
      const padY = targetH * PAN_OVERSCROLL;
      const minX = BX - padX;
      const maxX = BX + BW - targetW + padX;
      const minY = BY - padY;
      const maxY = BY + BH - targetH + padY;

      const nx = tapX - targetW / 2;
      const ny = tapY - targetH / 2;
      const clampedX = Math.max(minX, Math.min(maxX, nx));
      const clampedY = Math.max(minY, Math.min(maxY, ny));

      vbW.value = withTiming(targetW, { duration: 280 });
      vbH.value = withTiming(targetH, { duration: 280 });
      vbX.value = withTiming(clampedX, { duration: 280 });
      vbY.value = withTiming(clampedY, { duration: 280 });
    });

  const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .maxDelay(300)
    .onEnd((e, success) => {
      if (!success) return;
      const canvasX = vbX.value + (e.x / SCREEN_W) * vbW.value;
      const canvasY = vbY.value + (e.y / SCREEN_H) * vbH.value;
      let closest: SchemaStation | null = null;
      let minDist = Infinity;
      for (const s of Object.values(STATIONS)) {
        if (s.isJunction) continue;
        const dx = s.x - canvasX;
        const dy = s.y - canvasY;
        const d = dx * dx + dy * dy;
        const bonus = s.lines.length > 1 ? 0.6 : 1;
        const weighted = d * bonus;
        if (weighted < minDist) { minDist = weighted; closest = s; }
      }
      if (closest && Math.sqrt(minDist) < TAP_RADIUS) {
        runOnJS(onStationPress)(closest);
      }
    });

  const taps = Gesture.Exclusive(doubleTap, singleTap);
  const gesture = Gesture.Simultaneous(pan, pinch, taps);

  const highlightSet = useMemo(
    () => new Set(highlightedStationIds ?? []),
    [highlightedStationIds],
  );

  // -----------------------------------------------------------------
  // Разбиваем станции по уровню один раз при монтировании
  // -----------------------------------------------------------------
  const stationEntries = useMemo(
    () => Object.values(STATIONS).filter((s) => !s.isJunction),
    [],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.mapBg }]}>
      <GestureDetector gesture={gesture}>
        <Canvas style={StyleSheet.absoluteFill}>
          <Group transform={transform}>
            {/* Линии */}
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

            {/* Станции — кружки. Всегда видны, независимо от LOD. */}
            {stationEntries.map((s) => {
              const isHub = s.lines.length > 1;
              const isHighlighted = highlightSet.has(s.id);
              const isActive = s.id === activeStationId;
              const r = isHub ? STATION_R_HUB : STATION_R_REG;

              return (
                <React.Fragment key={s.id}>
                  {isActive && (
                    <Circle cx={s.x} cy={s.y} r={ACTIVE_GLOW_R} color={theme.accent} opacity={0.2} />
                  )}
                  <Circle
                    cx={s.x}
                    cy={s.y}
                    r={r}
                    color={isHighlighted ? theme.accent : theme.stationFill}
                  />
                  <Circle
                    cx={s.x}
                    cy={s.y}
                    r={r}
                    color={theme.stationStroke}
                    style="stroke"
                    strokeWidth={STATION_STROKE}
                  />
                </React.Fragment>
              );
            })}

            {/* Значки доступности — только для priority 3 (хабы, экспрессы, вокзалы) */}
            {stationEntries.map((s) => {
              if (s.facilities.wheelchair !== 'full') return null;
              const priority = getStationPriority(s);
              if (lodLevel < 2 && priority < 3) return null;
              return (
                <React.Fragment key={`acc-${s.id}`}>
                  <Circle cx={s.x + 10} cy={s.y - 10} r={6} color="#0A84FF" />
                  <Circle cx={s.x + 10} cy={s.y - 10} r={2} color="#FFFFFF" />
                </React.Fragment>
              );
            })}

            {/* Значки экспресса — тоже под LOD */}
            {stationEntries.map((s) => {
              if (!s.expressStop) return null;
              const priority = getStationPriority(s);
              if (lodLevel === 0 && priority < 3) return null;
              const isHub = s.lines.length > 1;
              const r = isHub ? STATION_R_HUB : STATION_R_REG;
              const size = isHub ? FONT_SIZE_HUB : FONT_SIZE_REG;
              const w = estimateWidth(s.name, size);
              const { badgeX, badgeY } = computeLabelLayout(s, size, w, r);
              return (
                <RoundedRect
                  key={`ex-${s.id}`}
                  x={badgeX}
                  y={badgeY}
                  width={BADGE_W}
                  height={BADGE_H}
                  r={3}
                  color="#E5231B"
                />
              );
            })}

            {expressFont &&
              stationEntries.map((s) => {
                if (!s.expressStop) return null;
                const priority = getStationPriority(s);
                if (lodLevel === 0 && priority < 3) return null;
                const isHub = s.lines.length > 1;
                const r = isHub ? STATION_R_HUB : STATION_R_REG;
                const size = isHub ? FONT_SIZE_HUB : FONT_SIZE_REG;
                const w = estimateWidth(s.name, size);
                const { badgeX, badgeY } = computeLabelLayout(s, size, w, r);
                return (
                  <SkiaText
                    key={`ext-${s.id}`}
                    x={badgeX + 5}
                    y={badgeY + 10}
                    text="Э"
                    font={expressFont}
                    color="#FFFFFF"
                  />
                );
              })}

            {/* Подписи — зависят от LOD */}
            {labelFont &&
              stationEntries.map((s) => {
                const priority = getStationPriority(s);
                if (lodLevel === 0 && priority < 3) return null;
                if (lodLevel === 1 && priority < 2) return null;

                const isHub = s.lines.length > 1;
                const font = isHub && labelFontBold ? labelFontBold : labelFont;
                if (!font) return null;
                const size = isHub ? FONT_SIZE_HUB : FONT_SIZE_REG;
                const r = isHub ? STATION_R_HUB : STATION_R_REG;
                const w = estimateWidth(s.name, size);
                const { tx, ty } = computeLabelLayout(s, size, w, r);

                return (
                  <SkiaText
                    key={`lbl-${s.id}`}
                    x={tx}
                    y={ty}
                    text={s.name}
                    font={font}
                    color={theme.text}
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