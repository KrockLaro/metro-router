import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useSettings, MapFilterType } from '../store/SettingsContext';
import { SunIcon, MoonIcon } from '../icons';

const FILTERS: { id: MapFilterType; label: string }[] = [
  { id: null, label: 'Показать всё' },
  { id: 'wheelchair', label: 'Доступность (лифты)' },
  { id: 'ticketOffice', label: 'Кассы' },
  { id: 'ticketMachines', label: 'Билетные автоматы' },
  { id: 'turnstiles', label: 'Турникеты' },
  { id: 'wc', label: 'Туалеты' },
  { id: 'parking', label: 'Парковки' },
  { id: 'wifi', label: 'Wi-Fi' },
];

export default function SettingsScreen() {
  const { theme, toggle } = useTheme();
  const { 
    avoidAeroexpress, setAvoidAeroexpress,
    wheelchairOnly, setWheelchairOnly,
    mapFilter, setMapFilter
  } = useSettings();
  
  const isDark = theme.name === 'dark';

  const Switch = ({ value, onToggle }: { value: boolean, onToggle: () => void }) => (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.8}>
      <View style={[styles.switchBase, { backgroundColor: value ? theme.accent : theme.border }]}>
        <View style={[styles.switchKnob, { transform: [{ translateX: value ? 20 : 0 }] }]} />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Настройки</Text>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>ОФОРМЛЕНИЕ</Text>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            {isDark ? <MoonIcon size={22} color={theme.icon} /> : <SunIcon size={22} color={theme.icon} />}
            <Text style={[styles.rowLabel, { color: theme.text }]}>Тёмная тема</Text>
          </View>
          <Switch value={isDark} onToggle={toggle} />
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>ФИЛЬТР КАРТЫ</Text>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, padding: 0 }]}>
        {FILTERS.map((f, i) => (
          <TouchableOpacity 
            key={f.label} 
            style={[styles.row, { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: i < FILTERS.length - 1 ? 1 : 0, borderBottomColor: theme.border }]}
            onPress={() => setMapFilter(f.id)}
          >
            <Text style={[styles.rowLabel, { color: mapFilter === f.id ? theme.accent : theme.text }]}>{f.label}</Text>
            {mapFilter === f.id && <Text style={{ color: theme.accent, fontSize: 18 }}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>МАРШРУТЫ</Text>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Text style={[styles.rowLabel, { color: theme.text }]}>Только доступные станции</Text>
          </View>
          <Switch value={wheelchairOnly} onToggle={() => setWheelchairOnly(!wheelchairOnly)} />
        </View>
        <Text style={[styles.hintText, { color: theme.textMuted }]}>
          Скрывать станции без лифтов и пандусов при построении маршрута.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Text style={[styles.rowLabel, { color: theme.text }]}>Избегать Аэроэкспрессов</Text>
          </View>
          <Switch value={avoidAeroexpress} onToggle={() => setAvoidAeroexpress(!avoidAeroexpress)} />
        </View>
        <Text style={[styles.hintText, { color: theme.textMuted }]}>
          Не предлагать более дорогие билеты Аэроэкспресса.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginTop: 40, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800' },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginTop: 16, marginBottom: 10 },
  card: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: { fontSize: 16, fontWeight: '500' },
  hintText: { fontSize: 12, marginTop: 8, lineHeight: 18 },
  switchBase: { width: 44, height: 24, borderRadius: 12, padding: 2, justifyContent: 'center' },
  switchKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFF' },
});