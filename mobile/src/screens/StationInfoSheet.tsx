import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TouchableWithoutFeedback, Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming,
} from 'react-native-reanimated';

import { SchemaStation } from '../map/schemaStations';
import { useTheme } from '../theme/ThemeProvider';
import ScheduleBlock from './ScheduleBlock';
import {
  WheelchairIcon, WheelchairPartialIcon, WheelchairNoneIcon,
  TicketOfficeIcon, TicketMachineIcon, TurnstileIcon,
  WcIcon, WaitingRoomIcon, WifiIcon, ParkingIcon,
  BikeRackIcon, LuggageIcon, HelpDeskIcon,
  LiftIcon, EscalatorIcon,
} from '../icons';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_H * 0.62;

interface Props {
  station: SchemaStation | null;
  onClose: () => void;
  onFrom?: () => void;
  onTo?: () => void;
}

export default function StationInfoSheet({ station, onClose, onFrom, onTo }: Props) {
  const { theme } = useTheme();
  const translateY = useSharedValue(SHEET_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const [renderStation, setRenderStation] = useState<SchemaStation | null>(station);

  useEffect(() => {
    if (station) {
      setRenderStation(station);
      translateY.value = withTiming(0, { duration: 250 });
      backdropOpacity.value = withTiming(1, { duration: 250 });
    } else {
      translateY.value = withTiming(SHEET_HEIGHT, { duration: 200 });
      backdropOpacity.value = withTiming(0, { duration: 200 });
      const t = setTimeout(() => setRenderStation(null), 220);
      return () => clearTimeout(t);
    }
  }, [station, translateY, backdropOpacity]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!renderStation) return null;
  const f = renderStation.facilities;

  return (
    <>
      {/* Затемнение фона */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={{ flex: 1 }} />
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* Сама карточка */}
      <Animated.View
        style={[styles.sheet, sheetStyle, { backgroundColor: theme.sheetBg }]}
      >
        <View style={[styles.handle, { backgroundColor: theme.border }]} />

        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.closeText, { color: theme.textMuted }]}>✕</Text>
        </TouchableOpacity>

        <ScrollView
          testID="station-scroll"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text testID="station-title" style={[styles.title, { color: theme.text }]}>
            {renderStation.name}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            Линии: {renderStation.lines.join(', ')}
            {renderStation.zone !== undefined ? ` · Зона ${renderStation.zone}` : ''}
          </Text>

          <View style={styles.routeBtns}>
            <TouchableOpacity
              style={[styles.routeBtn, { borderColor: theme.border }]}
              onPress={onFrom}
            >
              <View style={[styles.routeDot, { backgroundColor: '#34C759' }]} />
              <Text style={[styles.routeBtnText, { color: theme.text }]}>Отсюда</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.routeBtn, { borderColor: theme.border }]}
              onPress={onTo}
            >
              <View style={[styles.routeDot, { backgroundColor: '#FF3B30' }]} />
              <Text style={[styles.routeBtnText, { color: theme.text }]}>Сюда</Text>
            </TouchableOpacity>
          </View>

          <ScheduleBlock stationId={renderStation.id} />

          <Section title="Доступность" theme={theme}>
            <Facility
              Icon={
                f.wheelchair === 'full' ? WheelchairIcon
                  : f.wheelchair === 'partial' ? WheelchairPartialIcon
                  : WheelchairNoneIcon
              }
              label="Маломобильные пассажиры"
              value={
                f.wheelchair === 'full' ? 'Полностью доступна'
                  : f.wheelchair === 'partial' ? 'Частично доступна'
                  : 'Недоступна'
              }
              highlight={f.wheelchair === 'full'}
              warn={f.wheelchair === 'none'}
            />
            {f.lifts > 0 && <Facility Icon={LiftIcon} label="Лифты" value={`${f.lifts} шт.`} />}
            {f.escalators > 0 && (
              <Facility Icon={EscalatorIcon} label="Эскалаторы" value={`${f.escalators} шт.`} />
            )}
          </Section>

          <Section title="Билеты и сервис" theme={theme}>
            <Facility Icon={TicketOfficeIcon} label="Кассы" value={f.ticketOffice ? 'Есть' : 'Нет'} warn={!f.ticketOffice} />
            <Facility Icon={TicketMachineIcon} label="Автоматы" value={f.ticketMachines ? 'Есть' : 'Нет'} />
            <Facility Icon={TurnstileIcon} label="Турникеты" value={f.turnstiles ? 'Есть' : 'Нет'} />
            <Facility Icon={LuggageIcon} label="Камеры хранения" value={f.luggageStorage ? 'Есть' : 'Нет'} />
            <Facility Icon={HelpDeskIcon} label="Стойка помощи" value={f.helpDesk ? 'Есть' : 'Нет'} />
          </Section>

          <Section title="Оплата" theme={theme}>
            <Facility
              Icon={TurnstileIcon}
              label="Карта «Тройка» (Кошелёк)"
              value={f.troikaPayment ? 'Работает' : 'Не работает'}
              highlight={f.troikaPayment}
              warn={!f.troikaPayment}
            />
          </Section>

          <Section title="Комфорт" theme={theme}>
            <Facility Icon={WcIcon} label="Туалет" value={f.wc ? 'Есть' : 'Нет'} />
            <Facility Icon={WaitingRoomIcon} label="Зал ожидания" value={f.waitingRoom ? 'Есть' : 'Нет'} />
            <Facility Icon={WifiIcon} label="Wi-Fi" value={f.wifi ? 'Есть' : 'Нет'} />
            <Facility Icon={ParkingIcon} label="Парковка" value={f.parking ? 'Есть' : 'Нет'} />
            <Facility Icon={BikeRackIcon} label="Велопарковка" value={f.bikeRacks ? 'Есть' : 'Нет'} />
          </Section>
        </ScrollView>
      </Animated.View>
    </>
  );
}

function Section({ title, children, theme }: any) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>{title}</Text>
      {children}
    </View>
  );
}

function Facility({
  Icon, label, value, highlight, warn,
}: {
  Icon: React.FC<{ size?: number; color?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
  warn?: boolean;
}) {
  const { theme } = useTheme();
  const iconColor = highlight ? theme.accent : warn ? theme.danger : theme.icon;
  const valueColor = highlight ? theme.accent : warn ? theme.danger : theme.text;

  return (
    <View style={[styles.row, { borderBottomColor: theme.border }]}>
      <View style={styles.iconWrap}>
        <Icon size={22} color={iconColor} />
      </View>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 5,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -4 },
    elevation: 14,
    zIndex: 10,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    alignSelf: 'center', marginBottom: 8,
  },
  closeBtn: {
    position: 'absolute', top: 8, right: 14,
    width: 32, height: 32,
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  closeText: { fontSize: 22, fontWeight: '400', lineHeight: 24 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { marginBottom: 12 },
  routeBtns: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  routeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 12, borderWidth: 1, gap: 8,
  },
  routeDot: { width: 12, height: 12, borderRadius: 6 },
  routeBtnText: { fontSize: 15, fontWeight: '600' },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 13, fontWeight: '700',
    textTransform: 'uppercase', marginBottom: 8,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1,
  },
  iconWrap: { width: 36 },
  label: { flex: 1, fontSize: 15 },
  value: { fontSize: 15, fontWeight: '600' },
});