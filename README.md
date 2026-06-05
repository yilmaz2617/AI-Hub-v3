# AI Hub v3

React + TypeScript + Vite + Tailwind + Zustand dashboard.

## 🆕 v3.1.0 - Sync & Performance

### Sync Sistemi
- ✅ Auto-sync (2s debounce)
- ✅ Cross-tab realtime (BroadcastChannel)
- ✅ GitHub Gist backup
- ✅ Conflict resolution (LWW)
- ✅ Versioning (snapshot + rollback + diff)
- ✅ Offline queue
- ✅ Service Worker background sync

### Performance
- ✅ Route-based code splitting
- ✅ React.memo + useMemo/useCallback
- ✅ Virtual scrolling
- ✅ Bundle optimization (manual chunks)
- ✅ Terser minification

## Kurulum

```bash
npm install
npm run dev
```

## Test

```bash
npm test -- --run
npm run lint
```

## Obsidian Notları

Proje kararları ve hata kayıtları: `D:\AI_Data\Obsidian\AI_Hub_v3\`

### Karar Günlüğü

- Deep Research Paneli: ❌ Sahte/simülasyon
- ImprovePanel: ✅ Groq + Gemini entegre
- GitHub Repo: ✅ Aktif
- **Sync Sistemi: ✅ Auto-sync + Cross-tab + Gist + Versioning**
- **Performance: ✅ Lazy loading + Memoization + Bundle optimization**

### Hata Kaydı

- Sidebar Brain Import: Regex yanlış çalıştı, tam dosya yeniden yazıldı
- ImprovePanel apiKeys: useAppStore() vs getState() karıştı, getState() ile düzeltildi

### Teknolojiler

- React + TypeScript + Vite + Tailwind + Zustand
- **lodash-es + date-fns + uuid** (yeni)
- Lint: 0 error
- Test: **14/14 PASS** (10 yeni)
