import { useState } from 'react';
import { useThemeStore } from '@/store/themeStore';
import type { ThemeId } from '@/types';
import { THEMES } from '@/lib/constants';
import { Palette } from 'lucide-react';

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const themeId = useThemeStore(s => s.themeId);
  const setTheme = useThemeStore(s => s.setTheme);
  const current = THEMES.find(t => t.id === themeId);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:bg-[var(--surface2)] border border-transparent hover:border-[var(--border)]"
        style={{ color: 'var(--text2)' }}
        title="Tema Değiştir"
      >
        <Palette size={16} />
        <span className="hidden sm:inline">{current?.name || '🌙 Karanlık'}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1 z-50 rounded-lg shadow-xl overflow-hidden min-w-[180px]"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            {THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => { setTheme(theme.id as ThemeId); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm transition-colors hover:bg-[var(--surface2)] flex items-center gap-2"
                style={{
                  color: themeId === theme.id ? 'var(--accent)' : 'var(--text2)',
                  borderLeft: themeId === theme.id ? '3px solid var(--accent)' : '3px solid transparent',
                }}
              >
                {theme.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
