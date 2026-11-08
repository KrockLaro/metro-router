import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { BackIcon } from '../icons';

const SkeletonBlock = ({ width, height, style, color }: any) => {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[{ width, height, backgroundColor: color, borderRadius: 8 }, style, animatedStyle]}
    />
  );
};

export default function RouteSkeleton({ onBack }: { onBack: () => void }) {
  const { theme } = useTheme();
  const isDark = theme.name === 'dark';
  const skeletonColor = isDark ? '#2C2C2E' : '#E5E5EA';

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.headerBtn}>
          <BackIcon size={24} color={theme.text} />
        </TouchableOpacity>
        <SkeletonBlock width={120} height={20} color={skeletonColor} />
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.timeRow}>
          <SkeletonBlock width={180} height={40} color={skeletonColor} />
          <SkeletonBlock width={80} height={30} color={skeletonColor} />
        </View>
        <SkeletonBlock width={200} height={16} color={skeletonColor} style={{ marginBottom: 20 }} />

        <SkeletonBlock width="100%" height={60} color={skeletonColor} style={{ marginBottom: 12 }} />
        <SkeletonBlock width="100%" height={50} color={skeletonColor} style={{ marginBottom: 24 }} />

        {[1, 2].map((i) => (
          <View key={i} style={styles.routeRow}>
            <View style={styles.timeCol}>
              <SkeletonBlock width={40} height={16} color={skeletonColor} />
              <SkeletonBlock width={30} height={12} color={skeletonColor} style={{ marginVertical: 8 }} />
              <SkeletonBlock width={40} height={16} color={skeletonColor} />
            </View>
            <View style={styles.timelineCol}>
              <View style={[styles.line, { backgroundColor: skeletonColor }]} />
            </View>
            <View style={styles.contentCol}>
              <SkeletonBlock width={150} height={20} color={skeletonColor} style={{ marginBottom: 8 }} />
              <SkeletonBlock width="100%" height={80} color={skeletonColor} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 48, paddingBottom: 12, borderBottomWidth: 1 },
  headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 16 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  routeRow: { flexDirection: 'row', marginBottom: 24 },
  timeCol: { width: 56, alignItems: 'flex-start' },
  timelineCol: { width: 24, alignItems: 'center' },
  line: { width: 4, flex: 1, borderRadius: 2, marginVertical: 4 },
  contentCol: { flex: 1, paddingLeft: 12 },
});