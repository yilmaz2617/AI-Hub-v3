import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../store/appStore';

describe('appStore', () => {
  beforeEach(() => {
    useAppStore.setState({
      activePanel: 'chat',
      isSidebarOpen: true,
      toasts: [],
      apiKeys: {},
      backups: [],
      isTranslating: false,
    });
  });

  it('panel degistirir', () => {
    useAppStore.getState().setPanel('image');
    expect(useAppStore.getState().activePanel).toBe('image');
  });

  it('sidebar toggle', () => {
    const before = useAppStore.getState().isSidebarOpen;
    useAppStore.getState().toggleSidebar();
    expect(useAppStore.getState().isSidebarOpen).toBe(!before);
  });
});
