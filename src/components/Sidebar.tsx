import { useAppStore } from '@/store/appStore';
import { useThemeStore } from '@/store/themeStore';
import { useChatStore } from '@/store/chatStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Crown, Image, Wifi, Zap,
  ChevronLeft, ChevronRight, Plus, Trash2,
  Keyboard, Brain, ArrowRightLeft
} from 'lucide-react';
import { useEffect } from 'react';
import type { PanelId } from '@/types';
import ThemeSwitcher from './ThemeSwitcher';

const PANELS: { id: PanelId; label: string; icon: typeof MessageSquare; shortcut: string }[] = [
  { id: 'chat', label: 'Sohbet', icon: MessageSquare, shortcut: '1' },
  { id: 'premium', label: 'Premium', icon: Crown, shortcut: '2' },
  { id: 'image', label: 'Görsel', icon: Image, shortcut: '3' },
  { id: 'status', label: 'API Durumu', icon: Wifi, shortcut: '4' },
  { id: 'improve', label: 'Geliştir', icon: Zap, shortcut: '5' },
  { id: 'research', label: 'Deep Research', icon: Brain, shortcut: '6' },
  { id: 'compare', label: 'Karşılaştır', icon: ArrowRightLeft, shortcut: '7' },
];

export default function Sidebar() {
  const { activePanel, setPanel, isSidebarOpen, toggleSidebar } = useAppStore();
  const applyTheme = useThemeStore(s => s.applyTheme);
  const { sessions, activeSessionId, createSession, deleteSession, setActiveSession } = useChatStore();

  useEffect(() => { applyTheme(); }, [applyTheme]);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarOpen ? 260 : 56 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="flex-shrink-0 flex flex-col h-full overflow-hidden relative"
      style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
    >
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-4 z-10 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-colors hover:scale-110"
        style={{ background: 'var(--accent)', color: '#fff' }}
      >
        {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent)' }}>
          <Zap size={16} style={{ color: '#fff' }} />
        </div>
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 overflow-hidden"
            >
              <span className="font-bold text-sm whitespace-nowrap" style={{ color: 'var(--text)' }}>AI HUB</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap" style={{ background: 'var(--surface2)', color: 'var(--accent)', border: '1px solid var(--border)' }}>v3</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex flex-col gap-0.5 p-2">
        {PANELS.map(p => {
          const Icon = p.icon;
          const isActive = activePanel === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setPanel(p.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative group"
              style={{
                background: isActive ? 'var(--surface2)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text2)',
                border: isActive ? '1px solid var(--border2)' : '1px solid transparent',
              }}
              title={!isSidebarOpen ? p.label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex-1 text-left whitespace-nowrap overflow-hidden"
                  >
                    {p.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isSidebarOpen && isActive && (
                <motion.div
                  layoutId="activePanel"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                  style={{ background: 'var(--accent)' }}
                />
              )}
            </button>
          );
        })}
      </nav>

      <AnimatePresence>
        {isSidebarOpen && activePanel === 'chat' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-hidden flex flex-col min-h-0"
          >
            <div className="px-3 py-2 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
              <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text3)' }}>
                Sohbetler
              </span>
              <button
                onClick={createSession}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors hover:bg-[var(--surface2)]"
                style={{ color: 'var(--accent)' }}
              >
                <Plus size={12} /> Yeni
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5" style={{ scrollbarWidth: 'thin' }}>
              {sessions.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSession(s.id)}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all group flex items-center gap-2"
                  style={{
                    background: s.id === activeSessionId ? 'var(--surface2)' : 'transparent',
                    color: s.id === activeSessionId ? 'var(--text)' : 'var(--text2)',
                    border: s.id === activeSessionId ? '1px solid var(--border2)' : '1px solid transparent',
                  }}
                >
                  <MessageSquare size={12} className="flex-shrink-0 opacity-50" />
                  <span className="flex-1 truncate">{s.title}</span>
                  <Trash2
                    size={10}
                    className="opacity-0 group-hover:opacity-50 hover:!opacity-100 flex-shrink-0 transition-opacity"
                    onClick={e => { e.stopPropagation(); deleteSession(s.id); }}
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-auto p-2 flex items-center gap-2" style={{ borderTop: '1px solid var(--border)' }}>
        <ThemeSwitcher />
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 text-[10px]"
              style={{ color: 'var(--text3)' }}
            >
              <Keyboard size={10} />
              <span>Ctrl+1-6</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}