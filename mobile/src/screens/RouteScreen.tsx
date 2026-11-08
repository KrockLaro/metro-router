import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Share, ActivityIndicator, Alert, RefreshControl
} from 'react-native';

import { useTheme, Theme } from '../theme/ThemeProvider';
import {
  BackIcon, ChevronLeftIcon, ChevronRightIcon,
  ChevronDownIcon, ShareIcon,
} from '../icons';
import { RouteResult, RouteSegment, buildRoute } from '../api/client';
import {
  calculateFare, getIntermediateStations,
  getDirectionInfo, Fare,
} from '../map/tariffs';
import { STATIONS } from '../map/schemaStations';
import { METRO_TRANSFERS } from '../map/metroData';

// ------------------------------------------------------------
// Вспомогательные функции
// ------------------------------------------------------------

const MSK_OFFSET_MS = 3 * 60 * 60 * 1000;

function fmtTime(d: Date): string {
  const msk = new Date(d.getTime() + MSK_OFFSET_MS);
  const hh = msk.getUTCHours().toString().padStart(2, '0');
  const mm = msk.getUTCMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

function mskNowHHMM(): string {
  const msk = new Date(Date.now() + MSK_OFFSET_MS);
  const hh = msk.getUTCHours().toString().padStart(2, '0');
  const mm = msk.getUTCMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

function addMinutes(base: Date, min: number): Date {
  return new Date(base.getTime() + min * 60000);
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
// Компонент метки метро (в пересадках)
// ------------------------------------------------------------

function MetroBadge({ stationIds, theme, isDark }: { stationIds: (string | undefined)[]; theme: any; isDark: boolean }) {
  const metroLinesMap = new Map();
  for (const id of stationIds) {
    if (!id) continue;
    const lines = METRO_TRANSFERS[id];
    if (lines) {
      for (const l of lines) {
        metroLinesMap.set(l.id, l);
      }
    }
  }
  
  const lines = Array.from(metroLinesMap.values()).sort((a, b) => a.id - b.id);
  if (lines.length === 0) return null;

  return (
    <View style={[
      stylesMetro.container,
      { backgroundColor: isDark ? 'rgba(0, 85, 164, 0.18)' : 'rgba(0, 85, 164, 0.08)' }
    ]}>
      <View style={stylesMetro.header}>
        <View style={stylesMetro.icon}>
          <Text style={stylesMetro.iconText}>М</Text>
        </View>
        <Text style={[stylesMetro.title, { color: theme.text }]}>Переход на:</Text>
      </View>
      <View style={stylesMetro.list}>
        {lines.map((line) => (
          <Text key={line.id} style={[stylesMetro.lineText, { color: theme.textMuted }]}>
            {line.id} {line.name}
            {line.shortName ? ` (${line.shortName})` : ''}
          </Text>
        ))}
      </View>
    </View>
  );
}

// ------------------------------------------------------------
// Склейка сегментов
// ------------------------------------------------------------

interface MergedLeg {
  kind: 'ride' | 'transfer';
  line: string | null;
  line_color: string | null;
  line_kind: 'cppk' | 'mcd' | 'mcc' | 'metro' | null;
  from: { id: string; name: string };
  to: { id: string; name: string };
  minutes: number;
  isExpress: boolean;
  departureTime?: string;
  arrivalTime?: string;
  trainNumber?: string;
  waitMinutes?: number;
  scheduleFound?: boolean;
  trainType?: 'local' | 'express' | 'aeroexpress' | 'mcd';
}

function mergeLegs(segments: RouteSegment[]): MergedLeg[] {
  const result: MergedLeg[] = [];
  for (const seg of segments) {
    if (seg.kind === 'transfer') {
      result.push({
        kind: 'transfer', line: null, line_color: null, line_kind: null,
        from: seg.from, to: seg.to, minutes: seg.minutes, isExpress: false,
      });
      continue;
    }
    const last = result[result.length - 1];
    if (
      last &&
      last.kind === 'ride' &&
      last.line === seg.line &&
      last.to.id === seg.from.id
    ) {
      last.to = seg.to;
      last.minutes += seg.minutes;
      last.isExpress = last.isExpress || seg.kind === 'express';
      last.arrivalTime = seg.arrival_time ?? last.arrivalTime;
      last.trainType = seg.train_type ?? last.trainType;
    } else {
      result.push({
        kind: 'ride',
        line: seg.line,
        line_color: seg.line_color,
        line_kind: seg.line_kind,
        from: seg.from,
        to: seg.to,
        minutes: seg.minutes,
        isExpress: seg.kind === 'express',
        departureTime: seg.departure_time,
        arrivalTime: seg.arrival_time,
        trainNumber: seg.train_number,
        waitMinutes: seg.wait_minutes,
        scheduleFound: seg.schedule_found,
        trainType: seg.train_type,
      });
    }
  }
  return result;
}

function extractEndpoints(route: RouteResult | undefined): { fromId?: string; toId?: string } {
  if (!route || route.segments.length === 0) return {};
  const first = route.segments[0];
  const last = route.segments[route.segments.length - 1];
  return { fromId: first.from.id, toId: last.to.id };
}

// ------------------------------------------------------------
// Компонент экрана
// ------------------------------------------------------------

interface Props {
  route?: RouteResult;
  variants?: RouteResult[];
  fromName: string;
  toName: string;
  departure: Date;
  onBack: () => void;
}

export default function RouteScreen({
  route,
  variants,
  fromName,
  toName,
  departure: initialDeparture,
  onBack,
}: Props) {
  const { theme } = useTheme();
  const c = useMemo(() => getRouteColors(theme), [theme]);
  const styles = useMemo(() => makeStyles(c), [c]);
  const isDark = theme.name === 'dark';

  const propVariants = useMemo<RouteResult[]>(() => {
    if (variants && variants.length > 0) return variants;
    if (route) return [route];
    return [];
  }, [variants, route]);

  const [activeVariants, setActiveVariants] = useState<RouteResult[]>(propVariants);
  const [currentDeparture, setCurrentDeparture] = useState<Date>(initialDeparture);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setActiveVariants(propVariants);
    setActiveIndex(0);
  }, [propVariants]);

  const safeIndex = Math.min(activeIndex, Math.max(0, activeVariants.length - 1));
  const currentRoute = activeVariants[safeIndex];

  useEffect(() => {
    setExpandedIndex(null);
  }, [safeIndex]);

  const hasPrev = safeIndex > 0;
  const hasNext = safeIndex < activeVariants.length - 1;

  const arrival = useMemo(() => {
    if (!currentRoute) return currentDeparture;
    if (currentRoute.arrival_time) {
      const [hh, mm] = currentRoute.arrival_time.split(':').map(Number);
      const d = new Date(currentDeparture);
      d.setUTCHours(hh - 3, mm, 0, 0);
      return d;
    }
    return addMinutes(currentDeparture, currentRoute.total_minutes);
  }, [currentRoute, currentDeparture]);

  const legs = useMemo(
    () => (currentRoute ? mergeLegs(currentRoute.segments) : []),
    [currentRoute],
  );

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
        startTime: addMinutes(currentDeparture, startMin),
        endTime: addMinutes(currentDeparture, endMin),
        hideFromName:
          prevLeg !== null && prevLeg.kind === 'ride' && prevLeg.to.id === leg.from.id,
        isFirst: i === 0,
        isLast: i === legs.length - 1,
        nextIsTransfer: nextLeg ? nextLeg.kind === 'transfer' : false,
      };
    });
  }, [legs, currentDeparture]);

  const totalKm = useMemo(
    () => (currentRoute ? estimateKm(currentRoute.total_minutes) : 0),
    [currentRoute],
  );

  const fare: Fare | null = useMemo(() => {
    const railLegs = legs.filter((l) => l.kind === 'ride' && l.line_kind !== 'metro' && l.line_kind !== 'mcc');
    if (railLegs.length === 0) return null;
    
    const first = railLegs[0];
    const last = railLegs[railLegs.length - 1];
    const isExpress = railLegs.some((l) => l.isExpress);
    const isAeroexpress = railLegs.some((l) => l.line === 'Аэроэкспресс');
    return calculateFare(first.from.id, last.to.id, isExpress, isAeroexpress);
  }, [legs]);

  // Считаем количество "входов" в метро (непрерывный участок метро = 1 вход)
  const metroCount = useMemo(() => {
    let count = 0;
    let inMetro = false;
    for (const leg of legs) {
      if (leg.kind === 'ride' && (leg.line_kind === 'metro' || leg.line_kind === 'mcc')) {
        if (!inMetro) {
          count++;
          inMetro = true;
        }
      } else if (leg.kind === 'transfer') {
        continue;
      } else {
        inMetro = false;
      }
    }
    return count;
  }, [legs]);

  const totalRubles = (fare?.rubles || 0) + (metroCount * 73);

  const troikaStatus = useMemo(() => {
    if (!currentRoute) {
      return { ok: false, stationsOut: [] as string[] };
    }
    const seen = new Set<string>();
    const stationsOut: string[] = [];
    for (const seg of currentRoute.segments) {
      for (const side of ['from', 'to'] as const) {
        const st = seg[side];
        if (seen.has(st.id)) continue;
        seen.add(st.id);
        const station = STATIONS[st.id];
        if (!station) continue;
        if (!station.facilities?.troikaPayment) {
          stationsOut.push(station.name);
        }
      }
    }
    return { ok: stationsOut.length === 0, stationsOut };
  }, [currentRoute]);

  const handleRefresh = async () => {
    if (!currentRoute || isRefreshing) return;
    const { fromId, toId } = extractEndpoints(currentRoute);
    if (!fromId || !toId) return;

    setIsRefreshing(true);
    try {
      const res = await buildRoute({
        from_id: fromId,
        to_id: toId,
        depart_at: mskNowHHMM(),
        max_variants: 3,
      });
      if (res.variants.length > 0) {
        setActiveVariants(res.variants);
        setActiveIndex(0);
        setCurrentDeparture(new Date());
        setExpandedIndex(null);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[RouteScreen] refresh failed', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleShare = async () => {
    if (!currentRoute) return;
    try {
      await Share.share({
        message: `Маршрут: ${fromName} → ${toName}, ${Math.round(
          currentRoute.total_minutes,
        )} мин`,
      });
    } catch {}
  };

  const toggleExpand = (i: number) => {
    setExpandedIndex((prev) => (prev === i ? null : i));
  };

  if (!currentRoute) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.headerBtn}>
            <BackIcon size={24} color={c.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Маршрут не найден</Text>
          <View style={styles.headerBtn} />
        </View>
      </View>
    );
  }

  const displayDeparture = currentRoute.departure_time ?? fmtTime(currentDeparture);
  const displayArrival = currentRoute.arrival_time ?? fmtTime(arrival);

  return (
    <View style={styles.container}>
      {/* Шапка со стрелками */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerBtn}>
          <BackIcon size={24} color={c.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <TouchableOpacity
            onPress={() => hasPrev && setActiveIndex(safeIndex - 1)}
            disabled={!hasPrev}
            style={{ padding: 4 }}
          >
            <ChevronLeftIcon size={22} color={hasPrev ? c.text : c.iconMuted} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {currentRoute.label ?? 'Маршрут'} {safeIndex + 1}/{activeVariants.length}
          </Text>

          <TouchableOpacity
            onPress={() => hasNext && setActiveIndex(safeIndex + 1)}
            disabled={!hasNext}
            style={{ padding: 4 }}
          >
            <ChevronRightIcon size={22} color={hasNext ? c.text : c.iconMuted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleShare} style={styles.headerBtn}>
          <ShareIcon size={22} color={c.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={c.accent}
          />
        }
      >
        {/* Большое время */}
        <View style={styles.timeRow}>
          <Text style={styles.bigTime}>
            {displayDeparture} → {displayArrival}
          </Text>
          <Text style={styles.bigDuration}>
            {Math.round(currentRoute.total_minutes)} мин
          </Text>
        </View>
        <Text style={styles.subtitle}>
          {currentDeparture.toDateString() === new Date().toDateString() 
            ? 'Сегодня' 
            : currentDeparture.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} 
          {' · '}Отправление {displayDeparture}
        </Text>

        {/* Сводка */}
        <View style={styles.summaryCard}>
          <View style={{ flexDirection: 'column' }}>
            <Text style={styles.summaryItem}>
              {totalRubles > 0 ? `${totalRubles} ₽` : '— ₽'}
            </Text>
            {metroCount > 0 && (
              <Text style={{ fontSize: 10, color: c.textMuted, marginTop: 2 }}>
                включая метро (Тройка)
              </Text>
            )}
          </View>
          <Text style={styles.summaryItem}>
            {currentRoute.transfers}{' '}
            {plural(currentRoute.transfers, [
              'пересадка',
              'пересадки',
              'пересадок',
            ])}
          </Text>
          <Text style={styles.summaryItem}>{totalKm} км</Text>
        </View>

        {/* Тройка */}
        <View
          style={[
            styles.troikaRow,
            {
              borderColor: troikaStatus.ok ? '#34C759' : '#FF9500',
              backgroundColor: c.cardBg,
            },
          ]}
        >
          <View
            style={[
              styles.troikaDot,
              { backgroundColor: troikaStatus.ok ? '#34C759' : '#FF9500' },
            ]}
          />
          <Text style={[styles.troikaText, { color: c.text }]}>
            {troikaStatus.ok
              ? 'Тройка действует на всём маршруте'
              : `Вне зоны Тройки: ${troikaStatus.stationsOut
                  .slice(0, 2)
                  .join(', ')}${
                  troikaStatus.stationsOut.length > 2 ? ' и др.' : ''
                }`}
          </Text>
        </View>

        {/* Кнопка «Обновить» */}
        <TouchableOpacity
          onPress={handleRefresh}
          disabled={isRefreshing}
          activeOpacity={0.7}
          style={[
            styles.refreshBtn,
            { borderColor: c.border, opacity: isRefreshing ? 0.6 : 1 },
          ]}
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color={c.accent} />
          ) : (
            <Text style={[styles.refreshText, { color: c.accent }]}>
              Обновить от текущего времени
            </Text>
          )}
        </TouchableOpacity>

        {/* Таймлайн */}
        {items.map((item, i) => {
          const {
            leg, startTime, endTime, hideFromName,
            isFirst, isLast, nextIsTransfer,
          } = item;

          if (leg.kind === 'transfer') {
            return (
              <React.Fragment key={i}>
                <View style={styles.transferRow}>
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
                    <Text style={styles.transferSub}>
                      {Math.round(leg.minutes)} мин
                    </Text>
                    <MetroBadge stationIds={[leg.from.id, leg.to.id]} theme={theme} isDark={isDark} />
                  </View>
                </View>

                {isLast && (
                  <View style={styles.rideRow}>
                    <View style={styles.timeCol}>
                      <Text style={styles.timeText}>{fmtTime(endTime)}</Text>
                    </View>
                    <View style={styles.timelineCol}>
                      <View style={[styles.dot, { backgroundColor: c.textMuted }]} />
                    </View>
                    <View style={styles.contentCol}>
                      <Text style={styles.stationName}>{leg.to.name}</Text>
                      <MetroBadge stationIds={[leg.to.id]} theme={theme} isDark={isDark} />
                    </View>
                  </View>
                )}
              </React.Fragment>
            );
          }

          const color = leg.line_color || c.accent;
          const km = estimateKm(leg.minutes);

          const isMetro = leg.line_kind === 'metro' || leg.line_kind === 'mcc';
          
          const trainType = leg.trainType ?? (leg.isExpress ? 'express' : 'local');
          const isExpressTrain = trainType === 'express';

          const allIntermediates = isMetro ? [] : getIntermediateStations(leg.from.id, leg.to.id);
          const intermediates = isExpressTrain
            ? allIntermediates.filter((st) => st.expressStop)
            : allIntermediates;

          const isExpanded = expandedIndex === i;
          const direction = isMetro ? null : getDirectionInfo(leg.from.id, leg.to.id);

          const approx = leg.scheduleFound === false && !leg.trainNumber ? '~ ' : '';
          const segDep = leg.departureTime
            ? `${approx}${leg.departureTime}`
            : fmtTime(startTime);
          const segArr = leg.arrivalTime
            ? `${approx}${leg.arrivalTime}`
            : fmtTime(endTime);

          return (
            <View key={i} style={styles.rideRow}>
              <View style={styles.timeCol}>
                <Text style={styles.timeText}>{segDep}</Text>
                <Text style={styles.durationText}>
                  {Math.round(leg.minutes)}
                  {'\n'}мин
                </Text>
                <Text style={styles.timeText}>{segArr}</Text>
              </View>

              <View style={styles.timelineCol}>
                {isFirst && (
                  <View style={[styles.dot, { backgroundColor: color }]} />
                )}
                <View style={[styles.line, { backgroundColor: color }]} />
                {(isLast || nextIsTransfer) && (
                  <View style={[styles.dot, { backgroundColor: color }]} />
                )}
              </View>

              <View style={styles.contentCol}>
                {hideFromName ? (
                  <View style={styles.stationSpacer} />
                ) : (
                  <React.Fragment>
                    <Text style={styles.stationName}>{leg.from.name}</Text>
                    <MetroBadge stationIds={[leg.from.id]} theme={theme} isDark={isDark} />
                  </React.Fragment>
                )}

                <View style={styles.lineCard}>
                  <View style={styles.lineHeader}>
                    <Text style={styles.lineName}>
                      {leg.line || 'Маршрут'}
                    </Text>
                    {isMetro && (
                      <View style={[
                        styles.metroLineBadge, 
                        { backgroundColor: leg.line_kind === 'mcc' ? '#FFD700' : '#8B4513' }
                      ]}>
                        <Text style={[
                          styles.metroLineBadgeText, 
                          { color: leg.line_kind === 'mcc' ? '#1C1C1E' : '#FFF' }
                        ]}>
                          {leg.line_kind === 'mcc' ? 'МЦК' : 'Метро'}
                        </Text>
                      </View>
                    )}
                    {!isMetro && leg.isExpress && (
                      <View style={styles.expressBadge}>
                        <Text style={styles.expressBadgeText}>Э</Text>
                      </View>
                    )}
                  </View>

                  {leg.trainNumber ? (
                    <Text
                      style={[
                        styles.lineMeta,
                        { marginBottom: 4, color: c.textMuted },
                      ]}
                    >
                      Поезд № {leg.trainNumber}
                      {leg.waitMinutes && leg.waitMinutes > 0
                        ? ` · через ${Math.round(leg.waitMinutes)} мин`
                        : ''}
                    </Text>
                  ) : null}

                  <TouchableOpacity
                    style={styles.lineRow}
                    onPress={() => toggleExpand(i)}
                    activeOpacity={intermediates.length > 0 ? 0.7 : 1}
                    disabled={isMetro || intermediates.length === 0}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.directionLabel}>
                        {isMetro ? 'Поездка по городу' : (direction ? direction.label : `В сторону: ${leg.to.name}`)}
                      </Text>
                      <Text style={styles.lineMeta}>
                        {Math.round(leg.minutes)} мин
                        {!isMetro && (
                          <>
                            {isExpressTrain
                              ? intermediates.length > 0
                                ? ` · ${intermediates.length} ${plural(intermediates.length, ['остановка', 'остановки', 'остановок'])} экспресса`
                                : ' · без остановок'
                              : intermediates.length > 0
                                ? ` · ${intermediates.length} ${plural(intermediates.length, ['ост.', 'ост.', 'ост.'])}`
                                : ' · без остановок'}
                          </>
                        )}
                        {' · '}
                        {km} км
                      </Text>
                      {isMetro && (
                        <Text style={{ marginTop: 4, fontSize: 12, color: c.textMuted, fontStyle: 'italic' }}>
                          Вход в метро: 73 ₽ (Тройка) / 83 ₽ (Банк. карта)
                        </Text>
                      )}
                    </View>
                    {!isMetro && intermediates.length > 0 && (
                      <View
                        style={{
                          transform: [
                            { rotate: isExpanded ? '180deg' : '0deg' },
                          ],
                        }}
                      >
                        <ChevronDownIcon size={20} color={c.iconMuted} />
                      </View>
                    )}
                  </TouchableOpacity>

                  {isExpanded && !isMetro && intermediates.length > 0 && (
                    <View style={styles.intermediateList}>
                      <View
                        style={[
                          styles.intermediateDivider,
                          { backgroundColor: c.border },
                        ]}
                      />
                      {intermediates.map((st) => (
                        <View key={st.id} style={styles.intermediateRow}>
                          <View
                            style={[
                              styles.intermediateDot,
                              { borderColor: color },
                            ]}
                          />
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
                <MetroBadge stationIds={[leg.to.id]} theme={theme} isDark={isDark} />
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
// Стили для метро
// ------------------------------------------------------------
const stylesMetro = StyleSheet.create({
  container: {
    marginTop: 6,
    marginBottom: 8,
    padding: 8,
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    width: 16,
    height: 16,
    borderRadius: 3,
    backgroundColor: '#0055A4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    paddingLeft: 22,
  },
  lineText: {
    fontSize: 12,
    lineHeight: 18,
  },
});

// ------------------------------------------------------------
// Основные стили
// ------------------------------------------------------------

const makeStyles = (c: RouteColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 12, paddingTop: 48, paddingBottom: 12,
      borderBottomWidth: 1, borderBottomColor: c.border,
    },
    headerBtn: {
      width: 44, height: 44,
      alignItems: 'center', justifyContent: 'center',
    },
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    headerTitle: { fontSize: 17, fontWeight: '600', color: c.text },
    scroll: { padding: 16, paddingBottom: 40 },
    timeRow: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'baseline', marginBottom: 4,
    },
    bigTime: {
      fontSize: 32, fontWeight: '700',
      letterSpacing: -0.5, color: c.text,
    },
    bigDuration: { fontSize: 20, fontWeight: '600', color: c.text },
    subtitle: { fontSize: 13, marginBottom: 16, color: c.textMuted },
    summaryCard: {
      flexDirection: 'row', justifyContent: 'space-between',
      borderWidth: 1, borderColor: c.border, borderRadius: 12,
      paddingVertical: 14, paddingHorizontal: 20, marginBottom: 12,
    },
    summaryItem: { fontSize: 15, fontWeight: '600', color: c.text },

    troikaRow: {
      flexDirection: 'row', alignItems: 'center',
      borderWidth: 1, borderRadius: 12,
      paddingVertical: 12, paddingHorizontal: 16,
      marginBottom: 12, gap: 10,
    },
    troikaDot: { width: 10, height: 10, borderRadius: 5 },
    troikaText: { fontSize: 14, fontWeight: '500', flex: 1 },

    refreshBtn: {
      borderWidth: 1, borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center', justifyContent: 'center',
      marginBottom: 20, minHeight: 44,
    },
    refreshText: { fontSize: 14, fontWeight: '600' },

    rideRow: { flexDirection: 'row', alignItems: 'stretch' },
    transferRow: { flexDirection: 'row', alignItems: 'stretch' },
    timeCol: { width: 56, alignItems: 'flex-start' },
    timeText: { fontSize: 14, fontWeight: '600', color: c.text },
    durationText: {
      fontSize: 11, textAlign: 'center', flex: 1,
      paddingTop: 8, paddingBottom: 8, color: c.textMuted,
    },
    timelineCol: { width: 24, alignItems: 'center' },
    dot: {
      width: 14, height: 14, borderRadius: 7,
      borderWidth: 3, borderColor: c.bg,
    },
    line: { width: 5, flex: 1, borderRadius: 2.5 },
    transferDots: {
      flex: 1, alignItems: 'center', justifyContent: 'center',
      gap: 4, paddingVertical: 12,
    },
    transferDot: {
      width: 5, height: 5, borderRadius: 2.5,
      backgroundColor: c.iconMuted,
    },
    contentCol: { flex: 1, paddingLeft: 12 },
    stationName: {
      fontSize: 17, fontWeight: '700', marginBottom: 4,
      color: c.text, minHeight: 24,
    },
    stationSpacer: { height: 28 },
    lineCard: {
      borderRadius: 12, padding: 12, marginVertical: 4,
      backgroundColor: c.cardBg,
    },
    lineHeader: {
      flexDirection: 'row', alignItems: 'center',
      marginBottom: 6, gap: 8,
    },
    lineName: { fontSize: 15, fontWeight: '600', color: c.text },
    
    expressBadge: {
      backgroundColor: '#E5231B',
      paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
    },
    expressBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
    metroLineBadge: {
      paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
    },
    metroLineBadgeText: { fontSize: 10, fontWeight: '700' },

    directionLabel: {
      fontSize: 14, fontWeight: '600',
      color: c.text, marginBottom: 2,
    },
    lineRow: { flexDirection: 'row', alignItems: 'center' },
    lineMeta: { fontSize: 13, lineHeight: 18, color: c.textMuted },
    intermediateList: { marginTop: 4 },
    intermediateDivider: { height: 1, marginVertical: 8 },
    intermediateRow: {
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: 4, gap: 10,
    },
    intermediateDot: {
      width: 10, height: 10, borderRadius: 5,
      borderWidth: 2, backgroundColor: 'transparent',
    },
    intermediateName: { flex: 1, fontSize: 13, color: c.textMuted },
    expressMini: {
      backgroundColor: '#E5231B',
      paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3,
    },
    expressMiniText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
    transferLabel: { fontSize: 15, fontWeight: '500', color: c.textMuted },
    transferSub: { fontSize: 12, marginTop: 2, color: c.textMuted },
    footer: {
      textAlign: 'center', fontSize: 12,
      marginTop: 20, color: c.textMuted,
    },
  });