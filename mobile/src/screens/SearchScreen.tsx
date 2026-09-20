import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { searchStations, Station } from '../api/client';
import { useTheme } from '../theme/ThemeProvider';

export default function SearchScreen() {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [stations, setStations] = useState<Station[]>([]);
  const [from, setFrom] = useState<Station | null>(null);
  const [to, setTo] = useState<Station | null>(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigation<any>();

  useEffect(() => {
    if (query.length < 2) return;
    setLoading(true);
    const t = setTimeout(() => {
      searchStations(query)
        .then(setStations)
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const pick = (s: Station) => {
    if (!from) setFrom(s);
    else if (!to) setTo(s);
    setQuery('');
    setStations([]);
  };

  const go = () => {
    if (from && to) {
      nav.navigate('Route', {
        from, to, departure: new Date().toISOString(),
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.title, { color: theme.text }]}>MetroRouter</Text>

      <View style={styles.picked}>
        <Text style={{ color: theme.text }}>Откуда: {from?.name ?? '—'}</Text>
        <Text style={{ color: theme.text }}>Куда: {to?.name ?? '—'}</Text>
      </View>

      <TextInput
        testID="from-input"
        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
        placeholder="Поиск станции..."
        placeholderTextColor={theme.textMuted}
        value={query}
        onChangeText={setQuery}
      />

      {loading && <ActivityIndicator />}

      <FlatList
        data={stations}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => pick(item)}>
            <Text style={{ color: theme.text }}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        testID="build-route-button"
        style={[styles.button, (!from || !to) && styles.buttonDisabled]}
        disabled={!from || !to}
        onPress={go}
      >
        <Text style={styles.buttonText}>Построить маршрут</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  picked: { marginBottom: 12 },
  input: {
    borderWidth: 1, borderRadius: 8,
    padding: 10, marginBottom: 12,
  },
  item: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  button: {
    backgroundColor: '#E5231B', padding: 16,
    borderRadius: 8, alignItems: 'center', marginTop: 12,
  },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});