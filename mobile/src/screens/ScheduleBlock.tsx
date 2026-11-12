import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';

import { useTheme, Theme } from '../theme/ThemeProvider';
import {
  getStationSchedule,
  StationSchedule,
  ScheduleItem,
  TrainType,
} from '../api/client';
import { useNetworkStatus } from '../utils/useNetworkStatus';
import { ChevronDownIcon, TrainBadgeIcon } from '../icons';

interface Props {
  stationId: string;
}

const GRAY = '#8E8E93';
const BLUE = '#0A84FF';
const RED = '#FF3B30';
const YELLOW = '#FFCC00';

const TYPE_COLOR: Record<TrainType, string> = {
  local: GRAY,
  express: BLUE,
  aeroexpress: RED,
  mcd: YELLOW,
};

export default function ScheduleBlock({ stationId }: Props) {
  const { theme } = useTheme();
  const { isConnected } = useNetworkStatus();
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StationSchedule | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false); // <--- НОВОЕ СОСТОЯНИЕ
  const [now, setNow] = useState(Date.now());

  const fetchData = useCallback(async () => {
    if (!isConnected) {
      setError('Нет подключения к интернету');
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const res = await getStationSchedule(stationId, 3);
      setData(res);
    } catch (e: any) {
      if (e?.response?.status === 404) {
        // База вернула 404 - значит, для этой станции нет данных
        setNotFound(true);
      } else if (e?.message === 'Network Error') {
        setError('Не удалось связаться с сервером. Проверьте интернет.');
      } else {
        setError('Не удалось загрузить расписание');
      }
    } finally {
      setLoading(false);
    }
  }, [stationId, isConnected]);

  useEffect(() => {
    setData(null);
    setError(null);
    setNotFound(false);
    setExpanded(false);
  }, [stationId]);

  useEffect(() => {
    if (expanded && !data && !loading && !error && !notFound) {
      fetchData();
    }
  }, [expanded, data, loading, error, notFound, fetchData]);

  useEffect(() => {
    if (isConnected && expanded && error === 'Нет подключения к интернету' && !data) {
      fetchData();
    }
  }, [isConnected, expanded, error, data, fetchData]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const t = setInterval(() => fetchData(), 120000);
    return () => clearInterval(t);
  }, [expanded, fetchData]);

  const renderRow = (item: ScheduleItem) => {
    const minutes = recalc(item, now);
    if (minutes < -1) return null;

    const isSoon = minutes <= 1;
    const iconColor = TYPE_COLOR[item.train_type ?? 'local'] ?? GRAY;
    const iconTextColor = item.train_type === 'mcd' ? '#1C1C1E' : '#FFFFFF';

    const platformParts = [
      item.track_number ? `Путь ${item.track_number}` : null,
      item.platform_number ? `Пл ${item.platform_number}` : null,
    ].filter(Boolean);
    const platformText = platformParts.join(' · ');

    return (
      <View key={item.trip_id + item.departure_iso} style={[styles.row, { borderBottomColor: theme.border }]}>
        <View style={styles.badge}>
          <TrainBadgeIcon size={40} bgColor={iconColor} color={iconTextColor} />
        </View>

        <View style={styles.center}>
          <View style={styles.line1}>
            <Text style={[styles.route, { color: theme.text }]} numberOfLines={1} ellipsizeMode="middle">
              {item.route_name}
            </Text>
            <Text style={[styles.timeBold, { color: theme.text }]}>{item.departure_time}</Text>
          </View>

          <View style={styles.line2}>
            <Text style={[styles.metaLeft, { color: isSoon ? RED : theme.textMuted }]} numberOfLines={1}>
              {item.train_number ? `№ ${item.train_number} · ` : ''}
              {isSoon ? 'отправляется' : `через ${formatMinutes(minutes)}`}
            </Text>

            {platformText ? (
              <Text style={[styles.metaRight, { color: theme.textMuted }]} numberOfLines={1}>
                {platformText}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { borderColor: theme.border }]}>
      <TouchableOpacity style={styles.header} onPress={() => setExpanded((e) => !e)} activeOpacity={0.7}>
        <Text style={[styles.headerText, { color: theme.text }]}>Ближайшие электрички</Text>
        <View style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}>
          <ChevronDownIcon size={20} color={theme.iconMuted} />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          {loading && !data && <ActivityIndicator color={theme.accent} style={{ marginVertical: 16 }} />}

          {error && (
            <TouchableOpacity onPress={fetchData} style={styles.errorBox} disabled={!isConnected}>
              <Text style={[styles.errorText, { color: !isConnected ? theme.textMuted : theme.danger }]}>
                {error}
              </Text>
              {isConnected ? (
                <Text style={[styles.retryText, { color: theme.accent }]}>Повторить</Text>
              ) : (
                <Text style={[styles.retryText, { color: theme.textMuted }]}>Ожидание сети...</Text>
              )}
            </TouchableOpacity>
          )}

          {/* ЕСЛИ ДАННЫХ НЕТ, ПОКАЗЫВАЕМ АККУРАТНЫЙ ТЕКСТ */}
          {notFound && (
            <Text style={[styles.empty, { color: theme.textMuted }]}>
              Расписание для этой станции пока не загружено.
            </Text>
          )}

          {data && (
            <>
              {(() => {
                const hasTo = data.to_moscow.length > 0;
                const hasFrom = data.from_moscow.length > 0;
                if (!hasTo && !hasFrom) return null;

                if (hasTo && hasFrom) {
                  return (
                    <>
                      <DirectionGroup title="На Москву" items={data.to_moscow} renderRow={renderRow} theme={theme} />
                      <DirectionGroup title="От Москвы" items={data.from_moscow} renderRow={renderRow} theme={theme} />
                    </>
                  );
                }
                const merged = hasTo ? data.to_moscow : data.from_moscow;
                return <DirectionGroup title="Ближайшие поезда" items={merged} renderRow={renderRow} theme={theme} />;
              })()}
              {data.to_moscow.length === 0 && data.from_moscow.length === 0 && (
                <Text style={[styles.empty, { color: theme.textMuted }]}>Нет данных о ближайших рейсах</Text>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
}

function DirectionGroup({ title, items, renderRow, theme }: any) {
  const visible = items.filter((i: any) => new Date(i.departure_iso).getTime() > Date.now() - 60000);
  if (visible.length === 0) return null;

  return (
    <View style={styles.group}>
      <Text style={[styles.groupTitle, { color: theme.textMuted }]}>{title}</Text>
      {visible.map(renderRow)}
    </View>
  );
}

function recalc(item: ScheduleItem, now: number): number {
  try {
    const t = new Date(item.departure_iso).getTime();
    return Math.round((t - now) / 60000);
  } catch {
    return item.minutes_until;
  }
}

function formatMinutes(m: number): string {
  if (m <= 0) return 'сейчас';
  if (m < 60) return `${m} мин`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem === 0 ? `${h} ч` : `${h} ч ${rem} мин`;
}

const styles = StyleSheet.create({
  container: { borderWidth: 1, borderRadius: 12, marginBottom: 20, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14 },
  headerText: { fontSize: 15, fontWeight: '600' },
  body: { paddingBottom: 8 },
  group: { paddingHorizontal: 14, marginBottom: 12 },
  groupTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  badge: { width: 40, height: 40, marginRight: 12 },
  center: { flex: 1 },
  line1: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 },
  route: { fontSize: 14.5, fontWeight: '700', flexShrink: 1, marginRight: 8 },
  timeBold: { fontSize: 16, fontWeight: '700' },
  line2: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  metaLeft: { fontSize: 12, fontWeight: '400', flexShrink: 1, marginRight: 8 },
  metaRight: { fontSize: 12, fontWeight: '400', flexShrink: 0 },
  errorBox: { paddingVertical: 16, paddingHorizontal: 14, alignItems: 'center' },
  errorText: { fontSize: 13, marginBottom: 6, textAlign: 'center' },
  retryText: { fontSize: 13, fontWeight: '600' },
  empty: { textAlign: 'center', fontSize: 13, paddingVertical: 16 },
});