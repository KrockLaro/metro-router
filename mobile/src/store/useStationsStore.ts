import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SchemaStation } from '../map/schemaStations';

const FAVORITES_KEY = '@metro_favorites';
const RECENTS_KEY = '@metro_recents';
const MAX_RECENTS = 5;

export function useStationsStore() {
  const [favorites, setFavorites] = useState<SchemaStation[]>([]);
  const [recents, setRecents] = useState<SchemaStation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Загружаем данные при старте
  useEffect(() => {
    async function load() {
      try {
        const favJson = await AsyncStorage.getItem(FAVORITES_KEY);
        const recJson = await AsyncStorage.getItem(RECENTS_KEY);
        if (favJson) setFavorites(JSON.parse(favJson));
        if (recJson) setRecents(JSON.parse(recJson));
      } catch (e) {
        console.warn('Ошибка загрузки станций', e);
      } finally {
        setIsLoaded(true);
      }
    }
    load();
  }, []);

  // Сохранение избранного
  const toggleFavorite = useCallback(async (station: SchemaStation) => {
    setFavorites((prev) => {
      const exists = prev.some((s) => s.id === station.id);
      const next = exists
        ? prev.filter((s) => s.id !== station.id)
        : [...prev, station];
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next)).catch(console.warn);
      return next;
    });
  }, []);

  // Добавление в недавние (вызывать при открытии карточки или построении маршрута)
  const addRecent = useCallback(async (station: SchemaStation) => {
    setRecents((prev) => {
      // Удаляем дубликат, если он уже есть, и ставим в начало
      const filtered = prev.filter((s) => s.id !== station.id);
      const next = [station, ...filtered].slice(0, MAX_RECENTS);
      AsyncStorage.setItem(RECENTS_KEY, JSON.stringify(next)).catch(console.warn);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.some((s) => s.id === id),
    [favorites]
  );

  return { favorites, recents, isLoaded, toggleFavorite, addRecent, isFavorite };
}