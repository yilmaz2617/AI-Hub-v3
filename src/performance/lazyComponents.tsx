import { lazy } from 'react';

export const ChatPanel = lazy(() => import('../components/panels/ChatPanel'));
export const ResearchImproveHub = lazy(() => import('../components/panels/ResearchImproveHub'));
export const ImageGenPanel = lazy(() => import('../components/panels/ImageGenPanel'));
export const ApiStatusPanel = lazy(() => import('../components/panels/ApiStatusPanel'));
export const SyncPanel = lazy(() => import('../components/panels/SyncPanel'));
export const VersionPanel = lazy(() => import('../components/panels/VersionPanel'));
export const SettingsPanel = lazy(() => import('../components/panels/SettingsPanel'));
