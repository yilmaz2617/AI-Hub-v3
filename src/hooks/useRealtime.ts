import { useEffect } from 'react';
import { initRealtimeSync } from '../sync';

export function useRealtime() {
  useEffect(() => {
    const unsubscribe = initRealtimeSync();
    return () => unsubscribe();
  }, []);
}
