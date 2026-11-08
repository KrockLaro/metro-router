import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type MapFilterType = 'wheelchair' | 'ticketOffice' | 'ticketMachines' | 'parking' | 'wc' | 'wifi' | 'turnstiles' | null;

interface SettingsData {
  avoidAeroexpress: boolean;
  wheelchairOnly: boolean;
  mapFilter: MapFilterType;
  hasSeenTutorial: boolean;
}

interface SettingsContextType extends SettingsData {
  setAvoidAeroexpress: (v: boolean) => void;
  setWheelchairOnly: (v: boolean) => void;
  setMapFilter: (v: MapFilterType) => void;
  setHasSeenTutorial: (v: boolean) => void;
  isLoaded: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);
const STORAGE_KEY = '@metro_settings';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsData>({
    avoidAeroexpress: false,
    wheelchairOnly: false,
    mapFilter: null,
    hasSeenTutorial: false,
  });
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Защита от перезаписи данных при самом первом рендере
  const isFirstLoad = useRef(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((json) => {
        if (json) {
          try {
            const parsed = JSON.parse(json);
            setSettings(parsed);
            console.log('Настройки загружены:', parsed);
          } catch (e) {
            console.warn('Ошибка парсинга настроек', e);
          }
        }
      })
      .catch((e) => console.warn('Ошибка загрузки из AsyncStorage', e))
      .finally(() => {
        setIsLoaded(true);
      });
  }, []);

  useEffect(() => {
    // Если настройки еще не загрузились — не сохраняем (чтобы не затереть реальные данные дефолтными)
    if (!isLoaded) return;
    
    // Пропускаем самое первое сохранение сразу после загрузки, чтобы не делать лишних записей
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      .catch((e) => console.warn('Ошибка сохранения в AsyncStorage', e));
  }, [settings, isLoaded]);

  const setAvoidAeroexpress = (v: boolean) => setSettings((p) => ({ ...p, avoidAeroexpress: v }));
  const setWheelchairOnly = (v: boolean) => setSettings((p) => ({ ...p, wheelchairOnly: v }));
  const setMapFilter = (v: MapFilterType) => setSettings((p) => ({ ...p, mapFilter: v }));
  const setHasSeenTutorial = (v: boolean) => setSettings((p) => ({ ...p, hasSeenTutorial: v }));

  return (
    <SettingsContext.Provider value={{ 
      ...settings, 
      setAvoidAeroexpress, 
      setWheelchairOnly, 
      setMapFilter, 
      setHasSeenTutorial,
      isLoaded
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}