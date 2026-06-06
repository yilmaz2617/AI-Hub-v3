import { useCallback, useMemo, useRef, useEffect } from 'react';

export function useMemoizedCallback<T extends (...args: unknown[]) => unknown>(callback: T) {
  const ref = useRef(callback);
  useEffect(() => {
    ref.current = callback;
  }, [callback]);
  return useCallback((...args: Parameters<T>) => ref.current(...args) as ReturnType<T>, [ref]);
}

export function useDeepMemo<T>(value: T): T {
  const deps = useMemo(() => JSON.stringify(value), [value]);
  return useMemo(() => value, [deps]);
}
