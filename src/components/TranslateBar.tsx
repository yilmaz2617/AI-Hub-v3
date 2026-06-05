import { useState } from 'react';
import { translateText } from '@/lib/api';
import { useAppStore } from '@/store/appStore';
import { Languages, ArrowRight, Loader2 } from 'lucide-react';

interface TranslateBarProps {
  onTranslate?: (text: string) => void;
  compact?: boolean;
}

export default function TranslateBar({ onTranslate, compact }: TranslateBarProps) {
  const [text, setText] = useState('');
  const [direction, setDirection] = useState<'tr-en' | 'en-tr'>('tr-en');
  const isTranslating = useAppStore(s => s.isTranslating);
  const setIsTranslating = useAppStore(s => s.setIsTranslating);
  const addToast = useAppStore(s => s.addToast);

  const handleTranslate = async () => {
    if (!text.trim() || isTranslating) return;
    setIsTranslating(true);
    try {
      const target = direction === 'tr-en' ? 'en' : 'tr';
      const result = await translateText(text, target);
      setText(result);
      onTranslate?.(result);
      addToast(direction === 'tr-en' ? 'İngilizceye çevrildi' : 'Türkçeye çevrildi', 'success');
    } catch (e: unknown) {
      addToast('Çeviri hatası: ' + (e as Error).message, 'error');
    }
    setIsTranslating(false);
  };

  return (
    <div
      className="flex items-center gap-2 rounded-lg px-3 py-2"
      style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
    >
      <Languages size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleTranslate()}
        placeholder={compact ? 'Çeviri...' : 'Çevrilecek metin...'}
        className="flex-1 bg-transparent text-sm outline-none min-w-0 placeholder:text-[var(--text3)]"
        style={{ color: 'var(--text)' }}
      />
      <button
        onClick={() => setDirection(d => d === 'tr-en' ? 'en-tr' : 'tr-en')}
        className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors hover:bg-[var(--surface3)]"
        style={{ color: 'var(--text2)', border: '1px solid var(--border)' }}
        title="Yön değiştir"
      >
        {direction === 'tr-en' ? 'TR' : 'EN'}
        <ArrowRight size={10} />
        {direction === 'tr-en' ? 'EN' : 'TR'}
      </button>
      <button
        onClick={handleTranslate}
        disabled={isTranslating || !text.trim()}
        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
        style={{ background: 'var(--accent)', color: '#fff' }}
      >
        {isTranslating ? <Loader2 size={12} className="animate-spin" /> : null}
        Çevir
      </button>
    </div>
  );
}
