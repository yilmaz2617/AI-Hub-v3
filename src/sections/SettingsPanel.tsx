import { useSettingsStore } from '@/store/settingsStore';
import { useAppStore } from '@/store/appStore';
import { useChatStore } from '@/store/chatStore';
import { useThemeStore } from '@/store/themeStore';
import { downloadFile } from '@/lib/utils';
import {
  Volume2, VolumeX, Type, Gauge, Zap, Palette,
  Download, Upload, Trash2, X, Keyboard, Code
} from 'lucide-react';

interface SettingsPanelProps {
  onClose: () => void;
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const settings = useSettingsStore();
  const { addToast } = useAppStore();
  const { sessions } = useChatStore();
  // Theme info available if needed
  useThemeStore();

  const handleExportChats = () => {
    const data = JSON.stringify(sessions, null, 2);
    downloadFile(data, `aihub-chats-${Date.now()}.json`, 'application/json');
    addToast('Sohbetler dışa aktarıldı!', 'success');
  };

  const handleImportChats = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (Array.isArray(data)) {
            localStorage.setItem('aihub_chats', JSON.stringify(data));
            addToast('Sohbetler içe aktarıldı! Sayfayı yenileyin.', 'success');
          } else {
            throw new Error('Geçersiz format');
          }
        } catch {
          addToast('İçe aktarma hatası!', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearAll = () => {
    if (!confirm('Tüm veriler (sohbetler, ayarlar, API key\'leri) silinecek. Emin misin?')) return;
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('aihub_')) localStorage.removeItem(key);
    });
    addToast('Tüm veriler temizlendi! Sayfayı yenileyin.', 'success');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-lg max-h-[80vh] rounded-2xl overflow-hidden flex flex-col"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <Code size={18} style={{ color: 'var(--accent)' }} />
            <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Ayarlar</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--surface2)] transition-colors" style={{ color: 'var(--text3)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5" style={{ scrollbarWidth: 'thin' }}>
          {/* Sound */}
          <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              {settings.soundEnabled ? <Volume2 size={16} style={{ color: 'var(--green)' }} /> : <VolumeX size={16} style={{ color: 'var(--text3)' }} />}
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Ses Bildirimleri</span>
              <button
                onClick={settings.toggleSound}
                className="ml-auto w-10 h-5 rounded-full relative transition-colors"
                style={{ background: settings.soundEnabled ? 'var(--green)' : 'var(--border2)' }}
              >
                <div
                  className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                  style={{
                    background: '#fff',
                    left: settings.soundEnabled ? '22px' : '2px',
                  }}
                />
              </button>
            </div>
            <p className="text-[11px]" style={{ color: 'var(--text3)' }}>AI yanıtı geldiğinde sesli bildirim çal</p>
          </div>

          {/* Animations */}
          <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <Zap size={16} style={{ color: settings.animationsEnabled ? 'var(--yellow)' : 'var(--text3)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Animasyonlar</span>
              <button
                onClick={settings.toggleAnimations}
                className="ml-auto w-10 h-5 rounded-full relative transition-colors"
                style={{ background: settings.animationsEnabled ? 'var(--yellow)' : 'var(--border2)' }}
              >
                <div className="absolute top-0.5 w-4 h-4 rounded-full transition-all bg-white" style={{ left: settings.animationsEnabled ? '22px' : '2px' }} />
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <Type size={16} style={{ color: 'var(--accent)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Font Boyutu</span>
              <span className="ml-auto text-xs" style={{ color: 'var(--text3)' }}>{settings.fontSize}px</span>
            </div>
            <input
              type="range"
              min={11}
              max={18}
              value={settings.fontSize}
              onChange={e => settings.setFontSize(parseInt(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </div>

          {/* Stream Speed */}
          <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <Gauge size={16} style={{ color: 'var(--purple)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Yazma Hızı</span>
              <span className="ml-auto text-xs" style={{ color: 'var(--text3)' }}>
                {settings.streamSpeed < 10 ? 'Hızlı' : settings.streamSpeed < 20 ? 'Normal' : 'Yavaş'}
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={40}
              value={settings.streamSpeed}
              onChange={e => settings.setStreamSpeed(parseInt(e.target.value))}
              className="w-full accent-[var(--purple)]"
            />
          </div>

          {/* Keyboard Shortcuts */}
          <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Keyboard size={16} style={{ color: 'var(--accent)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Klavye Kısayolları</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                ['Ctrl + 1', 'Sohbet paneli'],
                ['Ctrl + 2', 'Premium panel'],
                ['Ctrl + 3', 'Görsel panel'],
                ['Ctrl + 4', 'API Durumu'],
                ['Ctrl + 5', 'Geliştir panel'],
                ['Ctrl + B', 'Sidebar aç/kapat'],
                ['Ctrl + T', 'Tema değiştir'],
                ['Enter', 'Mesaj gönder'],
                ['Shift + Enter', 'Yeni satır'],
                ['Escape', 'İptal / Kapat'],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ background: 'var(--surface3)', border: '1px solid var(--border2)', color: 'var(--accent)' }}>
                    {key}
                  </kbd>
                  <span style={{ color: 'var(--text2)' }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Data Management */}
          <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <Palette size={16} style={{ color: 'var(--orange)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Veri Yönetimi</span>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleExportChats}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all"
                style={{ background: 'var(--surface3)', border: '1px solid var(--border2)', color: 'var(--green)' }}
              >
                <Download size={12} /> Sohbetleri Dışa Aktar (JSON)
              </button>
              <button
                onClick={handleImportChats}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all"
                style={{ background: 'var(--surface3)', border: '1px solid var(--border2)', color: 'var(--accent)' }}
              >
                <Upload size={12} /> Sohbetleri İçe Aktar
              </button>
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all"
                style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', color: 'var(--red)' }}
              >
                <Trash2 size={12} /> Tüm Verileri Temizle
              </button>
            </div>
          </div>

          {/* Version */}
          <div className="text-center text-[10px]" style={{ color: 'var(--text3)' }}>
            AI Hub v3.0.0 · React 19 + TypeScript
          </div>
        </div>
      </div>
    </div>
  );
}
