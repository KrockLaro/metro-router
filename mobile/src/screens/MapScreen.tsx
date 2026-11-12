import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Text, Alert,
  Platform,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';

import SchematicMap, { SchematicMapHandle, RouteSegment } from '../map/SchematicMap';
import StationInfoSheet from './StationInfoSheet';
import SearchBar from './SearchBar';
import RouteScreen from './RouteScreen';
import RouteSkeleton from './RouteSkeleton';
import RouteErrorScreen from './RouteErrorScreen';
import { SchemaStation } from '../map/schemaStations';
import { osmFacilities } from '../map/osmFacilities';
import { useTheme } from '../theme/ThemeProvider';
import { useSettings } from '../store/SettingsContext';
import { useNetworkStatus } from '../utils/useNetworkStatus';
import { buildRoute, RouteResult } from '../api/client';
import { ChevronRightIcon } from '../icons';

function plural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}

function formatDuration(minutes: number): string {
  const rounded = Math.round(minutes);
  if (rounded < 60) return `${rounded} мин`;
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  if (m === 0) return `${h} ч`;
  return `${h} ч ${m} мин`;
}

export default function MapScreen() {
  const { theme } = useTheme();
  const { mapFilter, avoidAeroexpress, wheelchairOnly } = useSettings();
  const { isConnected } = useNetworkStatus();
  const mapApiRef = useRef<SchematicMapHandle | null>(null);

  const [selected, setSelected] = useState<SchemaStation | null>(null);
  const [from, setFrom] = useState<SchemaStation | null>(null);
  const [to, setTo] = useState<SchemaStation | null>(null);

  const [routeVariants, setRouteVariants] = useState<RouteResult[] | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [routeDeparture, setRouteDeparture] = useState(new Date());
  const [showDetails, setShowDetails] = useState(false);

  const [useNow, setUseNow] = useState(true);
  const [customTime, setCustomTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const avoidStationsList = useMemo(() => {
    if (!wheelchairOnly) return [];
    const badStations: string[] = [];
    for (const [id, facs] of Object.entries(osmFacilities)) {
      if (facs.wheelchair !== 'full') badStations.push(id);
    }
    return badStations;
  }, [wheelchairOnly]);

  const activeRouteStations = useMemo(() => {
    if (!routeVariants || routeVariants.length === 0) return [];
    const stations = new Set<string>();
    routeVariants[0].segments.forEach(s => {
      stations.add(s.from.id);
      stations.add(s.to.id);
    });
    return Array.from(stations);
  }, [routeVariants]);

  const activeRouteSegments = useMemo(() => {
    if (!routeVariants || routeVariants.length === 0) return [];
    const segs: RouteSegment[] = [];

    routeVariants[0].segments.forEach(seg => {
      if (seg.kind !== 'transfer' && seg.line) {
        let lineId = '';
        const lineStr = seg.line.toLowerCase();

        if (lineStr.includes('ярославское')) lineId = 'yar';
        else if (lineStr.includes('монинский')) lineId = 'yar_monino';
        else if (lineStr.includes('фрязинский')) lineId = 'yar_fryazino';
        else if (lineStr.includes('красноармейская')) lineId = 'yar_krasnoarmeysk';

        else if (lineStr.includes('павелецкое')) lineId = 'pav';
        else if (lineStr.includes('домодедово')) lineId = 'pav_aero_sub';

        else if (lineStr.includes('белорусское')) lineId = 'bel';
        else if (lineStr.includes('усовская')) lineId = 'bel_usovo';
        else if (lineStr.includes('звенигородская')) lineId = 'bel_zven';

        else if (lineStr.includes('савёловское')) lineId = 'sav';
        else if (lineStr.includes('дубна')) lineId = 'sav_dubna';
        else if (lineStr.includes('шереметьево')) lineId = 'sav_aero';

        else if (lineStr.includes('курское')) lineId = 'kursk';

        else if (lineStr.includes('рижское')) lineId = 'riga';
        else if (lineStr.includes('рижский вокзал')) lineId = 'riga_m';

        else if (lineStr.includes('ленинградское')) lineId = 'len';
        else if (lineStr.includes('конаково')) lineId = 'len_konakovo';

        else if (lineStr.includes('казанское')) lineId = 'kaz';
        else if (lineStr.includes('рязанский')) lineId = 'kaz_rzan';
        else if (lineStr.includes('казанский ход')) lineId = 'kaz_kaz';
        else if (lineStr.includes('озёры')) lineId = 'kaz_ozery';
        else if (lineStr.includes('рязановку')) lineId = 'kaz_ryazanovka';
        else if (lineStr.includes('рязань-2')) lineId = 'kaz_ryazan2';

        else if (lineStr.includes('киевское')) lineId = 'kiev';
        else if (lineStr.includes('новопеределкино')) lineId = 'kiev_novoperedelkino';
        else if (lineStr.includes('внуково')) lineId = 'kiev_aero';

        else if (lineStr.includes('горьковское')) lineId = 'gorky';
        else if (lineStr.includes('балашиху')) lineId = 'gorky_balashikha';
        else if (lineStr.includes('захарово')) lineId = 'gorky_zakharovo';
        else if (lineStr.includes('электрогорск')) lineId = 'gorky_elektrogorsk';

        else if (lineStr.includes('мцд-1')) lineId = 'mcd1';
        else if (lineStr.includes('мцд-2')) lineId = 'mcd2';
        else if (lineStr.includes('мцд-3')) lineId = 'mcd3';
        else if (lineStr.includes('мцд-4')) lineId = 'mcd4';
        else if (lineStr.includes('мцк')) lineId = 'mcc';
        else if (lineStr.includes('кольцевая')) lineId = 'metro_kol';

        if (lineId) {
          segs.push({ lineId, fromId: seg.from.id, toId: seg.to.id });
        } else {
          console.warn('Линия не распознана:', seg.line);
        }
      }
    });
    return segs;
  }, [routeVariants]);

  const transfersCount = useMemo(() => {
    if (!routeVariants || routeVariants.length === 0) return 0;
    let count = 0;
    let prevLine: string | null = null;
    for (const seg of routeVariants[0].segments) {
      if (seg.kind === 'transfer') {
        count++;
        prevLine = null;
      } else if (seg.line) {
        if (prevLine !== null && prevLine !== seg.line) {
          count++;
        }
        prevLine = seg.line;
      }
    }
    return count;
  }, [routeVariants]);

  useEffect(() => {
    if (isConnected && routeError === 'Нет подключения к интернету' && from && to) {
      handleBuildRoute();
    }
  }, [isConnected]);

  const handleStationPress = useCallback((s: SchemaStation) => {
    setSelected(s);
    mapApiRef.current?.focusStation(s.id);
  }, []);

  const handleSearchPick = useCallback((s: SchemaStation) => {
    setSelected(s);
    mapApiRef.current?.focusStation(s.id, 1.6);
  }, []);

  const handleMapReady = useCallback((api: SchematicMapHandle) => {
    mapApiRef.current = api;
  }, []);

  const handleSetFrom = useCallback(() => {
    if (selected) {
      setFrom(selected);
      setSelected(null);
    }
  }, [selected]);

  const handleSetTo = useCallback(() => {
    if (selected) {
      setTo(selected);
      setSelected(null);
    }
  }, [selected]);

  const handleSwap = useCallback(() => {
    setFrom(to);
    setTo(from);
  }, [from, to]);

  const handleClear = useCallback(() => {
    setFrom(null);
    setTo(null);
    setRouteVariants(null);
    setRouteError(null);
    setShowDetails(false);
    mapApiRef.current?.resetView();
  }, []);

  const handleBuildRoute = useCallback(async () => {
    if (!from || !to) return;
    if (from.id === to.id) {
      Alert.alert('Ошибка', 'Станция отправления и назначения совпадают');
      return;
    }

    if (!isConnected) {
      setRouteError('Нет подключения к интернету');
      return;
    }

    setRouteLoading(true);
    setRouteError(null);

    try {
      let depTimeStr: string;
      let depDate: Date;

      if (useNow) {
        const now = new Date();
        const msk = new Date(now.getTime() + 3 * 60 * 60 * 1000);
        const hh = msk.getUTCHours().toString().padStart(2, '0');
        const mm = msk.getUTCMinutes().toString().padStart(2, '0');
        depTimeStr = `${hh}:${mm}`;
        depDate = now;
      } else {
        const hh = customTime.getHours().toString().padStart(2, '0');
        const mm = customTime.getMinutes().toString().padStart(2, '0');
        depTimeStr = `${hh}:${mm}`;
        depDate = customTime;
      }

      const res = await buildRoute({
        from_id: from.id,
        to_id: to.id,
        depart_at: depTimeStr,
        max_variants: 3,
        avoid_aeroexpress: avoidAeroexpress,
        avoid_stations: avoidStationsList,
      });

      if (!res.variants || res.variants.length === 0) {
        setRouteError('Не удалось найти ни одного подходящего рейса на выбранное время.');
      } else {
        setRouteDeparture(depDate);
        setRouteVariants(res.variants);
      }
    } catch (e: any) {
      const details = e?.response?.data?.detail || e?.message || 'Неизвестная ошибка';
      if (details === 'Network Error') {
        setRouteError('Нет подключения к серверу. Проверьте интернет.');
      } else {
        setRouteError(e?.response?.status === 404 ? 'Одна из станций не найдена в базе данных.' : details);
      }
    } finally {
      setRouteLoading(false);
    }
  }, [from, to, useNow, customTime, avoidAeroexpress, avoidStationsList, isConnected]);

  if (routeLoading) return <RouteSkeleton onBack={() => setRouteLoading(false)} />;

  if (routeError) {
    return (
      <RouteErrorScreen
        message={routeError}
        onBack={() => setRouteError(null)}
      />
    );
  }

  if (showDetails && routeVariants && routeVariants.length > 0 && from && to) {
    return (
      <RouteScreen
        variants={routeVariants}
        fromName={from.name}
        toName={to.name}
        departure={routeDeparture}
        onBack={() => setShowDetails(false)}
      />
    );
  }

  const highlighted = [from?.id, to?.id].filter(Boolean) as string[];
  const routeReady = Boolean(from && to);
  const hasActiveRoute = Boolean(routeVariants && routeVariants.length > 0);

  const formatTime = (d: Date) => {
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;
  };

  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={styles.container}>

        {!isConnected && (
          <View style={{ backgroundColor: theme.danger, paddingTop: 50, paddingBottom: 10, alignItems: 'center' }}>
            <Text style={{ color: '#FFF', fontWeight: '600' }}>Нет подключения к интернету</Text>
          </View>
        )}

        <SchematicMap
          onStationPress={handleStationPress}
          onMapReady={handleMapReady}
          highlightedStationIds={highlighted}
          activeStationId={selected?.id ?? null}
          mapFilter={mapFilter}
          activeRouteStations={activeRouteStations}
          activeRouteSegments={activeRouteSegments}
        />

        <SearchBar onPick={handleSearchPick} />

        <TouchableOpacity
          style={[styles.resetBtn, { backgroundColor: theme.card, borderColor: theme.border, top: isConnected ? 116 : 150 }]}
          onPress={() => mapApiRef.current?.resetView()}
        >
          <Text style={[styles.resetText, { color: theme.icon }]}>⌂</Text>
        </TouchableOpacity>

        {(from || to) && (
          <View style={[styles.routePanel, { backgroundColor: theme.card, borderColor: theme.border }]}>

            {hasActiveRoute ? (
              <TouchableOpacity style={styles.activeRouteSummary} onPress={() => setShowDetails(true)}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.routeText, { color: theme.text, fontSize: 18 }]}>
                    Маршрут: {formatDuration(routeVariants![0].total_minutes)}
                  </Text>
                  <Text style={{ color: theme.textMuted, fontSize: 13, marginTop: 4 }}>
                    {transfersCount} {plural(transfersCount, ['пересадка', 'пересадки', 'пересадок'])} · Нажмите для деталей
                  </Text>
                </View>
                <ChevronRightIcon size={24} color={theme.accent} />
              </TouchableOpacity>
            ) : (
              <>
                <View style={styles.routeRow}>
                  <View style={[styles.routeDot, { backgroundColor: '#34C759' }]} />
                  <Text style={[styles.routeText, { color: theme.text }]} numberOfLines={1}>
                    {from ? from.name : 'Выберите станцию отправления'}
                  </Text>
                </View>
                <View style={styles.routeRow}>
                  <View style={[styles.routeDot, { backgroundColor: '#FF3B30' }]} />
                  <Text style={[styles.routeText, { color: theme.text }]} numberOfLines={1}>
                    {to ? to.name : 'Выберите станцию назначения'}
                  </Text>
                </View>

                <View style={[styles.timeSelector, { borderTopColor: theme.border }]}>
                  <TouchableOpacity style={styles.timeOption} onPress={() => setUseNow(true)}>
                    <Text style={[styles.timeLabel, { color: useNow ? theme.accent : theme.textMuted }]}>Сейчас</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.timeOption}
                    onPress={() => {
                      setUseNow(false);
                      setShowTimePicker(true);
                    }}
                  >
                    <Text style={[styles.timeLabel, { color: !useNow ? theme.accent : theme.textMuted }]}>
                      {!useNow ? `В ${formatTime(customTime)}` : 'Выбрать время'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.routeActions, { borderTopColor: theme.border }]}>
                  <TouchableOpacity onPress={handleSwap} disabled={!from || !to}>
                    <Text style={[styles.actionText, { color: from && to ? theme.accent : theme.iconMuted }]}>Поменять</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleClear}>
                    <Text style={[styles.actionText, { color: theme.danger }]}>Сбросить</Text>
                  </TouchableOpacity>
                  <TouchableOpacity disabled={!routeReady} onPress={handleBuildRoute}>
                    <Text style={[styles.actionText, { color: routeReady ? theme.accent : theme.iconMuted }]}>Построить</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {hasActiveRoute && (
              <TouchableOpacity onPress={handleClear} style={[styles.clearRouteBtn, { borderTopColor: theme.border }]}>
                <Text style={{ color: theme.danger, textAlign: 'center', fontWeight: '600', fontSize: 14 }}>Сбросить маршрут</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <StationInfoSheet
          station={selected}
          onClose={() => setSelected(null)}
          onFrom={handleSetFrom}
          onTo={handleSetTo}
        />

        {showTimePicker && (
          <DateTimePicker
            value={customTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => {
              setShowTimePicker(false);
              if (date) setCustomTime(date);
            }}
            themeVariant={theme.name === 'dark' ? 'dark' : 'light'}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },
  resetBtn: { position: 'absolute', right: 16, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1, zIndex: 20 },
  resetText: { fontSize: 22, fontWeight: '400' },
  routePanel: { position: 'absolute', left: 16, right: 16, bottom: 24, padding: 12, borderRadius: 16, borderWidth: 1, zIndex: 15 },
  routeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 10 },
  routeDot: { width: 12, height: 12, borderRadius: 6 },
  routeText: { flex: 1, fontSize: 15, fontWeight: '500' },
  timeSelector: { flexDirection: 'row', marginTop: 8, paddingTop: 8, borderTopWidth: 1, gap: 16 },
  timeOption: { paddingVertical: 4 },
  timeLabel: { fontSize: 14, fontWeight: '600' },
  routeActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTopWidth: 1 },
  actionText: { fontSize: 14, fontWeight: '600' },
  activeRouteSummary: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  clearRouteBtn: { borderTopWidth: 1, paddingTop: 12, marginTop: 8 },
});