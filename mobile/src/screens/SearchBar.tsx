import React, { useState, useMemo, useEffect } from 'react';
import {
  View, TextInput, StyleSheet, FlatList, TouchableOpacity, Text, Keyboard,
} from 'react-native';
import { SearchIcon, CloseIcon } from '../icons';
import { STATIONS, SchemaStation } from '../map/schemaStations';
import { useTheme } from '../theme/ThemeProvider';
import { useStationsStore } from '../store/useStationsStore';

interface Props {
  onPick: (station: SchemaStation) => void;
}

type ListItem =
  | { type: 'header'; title: string; key: string }
  | { type: 'station'; station: SchemaStation; key: string };

export default function SearchBar({ onPick }: Props) {
  const { theme } = useTheme();
  const { favorites, recents } = useStationsStore();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  // Следим за скрытием клавиатуры, чтобы закрыть выпадающий список
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setFocused(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  const displayData = useMemo<ListItem[]>(() => {
    const data: ListItem[] = [];

    if (query.length >= 2) {
      const q = query.toLowerCase();
      const results = Object.values(STATIONS)
        .filter((s) => s.name.toLowerCase().includes(q))
        .slice(0, 12);
      
      if (results.length > 0) {
        data.push({ type: 'header', title: 'Результаты поиска', key: 'h_search' });
        results.forEach(s => data.push({ type: 'station', station: s, key: s.id }));
      }
    } else {
      if (favorites.length > 0) {
        data.push({ type: 'header', title: '★ Избранное', key: 'h_favs' });
        favorites.forEach(s => data.push({ type: 'station', station: s, key: 'fav_' + s.id }));
      }
      
      if (recents.length > 0) {
        data.push({ type: 'header', title: '🕒 Недавние', key: 'h_recents' });
        recents.forEach(s => data.push({ type: 'station', station: s, key: 'rec_' + s.id }));
      }
    }

    return data;
  }, [query, favorites, recents]);

  const handlePick = (s: SchemaStation) => {
    Keyboard.dismiss(); // Принудительно скрываем клавиатуру
    setQuery('');
    setFocused(false);
    onPick(s);
  };

  return (
    <View style={styles.wrap}>
      <View style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <SearchIcon size={20} color={theme.iconMuted} />
        <TextInput
          testID="search-input"
          style={[styles.text, { color: theme.text }]}
          placeholder="Поиск станции..."
          placeholderTextColor={theme.iconMuted}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <CloseIcon size={18} color={theme.iconMuted} />
          </TouchableOpacity>
        )}
      </View>

      {focused && displayData.length > 0 && (
        <View style={[styles.dropdown, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={displayData}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => {
              if (item.type === 'header') {
                return (
                  <View style={[styles.headerRow, { backgroundColor: theme.bg }]}>
                    <Text style={[styles.headerTitle, { color: theme.textMuted }]}>
                      {item.title}
                    </Text>
                  </View>
                );
              }

              const s = item.station;
              const isFav = favorites.some((f) => f.id === s.id);

              return (
                <TouchableOpacity style={styles.item} onPress={() => handlePick(s)}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemText, { color: theme.text }]}>
                      {s.name}
                    </Text>
                    <Text style={[styles.itemMeta, { color: theme.textMuted }]}>
                      {s.lines.join(' • ')}
                    </Text>
                  </View>
                  {isFav && <Text style={styles.starIcon}>★</Text>}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 56, left: 16, right: 16, zIndex: 100 },
  input: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, height: 48, borderRadius: 24,
    borderWidth: 1, gap: 8,
    shadowColor: '#000', shadowOpacity: 0.1,
    shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  text: { flex: 1, fontSize: 16 },
  dropdown: {
    marginTop: 8, borderRadius: 16, borderWidth: 1,
    maxHeight: 320, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.15,
    shadowRadius: 16, shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  headerRow: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderTopWidth: 1, borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 12, fontWeight: '700', textTransform: 'uppercase',
  },
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  itemText: { fontSize: 15, fontWeight: '600' },
  itemMeta: { fontSize: 12, marginTop: 2 },
  starIcon: { color: '#FFD700', fontSize: 18, marginLeft: 8 },
});