import { useState, useEffect, useCallback, useRef } from 'react';

export function useVersion() {
  const [version, setVersion] = useState({
    version: '3.1.0',
    buildDate: new Date().toISOString(),
  });
  const setVersionRef = useRef(setVersion);
  setVersionRef.current = setVersion;

  const refresh = useCallback(() => {
    setVersionRef.current(prev => ({
      ...prev,
      buildDate: new Date().toISOString(),
    }));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { version, refresh };
}
