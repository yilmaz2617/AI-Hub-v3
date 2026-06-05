import React, { useEffect, Suspense } from 'react';
import { useAppStore } from './store/appStore';
import { useRealtime } from './hooks/useRealtime';
import { lazyComponents, withSuspense } from './performance/lazyComponents';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { Sidebar } from './components/Sidebar';

// Lazy panel wrappers
const ChatPanel = withSuspense(lazyComponents.ChatPanel);
const ImprovePanel = withSuspense(lazyComponents.ImprovePanel);
const SyncPanel = withSuspense(lazyComponents.SyncPanel);
const VersionPanel = withSuspense(lazyComponents.VersionPanel);
const DeepResearchPanel = withSuspense(lazyComponents.DeepResearchPanel);
const ImageGenPanel = withSuspense(lazyComponents.ImageGenPanel);
const ApiStatusPanel = withSuspense(lazyComponents.ApiStatusPanel);
const SettingsPanel = withSuspense(lazyComponents.SettingsPanel);
const ResearchImproveHub = withSuspense(
  React.lazy(() => import('./components/panels/ResearchImproveHub'))
);

const panelMap: Record<string, React.ComponentType> = {
  'research-hub': ResearchImproveHub,
  chat: ChatPanel,
  improve: ImprovePanel,
  sync: SyncPanel,
  versions: VersionPanel,
  'deep-research': DeepResearchPanel,
  'image-gen': ImageGenPanel,
  'api-status': ApiStatusPanel,
  settings: SettingsPanel,
};

function App() {
  const activePanel = useAppStore((state) => state.activePanel || 'chat');

  // Realtime sync başlat
  useRealtime();

  // Service Worker kaydet
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/syncWorker.js')
        .then((_reg) => {  })
        .catch((_err) => {  });
    }
  }, []);

  // Preload yakın panel'ler
  useEffect(() => {
    const preloadMap: Record<string, () => void> = {
      chat: () => { import('./components/panels/ImprovePanel'); },
      improve: () => { import('./components/panels/ChatPanel'); import('./components/panels/SyncPanel'); },
      sync: () => { import('./components/panels/VersionPanel'); },
    };
    preloadMap[activePanel]?.();
  }, [activePanel]);

  const ActiveComponent = panelMap[activePanel] || ChatPanel;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Suspense fallback={<LoadingSpinner />}>
          <ActiveComponent />
        </Suspense>
      </main>
    </div>
  );
}

export default App;








