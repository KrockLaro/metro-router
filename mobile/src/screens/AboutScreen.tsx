import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

const APP_VERSION = '1.0.0';
const BUILD = '2026.09';

interface License {
  title: string;
  text: string;
  url?: string;
}

const LICENSES: License[] = [
  {
    title: 'Данные о расписаниях',
    text:
      'Расписания электричек предоставлены сервисом «Яндекс.Расписания». ' +
      'API-ключ и все данные о рейсах принадлежат ООО «Яндекс». ' +
      'Использование данных регулируется условиями API Яндекс.Расписаний.',
    url: 'https://yandex.ru/legal/rasp_api_termsofuse/',
  },
  {
    title: 'Картографические данные',
    text:
      'Данные OpenStreetMap доступны под лицензией Open Database License (ODbL). ' +
      '© OpenStreetMap contributors.',
    url: 'https://www.openstreetmap.org/copyright',
  },
  {
    title: 'Движок маршрутизации',
    text:
      'OpenTripPlanner — open-source движок для планирования маршрутов. ' +
      'Лицензия: LGPL 3.0.',
    url: 'https://www.opentripplanner.org/',
  },
  {
    title: 'Собственный код',
    text:
      'Код приложения распространяется под лицензией MIT. ' +
      'Схема, граф станций и алгоритмы — собственная разработка.',
  },
  {
    title: 'Иконки',
    text:
      'Иконки (доступность, кассы, лифты, Wi-Fi и др.) — кастомная разработка ' +
      'в стиле официальных приложений транспорта. Свободны к использованию ' +
      'в рамках лицензии MIT.',
  },
];

export default function AboutScreen() {
  const { theme } = useTheme();

  const openLink = (url?: string) => {
    if (url) Linking.openURL(url);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={[styles.appName, { color: theme.text }]}>Маршрутизатор</Text>
        <Text style={[styles.version, { color: theme.textMuted }]}>
          Версия {APP_VERSION} · сборка {BUILD}
        </Text>
      </View>

      <Text style={[styles.description, { color: theme.text }]}>
        Приложение для построения маршрутов по электричкам ЦППК, МЦД и МЦК.
        Поддерживает поиск пересадок, отображение доступности станций для
        маломобильных пассажиров, светлую и тёмную темы, интерактивную
        схематичную карту.
      </Text>

      <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
        ЛИЦЕНЗИИ И ИСТОЧНИКИ ДАННЫХ
      </Text>

      {LICENSES.map((lic, i) => (
        <View
          key={i}
          style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <Text style={[styles.cardTitle, { color: theme.text }]}>{lic.title}</Text>
          <Text style={[styles.cardText, { color: theme.textMuted }]}>{lic.text}</Text>
          {lic.url && (
            <TouchableOpacity onPress={() => openLink(lic.url)}>
              <Text style={[styles.link, { color: theme.accent }]}>
                Подробнее →
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
        ДИСКЛЕЙМЕР
      </Text>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.cardText, { color: theme.textMuted }]}>
          Приложение не является официальным продуктом ЦППК, МЦД, МЦК,
          АО «Центральная ППК», Департамента транспорта Москвы или
          ООО «Яндекс». Все товарные знаки принадлежат их владельцам.
          Данные предоставляются «как есть», возможны неточности.
        </Text>
      </View>

      <Text style={[styles.footer, { color: theme.textMuted }]}>
        © 2026 Маршрутизатор · Сделано с ❤️ для пассажиров
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  appName: { fontSize: 32, fontWeight: '700' },
  version: { fontSize: 14, marginTop: 6 },
  description: { fontSize: 15, lineHeight: 22, marginBottom: 24 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 10,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  cardText: { fontSize: 13, lineHeight: 19 },
  link: { fontSize: 13, fontWeight: '600', marginTop: 8 },
  footer: { textAlign: 'center', fontSize: 12, marginTop: 30 },
});