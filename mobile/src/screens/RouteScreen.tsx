import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Share,
} from 'react-native';
import { useTheme, Theme } from '../theme/ThemeProvider';
import {
  BackIcon, ChevronLeftIcon, ChevronRightIcon,
  ChevronDownIcon, ShareIcon,
} from '../icons';
import { RouteResult, RouteSegment } from '../api/client';
import {
  calculateFare, getIntermediateStations,
  getDirectionInfo, Fare,
} from '../map/tariffs';

// ------------------------------------------------------------
// Вспомогательные функции
// ------------------------------------------------------------

function addMinutes(base: Date, min: number): Date {
  return new Date(base.getTime() + min * 60000);
}
function fmtTime(d: Date): string {
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}
function estimateKm(minutes: number): number {
  return Math.round(minutes * 0.7 * 10) / 10;
}
function plural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}

interface RouteColors {
  bg: string;
  text: string;
  textMuted: string;
  border: string;
  cardBg: string;
  icon: string;
  iconMuted: string;
  accent: string;
}

function getRouteColors(theme: Theme): RouteColors {
  const isDark = theme.name === 'dark';
  return {
    bg: theme.bg,
    text: theme.text,
    textMuted: theme.textMuted,
    border: theme.border,
    cardBg: isDark ? '#1C1C1E' : '#F2F2F7',
    icon: theme.icon,
    iconMuted: theme.iconMuted,
    accent: theme.accent,
  };
}

// ------------------------------------------------------------
// Склейка сегментов
// ------------------------------------------------------------

interface MergedLeg {
  kind: 'ride' | 'transfer';
  line: string | null;
  line_color: string | null;
  from: { id: string; name: string };
  to: { id: string; name: string };
  minutes: number;
  isExpress: boolean;
}

function mergeLegs(segments: RouteSegment[]): MergedLeg[] {
  const result: MergedLeg[] = [];
  for (const seg of segments) {
    if (seg.kind === 'transfer') {
      result.push({
        kind: 'transfer', line: null, line_color: null,
        from: seg.from, to: seg.to, minutes: seg.minutes, isExpress: false,
      });
      continue;
    }
    const last = result[result.length - 1];
    if (last && last.kind === 'ride' && last.line === seg.line && last.to.id === seg.from.id) {
      last.to = seg.to;
      last.minutes += seg.minutes;
      last.isExpress = last.isExpress || seg.kind === 'express';
    } else {
      result.push({
        kind: 'ride', line: seg.line, line_color: seg.line_color,
        from: seg.from, to: seg.to, minutes: seg.minutes,
        isExpress: seg.kind === 'express',
      });
    }
  }
  return result;
}

// ------------------------------------------------------------
// Компонент
// ------------------------------------------------------------

interface Props {
  route: RouteResult;
  fromName: string;
  toName: string;
  departure: Date;
  onBack: () => void;
}

export default function RouteScreen({ route, fromName, toName, departure, onBack }: Props) {
  const { theme } = useTheme();
  const c = useMemo(() => getRouteColors(theme), [theme]);
  const styles = useMemo(() => makeStyles(c), [c]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const arrival = addMinutes(departure, route.total_minutes);
  const legs = useMemo(() => mergeLegs(route.segments), [route.segments]);

  const items = useMemo(() => {
    let cursor = 0;
    return legs.map((leg, i) => {
      const startMin = cursor;
      const endMin = cursor + leg.minutes;
      cursor = endMin;
      const prevLeg = i > 0 ? legs[i - 1] : null;
      const nextLeg = i < legs.length - 1 ? legs[i + 1] : null;
      return {
        leg,
        startTime: addMinutes(departure, startMin),
        endTime: addMinutes(departure, endMin),
        hideFromName: prevLeg !== null && prevLeg.kind === 'ride' && prevLeg.to.id === leg.from.id,
        isFirst: i === 0,
        isLast: i === legs.length - 1,
        nextIsTransfer: nextLeg ? nextLeg.kind === 'transfer' : false,
      };
    });
  }, [legs, departure]);

  const totalKm = useMemo(() => estimateKm(route.total_minutes), [route.total_minutes]);

  const fare: Fare | null = useMemo(() => {
    const rides = legs.filter((l) => l.kind === 'ride');
    if (rides.length === 0) return null;
    const first = rides[0];
    const last = rides[rides.length - 1];
    const isExpress = rides.some((l) => l.isExpress);
    return calculateFare(first.from.id, last.to.id, isExpress);
  }, [legs]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Маршрут: ${fromName} → ${toName}, ${Math.round(route.total_minutes)} мин`,
      });
    } catch {}
  };

  const toggleExpand = (i: number) => {
    setExpandedIndex((prev) => (prev === i ? null : i));
  };

  return (
    <View style={styles.container}>
      {/* Шапка */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerBtn}>
          <BackIcon size={24} color={c.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <ChevronLeftIcon size={20} color={c.iconMuted} />
          <Text style={styles.headerTitle}>Маршрут 1/1</Text>
          <ChevronRightIcon size={20} color={c.iconMuted} />
        </View>
        <TouchableOpacity onPress={handleShare} style={styles.headerBtn}>
          <ShareIcon size={22} color={c.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Большое время */}
        <View style={styles.timeRow}>
          <Text style={styles.bigTime}>{fmtTime(departure)} → {fmtTime(arrival)}</Text>
          <Text style={styles.bigDuration}>{Math.round(route.total_minutes)} мин</Text>
        </View>
        <Text style={styles.subtitle}>
          Сегодня · Отправление {fmtTime(departure)} · Электричка
        </Text>

        {/* Сводка: цена / пересадки / км */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryItem}>{fare ? `${fare.rubles} ₽` : '— ₽'}</Text>
          <Text style={styles.summaryItem}>
            {route.transfers} {plural(route.transfers, ['пересадка', 'пересадки', 'пересадок'])}
          </Text>
          <Text style={styles.summaryItem}>{totalKm} км</Text>
        </View>

        {/* Таймлайн */}
        {items.map((item, i) => {
          const { leg, startTime, endTime, hideFromName, isFirst, isLast, nextIsTransfer } = item;

          if (leg.kind === 'transfer') {
            return (
              <View key={i} style={styles.transferRow}>
                <View style={styles.timeCol} />
                <View style={styles.timelineCol}>
                  <View style={styles.transferDots}>
                    <View style={styles.transferDot} />
                    <View style={styles.transferDot} />
                    <View style={styles.transferDot} />
                  </View>
                </View>
                <View style={styles.contentCol}>
                  <Text style={styles.transferLabel}>Пересадка</Text>
                  <Text style={styles.transferSub}>{Math.round(leg.minutes)} мин</Text>
                </View>
              </View>
            );
          }

          const color = leg.line_color || c.accent;
          const km = estimateKm(leg.minutes);
          const intermediates = getIntermediateStations(leg.from.id, leg.to.id);
          const isExpanded = expandedIndex === i;
          const direction = getDirectionInfo(leg.from.id, leg.to.id);

          return (
            <View key={i} style={styles.rideRow}>
              {/* Время */}
              <View style={styles.timeCol}>
                <Text style={styles.timeText}>{fmtTime(startTime)}</Text>
                <Text style={styles.durationText}>
                  {Math.round(leg.minutes)}{'\n'}мин
                </Text>
                <Text style={styles.timeText}>{fmtTime(endTime)}</Text>
              </View>

              {/* Линия */}
              <View style={styles.timelineCol}>
                {isFirst && <View style={[styles.dot, { backgroundColor: color }]} />}
                <View style={[styles.line, { backgroundColor: color }]} />
                {(isLast || nextIsTransfer) && (
                  <View style={[styles.dot, { backgroundColor: color }]} />
                )}
              </View>

              {/* Станции и карточка */}
              <View style={styles.contentCol}>
                {hideFromName ? (
                  <View style={styles.stationSpacer} />
                ) : (
                  <Text style={styles.stationName}>{leg.from.name}</Text>
                )}

                <View style={styles.lineCard}>
                  <View style={styles.lineHeader}>
                    <Text style={styles.lineName}>{leg.line || 'Маршрут'}</Text>
                    {leg.isExpress && (
                      <View style={styles.expressBadge}>
                        <Text style={styles.expressBadgeText}>Э</Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.lineRow}
                    onPress={() => toggleExpand(i)}
                    activeOpacity={intermediates.length > 0 ? 0.7 : 1}
                    disabled={intermediates.length === 0}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.directionLabel}>
                        {direction ? direction.label : `В сторону: ${leg.to.name}`}
                      </Text>
                      <Text style={styles.lineMeta}>
                        {Math.round(leg.minutes)} мин
                        {intermediates.length > 0
                          ? ` · ${intermediates.length} ${plural(intermediates.length, ['ост.', 'ост.', 'ост.'])}`
                          : ' · без остановок'}
                        {' · '}{km} км
                      </Text>
                    </View>
                    {intermediates.length > 0 && (
                      <View style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}>
                        <ChevronDownIcon size={20} color={c.iconMuted} />
                      </View>
                    )}
                  </TouchableOpacity>

                  {isExpanded && intermediates.length > 0 && (
                    <View style={styles.intermediateList}>
                      <View style={[styles.intermediateDivider, { backgroundColor: c.border }]} />
                      {intermediates.map((st) => (
                        <View key={st.id} style={styles.intermediateRow}>
                          <View style={[styles.intermediateDot, { borderColor: color }]} />
                          <Text style={styles.intermediateName}>{st.name}</Text>
                          {st.expressStop && (
                            <View style={styles.expressMini}>
                              <Text style={styles.expressMiniText}>Э</Text>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                <Text style={styles.stationName}>{leg.to.name}</Text>
              </View>
            </View>
          );
        })}

        <Text style={styles.footer}>Время может отличаться от фактического</Text>
      </ScrollView>
    </View>
  );
}

// ------------------------------------------------------------
// Стили
// ------------------------------------------------------------

const makeStyles = (c: RouteColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 12, paddingTop: 48, paddingBottom: 12,
      borderBottomWidth: 1, borderBottomColor: c.border,
    },
    headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    headerTitle: { fontSize: 17, fontWeight: '600', color: c.text },
    scroll: { padding: 16, paddingBottom: 40 },
    timeRow: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'baseline', marginBottom: 4,
    },
    bigTime: { fontSize: 32, fontWeight: '700', letterSpacing: -0.5, color: c.text },
    bigDuration: { fontSize: 20, fontWeight: '600', color: c.text },
    subtitle: { fontSize: 13, marginBottom: 16, color: c.textMuted },
    summaryCard: {
      flexDirection: 'row', justifyContent: 'space-between',
      borderWidth: 1, borderColor: c.border, borderRadius: 12,
      paddingVertical: 14, paddingHorizontal: 20, marginBottom: 20,
    },
    summaryItem: { fontSize: 15, fontWeight: '600', color: c.text },
    rideRow: { flexDirection: 'row', alignItems: 'stretch' },
    transferRow: { flexDirection: 'row', alignItems: 'stretch' },
    timeCol: { width: 56, alignItems: 'flex-start' },
    timeText: { fontSize: 14, fontWeight: '600', color: c.text },
    durationText: {
      fontSize: 11, textAlign: 'center', flex: 1,
      paddingTop: 8, paddingBottom: 8, color: c.textMuted,
    },
    timelineCol: { width: 24, alignItems: 'center' },
    dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 3, borderColor: c.bg },
    line: { width: 5, flex: 1, borderRadius: 2.5 },
    transferDots: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 12 },
    transferDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: c.iconMuted },
    contentCol: { flex: 1, paddingLeft: 12 },
    stationName: { fontSize: 17, fontWeight: '700', marginBottom: 4, color: c.text, minHeight: 24 },
    stationSpacer: { height: 28 },
    lineCard: { borderRadius: 12, padding: 12, marginVertical: 4, backgroundColor: c.cardBg },
    lineHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
    lineName: { fontSize: 15, fontWeight: '600', color: c.text },
    expressBadge: { backgroundColor: '#E5231B', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    expressBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
    directionLabel: { fontSize: 14, fontWeight: '600', color: c.text, marginBottom: 2 },
    lineRow: { flexDirection: 'row', alignItems: 'center' },
    lineMeta: { fontSize: 13, lineHeight: 18, color: c.textMuted },
    intermediateList: { marginTop: 4 },
    intermediateDivider: { height: 1, marginVertical: 8 },
    intermediateRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, gap: 10 },
    intermediateDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, backgroundColor: 'transparent' },
    intermediateName: { flex: 1, fontSize: 13, color: c.textMuted },
    expressMini: { backgroundColor: '#E5231B', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
    expressMiniText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
    transferLabel: { fontSize: 15, fontWeight: '500', color: c.textMuted },
    transferSub: { fontSize: 12, marginTop: 2, color: c.textMuted },
    footer: { textAlign: 'center', fontSize: 12, marginTop: 20, color: c.textMuted },
  });