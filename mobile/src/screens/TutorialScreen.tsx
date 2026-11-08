import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '🗺️',
    title: 'Добро пожаловать!',
    text: 'Маршрутизатор поможет вам строить маршруты по электричкам, МЦД и МЦК. Вся карта интерактивна.',
  },
  {
    id: '2',
    emoji: '👆',
    title: 'Управляйте картой',
    text: 'Двигайте карту одним пальцем, а для приближения используйте жест «щипок» или двойное нажатие. Нажмите на станцию, чтобы открыть ее карточку.',
  },
  {
    id: '3',
    emoji: '🔍',
    title: 'Умные фильтры',
    text: 'В настройках можно включить подсветку станций с нужными удобствами (парковка, туалеты) или режим «Только доступные станции».',
  },
  {
    id: '4',
    emoji: '🚂',
    title: 'Стройте маршруты',
    text: 'Выберите станции «Откуда» и «Куда», укажите время, и приложение покажет лучшие варианты с учетом пересадок.',
  },
];

export default function TutorialScreen({ onFinish }: { onFinish: () => void }) {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      onFinish();
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.skipContainer}>
        {currentIndex < SLIDES.length - 1 && (
          <TouchableOpacity onPress={onFinish}>
            <Text style={[styles.skipText, { color: theme.textMuted }]}>Пропустить</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
            <Text style={[styles.text, { color: theme.textMuted }]}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.bottomContainer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === currentIndex ? theme.accent : theme.border },
                i === currentIndex && { width: 24 }
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: theme.accent }]}
          onPress={handleNext}
        >
          <Text style={styles.nextBtnText}>
            {currentIndex === SLIDES.length - 1 ? 'Начать работу' : 'Далее'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipContainer: { alignItems: 'flex-end', paddingTop: 60, paddingHorizontal: 24, height: 80 },
  skipText: { fontSize: 15, fontWeight: '600' },
  slide: { width, paddingHorizontal: 40, alignItems: 'center', justifyContent: 'center', paddingBottom: 100 },
  emoji: { fontSize: 80, marginBottom: 30 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 16, textAlign: 'center' },
  text: { fontSize: 16, textAlign: 'center', lineHeight: 24 },
  bottomContainer: { paddingHorizontal: 40, paddingBottom: 60, alignItems: 'center' },
  pagination: { flexDirection: 'row', gap: 8, marginBottom: 30 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  nextBtn: { width: '100%', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  nextBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});