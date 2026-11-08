import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useSettings } from '../store/SettingsContext';
import { BackIcon } from '../icons';

interface Props {
  message?: string;
  onBack: () => void;
}

export default function RouteErrorScreen({ message, onBack }: Props) {
  const { theme } = useTheme();
  const { wheelchairOnly, avoidAeroexpress, setWheelchairOnly, setAvoidAeroexpress } = useSettings();

  const hasActiveFilters = wheelchairOnly || avoidAeroexpress;

  const handleResetFilters = () => {
    setWheelchairOnly(false);
    setAvoidAeroexpress(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerBtn}>
          <BackIcon size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Маршрут</Text>
        <View style={styles.headerBtn} />
      </View>

      <View style={styles.content}>
        <Text style={styles.emoji}>🚧</Text>
        <Text style={[styles.title, { color: theme.text }]}>Маршрут не найден</Text>
        
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          {message || 'Не удалось построить путь между этими станциями. Возможно, между ними нет прямого сообщения или в данный момент нет подходящих рейсов.'}
        </Text>

        {hasActiveFilters && (
          <View style={[styles.filterWarning, { backgroundColor: 'rgba(255, 149, 0, 0.1)', borderColor: '#FF9500' }]}>
            <Text style={[styles.filterText, { color: '#FF9500' }]}>
              ⚠️ У вас включены фильтры (доступность или отказ от Аэроэкспресса). Это могло ограничить поиск.
            </Text>
            <TouchableOpacity 
              style={[styles.resetFiltersBtn, { backgroundColor: '#FF9500' }]} 
              onPress={handleResetFilters}
            >
              <Text style={styles.resetFiltersText}>Сбросить все фильтры</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.backBtn, { borderColor: theme.border }]} 
          onPress={onBack}
        >
          <Text style={[styles.backBtnText, { color: theme.text }]}>Вернуться на карту</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingTop: 48, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: 'transparent',
  },
  headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 80, // Сдвиг чуть выше центра
  },
  emoji: {
    fontSize: 72,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  filterWarning: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 30,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  resetFiltersBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  resetFiltersText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  backBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});