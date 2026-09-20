import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { useTheme, Theme } from '../theme/ThemeProvider';
import {
  BackIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ShareIcon,
} from '../icons';
import { RouteResult } from '../api/client';

interface Props {
  route: RouteResult;
  fromName: string;
  toName: string;
  departure: Date;
  onBack: () => void;
}

// ------------------------------------------------------------------
// Вспомогательные функции
// ------------------------------------------------------------------

function addMinutes(base: Date, min: number): Date {
  return new Date(base.getTime() + min * 60000);
}

function fmtTime(d: Date): string {
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

function estimateStops(minutes: number): number {
  return Math.max(1, Math.round(minutes / 1.8));
}

function plural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}

// ------------------------------------------------------------------
// Тематические цвета
// ------------------------------------------------------------------

interface RouteColors {
  bg: string;
  text: string;
  textMuted: string;
  border: string;
  cardBg: string;
  icon: string;
  iconMuted: string;
  accent: string;
  green: string;
  red: string;
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
    green: isDark ? '#32D74B' : '#34C759',
    red: isDark ? '#FF453A' : '#FF3B30',
  };
}

// ------------------------------------------------------------------
// Компонент
// ------------------------------------------------------------------

export default function RouteScreen({
  route,
  fromName,
  toName,
  departure,
  onBack,
}: Props) {
  const { theme } = useTheme();
  const c = useMemo(() => getRouteColors(theme), [theme]);
  const styles = useMemo(() => makeStyles(c), [c]);

  const arrival = addMinutes(departure, route.total_minutes ?? 0);

  const items = useMemo(() => {
    let cursor = 0;
    return (route.segments ?? []).map((seg) => {
      const startMin = cursor;
      const endMin = cursor + (seg.minutes ?? 0);
      cursor = endMin;
      return {
        segment: seg,
        startTime: addMinutes(departure, startMin),
        endTime: addMinutes(departure, endMin),
      };
    });
  }, [route, departure]);

  const totalKm = route.total_km ?? 0;
  const totalPrice = route.total_price ?? 0;
  const totalMinutes = Math.round(route.total_minutes ?? 0);
  const transfers = route.transfers ?? 0;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Маршрут: ${fromName} → ${toName}, ${totalMinutes} мин`,
      });
    } catch {}
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

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Большое время */}
        <View style={styles.timeRow}>
          <Text style={styles.bigTime}>
            {fmtTime(departure)} → {fmtTime(arrival)}
          </Text>
          <Text style={styles.bigDuration}>{totalMinutes} мин</Text>
        </View>

        <Text style={styles.subtitle}>
          Сегодня · Отправление {fmtTime(departure)} · Электричка
        </Text>

        {/* Сводка */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryItem}>{totalPrice} ₽</Text>
          <Text style={styles.summaryItem}>
            {transfers}{' '}
            {plural(transfers, ['пересадка', 'пересадки', 'пересадок'])}
          </Text>
          <Text style={styles.summaryItem}>{totalKm.toFixed(1)} км</Text>
        </View>

        {/* Таймлайн */}
        {items.map((item, i) => {
          const isTransfer = item.segment.kind === 'transfer';

          if (isTransfer) {
            return (
              <View key={i} style={styles.row}>
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
                    {Math.round(item.segment.minutes)} мин
                  </Text>
                </View>
              </View>
            );
          }

          const color = item.segment.line_color || c.accent;
          const stops = estimateStops(item.segment.minutes);
          const km = item.segment.distance_km ?? 0;

          return (
            <View key={i} style={styles.row}>
              {/* Время */}
              <View style={styles.timeCol}>
                <Text style={styles.timeText}>{fmtTime(item.startTime)}</Text>
                <Text style={styles.durationText}>
                  {Math.round(item.segment.minutes)}
                  {'\n'}мин
                </Text>
                <Text style={styles.timeText}>{fmtTime(item.endTime)}</Text>
              </View>

              {/* Линия */}
              <View style={styles.timelineCol}>
                <View style={[styles.dot, { backgroundColor: color }]} />
                <View style={[styles.line, { backgroundColor: color }]} />
                <View style={[styles.dot, { backgroundColor: color }]} />
              </View>

              {/* Станции и карточка */}
              <View style={styles.contentCol}>
                <Text style={styles.stationName}>
                  {item.segment.from.name}
                </Text>

                <View style={styles.lineCard}>
                  <Text style={styles.lineName}>
                    {item.segment.line || 'Маршрут'}
                  </Text>
                  <View style={styles.lineRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.lineMeta}>
                        В сторону: {item.segment.to.name}
                      </Text>
                      <Text style={styles.lineMeta}>
                        {stops} ост. · {km} км
                      </Text>
                    </View>
                    <ChevronDownIcon size={20} color={c.iconMuted} />
                  </View>
                </View>

                <Text style={styles.stationName}>
                  {item.segment.to.name}
                </Text>
              </View>
            </View>
          );
        })}

        <Text style={styles.footer}>
          Время и стоимость могут отличаться от фактических
        </Text>
      </ScrollView>
    </View>
  );
}

// ------------------------------------------------------------------
// Фабрика стилей
// ------------------------------------------------------------------

const makeStyles = (c: RouteColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.bg,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingTop: 48,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    headerBtn: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerCenter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: c.text,
    },

    scroll: {
      padding: 16,
      paddingBottom: 40,
    },

    timeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 4,
    },
    bigTime: {
      fontSize: 32,
      fontWeight: '700',
      letterSpacing: -0.5,
      color: c.text,
    },
    bigDuration: {
      fontSize: 20,
      fontWeight: '600',
      color: c.text,
    },

    subtitle: {
      fontSize: 13,
      marginBottom: 16,
      color: c.textMuted,
    },

    summaryCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    summaryItem: {
      fontSize: 15,
      fontWeight: '600',
      color: c.text,
    },

    row: {
      flexDirection: 'row',
      alignItems: 'stretch',
      marginBottom: 4,
    },

    timeCol: {
      width: 56,
      alignItems: 'flex-start',
    },
    timeText: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
    },
    durationText: {
      fontSize: 11,
      textAlign: 'center',
      flex: 1,
      paddingTop: 4,
      paddingBottom: 4,
      color: c.textMuted,
    },

    timelineCol: {
      width: 24,
      alignItems: 'center',
    },
    dot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      borderWidth: 3,
      borderColor: c.bg,
    },
    line: {
      width: 5,
      flex: 1,
      borderRadius: 2.5,
      marginVertical: 2,
    },

    transferDots: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingVertical: 8,
    },
    transferDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: c.iconMuted,
    },

    contentCol: {
      flex: 1,
      paddingLeft: 12,
    },
    stationName: {
      fontSize: 17,
      fontWeight: '700',
      marginBottom: 4,
      color: c.text,
    },

    lineCard: {
      borderRadius: 12,
      padding: 12,
      marginVertical: 4,
      backgroundColor: c.cardBg,
    },
    lineName: {
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 6,
      color: c.text,
    },
    lineRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    lineMeta: {
      fontSize: 13,
      lineHeight: 18,
      color: c.textMuted,
    },

    transferLabel: {
      fontSize: 15,
      fontWeight: '500',
      marginTop: 8,
      color: c.textMuted,
    },
    transferSub: {
      fontSize: 12,
      marginTop: 2,
      color: c.textMuted,
    },

    footer: {
      textAlign: 'center',
      fontSize: 12,
      marginTop: 20,
      color: c.textMuted,
    },
  });