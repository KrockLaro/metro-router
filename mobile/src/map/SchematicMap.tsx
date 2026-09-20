import React, { useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg, { Path, Circle, G, Text as SvgText, Rect } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { STATIONS, SchemaStation } from './schemaStations';
import { LINES } from './schemaLines';
import { useTheme } from '../theme/ThemeProvider';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const CANVAS = { w: 2200, h: 1700 };

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

const SchematicMap: React.FC<Props> = ({
  onStationPress,
  onMapReady,
  highlightedStationIds,
  activeStationId,
}) => {
  const { theme } = useTheme();

  // Стартовые трансформации
  const scale = useSharedValue(0.35);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(0.35);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // ------------------------------------------------------------------
  // API для родителя
  // ------------------------------------------------------------------
  const focusStation = useCallback((stationId: string, targetScale = 1.2) => {
  const s = STATIONS[stationId];
  if (!s) return;

  // Учитываем смещение canvas (left/top в styles.canvas).
  // Итоговый translate = позиция центра холста - позиция станции * масштаб.
  const targetX = CANVAS.w / 2 - s.x * targetScale;
  const targetY = CANVAS.h / 2 - s.y * targetScale;

  scale.value = withTiming(targetScale, { duration: 450 });
  translateX.value = withTiming(targetX, { duration: 450 });
  translateY.value = withTiming(targetY, { duration: 450 });
}, []);

  const resetView = useCallback(() => {
    scale.value = withTiming(0.35, { duration: 400 });
    translateX.value = withTiming(0, { duration: 400 });
    translateY.value = withTiming(0, { duration: 400 });
  }, []);

  useEffect(() => {
    if (onMapReady) {
      onMapReady({ focusStation, resetView });
    }
  }, [onMapReady, focusStation, resetView]);

  // ------------------------------------------------------------------
  // Жесты
  // ------------------------------------------------------------------
  const pan = Gesture.Pan()
    .averageTouches(true)
    .onStart(() => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = savedX.value + e.translationX;
      translateY.value = savedY.value + e.translationY;
    });

  const pinch = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      scale.value = Math.max(0.15, Math.min(4, savedScale.value * e.scale));
    })
    .onEnd(() => {
      if (scale.value < 0.2) scale.value = withSpring(0.2);
      if (scale.value > 3) scale.value = withSpring(3);
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((e, success) => {
      if (!success) return;
      const next = scale.value > 0.8 ? 0.35 : 1.2;
      const cx = e.x - SCREEN_W / 2;
      const cy = e.y - SCREEN_H / 2;
      translateX.value = withSpring(translateX.value - cx * (next / scale.value - 1));
      translateY.value = withSpring(translateY.value - cy * (next / scale.value - 1));
      scale.value = withSpring(next);
    });

  const gesture = Gesture.Simultaneous(pan, pinch, doubleTap);

  // ------------------------------------------------------------------
  // Линии
  // ------------------------------------------------------------------
  const renderedLines = useMemo(
    () =>
      LINES.map((line) => {
        const points = line.path
          .map((id) => STATIONS[id])
          .filter(Boolean)
          .map((s) => `${s.x},${s.y}`)
          .join(' L ');
        return (
          <Path
            key={line.id}
            d={`M ${points}`}
            stroke={line.color}
            strokeWidth={8}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      }),
    [],
  );

  // ------------------------------------------------------------------
  // Подпись станции (с учётом ориентации и значка Э)
  // ------------------------------------------------------------------
  const renderStationLabel = (s: SchemaStation) => {
    const isHub = s.lines.length > 1;
    const fontSize = isHub ? 18 : 15;
    const fontWeight = isHub ? '700' : '500';

    const baseOffset = 20;
    const badgeW = 22;
    const badgeGap = 6;
    const extraOffset = s.expressStop ? badgeW + badgeGap : 0;
    const offset = baseOffset + extraOffset;

    let x = s.x + offset;
    let y = s.y + 5;
    let textAnchor: 'start' | 'middle' | 'end' = 'start';

    switch (s.orientation) {
      case 'left':
        x = s.x - offset;
        textAnchor = 'end';
        break;
      case 'top':
        x = s.x;
        y = s.y - offset;
        textAnchor = 'middle';
        break;
      case 'bottom':
        x = s.x;
        y = s.y + offset + 4;
        textAnchor = 'middle';
        break;
      case 'right':
      default:
        break;
    }

    return (
      <SvgText
        key={`label-${s.id}`}
        x={x}
        y={y}
        fontSize={fontSize}
        fontWeight={fontWeight}
        fill={theme.text}
        textAnchor={textAnchor}
      >
        {s.name}
      </SvgText>
    );
  };

  // ------------------------------------------------------------------
  // Значок экспресса
  // ------------------------------------------------------------------
  const renderExpressBadge = (s: SchemaStation) => {
    if (!s.expressStop) return null;

    const badgeW = 22;
    const badgeH = 16;
    const baseOffset = 20;

    let badgeX: number;
    let badgeY: number;

    switch (s.orientation) {
      case 'left':
        badgeX = s.x - baseOffset - badgeW;
        badgeY = s.y - badgeH / 2;
        break;
      case 'top':
        badgeX = s.x - badgeW / 2;
        badgeY = s.y - baseOffset - badgeH;
        break;
      case 'bottom':
        badgeX = s.x - badgeW / 2;
        badgeY = s.y + baseOffset;
        break;
      case 'right':
      default:
        badgeX = s.x + baseOffset;
        badgeY = s.y - badgeH / 2;
        break;
    }

    return (
      <G key={`express-${s.id}`}>
        <Rect
          x={badgeX}
          y={badgeY}
          width={badgeW}
          height={badgeH}
          rx={4}
          fill="#E5231B"
        />
        <SvgText
          x={badgeX + badgeW / 2}
          y={badgeY + badgeH - 5}
          fontSize={11}
          fontWeight="700"
          fill="#FFFFFF"
          textAnchor="middle"
        >
          Э
        </SvgText>
      </G>
    );
  };

  // ------------------------------------------------------------------
  // Станции
  // ------------------------------------------------------------------
  const renderedStations = useMemo(() => {
    const highlightSet = new Set(highlightedStationIds ?? []);
    return Object.values(STATIONS).map((s) => {
      const isHub = s.lines.length > 1;
      const isHighlighted = highlightSet.has(s.id);
      const isActive = s.id === activeStationId;

      return (
        <G key={s.id}>
          {isActive && (
            <Circle cx={s.x} cy={s.y} r={30} fill={theme.accent} opacity={0.2} />
          )}

          <Circle
            cx={s.x}
            cy={s.y}
            r={isHub ? 18 : 11}
            fill={isHighlighted ? theme.accent : theme.stationFill}
            stroke={theme.stationStroke}
            strokeWidth={3}
            onPress={() => onStationPress(s)}
          />

          {s.facilities.wheelchair === 'full' && (
            <G>
              <Circle cx={s.x + 16} cy={s.y - 16} r={9} fill="#0A84FF" />
              <Circle cx={s.x + 16} cy={s.y - 18} r={1.6} fill="#FFF" />
              <Path
                d={`M${s.x + 16} ${s.y - 16} v4 h4`}
                stroke="#FFF"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
              />
            </G>
          )}

          {renderExpressBadge(s)}
          {renderStationLabel(s)}
        </G>
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onStationPress, highlightedStationIds, activeStationId, theme]);

  // ------------------------------------------------------------------
  // Рендер
  // ------------------------------------------------------------------
  return (
    <View style={[styles.container, { backgroundColor: theme.mapBg }]}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.canvas, animatedStyle]}>
          <Svg
            width={CANVAS.w}
            height={CANVAS.h}
            viewBox={`0 0 ${CANVAS.w} ${CANVAS.h}`}
          >
            <Rect width={CANVAS.w} height={CANVAS.h} fill={theme.mapBg} />
            {renderedLines}
            {renderedStations}
          </Svg>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default SchematicMap;

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  canvas: {
    width: CANVAS.w,
    height: CANVAS.h,
    position: 'absolute',
    left: -CANVAS.w / 2 + SCREEN_W / 2,
    top: -CANVAS.h / 2 + SCREEN_H / 2,
  },
});