import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export const CURRENT_BUILD = '2026.11'; // <-- ВЕРСИЯ СБОРКИ

interface ChangelogItem {
  version: string;
  date: string;
  changes: string[];
}

const CHANGELOG: ChangelogItem[] = [
  {
    version: '1.0.0',
    date: 'Ноябрь 2026',
    changes: [
      'Добавлена поддержка маршрутов по МЦД и МЦК.',
      'Появились фильтры станций (парковки, лифты, кассы).',
      'Маршрут теперь подсвечивается на карте, лишние линии скрываются.',
      'Добавлен выбор времени отправления и экран «Избранное».',
      'В карточке станций присутствует табличка с ближайшими поездами (МЦД, Экспресс, Пригород, Аэроэкспресс).',
      'Пофиушены баги при передвижении карты (непроизвольный зум и открытие карточки станции)',
      'И многое другое...'
    ],
  },
  {
    version: 'Beta 0.1',
    date: 'Сентябрь 2026',
    changes: [
      'Представляем Маршрутизатор!',
      'Сервис с интерактивной картой электричек Москвы и Подмосковья.',
      'Стройте маршруты, смотрите информацию о станциях, фильтруйте карту и многое другое!',
    ],
  },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ChangelogModal({ visible, onClose }: Props) {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>Что нового</Text>
          
          <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
            {CHANGELOG.map((item, index) => (
              <View key={item.version} style={[styles.section, index > 0 && { borderTopWidth: 1, borderTopColor: theme.border, marginTop: 16, paddingTop: 16 }]}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.versionText, { color: theme.accent }]}>Версия {item.version}</Text>
                  <Text style={[styles.dateText, { color: theme.textMuted }]}>{item.date}</Text>
                </View>
                {item.changes.map((change, i) => (
                  <View key={i} style={styles.changeRow}>
                    <Text style={[styles.bullet, { color: theme.textMuted }]}>•</Text>
                    <Text style={[styles.changeText, { color: theme.text }]}>{change}</Text>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={[styles.btn, { backgroundColor: theme.accent }]} onPress={onClose}>
            <Text style={styles.btnText}>Понятно</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  container: { width: '100%', borderRadius: 20, padding: 24, borderWidth: 1 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 20, textAlign: 'center' },
  section: {},
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  versionText: { fontSize: 16, fontWeight: '700' },
  dateText: { fontSize: 13, fontWeight: '500' },
  changeRow: { flexDirection: 'row', marginBottom: 6, paddingRight: 10 },
  bullet: { fontSize: 16, marginRight: 8, lineHeight: 22 },
  changeText: { fontSize: 14, lineHeight: 22, flex: 1 },
  btn: { marginTop: 24, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});