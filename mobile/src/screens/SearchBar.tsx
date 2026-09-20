import React, { useState, useMemo } from 'react';
import {
  View, TextInput, StyleSheet, FlatList, TouchableOpacity, Text,
} from 'react-native';
import { SearchIcon, CloseIcon } from '../icons';
import { STATIONS, SchemaStation } from '../map/schemaStations';
import { useTheme } from '../theme/ThemeProvider';

interface Props {
  onPick: (station: SchemaStation) => void;
}

export default function SearchBar({ onPick }: Props) {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return Object.values(STATIONS)
      .filter((s) => s.name.toLowerCase().includes(q))
      .slice(0, 12);
  }, [query]);

  const handlePick = (s: SchemaStation) => {
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
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <CloseIcon size={18} color={theme.iconMuted} />
          </TouchableOpacity>
        )}
      </View>

      {focused && results.length > 0 && (
        <View style={[styles.dropdown, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={results}
            keyExtractor={(s) => s.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.item} onPress={() => handlePick(item)}>
                <Text style={[styles.itemText, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.itemMeta, { color: theme.textMuted }]}>
                  {item.lines.join(' • ')}
                </Text>
              </TouchableOpacity>
            )}
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
  item: {
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  itemText: { fontSize: 15, fontWeight: '600' },
  itemMeta: { fontSize: 12, marginTop: 2 },
});