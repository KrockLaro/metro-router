import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { useTheme, Theme } from '../theme/ThemeProvider';
import { getStationSchedule, StationSchedule, ScheduleItem } from '../api/client';
import { ChevronDownIcon, TrainBadgeIcon } from '../icons';

interface Props {
  stationId: string;
}

const GRAY = '#8E8E93';
const BLUE = '#0A84FF';
const RED = '#FF3B30';

export default function ScheduleBlock({ stationId }: Props) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StationSchedule | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStationSchedule(stationId, 3);
      setData(res);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Не удалось загрузить расписание');
    } finally {
      setLoading(false);
    }
  }, [stationId]);

  useEffect(() => {
    setData(null);
    setError(null);
    setExpanded(false);
  }, [stationId]);

  useEffect(() => {
    if (expanded && !data && !loading && !error) {
      fetchData();
    }
  }, [expanded, data, loading, error, fetchData]);

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
    const badgeColor = item.is_express ? BLUE : GRAY;

    const metaParts = [
      item.track ? `Путь ${item.track}` : null,
      item.platform ? `Платформа ${item.platform}` : null,
      item.train_number ? `№ ${item.train_number}` : null,
    ].filter(Boolean);

    return (
      <View
        key={item.trip_id + item.departure_iso}
        style={[styles.row, { borderBottomColor: theme.border }]}
      >
        <View style={styles.badge}>
          <TrainBadgeIcon size={40} bgColor={badgeColor} color="#FFFFFF" />
        </View>

        <View style={styles.center}>
          <Text style={[styles.route, { color: theme.text }]} numberOfLines={2}>
            {item.route_name}
          </Text>
          {metaParts.length > 0 && (
            <Text style={[styles.meta, { color: theme.textMuted }]} numberOfLines={1}>
              {metaParts.join(' · ')}
            </Text>
          )}
        </View>

        <View style={styles.right}>
          <Text style={[styles.time, { color: theme.text }]}>
            {item.departure_time}
          </Text>
          <Text
            style={[
              styles.countdown,
              { color: isSoon ? RED : theme.textMuted },
            ]}
          >
            Через {formatMinutes(minutes)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { borderColor: theme.border }]}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded((e) => !e)}
        activeOpacity={0.7}
      >
        <Text style={[styles.headerText, { color: theme.text }]}>
          Ближайшие электрички
        </Text>
        <View style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}>
          <ChevronDownIcon size={20} color={theme.iconMuted} />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          {loading && !data && (
            <ActivityIndicator color={theme.accent} style={{ marginVertical: 16 }} />
          )}

          {error && (
            <TouchableOpacity onPress={fetchData} style={styles.errorBox}>
              <Text style={[styles.errorText, { color: theme.danger }]}>
                {error}
              </Text>
              <Text style={[styles.retryText, { color: theme.accent }]}>
                Повторить
              </Text>
            </TouchableOpacity>
          )}

          {data && (
            <>
              <DirectionGroup
                title="На Москву"
                items={data.to_moscow}
                renderRow={renderRow}
                theme={theme}
              />
              <DirectionGroup
                title="От Москвы"
                items={data.from_moscow}
                renderRow={renderRow}
                theme={theme}
              />
              {data.to_moscow.length === 0 && data.from_moscow.length === 0 && (
                <Text style={[styles.empty, { color: theme.textMuted }]}>
                  Нет данных о ближайших рейсах
                </Text>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
}

function DirectionGroup({
  title,
  items,
  renderRow,
  theme,
}: {
  title: string;
  items: ScheduleItem[];
  renderRow: (item: ScheduleItem) => React.ReactNode;
  theme: Theme;
}) {
  const visible = items.filter((i) => {
    const t = new Date(i.departure_iso).getTime();
    return t > Date.now() - 60000;
  });
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
  container: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  headerText: { fontSize: 15, fontWeight: '600' },
  body: { paddingBottom: 8 },
  group: { paddingHorizontal: 14, marginBottom: 12 },
  groupTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  badge: { width: 40, height: 40, marginRight: 12 },
  center: { flex: 1, marginRight: 8 },
  route: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  meta: { fontSize: 12 },
  right: { alignItems: 'flex-end', minWidth: 76 },
  time: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  countdown: { fontSize: 11 },
  errorBox: { paddingVertical: 16, paddingHorizontal: 14, alignItems: 'center' },
  errorText: { fontSize: 13, marginBottom: 6, textAlign: 'center' },
  retryText: { fontSize: 13, fontWeight: '600' },
  empty: { textAlign: 'center', fontSize: 13, paddingVertical: 16 },
});