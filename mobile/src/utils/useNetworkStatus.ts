import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // Проверяем, есть ли подключение к Wi-Fi или мобильной сети
      const connected = state.isConnected && state.isInternetReachable !== false;
      setIsConnected(connected);
    });

    return () => unsubscribe();
  }, []);

  return { isConnected };
}