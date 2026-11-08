import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TouchableWithoutFeedback, Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming,
} from 'react-native-reanimated';

import {
  SchemaStation,
  StationFacilities,
  SubStationInfo,
} from '../map/schemaStations';
import { METRO_TRANSFERS } from '../map/metroData';
import { useTheme } from '../theme/ThemeProvider';
import { useStationsStore } from '../store/useStationsStore';
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
  const { addRecent, isFavorite, toggleFavorite } = useStationsStore();
  
  const translateY = useSharedValue(SHEET_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const [renderStation, setRenderStation] = useState<SchemaStation | null>(station);
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);

  useEffect(() => {
    if (station) {
      setRenderStation(station);
      setExpandedSubId(null);
      translateY.value = withTiming(0, { duration: 250 });
      backdropOpacity.value = withTiming(1, { duration: 250 });
      
      // Добавляем в недавние
      addRecent(station);
    } else {
      translateY.value = withTiming(SHEET_HEIGHT, { duration: 200 });
      backdropOpacity.value = withTiming(0, { duration: 200 });
      const t = setTimeout(() => {
        setRenderStation(null);
        setExpandedSubId(null);
      }, 220);
      return () => clearTimeout(t);
    }
  }, [station, translateY, backdropOpacity, addRecent]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const expandedSub = useMemo<SubStationInfo | null>(() => {
    if (!renderStation?.isHubNode || !renderStation.subStations || !expandedSubId) return null;
    return renderStation.subStations.find((s) => s.id === expandedSubId) ?? null;
  }, [renderStation, expandedSubId]);

  if (!renderStation) return null;

  const isHub = !!renderStation.isHubNode && !!renderStation.subStations?.length;
  const showSubDetails = isHub && expandedSub !== null;

  const title = showSubDetails
    ? `${renderStation.name} · ${expandedSub!.shortName}`
    : renderStation.name;

  const metroKey = showSubDetails ? expandedSub!.id : renderStation.id;
  const metroLines = METRO_TRANSFERS[metroKey];

  const isDark = theme.name === 'dark';
  
  // Используем ID подстанции, если она открыта, иначе ID самой станции
  const activeId = showSubDetails ? expandedSub!.id : renderStation.id;
  const activeFav = isFavorite(activeId);

  const handleToggleFavorite = () => {
    // Если открыта подстанция, нужно сохранить её как станцию с нужным ID
    const toSave = showSubDetails ? { ...renderStation, id: expandedSub!.id, name: expandedSub!.name } : renderStation;
    toggleFavorite(toSave);
  };

  return (
    <>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={{ flex: 1 }} />
        </TouchableWithoutFeedback>
      </Animated.View>

      <Animated.View style={[styles.sheet, sheetStyle, { backgroundColor: theme.sheetBg }]}>
        <View style={[styles.handle, { backgroundColor: theme.border }]} />

        {/* Кнопка Избранное */}
        <TouchableOpacity
          style={styles.starBtn}
          onPress={handleToggleFavorite}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={{ fontSize: 24, color: activeFav ? '#FFD700' : theme.iconMuted }}>
            {activeFav ? '★' : '☆'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.closeText, { color: theme.textMuted }]}>✕</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>

          {showSubDetails ? (
            <>
              <View style={styles.subMetaRow}>
                <View style={[styles.kindBadge, { borderColor: theme.border }]}>
                  <Text style={[styles.kindBadgeText, { color: theme.textMuted }]}>
                    {kindLabel(expandedSub!.kind)}
                  </Text>
                </View>
                {!!expandedSub!.description && (
                  <Text style={[styles.subDesc, { color: theme.textMuted }]} numberOfLines={2}>
                    {expandedSub!.description}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.backBtn, { borderColor: theme.border }]}
                onPress={() => setExpandedSubId(null)}
              >
                <Text style={[styles.backBtnText, { color: theme.accent }]}>← К списку станций</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
              {isHub
                ? `ТПУ · ${renderStation.subStations!.length} ${pluralSubstations(renderStation.subStations!.length)}`
                : `Линии: ${renderStation.lines.join(', ')}${renderStation.zone !== undefined ? ` · Зона ${renderStation.zone}` : ''}`}
            </Text>
          )}

          {!!metroLines?.length && (
            <View style={[styles.metroContainer, { backgroundColor: isDark ? 'rgba(0, 85, 164, 0.18)' : 'rgba(0, 85, 164, 0.08)' }]}>
              <View style={styles.metroHeader}>
                <View style={styles.metroIcon}><Text style={styles.metroIconText}>М</Text></View>
                <Text style={[styles.metroTitle, { color: theme.text }]}>Переход на:</Text>
              </View>
              <View style={styles.metroList}>
                {[...metroLines].sort((a, b) => a.id - b.id).map((line) => (
                  <Text key={line.id} style={[styles.metroLineText, { color: theme.textMuted }]}>
                    {line.id} {line.name}{line.shortName ? ` (${line.shortName})` : ''}
                  </Text>
                ))}
              </View>
            </View>
          )}

          <View style={styles.routeBtns}>
            <TouchableOpacity style={[styles.routeBtn, { borderColor: theme.border }]} onPress={onFrom}>
              <View style={[styles.routeDot, { backgroundColor: '#34C759' }]} />
              <Text style={[styles.routeBtnText, { color: theme.text }]}>{showSubDetails ? `Отсюда (${expandedSub!.shortName})` : 'Отсюда'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.routeBtn, { borderColor: theme.border }]} onPress={onTo}>
              <View style={[styles.routeDot, { backgroundColor: '#FF3B30' }]} />
              <Text style={[styles.routeBtnText, { color: theme.text }]}>{showSubDetails ? `Сюда (${expandedSub!.shortName})` : 'Сюда'}</Text>
            </TouchableOpacity>
          </View>

          {!isHub && <ScheduleBlock stationId={renderStation.id} />}
          {showSubDetails && !!expandedSub!.scheduleStationId && (
            <ScheduleBlock stationId={expandedSub!.scheduleStationId} />
          )}

          {isHub && !showSubDetails && (
            <Section title="Станции в составе ТПУ" theme={theme}>
              {renderStation.subStations!.map((sub) => (
                <SubStationRow key={sub.id} sub={sub} onPress={() => setExpandedSubId(sub.id)} />
              ))}
            </Section>
          )}

          {(!isHub || showSubDetails) && (
            <FacilitiesContent facilities={showSubDetails ? expandedSub!.facilities : renderStation.facilities} />
          )}
        </ScrollView>
      </Animated.View>
    </>
  );
}

// ------------------------------------------------------------------
// Вспомогательные компоненты
// ------------------------------------------------------------------

function SubStationRow({ sub, onPress }: { sub: SubStationInfo; onPress: () => void }) {
  const { theme } = useTheme();
  const wc = sub.facilities.wheelchair;

  return (
    <TouchableOpacity style={[styles.subRow, { borderBottomColor: theme.border }]} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.subRowLeft}>
        <Text style={[styles.subRowName, { color: theme.text }]}>{sub.name}</Text>
        {!!sub.description && (
          <Text style={[styles.subRowDesc, { color: theme.textMuted }]} numberOfLines={1}>{sub.description}</Text>
        )}
      </View>
      <View style={styles.subRowRight}>
        <View style={[styles.accessDot, { backgroundColor: wc === 'full' ? theme.accent : wc === 'partial' ? '#E5A11B' : theme.danger }]} />
        <Text style={[styles.chevron, { color: theme.textMuted }]}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

function FacilitiesContent({ facilities }: { facilities: StationFacilities }) {
  const { theme } = useTheme();
  const f = facilities;

  return (
    <>
      <Section title="Доступность" theme={theme}>
        <Facility
          Icon={f.wheelchair === 'full' ? WheelchairIcon : f.wheelchair === 'partial' ? WheelchairPartialIcon : WheelchairNoneIcon}
          label="Маломобильные пассажиры"
          value={f.wheelchair === 'full' ? 'Полностью доступна' : f.wheelchair === 'partial' ? 'Частично доступна' : 'Недоступна'}
          highlight={f.wheelchair === 'full'}
          warn={f.wheelchair === 'none'}
        />
        {f.lifts > 0 && <Facility Icon={LiftIcon} label="Лифты" value={`${f.lifts} шт.`} />}
        {f.escalators > 0 && <Facility Icon={EscalatorIcon} label="Эскалаторы" value={`${f.escalators} шт.`} />}
      </Section>

      <Section title="Билеты и сервис" theme={theme}>
        <Facility Icon={TicketOfficeIcon} label="Кассы" value={f.ticketOffice ? 'Есть' : 'Нет'} warn={!f.ticketOffice} />
        <Facility Icon={TicketMachineIcon} label="Автоматы" value={f.ticketMachines ? 'Есть' : 'Нет'} />
        <Facility Icon={TurnstileIcon} label="Турникеты" value={f.turnstiles ? 'Есть' : 'Нет'} />
        <Facility Icon={LuggageIcon} label="Камеры хранения" value={f.luggageStorage ? 'Есть' : 'Нет'} />
        <Facility Icon={HelpDeskIcon} label="Стойка помощи" value={f.helpDesk ? 'Есть' : 'Нет'} />
      </Section>

      <Section title="Оплата" theme={theme}>
        <Facility Icon={TurnstileIcon} label="Карта «Тройка» (Кошелёк)" value={f.troikaPayment ? 'Работает' : 'Не работает'} highlight={f.troikaPayment} warn={!f.troikaPayment} />
      </Section>

      <Section title="Комфорт" theme={theme}>
        <Facility Icon={WcIcon} label="Туалет" value={f.wc ? 'Есть' : 'Нет'} />
        <Facility Icon={WaitingRoomIcon} label="Зал ожидания" value={f.waitingRoom ? 'Есть' : 'Нет'} />
        <Facility Icon={WifiIcon} label="Wi-Fi" value={f.wifi ? 'Есть' : 'Нет'} />
        <Facility Icon={ParkingIcon} label="Парковка" value={f.parking ? 'Есть' : 'Нет'} />
        <Facility Icon={BikeRackIcon} label="Велопарковка" value={f.bikeRacks ? 'Есть' : 'Нет'} />
      </Section>
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

function Facility({ Icon, label, value, highlight, warn }: any) {
  const { theme } = useTheme();
  const iconColor = highlight ? theme.accent : warn ? theme.danger : theme.icon;
  const valueColor = highlight ? theme.accent : warn ? theme.danger : theme.text;

  return (
    <View style={[styles.row, { borderBottomColor: theme.border }]}>
      <View style={styles.iconWrap}><Icon size={22} color={iconColor} /></View>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

function kindLabel(kind: SubStationInfo['kind']): string {
  switch (kind) {
    case 'railway': return 'Ж/д вокзал';
    case 'mcd': return 'МЦД';
    case 'metro': return 'Метро';
    case 'platform': return 'Платформа';
  }
}

function pluralSubstations(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'станция';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'станции';
  return 'станций';
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 5 },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    height: SHEET_HEIGHT, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 14,
    shadowOffset: { width: 0, height: -4 }, elevation: 14, zIndex: 10,
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 8 },
  starBtn: { position: 'absolute', top: 8, right: 50, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  closeBtn: { position: 'absolute', top: 8, right: 14, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  closeText: { fontSize: 22, fontWeight: '400', lineHeight: 24 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { marginBottom: 12 },
  subMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  kindBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  kindBadgeText: { fontSize: 12, fontWeight: '600' },
  subDesc: { flex: 1, fontSize: 13 },
  backBtn: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, marginBottom: 16 },
  backBtnText: { fontSize: 14, fontWeight: '600' },
  metroContainer: { marginTop: 4, marginBottom: 16, padding: 12, borderRadius: 12 },
  metroHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  metroIcon: { width: 20, height: 20, borderRadius: 4, backgroundColor: '#0055A4', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  metroIconText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', lineHeight: 16 },
  metroTitle: { fontSize: 15, fontWeight: '600' },
  metroList: { paddingLeft: 28 },
  metroLineText: { fontSize: 14, lineHeight: 22 },
  routeBtns: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  routeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1, gap: 8 },
  routeDot: { width: 12, height: 12, borderRadius: 6 },
  routeBtnText: { fontSize: 14, fontWeight: '600' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1 },
  iconWrap: { width: 36 },
  label: { flex: 1, fontSize: 15 },
  value: { fontSize: 15, fontWeight: '600' },
  subRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  subRowLeft: { flex: 1, paddingRight: 12 },
  subRowName: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  subRowDesc: { fontSize: 13 },
  subRowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  accessDot: { width: 10, height: 10, borderRadius: 5 },
  chevron: { fontSize: 22, fontWeight: '300' },
});