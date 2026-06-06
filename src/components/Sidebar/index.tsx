import React, { memo } from 'react';
import { useAppStore } from '../../store/appStore';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
}

const menuItems: MenuItem[] = [
  { id: 'chat', label: 'Chat', icon: '💬' },
  { id: 'research-hub', label: 'Research & Improve', icon: '🔬' },
  { id: 'image-gen', label: 'Image Gen', icon: '🎨' },
  { id: 'api-status', label: 'API Status', icon: '📊' },
  { id: 'sync', label: 'Sync', icon: '🔄' },
  { id: 'versions', label: 'Versiyonlar', icon: '📜' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export const Sidebar: React.FC = memo(() => {
  const { activePanel, setActivePanel } = useAppStore();

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Hub v3</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Research & Improve Hub</p>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActivePanel(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activePanel === item.id
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
            {item.id === 'sync' && (
              <span className="ml-auto w-2 h-2 bg-green-500 rounded-full" title="Sync active" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>v3.1.0</p>
          <p className="mt-1">Research & Improve Hub</p>
          <p>Test: PASS</p>
        </div>
      </div>
    </aside>
  );
});

export default Sidebar;
