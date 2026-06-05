import { useRef, useState, useEffect, useMemo, useCallback } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  containerHeight: number;
  overscan?: number;
}

export function VirtualList<T>({
  items, itemHeight, renderItem, containerHeight, overscan = 5,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const totalHeight = items.length * itemHeight;

  const visibleRange = useMemo(() => {
    const startIdx = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIdx = Math.min(items.length - 1, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan);
    return { startIdx, endIdx };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const handleScroll = useCallback(() => {
    if (containerRef.current) setScrollTop(containerRef.current.scrollTop);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const visibleItems = useMemo(() => {
    const result = [];
    for (let i = visibleRange.startIdx; i <= visibleRange.endIdx; i++) {
      result.push(
        <div key={i} style={{ position: 'absolute', top: i * itemHeight, height: itemHeight, left: 0, right: 0 }}>
          {renderItem(items[i], i)}
        </div>
      );
    }
    return result;
  }, [visibleRange, items, itemHeight, renderItem]);

  return (
    <div ref={containerRef} style={{ height: containerHeight, overflow: 'auto', position: 'relative' }}>
      <div style={{ height: totalHeight, position: 'relative' }}>{visibleItems}</div>
    </div>
  );
}
