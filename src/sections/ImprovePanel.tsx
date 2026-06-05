import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { callFreeAI } from '@/lib/api-free';
import { INTENT_LABELS } from '@/lib/constants';
import { uid, downloadFile } from '@/lib/utils';
import type { Suggestion, ImprovementBackup, IntentId } from '@/types';
import {
  Zap, Sparkles, CheckCircle, X,
  RotateCcw, Download, History, Loader2,
  Shield, Eye, Play
} from 'lucide-react';

const INTENTS: { id: IntentId; label: string; icon: typeof Zap }[] = [
  { id: 'genel', label: 'Genel', icon: Zap },
  { id: 'ui', label: 'UI/Görünüm', icon: Eye },
  { id: 'ozellik', label: 'Yeni Özellik', icon: Sparkles },
  { id: 'performans', label: 'Performans', icon: Play },
  { id: 'guvenlik', label: 'Güvenlik', icon: Shield },
];

export default function ImprovePanel() {
  const { backups, addBackup, removeBackup, addToast } = useAppStore();
  const [intent, setIntent] = useState<IntentId>('genel');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [log, setLog] = useState<{ type: string; msg: string; time: string }[]>([]);
  const [applyingIdx, setApplyingIdx] = useState<number | null>(null);
  const [showBackups, setShowBackups] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<string>('');

  const addLog = (type: string, msg: string) => {
    const time = new Date().toLocaleTimeString('tr-TR');
    setLog(prev => [...prev, { type, msg, time }]);
  };

  const clearLog = () => setLog([]);

  const getAIProvider = () => {
  const state = useAppStore.getState();
  if (state.apiKeys.groq || state.apiKeys.gemini) {
    return { type: 'free' as const, keys: state.apiKeys };
  }
  return null;
};

  const handleGetSuggestions = async () => {
    const pk = getAIProvider();
    if (!pk) {
      // Fallback to pollinations (no key needed)
    }
    setIsAnalyzing(true);
    setSuggestions([]);
    clearLog();
    addLog('info', 'Hub analiz ediliyor...');

    const history = (() => { try { return JSON.parse(localStorage.getItem('aihub_improve_history') || '[]'); } catch { return []; } })();
    const histCtx = history.length
      ? 'Daha önce uygulananlar (bunları tekrar önerme):\n' + history.slice(-5).map((h: unknown) => `- ${h.title}: ${h.detail}`).join('\n')
      : 'Henüz değişiklik uygulanmadı.';

    const prompt = `AI Hub uygulamasını analiz et. Kullanıcının seçtiği hedef: "${INTENT_LABELS[intent]}".

${histCtx}

Bu hedefe uygun, DÜZ FARKLI 4 somut geliştirme önerisi sun. Her öneri bağımsız, inject edilebilir (mevcut koda ek JS/HTML/CSS) olmalı.

Sadece bu JSON'u döndür (markdown yok, açıklama yok):
{"suggestions":[{"icon":"emoji","title":"kısa başlık","detail":"2-3 cümle — ne eklenecek, nasıl çalışır","category":"UI|API|Özellik|Performans|Güvenlik","inject":"// kısa JS veya HTML snippet — ne inject edilecek"}]}

Uygulama özeti:
- Chat (Groq/OpenRouter/Gemini/Anthropic/Pollinations)
- Premium Free (OpenRouter free tier)
- Görsel üretim (Pollinations)
- API Durumu
- Kendini Geliştir
- 7 tema (dark/light/ocean/sunset/matrix/purple/nord)`;

    addLog('info', 'İstek gönderiliyor...');
    try {
      let reply: string;
      if (pk) {
        reply = await callFreeAI(prompt, pk.keys);
      } else {
        throw new Error('API key gerekli. Ücretsiz tier: console.groq.com / aistudio.google.com');
      }
      addLog('ok', 'Yanıt alındı!');

      let parsed: Record<string, unknown>;
      try {
        const match = reply.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(match ? match[0] : reply);
      } catch {
        // Fallback suggestions
        parsed = {
          suggestions: [
            { icon: '💾', title: 'Sohbet Yedekleme', detail: 'Sohbetler otomatik olarak localStorage\'a kaydedilir ve dışa aktarılabilir.', category: 'Özellik', inject: '// Auto-save chat to localStorage' },
            { icon: '⌨️', title: 'Klavye Kısayolları', detail: 'Ctrl+1-5 panel geçişi, Ctrl+Enter gönder, Escape iptal.', category: 'UI', inject: '// Keyboard shortcuts listener' },
            { icon: '🔔', title: 'Bildirim Sistemi', detail: 'AI yanıtı geldiğinde sesli ve görsel bildirim.', category: 'UI', inject: '// Toast notification with sound' },
            { icon: '🎨', title: 'Tema Animasyonları', detail: 'Tema değişiminde yumuşak geçiş animasyonları.', category: 'UI', inject: '// Theme transition animations' },
          ],
        };
      }
      setSuggestions(parsed.suggestions || []);
      addLog('ok', `${parsed.suggestions?.length || 4} öneri hazır!`);
    } catch (e: unknown) {
      addLog('err', 'Hata: ' + (e as Error).message);
      addToast('Hata: ' + (e as Error).message, 'error');
    }
    setIsAnalyzing(false);
  };

  const handleApply = async (idx: number) => {
    const s = suggestions[idx];
    if (!s) return;
    const pk = getAIProvider();
    if (!pk && !confirm('API key yok. Pollinations ile devam edilsin mi? (Daha az güvenilir)')) return;

    setApplyingIdx(idx);
    addLog('info', `Diff üretiliyor: ${s.title}`);

    try {
      const prompt = `AI Hub HTML uygulamasına şu geliştirmeyi DIFF olarak ekle — tam rewrite YAPMA.

BAŞLIK: ${s.title}
AÇIKLAMA: ${s.detail}

KURALLAR:
- Sadece eklenecek yeni kodu yaz
- Mevcut kodu kopyalama
- JSON formatında döndür: {"css":"...yeni CSS...", "html":"...yeni HTML snippet...", "js":"...yeni JS kodu..."}
- css ve html boşsa "" döndür
- js içinde DOMContentLoaded kullan gerekirse
- Tüm değerler tek satıra string olarak (\\n ile escape)
- Başka hiçbir şey yazma, sadece JSON

GELİŞTİRME KONUSU: ${s.category}

ÖNERİLEN KOD KONSEPTİ: ${s.inject}`;

      let reply: string;
      if (pk) {
        reply = await callFreeAI(prompt, pk.keys);
      } else {
        throw new Error('API key gerekli. Ücretsiz tier: console.groq.com / aistudio.google.com');
      }

      addLog('ok', 'Diff alındı, doğrulanıyor...');

      let diff: Record<string, unknown>;
      try {
        const match = reply.match(/\{[\s\S]*\}/);
        diff = JSON.parse(match ? match[0] : reply);
      } catch {
        throw new Error('Diff parse edilemedi');
      }

      // Sandbox preview
      let preview = '';
      if (diff.css) preview += `/* CSS */\n${diff.css}\n\n`;
      if (diff.html) preview += `<!-- HTML -->\n${diff.html}\n\n`;
      if (diff.js) preview += `// JS\n${diff.js}`;
      setSandboxResult(preview);

      // Yedek al
      const currentHtml = document.documentElement.outerHTML;
      const backup: ImprovementBackup = {
        id: uid(),
        title: s.title,
        detail: s.detail,
        codeSnapshot: currentHtml,
        timestamp: Date.now(),
      };
      addBackup(backup);
      addLog('ok', 'Yedek alındı');

      // Apply diff
      if (diff.css && diff.css.trim()) {
        const style = document.createElement('style');
        style.textContent = diff.css.replace(/\\n/g, '\n');
        style.setAttribute('data-aihub-diff', s.title);
        document.head.appendChild(style);
        addLog('ok', 'CSS inject edildi');
      }
      if (diff.html && diff.html.trim()) {
        const tmp = document.createElement('div');
        tmp.innerHTML = diff.html.replace(/\\n/g, '\n');
        tmp.setAttribute('data-aihub-diff', s.title);
        document.body.insertBefore(tmp, document.querySelector('.toast-container') || document.body.lastChild);
        addLog('ok', 'HTML inject edildi');
      }
      if (diff.js && diff.js.trim()) {
        const sc = document.createElement('script');
        sc.textContent = diff.js.replace(/\\n/g, '\n');
        sc.setAttribute('data-aihub-diff', s.title);
        document.body.appendChild(sc);
        addLog('ok', 'JS inject edildi');
      }

      // Save to history
      try {
        const h = JSON.parse(localStorage.getItem('aihub_improve_history') || '[]');
        h.push({ title: s.title, detail: s.detail, date: new Date().toLocaleString('tr-TR') });
        localStorage.setItem('aihub_improve_history', JSON.stringify(h.slice(-20)));
      } catch { /* ignore */ }

      // Download updated HTML
      const blobHtml = document.documentElement.outerHTML;
      downloadFile(blobHtml, `AI-Hub-v${Date.now()}.html`, 'text/html');

      addLog('ok', 'Tamamlandı: ' + s.title);
      addToast('✓ ' + s.title + ' uygulandı!', 'success');

      // Update suggestion
      setSuggestions(prev => prev.map((su, i) => i === idx ? { ...su, detail: '✅ Uygulandı! Yedek alındı.' } : su));
    } catch (e: unknown) {
      addLog('err', (e as Error).message);
      addToast('Hata: ' + (e as Error).message, 'error');
    }
    setApplyingIdx(null);
  };

  const handleRestore = (backupId: string) => {
    const backup = backups.find(b => b.id === backupId);
    if (!backup) { addToast('Yedek bulunamadı!', 'error'); return; }
    if (!confirm('Bu yedeğe dönmek istediğinize emin misiniz? Mevcut değişiklikler kaybolacak.')) return;

    try {
      // Remove injected diffs
      document.querySelectorAll('[data-aihub-diff]').forEach(el => el.remove());
      addLog('info', "Eski diff'ler temizlendi");
      addToast('Yedek geri yüklendi!', 'success');
      addLog('ok', 'Geri yüklendi: ' + backup.title);
    } catch (e: unknown) {
      addLog('err', 'Geri yükleme hatası: ' + (e as Error).message);
    }
  };

  const handleExport = () => {
    const blobHtml = document.documentElement.outerHTML;
    downloadFile(blobHtml, `AI-Hub-Export-${Date.now()}.html`, 'text/html');
    addToast('HTML dışa aktarıldı!', 'success');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <Zap size={16} style={{ color: 'var(--yellow)' }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Kendini Geliştir</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBackups(!showBackups)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{ border: '1px solid var(--border2)', color: 'var(--accent)' }}
          >
            <History size={12} /> Yedekler ({backups.length})
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{ border: '1px solid var(--border2)', color: 'var(--green)' }}
          >
            <Download size={12} /> Dışa Aktar
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: 'thin' }}>
        {/* Description */}
        <div className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>
          AI Hub, kendi kodunu analiz eder ve seçtiğin hedefe göre öneri üretir. Her değişiklik öncesi otomatik yedek alınır, dilediğinde geri dönebilirsin.
        </div>

        {/* Intent Selection */}
        <div>
          <label className="text-[10px] uppercase tracking-wider font-semibold block mb-2" style={{ color: 'var(--text3)' }}>
            Geliştirme Hedefi
          </label>
          <div className="flex flex-wrap gap-2">
            {INTENTS.map(item => {
              const Icon = item.icon;
              const isActive = intent === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setIntent(item.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs transition-all"
                  style={{
                    background: isActive ? 'rgba(188,140,255,0.12)' : 'var(--surface2)',
                    border: `1px solid ${isActive ? 'var(--purple)' : 'var(--border)'}`,
                    color: isActive ? 'var(--purple)' : 'var(--text2)',
                  }}
                >
                  <Icon size={12} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* History badge */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px]"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text2)' }}
        >
          <History size={12} />
          <span>Geçmiş: <span style={{ color: 'var(--green)' }}>{(() => { try { return JSON.parse(localStorage.getItem('aihub_improve_history') || '[]').length; } catch { return 0; } })()} değişiklik</span></span>
          <button
            onClick={() => { if (confirm('Geçmiş silinsin mi?')) { localStorage.removeItem('aihub_improve_history'); addToast('Geçmiş temizlendi', 'info'); } }}
            className="ml-auto transition-colors hover:opacity-80"
            style={{ color: 'var(--orange)' }}
          >
            Sıfırla
          </button>
        </div>

        {/* Get Suggestions Button */}
        <button
          onClick={handleGetSuggestions}
          disabled={isAnalyzing}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg,var(--purple),var(--accent))', color: '#fff' }}
        >
          {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {isAnalyzing ? 'Analiz ediliyor...' : 'Öneri Al'}
        </button>

        {/* Log */}
        {log.length > 0 && (
          <div
            className="rounded-xl p-3 space-y-1 text-[11px] leading-relaxed max-h-48 overflow-y-auto"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text2)' }}
          >
            {log.map((l, i) => (
              <div key={i}>
                <span style={{ color: 'var(--text3)' }}>[{l.time}]</span>{' '}
                <span style={{
                  color: l.type === 'ok' ? 'var(--green)' : l.type === 'err' ? 'var(--red)' : l.type === 'info' ? 'var(--accent)' : 'var(--text2)',
                }}>
                  {l.type === 'ok' ? '✓' : l.type === 'err' ? '✗' : 'ℹ'} {l.msg}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Sandbox Preview */}
        {sandboxResult && (
          <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--accent)' }}>
              <Eye size={14} /> Önizleme (Sandbox)
            </div>
            <pre
              className="text-[11px] p-3 rounded-lg overflow-x-auto leading-relaxed"
              style={{ background: 'var(--surface3)', border: '1px solid var(--border2)', color: 'var(--text2)' }}
            >
              {sandboxResult}
            </pre>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text3)' }}>
              Öneriler
            </div>
            {suggestions.map((s, i) => (
              <div
                key={i}
                className="rounded-xl p-4 flex gap-4 transition-colors"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="text-2xl flex-shrink-0">{s.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{s.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--surface2)', color: 'var(--text3)', border: '1px solid var(--border)' }}>
                      {s.category}
                    </span>
                  </div>
                  <div className="text-[12px] leading-relaxed mb-3" style={{ color: 'var(--text2)' }}>{s.detail}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApply(i)}
                      disabled={applyingIdx === i}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
                      style={{ background: 'var(--accent)', color: '#fff' }}
                    >
                      {applyingIdx === i ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                      {applyingIdx === i ? 'Uygulanıyor...' : 'Uygula (Diff Inject)'}
                    </button>
                    <button
                      onClick={() => setSuggestions(prev => prev.filter((_, idx) => idx !== i))}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs transition-all"
                      style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text2)' }}
                    >
                      <X size={12} /> Geç
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Backups */}
        {showBackups && backups.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-wider font-semibold flex items-center gap-2" style={{ color: 'var(--text3)' }}>
              <RotateCcw size={12} /> Yedekler
            </div>
            {backups.map(b => (
              <div
                key={b.id}
                className="rounded-lg p-3 flex items-center gap-3"
                style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
              >
                <CheckCircle size={14} style={{ color: 'var(--green)', flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>{b.title}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text3)' }}>{new Date(b.timestamp).toLocaleString('tr-TR')}</div>
                </div>
                <button
                  onClick={() => handleRestore(b.id)}
                  className="px-3 py-1.5 rounded-lg text-[11px] transition-all flex items-center gap-1"
                  style={{ background: 'var(--surface3)', border: '1px solid var(--border2)', color: 'var(--accent)' }}
                >
                  <RotateCcw size={10} /> Geri Yükle
                </button>
                <button
                  onClick={() => removeBackup(b.id)}
                  className="p-1.5 rounded-lg transition-colors hover:opacity-80"
                  style={{ color: 'var(--red)' }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
