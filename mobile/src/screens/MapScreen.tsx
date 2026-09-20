import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import SchematicMap, { SchematicMapHandle } from '../map/SchematicMap';
import StationInfoSheet from './StationInfoSheet';
import SearchBar from './SearchBar';
import RouteScreen from './RouteScreen';
import { SchemaStation } from '../map/schemaStations';
import { useTheme } from '../theme/ThemeProvider';
import { SunIcon, MoonIcon } from '../icons';
import { buildRoute, RouteResult } from '../api/client';

export default function MapScreen() {
  const { theme, toggle } = useTheme();
  const mapApiRef = useRef<SchematicMapHandle | null>(null);

  const [selected, setSelected] = useState<SchemaStation | null>(null);
  const [from, setFrom] = useState<SchemaStation | null>(null);
  const [to, setTo] = useState<SchemaStation | null>(null);

  const [routeData, setRouteData] = useState<RouteResult | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeDeparture, setRouteDeparture] = useState(new Date());

  // ------------------------------------------------------------------
  // Обработчики карты
  // ------------------------------------------------------------------

  const handleStationPress = useCallback((s: SchemaStation) => {
    setSelected(s);
    mapApiRef.current?.focusStation(s.id, 1.4);
  }, []);

  const handleSearchPick = useCallback((s: SchemaStation) => {
    setSelected(s);
    mapApiRef.current?.focusStation(s.id, 1.6);
  }, []);

  const handleMapReady = useCallback((api: SchematicMapHandle) => {
    mapApiRef.current = api;
  }, []);

  // ------------------------------------------------------------------
  // Обработчики маршрута
  // ------------------------------------------------------------------

  const handleSetFrom = useCallback(() => {
  if (selected) {
    setFrom(selected);
    setSelected(null);
    mapApiRef.current?.resetView();   // ← добавь
  }
}, [selected]);

const handleSetTo = useCallback(() => {
  if (selected) {
    setTo(selected);
    setSelected(null);
    mapApiRef.current?.resetView();   // ← добавь
  }
}, [selected]);

  const handleSwap = useCallback(() => {
    setFrom(to);
    setTo(from);
  }, [from, to]);

  const handleClear = useCallback(() => {
    setFrom(null);
    setTo(null);
    setRouteData(null);
  }, []);

  const handleBuildRoute = useCallback(async () => {
    if (!from || !to) return;
    if (from.id === to.id) {
      Alert.alert('Ошибка', 'Станция отправления и назначения совпадают');
      return;
    }

    setRouteLoading(true);
    try {
      const data = await buildRoute(from.id, to.id);
      setRouteDeparture(new Date());
      setRouteData(data);
    } catch (e: any) {
      const details = e?.response?.data?.detail || e?.message || 'Неизвестная ошибка';
      Alert.alert(
        'Не удалось построить маршрут',
        `${details}\n\nПроверь:\n1. Бэкенд запущен (uvicorn)\n2. http://localhost:8000/docs открывается\n3. В .env указан правильный IP`,
      );
    } finally {
      setRouteLoading(false);
    }
  }, [from, to]);

  // ------------------------------------------------------------------
  // Экран маршрута (если построен)
  // ------------------------------------------------------------------

  if (routeData && from && to) {
    return (
      <RouteScreen
        route={routeData}
        fromName={from.name}
        toName={to.name}
        departure={routeDeparture}
        onBack={() => setRouteData(null)}
      />
    );
  }

  const highlighted = [from?.id, to?.id].filter(Boolean) as string[];
  const routeReady = Boolean(from && to);

  // ------------------------------------------------------------------
  // Основной экран
  // ------------------------------------------------------------------

  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={styles.container}>
        <SchematicMap
          onStationPress={handleStationPress}
          onMapReady={handleMapReady}
          highlightedStationIds={highlighted}
          activeStationId={selected?.id ?? null}
        />

        <SearchBar onPick={handleSearchPick} />

        <TouchableOpacity
          testID="theme-toggle"
          style={[styles.themeBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={toggle}
        >
          {theme.name === 'dark'
            ? <SunIcon size={22} color={theme.icon} />
            : <MoonIcon size={22} color={theme.icon} />}
        </TouchableOpacity>

        {/* Панель "Откуда / Куда" */}
        {(from || to) && (
          <View
            style={[
              styles.routePanel,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: '#34C759' }]} />
              <Text
                style={[styles.routeText, { color: theme.text }]}
                numberOfLines={1}
              >
                {from ? from.name : 'Выберите станцию отправления'}
              </Text>
            </View>

            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: '#FF3B30' }]} />
              <Text
                style={[styles.routeText, { color: theme.text }]}
                numberOfLines={1}
              >
                {to ? to.name : 'Выберите станцию назначения'}
              </Text>
            </View>

            <View style={[styles.routeActions, { borderTopColor: theme.border }]}>
              <TouchableOpacity onPress={handleSwap} disabled={!from || !to}>
                <Text
                  style={[
                    styles.actionText,
                    { color: from && to ? theme.accent : theme.iconMuted },
                  ]}
                >
                  Поменять
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleClear}>
                <Text style={[styles.actionText, { color: theme.danger }]}>
                  Сбросить
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={!routeReady || routeLoading}
                onPress={handleBuildRoute}
              >
                {routeLoading ? (
                  <ActivityIndicator size="small" color={theme.accent} />
                ) : (
                  <Text
                    style={[
                      styles.actionText,
                      { color: routeReady ? theme.accent : theme.iconMuted },
                    ]}
                  >
                    Построить
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <StationInfoSheet
  station={selected}
  onClose={() => {
    setSelected(null);
    mapApiRef.current?.resetView();   // ← добавь
  }}
  onFrom={handleSetFrom}
  onTo={handleSetTo}
/>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },

  themeBtn: {
    position: 'absolute',
    top: 116,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    zIndex: 20,
  },

  routePanel: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    zIndex: 15,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 10,
  },
  routeDot: { width: 12, height: 12, borderRadius: 6 },
  routeText: { flex: 1, fontSize: 15, fontWeight: '500' },
  routeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  actionText: { fontSize: 14, fontWeight: '600' },
});