import { useState, useEffect, useRef, useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import { useUIStore } from '@/store/uiStore';
import { useThemeStore } from '@/store/themeStore';
import { useHotkeys } from 'react-hotkeys-hook';
import { motion } from 'framer-motion';
import {
  Search, MessageSquare, Crown, Image, Wifi, Zap,
  Settings as SettingsIcon, Moon, Sun, Monitor,
  Maximize, Columns, Sparkles, HelpCircle} from 'lucide-react';

interface Command {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof MessageSquare;
  shortcut?: string;
  action: () => void;
  keywords: string[];
}

export default function CommandPalette() {
  const { showCommandPalette, setCommandPalette, toggleZenMode, toggleFullscreen, setCompareMode } = useUIStore();
  const { setPanel } = useAppStore();
  const { toggleTheme, themeId } = useThemeStore();
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useHotkeys('ctrl+k', (e) => { e.preventDefault(); setCommandPalette(true); }, { enableOnFormTags: true });
  useHotkeys('esc', () => setCommandPalette(false), { enabled: showCommandPalette });

  useEffect(() => {
    if (showCommandPalette) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [showCommandPalette]);

  const commands: Command[] = useMemo(() => [
    { id: 'chat', title: 'Sohbet Paneli', subtitle: 'AI modelleri ile sohbet et', icon: MessageSquare, shortcut: 'Ctrl+1', action: () => { setPanel('chat'); setCommandPalette(false); }, keywords: ['sohbet', 'chat', 'mesaj', 'gpt', 'ai'] },
    { id: 'premium', title: 'Premium Free', subtitle: 'En iyi ücretsiz modeller', icon: Crown, shortcut: 'Ctrl+2', action: () => { setPanel('premium'); setCommandPalette(false); }, keywords: ['premium', 'free', 'gpt-4o', 'claude'] },
    { id: 'image', title: 'Görsel Üretimi', subtitle: 'AI ile görsel oluştur', icon: Image, shortcut: 'Ctrl+3', action: () => { setPanel('image'); setCommandPalette(false); }, keywords: ['gorsel', 'image', 'resim', 'foto', 'flux'] },
    { id: 'status', title: 'API Durumu', subtitle: 'API anahtarlarını yönet', icon: Wifi, shortcut: 'Ctrl+4', action: () => { setPanel('status'); setCommandPalette(false); }, keywords: ['api', 'key', 'durum', 'status'] },
    { id: 'improve', title: 'Kendini Geliştir', subtitle: 'AI ile kodunu iyileştir', icon: Zap, shortcut: 'Ctrl+5', action: () => { setPanel('improve'); setCommandPalette(false); }, keywords: ['gelistir', 'improve', 'kod', 'optimize'] },
    { id: 'compare', title: 'Karşılaştırma Modu', subtitle: 'İki modeli aynı anda test et', icon: Columns, action: () => { setCompareMode(true); setCommandPalette(false); }, keywords: ['karsilastir', 'compare', 'iki', 'test'] },
    { id: 'zen', title: 'Zen Modu', subtitle: 'Dikkat dağıtıcıları gizle', icon: Monitor, action: () => { toggleZenMode(); setCommandPalette(false); }, keywords: ['zen', 'odak', 'focus'] },
    { id: 'fullscreen', title: 'Tam Ekran', subtitle: 'Tam ekran moduna geç', icon: Maximize, action: () => { toggleFullscreen(); setCommandPalette(false); }, keywords: ['fullscreen', 'tam ekran'] },
    { id: 'theme', title: `Tema: ${themeId}`, subtitle: 'Tema değiştir', icon: themeId === 'light' ? Sun : Moon, action: () => { toggleTheme(); setCommandPalette(false); }, keywords: ['tema', 'theme', 'renk', 'dark', 'light'] },
    { id: 'settings', title: 'Ayarlar', subtitle: 'Uygulama ayarları', icon: SettingsIcon, action: () => { setCommandPalette(false); }, keywords: ['ayar', 'settings', 'config'] },
    { id: 'help', title: 'Yardım', subtitle: 'Klavye kısayolları ve ipuçları', icon: HelpCircle, action: () => { setCommandPalette(false); }, keywords: ['yardim', 'help', 'nasil', 'klavye'] },
  ], [setPanel, setCommandPalette, toggleZenMode, toggleFullscreen, setCompareMode, toggleTheme, themeId]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.subtitle.toLowerCase().includes(q) ||
      c.keywords.some(k => k.includes(q))
    );
  }, [query, commands]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && filtered[selectedIdx]) {
      e.preventDefault();
      filtered[selectedIdx].action();
    }
  };

  if (!showCommandPalette) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCommandPalette(false)} />
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border2)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
          <Search size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIdx(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Komut veya panel ara..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text)' }}
          />
          <kbd className="px-2 py-0.5 rounded text-[10px] font-mono" style={{ background: 'var(--surface3)', border: '1px solid var(--border2)', color: 'var(--text3)' }}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto py-2" style={{ scrollbarWidth: 'thin' }}>
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text3)' }}>
              <Sparkles size={24} className="mx-auto mb-2 opacity-50" />
              Sonuc bulunamadi
            </div>
          )}
          {filtered.map((cmd, i) => {
            const Icon = cmd.icon;
            const isSelected = i === selectedIdx;
            return (
              <button
                key={cmd.id}
                onClick={cmd.action}
                onMouseEnter={() => setSelectedIdx(i)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all"
                style={{
                  background: isSelected ? 'var(--surface2)' : 'transparent',
                  borderLeft: isSelected ? '3px solid var(--accent)' : '3px solid transparent',
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--surface3)', border: '1px solid var(--border2)' }}
                >
                  <Icon size={14} style={{ color: isSelected ? 'var(--accent)' : 'var(--text2)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm" style={{ color: isSelected ? 'var(--text)' : 'var(--text2)' }}>{cmd.title}</div>
                  <div className="text-[11px]" style={{ color: 'var(--text3)' }}>{cmd.subtitle}</div>
                </div>
                {cmd.shortcut && (
                  <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono flex-shrink-0" style={{ background: 'var(--surface3)', border: '1px solid var(--border2)', color: 'var(--text3)' }}>
                    {cmd.shortcut}
                  </kbd>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 text-[10px]" style={{ color: 'var(--text3)', borderTop: '1px solid var(--border)', background: 'var(--surface2)' }}>
          <span>↑↓ sec</span>
          <span>Enter ac</span>
          <span>ESC kapat</span>
        </div>
      </motion.div>
    </div>
  );
}
