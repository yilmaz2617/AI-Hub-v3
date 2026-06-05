import { useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { useThemeStore } from '@/store/themeStore';
import { useChatStore } from '@/store/chatStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useUIStore } from '@/store/uiStore';
import { useHotkeys } from 'react-hotkeys-hook';
import Sidebar from '@/components/Sidebar';
import ToastContainer from '@/components/ToastContainer';
import CommandPalette from '@/components/CommandPalette';
import Onboarding from '@/components/Onboarding';
import ChatPanel from '@/sections/ChatPanel';
import PremiumPanel from '@/sections/PremiumPanel';
import ImagePanel from '@/sections/ImagePanel';
import StatusPanel from '@/sections/StatusPanel';
import ImprovePanel from '@/sections/ImprovePanel';
import ComparePanel from '@/sections/ComparePanel';
import ResearchPanel from '@/sections/ResearchPanel';

function App() {
  const { activePanel, setPanel, loadApiKeys, loadBackups, addToast } = useAppStore();
  const { isZenMode } = useUIStore();
  const applyTheme = useThemeStore(s => s.applyTheme);
  const loadSessions = useChatStore(s => s.loadSessions);
  const loadSettings = useSettingsStore(s => s.loadSettings);

  // Init
  useEffect(() => {
    applyTheme();
    loadSettings();
    loadApiKeys();
    loadSessions();
    loadBackups();
    addToast('AI Hub v3 baslatildi!', 'success');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcuts
  useHotkeys('ctrl+1', () => setPanel('chat'), { preventDefault: true });
  useHotkeys('ctrl+2', () => setPanel('premium'), { preventDefault: true });
  useHotkeys('ctrl+3', () => setPanel('image'), { preventDefault: true });
  useHotkeys('ctrl+4', () => setPanel('status'), { preventDefault: true });
  useHotkeys('ctrl+5', () => setPanel('improve'), { preventDefault: true });
  useHotkeys('ctrl+6', () => setPanel('research'), { preventDefault: true });
  useHotkeys('ctrl+7', () => setPanel('compare'), { preventDefault: true });
  useHotkeys('ctrl+b', () => useAppStore.getState().toggleSidebar(), { preventDefault: true });
  useHotkeys('ctrl+t', () => useThemeStore.getState().toggleTheme(), { preventDefault: true });

  const renderPanel = () => {
    switch (activePanel) {
      case 'chat': return <ChatPanel />;
      case 'premium': return <PremiumPanel />;
      case 'image': return <ImagePanel />;
      case 'status': return <StatusPanel />;
      case 'improve': return <ImprovePanel />;
      case 'research': return <ResearchPanel />;
      case 'compare': return <ComparePanel />;
      default: return <ChatPanel />;
    }
  };

  return (
    <div
      className={`h-screen w-screen flex overflow-hidden ${isZenMode ? 'zen-mode' : ''}`}
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      {!isZenMode && <Sidebar />}
      <main className={`flex-1 overflow-hidden relative ${isZenMode ? 'p-4' : ''}`}>
        {isZenMode && (
          <div
            className="absolute inset-0 z-0"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, var(--surface) 0%, var(--bg) 70%)',
              opacity: 0.5,
            }}
          />
        )}
        <div className="relative z-10 h-full">
          {renderPanel()}
        </div>
      </main>
      <ToastContainer />
      <CommandPalette />
      <Onboarding />
    </div>
  );
}

export default App;
