// ═══════════════════════════════════════════
// AI HUB v3 — Streaming Efekti (Karakter Karakter)
// ═══════════════════════════════════════════
import { useState, useRef, useCallback } from 'react';

export function useStreaming(charDelay = 15) {
  const [displayedText, setDisplayedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const fullTextRef = useRef('');
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef(false);

  const start = useCallback((text: string, onComplete?: () => void) => {
    // Clear any existing stream
    if (timerRef.current) clearTimeout(timerRef.current);
    
    fullTextRef.current = text;
    indexRef.current = 0;
    cancelledRef.current = false;
    setDisplayedText('');
    setIsStreaming(true);

    const streamNext = () => {
      if (cancelledRef.current) return;
      
      if (indexRef.current < fullTextRef.current.length) {
        const next = Math.min(indexRef.current + 2, fullTextRef.current.length);
        indexRef.current = next;
        setDisplayedText(fullTextRef.current.substring(0, next));
        
        // Adaptive speed: faster for long text
        const delay = text.length > 500 ? charDelay / 2 : charDelay;
        timerRef.current = setTimeout(streamNext, delay);
      } else {
        setIsStreaming(false);
        onComplete?.();
      }
    };

    timerRef.current = setTimeout(streamNext, charDelay);
  }, [charDelay]);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsStreaming(false);
    // Show full text immediately
    setDisplayedText(fullTextRef.current);
  }, []);

  const reset = useCallback(() => {
    cancelledRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    setDisplayedText('');
    setIsStreaming(false);
    fullTextRef.current = '';
    indexRef.current = 0;
  }, []);

  return { displayedText, isStreaming, start, cancel, reset, fullText: fullTextRef.current };
}
