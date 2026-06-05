export const bundleConfig = {
  manualChunks: {
    'vendor-react': ['react', 'react-dom'],
    'vendor-ui': ['tailwind-merge', 'clsx'],
    'vendor-state': ['zustand'],
    'vendor-utils': ['lodash-es', 'date-fns', 'uuid'],
    'panels-chat': ['./src/components/panels/ChatPanel'],
    'panels-improve': ['./src/components/panels/ImprovePanel'],
    'panels-sync': ['./src/components/panels/SyncPanel'],
    'panels-version': ['./src/components/panels/VersionPanel'],
    'panels-deep-research': ['./src/components/panels/DeepResearchPanel'],
    'panels-image-gen': ['./src/components/panels/ImageGenPanel'],
    'panels-api-status': ['./src/components/panels/ApiStatusPanel'],
    'panels-settings': ['./src/components/panels/SettingsPanel'],
  },
};
