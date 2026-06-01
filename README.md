AI Hub v3

React + TypeScript + Vite + Tailwind + Zustand dashboard.

## Kurulum
npm install
npm run dev

## Test
npm test -- --run
npm run lint

## Obsidian Notları
Proje kararları ve hata kayıtları:

### Karar Günlüğü
- Deep Research Paneli: ❌ Sahte/simülasyon (Plan sunulmadan kod yazıldı)
- ImprovePanel: ✅ Groq + Gemini entegre (Kaliteli, ücretsiz tier)
- GitHub Repo: ✅ Aktif

### Hata Kaydı
- Sidebar Brain Import: Regex yanlış çalıştı, tam dosya yeniden yazıldı
- ImprovePanel apiKeys: useAppStore() vs getState() karıştı, getState() ile düzeltildi

### Teknolojiler
- React + TypeScript + Vite + Tailwind + Zustand
- Lint: 0 error
- Test: 4/4 PASS
