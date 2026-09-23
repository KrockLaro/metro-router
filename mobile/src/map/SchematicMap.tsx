import React, { useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import {
  Canvas, Group, Path, Circle, RoundedRect,
  Text as SkiaText, Skia, type SkFont,
} from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  useSharedValue, useDerivedValue,
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
    if (s.x < minX) minX = s.x;
    if (s.x > maxX) maxX = s.x;
    if (s.y < minY) minY = s.y;
    if (s.y > maxY) maxY = s.y;
  }
  const PAD = 200;
  return {
    x: minX - PAD,
    y: minY - PAD,
    w: (maxX - minX) + PAD * 2,
    h: (maxY - minY) + PAD * 2,
  };
})();

const BOUNDS_ASPECT = _bounds.w / _bounds.h;

let initVbW: number;
let initVbH: number;
if (BOUNDS_ASPECT > ASPECT) {
  initVbW = _bounds.w;
  initVbH = _bounds.w / ASPECT;
} else {
  initVbH = _bounds.h;
  initVbW = _bounds.h * ASPECT;
}
const initVbX = _bounds.x + _bounds.w / 2 - initVbW / 2;
const initVbY = _bounds.y + _bounds.h / 2 - initVbH / 2;

const TAP_RADIUS = 35;

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

const estimateWidth = (text: string, size: number) => text.length * size * 0.55;

// ------------------------------------------------------------
// Размещение подписи и значка экспресса
// ------------------------------------------------------------
interface LabelLayout {
  tx: number;
  ty: number;
  badgeX: number;
  badgeY: number;
}

function computeLabelLayout(s: SchemaStation, size: number, textW: number): LabelLayout {
  const badgeW = 20;
  const badgeH = 16;
  const gap = 8;
  const off = 16;

  // Явная ориентация приоритетна
  switch (s.orientation) {
    case 'left':
      return {
        tx: s.x - off - badgeW - gap - textW,
        ty: s.y + size / 3,
        badgeX: s.x - off - badgeW,
        badgeY: s.y - badgeH / 2,
      };
    case 'top':
      return {
        tx: s.x - textW / 2,
        ty: s.y - off - badgeH - gap,
        badgeX: s.x - badgeW / 2,
        badgeY: s.y - off - badgeH,
      };
    case 'bottom':
      return {
        tx: s.x - textW / 2,
        ty: s.y + off + size,
        badgeX: s.x - badgeW / 2,
        badgeY: s.y + off,
      };
    case 'right':
    default:
      return {
        tx: s.x + off + badgeW + gap,
        ty: s.y + size / 3,
        badgeX: s.x + off,
        badgeY: s.y - badgeH / 2,
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

  const transform = useDerivedValue(() => {
    const scale = SCREEN_W / vbW.value;
    return [
      { translateX: -vbX.value * scale },
      { translateY: -vbY.value * scale },
      { scale },
    ];
  });

  const labelFont = useMemo<SkFont | null>(() => {
    try {
      const tf = Skia.FontMgr.System().matchFamilyStyle('sans-serif', { weight: 400, width: 5, slant: 0 });
      return tf ? Skia.Font(tf, 15) : null;
    } catch { return null; }
  }, []);

  const labelFontBold = useMemo<SkFont | null>(() => {
    try {
      const tf = Skia.FontMgr.System().matchFamilyStyle('sans-serif', { weight: 700, width: 5, slant: 0 });
      return tf ? Skia.Font(tf, 18) : null;
    } catch { return null; }
  }, []);

  const expressFont = useMemo<SkFont | null>(() => {
    try {
      const tf = Skia.FontMgr.System().matchFamilyStyle('sans-serif', { weight: 700, width: 5, slant: 0 });
      return tf ? Skia.Font(tf, 11) : null;
    } catch { return null; }
  }, []);

  const linePaths = useMemo(() => {
    return LINES.map((line) => {
      const p = Skia.Path.Make();
      const stations = line.path.map((id) => STATIONS[id]).filter(Boolean);
      if (stations.length > 0) {
        p.moveTo(stations[0].x, stations[0].y);
        for (let i = 1; i < stations.length; i++) {
          p.lineTo(stations[i].x, stations[i].y);
        }
      }
      return { id: line.id, path: p, color: line.color };
    });
  }, []);

  const focusStation = useCallback(
    (stationId: string, targetScale = 1.4) => {
      const s = STATIONS[stationId];
      if (!s) return;
      const targetW = _bounds.w / targetScale;
      const targetH = _bounds.h / targetScale;
      vbW.value = withTiming(targetW, { duration: 400 });
      vbH.value = withTiming(targetH, { duration: 400 });
      vbX.value = withTiming(s.x - targetW / 2, { duration: 400 });
      vbY.value = withTiming(s.y - targetH / 2, { duration: 400 });
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

  const pan = Gesture.Pan()
    .averageTouches(true)
    .minDistance(4)
    .onStart(() => {
      savedVbX.value = vbX.value;
      savedVbY.value = vbY.value;
      savedVbW.value = vbW.value;
      savedVbH.value = vbH.value;
    })
    .onUpdate((e) => {
      const dx = (e.translationX / SCREEN_W) * savedVbW.value;
      const dy = (e.translationY / SCREEN_H) * savedVbH.value;
      vbX.value = savedVbX.value - dx;
      vbY.value = savedVbY.value - dy;
    })
    .onEnd((e) => {
      const vx = (e.velocityX / SCREEN_W) * savedVbW.value;
      const vy = (e.velocityY / SCREEN_H) * savedVbH.value;
      vbX.value = withDecay({ velocity: -vx, deceleration: 0.997 });
      vbY.value = withDecay({ velocity: -vy, deceleration: 0.997 });
    });

  const pinch = Gesture.Pinch()
    .onStart(() => {
      savedVbW.value = vbW.value;
      savedVbH.value = vbH.value;
      savedVbX.value = vbX.value;
      savedVbY.value = vbY.value;
    })
    .onUpdate((e) => {
      const factor = Math.max(0.3, Math.min(5, e.scale));
      const newW = savedVbW.value / factor;
      const newH = savedVbH.value / factor;
      const focalX = savedVbX.value + (e.focalX / SCREEN_W) * savedVbW.value;
      const focalY = savedVbY.value + (e.focalY / SCREEN_H) * savedVbH.value;
      vbW.value = newW;
      vbH.value = newH;
      vbX.value = focalX - (e.focalX / SCREEN_W) * newW;
      vbY.value = focalY - (e.focalY / SCREEN_H) * newH;
    })
    .onEnd(() => {
      const currentW = vbW.value;
      if (currentW > _bounds.w * 1.5) {
        vbW.value = withTiming(_bounds.w * 1.5, { duration: 250 });
        vbH.value = withTiming(_bounds.h * 1.5, { duration: 250 });
      } else if (currentW < _bounds.w / 5) {
        const f = _bounds.w / 5 / currentW;
        vbW.value = withTiming(_bounds.w / 5, { duration: 250 });
        vbH.value = withTiming(vbH.value / f, { duration: 250 });
      }
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(300)
    .onEnd((e, success) => {
      if (!success) return;
      const isZoomedIn = vbW.value < _bounds.w * 0.5;
      const factor = isZoomedIn ? 0.5 : 1.8;
      const newW = isZoomedIn ? _bounds.w : _bounds.w / factor;
      const newH = isZoomedIn ? _bounds.h : _bounds.h / factor;
      const tapX = vbX.value + (e.x / SCREEN_W) * vbW.value;
      const tapY = vbY.value + (e.y / SCREEN_H) * vbH.value;
      vbW.value = withTiming(newW, { duration: 280 });
      vbH.value = withTiming(newH, { duration: 280 });
      vbX.value = withTiming(tapX - newW / 2, { duration: 280 });
      vbY.value = withTiming(tapY - newH / 2, { duration: 280 });
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
        const dx = s.x - canvasX;
        const dy = s.y - canvasY;
        const d = dx * dx + dy * dy;
        if (d < minDist) { minDist = d; closest = s; }
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

  return (
    <View style={[styles.container, { backgroundColor: theme.mapBg }]}>
      <GestureDetector gesture={gesture}>
        <Canvas style={StyleSheet.absoluteFill}>
          <Group transform={transform}>
            {/* Линии */}
            {linePaths.map((item) => (
              <Path
                key={item.id}
                path={item.path}
                color={item.color}
                style="stroke"
                strokeWidth={8}
                strokeCap="round"
                strokeJoin="round"
              />
            ))}

            {/* Станции */}
            {Object.values(STATIONS).map((s) => {
              const isHub = s.lines.length > 1;
              const isHighlighted = highlightSet.has(s.id);
              const isActive = s.id === activeStationId;
              const r = isHub ? 18 : 11;

              return (
                <React.Fragment key={s.id}>
                  {isActive && (
                    <Circle cx={s.x} cy={s.y} r={30} color={theme.accent} opacity={0.2} />
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
                    strokeWidth={3}
                  />
                </React.Fragment>
              );
            })}

            {/* Значки доступности */}
            {Object.values(STATIONS).map((s) => {
              if (s.facilities.wheelchair !== 'full') return null;
              return (
                <React.Fragment key={`acc-${s.id}`}>
                  <Circle cx={s.x + 16} cy={s.y - 16} r={9} color="#0A84FF" />
                  <Circle cx={s.x + 16} cy={s.y - 16} r={3} color="#FFFFFF" />
                </React.Fragment>
              );
            })}

            {/* Значки экспресса */}
            {Object.values(STATIONS).map((s) => {
              if (!s.expressStop) return null;
              const size = s.lines.length > 1 ? 18 : 15;
              const w = estimateWidth(s.name, size);
              const { badgeX, badgeY } = computeLabelLayout(s, size, w);
              return (
                <RoundedRect
                  key={`ex-${s.id}`}
                  x={badgeX}
                  y={badgeY}
                  width={20}
                  height={16}
                  r={4}
                  color="#E5231B"
                />
              );
            })}

            {/* Буквы Э */}
            {expressFont &&
              Object.values(STATIONS).map((s) => {
                if (!s.expressStop) return null;
                const size = s.lines.length > 1 ? 18 : 15;
                const w = estimateWidth(s.name, size);
                const { badgeX, badgeY } = computeLabelLayout(s, size, w);
                return (
                  <SkiaText
                    key={`ext-${s.id}`}
                    x={badgeX + 6}
                    y={badgeY + 12}
                    text="Э"
                    font={expressFont}
                    color="#FFFFFF"
                  />
                );
              })}

            {/* Подписи станций */}
            {labelFont &&
              Object.values(STATIONS).map((s) => {
                const isHub = s.lines.length > 1;
                const font = isHub && labelFontBold ? labelFontBold : labelFont;
                if (!font) return null;
                const size = isHub ? 18 : 15;
                const w = estimateWidth(s.name, size);
                const { tx, ty } = computeLabelLayout(s, size, w);

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