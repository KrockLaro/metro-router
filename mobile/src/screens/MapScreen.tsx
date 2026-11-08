import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Text, Alert,
  ActivityIndicator, Platform,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';

import SchematicMap, { SchematicMapHandle } from '../map/SchematicMap';
import StationInfoSheet from './StationInfoSheet';
import SearchBar from './SearchBar';
import RouteScreen from './RouteScreen';
import { SchemaStation } from '../map/schemaStations';
import { osmFacilities } from '../map/osmFacilities';
import { useTheme } from '../theme/ThemeProvider';
import { useSettings } from '../store/SettingsContext';
import { buildRoute, RouteResult } from '../api/client';

export default function MapScreen() {
  const { theme } = useTheme();
  const { mapFilter, avoidAeroexpress, wheelchairOnly } = useSettings();
  const mapApiRef = useRef<SchematicMapHandle | null>(null);

  const [selected, setSelected] = useState<SchemaStation | null>(null);
  const [from, setFrom] = useState<SchemaStation | null>(null);
  const [to, setTo] = useState<SchemaStation | null>(null);

  const [routeVariants, setRouteVariants] = useState<RouteResult[] | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeDeparture, setRouteDeparture] = useState(new Date());

  // ВЫБОР ВРЕМЕНИ
  const [useNow, setUseNow] = useState(true);
  const [customTime, setCustomTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Формируем черный список станций, если включен фильтр доступности
  const avoidStationsList = useMemo(() => {
    if (!wheelchairOnly) return [];
    const badStations: string[] = [];
    
    // Проходим по всем станциям из OSM
    for (const [id, facs] of Object.entries(osmFacilities)) {
      // Если нет полной доступности (т.е. нет лифтов или не отмечено), кидаем в черный список
      if (facs.wheelchair !== 'full') {
        badStations.push(id);
      }
    }
    return badStations;
  }, [wheelchairOnly]);

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
  }, []);

  const handleBuildRoute = useCallback(async () => {
    if (!from || !to) return;
    if (from.id === to.id) {
      Alert.alert('Ошибка', 'Станция отправления и назначения совпадают');
      return;
    }

    setRouteLoading(true);
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

      setRouteDeparture(depDate);
      setRouteVariants(res.variants ?? []);
    } catch (e: any) {
      const details = e?.response?.data?.detail || e?.message || 'Неизвестная ошибка';
      Alert.alert('Не удалось построить маршрут', details);
    } finally {
      setRouteLoading(false);
    }
  }, [from, to, useNow, customTime, avoidAeroexpress, avoidStationsList]);

  if (routeVariants && routeVariants.length > 0 && from && to) {
    return (
      <RouteScreen
        variants={routeVariants}
        fromName={from.name}
        toName={to.name}
        departure={routeDeparture}
        onBack={() => setRouteVariants(null)}
      />
    );
  }

  const highlighted = [from?.id, to?.id].filter(Boolean) as string[];
  const routeReady = Boolean(from && to);

  const formatTime = (d: Date) => {
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;
  };

  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={styles.container}>
        <SchematicMap
          onStationPress={handleStationPress}
          onMapReady={handleMapReady}
          highlightedStationIds={highlighted}
          activeStationId={selected?.id ?? null}
          mapFilter={mapFilter}
        />

        <SearchBar onPick={handleSearchPick} />

        <TouchableOpacity
          style={[styles.resetBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => mapApiRef.current?.resetView()}
        >
          <Text style={[styles.resetText, { color: theme.icon }]}>⌂</Text>
        </TouchableOpacity>

        {(from || to) && (
          <View style={[styles.routePanel, { backgroundColor: theme.card, borderColor: theme.border }]}>
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

            {/* Блок выбора времени */}
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
              <TouchableOpacity disabled={!routeReady || routeLoading} onPress={handleBuildRoute}>
                {routeLoading ? (
                  <ActivityIndicator size="small" color={theme.accent} />
                ) : (
                  <Text style={[styles.actionText, { color: routeReady ? theme.accent : theme.iconMuted }]}>Построить</Text>
                )}
              </TouchableOpacity>
            </View>
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
  
  resetBtn: { 
    position: 'absolute', top: 116, right: 16, 
    width: 44, height: 44, borderRadius: 22, 
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, zIndex: 20 
  },
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
});