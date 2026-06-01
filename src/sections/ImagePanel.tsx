import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { callPollinations, translateText } from '@/lib/api';
import { generateImageUrl } from '@/lib/api';
import { IMAGE_MODELS, IMAGE_SIZES } from '@/lib/constants';
import { uid } from '@/lib/utils';
import type { GeneratedImage } from '@/types';
import {
  ImageIcon, Loader2, Download, Wand2, Languages,
  Sparkles, Dices, ShieldOff, Trash2, ChevronDown
} from 'lucide-react';

export default function ImagePanel() {
  const { addToast } = useAppStore();
  const [prompt, setPrompt] = useState('');
  const [negative, setNegative] = useState('');
  const [model, setModel] = useState('flux-realism');
  const [size, setSize] = useState('1024x1024');
  const [seed, setSeed] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>(() => {
    try {
      const stored = localStorage.getItem('aihub_images');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [variants, setVariants] = useState<string[]>([]);
  const [showVariants, setShowVariants] = useState(false);
  const [promptStatus, setPromptStatus] = useState('');
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const saveImages = (imgs: GeneratedImage[]) => {
    setImages(imgs);
    try { localStorage.setItem('aihub_images', JSON.stringify(imgs)); } catch { /* ignore */ }
  };

  const setStatus = (msg: string, duration = 3000) => {
    setPromptStatus(msg);
    if (duration) setTimeout(() => setPromptStatus(''), duration);
  };

  const handleTranslate = async () => {
    if (!prompt.trim()) { addToast('Prompt boş!', 'warning'); return; }
    setActiveTool('translate');
    setStatus('🌐 Çevriliyor...', 0);
    try {
      const result = await translateText(prompt, 'en');
      setPrompt(result);
      setStatus('✓ İngilizceye çevrildi', 3000);
      addToast('Prompt çevrildi!', 'success');
    } catch (e: unknown) {
      setStatus('Hata: ' + (e as Error).message, 3000);
      addToast('Çeviri hatası', 'error');
    }
    setActiveTool(null);
  };

  const handleEnhance = async () => {
    if (!prompt.trim()) { addToast('Prompt boş!', 'warning'); return; }
    setActiveTool('enhance');
    setStatus('✨ Güçlendiriliyor...', 0);
    try {
      const result = await callPollinations(
        'You are a Stable Diffusion prompt engineer. Enhance the prompt with artistic style, lighting, camera info, mood, texture, quality tags. Output ONLY the enhanced prompt. Max 150 words.',
        prompt
      );
      setPrompt(result);
      setStatus('✓ Prompt güçlendirildi', 3000);
      addToast('Prompt güçlendirildi!', 'success');
    } catch (e: unknown) {
      setStatus('Hata: ' + (e as Error).message, 3000);
    }
    setActiveTool(null);
  };

  const handleVariants = async () => {
    if (!prompt.trim()) { addToast('Prompt boş!', 'warning'); return; }
    setActiveTool('variants');
    setStatus('🎲 Varyantlar üretiliyor...', 0);
    try {
      const result = await callPollinations(
        'Generate exactly 3 different English prompt variants. Return ONLY valid JSON: {"variants":["prompt1","prompt2","prompt3"]}',
        prompt
      );
      const match = result.match(/\{[\s\S]*\}/);
      const j = JSON.parse(match ? match[0] : result);
      setVariants(j.variants || []);
      setShowVariants(true);
      setStatus('✓ 3 varyant hazır', 3000);
    } catch (e: unknown) {
      setStatus('Hata: ' + (e as Error).message, 3000);
    }
    setActiveTool(null);
  };

  const handleNegative = async () => {
    if (!prompt.trim()) { addToast('Önce prompt yaz!', 'warning'); return; }
    setActiveTool('negative');
    setStatus('⛔ Negatif prompt üretiliyor...', 0);
    try {
      const result = await callPollinations(
        'Generate a negative prompt for Stable Diffusion. Return ONLY comma-separated terms. No explanations.',
        prompt
      );
      setNegative(result);
      setStatus('✓ Negatif prompt oluşturuldu', 3000);
      addToast('Negatif prompt oluşturuldu!', 'success');
    } catch (e: unknown) {
      setStatus('Hata: ' + (e as Error).message, 3000);
    }
    setActiveTool(null);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) { addToast('Prompt gir!', 'warning'); return; }
    setIsGenerating(true);
    setShowVariants(false);
    const [w, h] = size.split('x').map(Number);
    const s = seed ? parseInt(seed) : Math.floor(Math.random() * 99999);

    const img: GeneratedImage = {
      id: uid(),
      url: '',
      prompt,
      model,
      size,
      seed: s,
      negative,
      createdAt: Date.now(),
    };
    const updated = [img, ...images];
    saveImages(updated);

    try {
      const url = generateImageUrl(prompt, model, s, w, h, negative);
      // Önizleme olarak URL'yi ayarla, yüklendiğinde güncelle
      const finalImg = { ...img, url };
      const finalUpdated = [finalImg, ...images];
      saveImages(finalUpdated);
      addToast('Görsel üretildi!', 'success');
    } catch (e: unknown) {
      addToast('Hata: ' + (e as Error).message, 'error');
    }
    setIsGenerating(false);
  };

  const handleDownload = (url: string, id: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `aihub-${id}.jpg`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    addToast('İndirme başladı!', 'success');
  };

  const handleDelete = (id: string) => {
    saveImages(images.filter(i => i.id !== id));
    addToast('Görsel silindi', 'info');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <ImageIcon size={16} style={{ color: 'var(--purple)' }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Görsel Üretimi</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--surface2)', color: 'var(--text3)', border: '1px solid var(--border)' }}>
          {images.length} görsel
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: 'thin' }}>
        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Prompt Box */}
          <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text3)' }}>Prompt</div>

            {/* Toolbar */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleTranslate}
                disabled={!!activeTool}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] transition-all disabled:opacity-40 hover:bg-[var(--surface2)]"
                style={{ border: '1px solid var(--border2)', color: activeTool === 'translate' ? 'var(--green)' : 'var(--text2)' }}
              >
                {activeTool === 'translate' ? <Loader2 size={12} className="animate-spin" /> : <Languages size={12} />}
                TR→EN
              </button>
              <button
                onClick={handleEnhance}
                disabled={!!activeTool}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] transition-all disabled:opacity-40 hover:bg-[var(--surface2)]"
                style={{ border: '1px solid var(--border2)', color: activeTool === 'enhance' ? 'var(--purple)' : 'var(--text2)' }}
              >
                {activeTool === 'enhance' ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                Güçlendir
              </button>
              <button
                onClick={handleVariants}
                disabled={!!activeTool}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] transition-all disabled:opacity-40 hover:bg-[var(--surface2)]"
                style={{ border: '1px solid var(--border2)', color: activeTool === 'variants' ? 'var(--yellow)' : 'var(--text2)' }}
              >
                {activeTool === 'variants' ? <Loader2 size={12} className="animate-spin" /> : <Dices size={12} />}
                Varyant
              </button>
              <button
                onClick={handleNegative}
                disabled={!!activeTool}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] transition-all disabled:opacity-40 hover:bg-[var(--surface2)]"
                style={{ border: '1px solid var(--border2)', color: activeTool === 'negative' ? 'var(--red)' : 'var(--text2)' }}
              >
                {activeTool === 'negative' ? <Loader2 size={12} className="animate-spin" /> : <ShieldOff size={12} />}
                Negatif
              </button>
            </div>

            {/* Status */}
            {promptStatus && (
              <div className="text-[11px] px-2 py-1 rounded" style={{ color: promptStatus.startsWith('✓') ? 'var(--green)' : promptStatus.startsWith('Hata') ? 'var(--red)' : 'var(--accent)' }}>
                {promptStatus}
              </div>
            )}

            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Türkçe veya İngilizce yazın..."
              rows={4}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none transition-colors focus:border-[var(--accent)]"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', lineHeight: '1.6' }}
            />

            {/* Variants */}
            {showVariants && variants.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {variants.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => { setPrompt(v); setShowVariants(false); }}
                    className="text-left px-3 py-2 rounded-lg text-[11px] transition-all hover:border-[var(--accent)] flex gap-2 items-start"
                    style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text2)' }}
                  >
                    <span style={{ color: 'var(--accent)' }}>V{i + 1}</span>
                    <span>{v}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Negative Prompt */}
            <div>
              <div className="text-[10px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--text3)' }}>Negatif Prompt</div>
              <textarea
                value={negative}
                onChange={e => setNegative(e.target.value)}
                placeholder="blurry, low quality, ugly, distorted..."
                rows={2}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none transition-colors focus:border-[var(--accent)]"
                style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', lineHeight: '1.6' }}
              />
            </div>
          </div>

          {/* Settings Box */}
          <div className="rounded-xl p-4 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div>
              <div className="text-[10px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--text3)' }}>Model</div>
              <div className="relative">
                <select
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-xs appearance-none cursor-pointer outline-none"
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                >
                  <optgroup label="── Pollinations (Ücretsiz) ──">
                    {IMAGE_MODELS.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </optgroup>
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text3)' }} />
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--text3)' }}>Boyut</div>
              <div className="relative">
                <select
                  value={size}
                  onChange={e => setSize(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-xs appearance-none cursor-pointer outline-none"
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                >
                  {IMAGE_SIZES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text3)' }} />
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--text3)' }}>Seed (Boş = Rastgele)</div>
              <input
                type="number"
                value={seed}
                onChange={e => setSeed(e.target.value)}
                placeholder="örn: 42"
                className="w-full rounded-lg px-3 py-2 text-xs outline-none"
                style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,var(--accent),var(--purple))', color: '#fff' }}
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {isGenerating ? 'Üretiliyor...' : 'Görsel Üret'}
            </button>
          </div>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map(img => (
            <div key={img.id} className="rounded-xl overflow-hidden group relative" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              {img.url ? (
                <>
                  <img src={img.url} alt={img.prompt} className="w-full aspect-square object-cover" loading="lazy" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2" style={{ background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.8))' }}>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDownload(img.url, img.id)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ background: 'var(--surface2)', color: 'var(--accent)' }}
                        title="İndir"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(img.id)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ background: 'var(--surface2)', color: 'var(--red)' }}
                        title="Sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full aspect-square flex items-center justify-center">
                  <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
                </div>
              )}
              <div className="px-2 py-1.5 text-[10px] truncate" style={{ color: 'var(--text3)' }}>
                {img.model} · {img.size} · s:{img.seed}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
