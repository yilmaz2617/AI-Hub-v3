import { useState, useEffect, useCallback, useRef } from 'react';

export function usePerformance() {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
  });
  const setMetricsRef = useRef(setMetrics);
  setMetricsRef.current = setMetrics;

  const measure = useCallback((fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    setMetricsRef.current(prev => ({ ...prev, renderTime: end - start }));
  }, []);

  useEffect(() => {
    const loadTime = performance.now();
    setMetricsRef.current(prev => ({ ...prev, loadTime }));
  }, []);

  return { metrics, measure };
}

