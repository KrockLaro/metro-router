import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type MapFilterType = 'wheelchair' | 'ticketOffice' | 'ticketMachines' | 'parking' | 'wc' | 'wifi' | 'turnstiles' | null;

interface SettingsData {
  avoidAeroexpress: boolean;
  wheelchairOnly: boolean;
  mapFilter: MapFilterType;
  hasSeenTutorial: boolean; // <-- Добавлено
}

interface SettingsContextType extends SettingsData {
  setAvoidAeroexpress: (v: boolean) => void;
  setWheelchairOnly: (v: boolean) => void;
  setMapFilter: (v: MapFilterType) => void;
  setHasSeenTutorial: (v: boolean) => void; // <-- Добавлено
  isLoaded: boolean; // <-- Добавлено (полезно знать, загрузились ли настройки)
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

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((json) => {
      if (json) {
        try { setSettings(JSON.parse(json)); } catch (e) {}
      }
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
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