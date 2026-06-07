import { useState, useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/appStore';
import { callPremiumAPI } from '@/lib/api';
import { renderMarkdown, uid, copyToClipboard } from '@/lib/utils';
import { PREMIUM_MODELS, PREMIUM_INFO, DEFAULT_PREMIUM_SYSTEM } from '@/lib/constants';
import type { Message } from '@/types';
import { Send, Crown, Trash2, Copy, Check, User, Loader2, ChevronDown, Timer } from 'lucide-react';

export default function PremiumPanel() {
  const { apiKeys, addToast } = useAppStore();
  const [model, setModel] = useState(PREMIUM_MODELS[0].models[0].id);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_PREMIUM_SYSTEM);
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [queuePos, setQueuePos] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => scrollToBottom(), [history.length]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }, [input]);

  const simulateQueue = async () => {
    const pos = Math.floor(Math.random() * 5) + 1;
    for (let i = pos; i > 0; i--) {
      setQueuePos(i);
      await new Promise(r => setTimeout(r, 1500));
    }
    setQueuePos(0);
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const userMsg: Message = { id: uid(), role: 'user', content: text, timestamp: Date.now() };
    const updatedHistory = [...history, userMsg];
    setHistory(updatedHistory);

    setIsLoading(true);
    await simulateQueue();

    try {
      const reply = await callPremiumAPI(
        model,
        updatedHistory,
        systemPrompt,
        !!apiKeys.openrouter,
        apiKeys.openrouter
      );
      const aiMsg: Message = {
        id: uid(),
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      };
      setHistory([...updatedHistory, aiMsg]);
      addToast('Yanıt alındı!', 'success');
    } catch (e: unknown) {
      const errMsg = (e as Error).message?.includes('429')
        ? 'Rate limit aşıldı. Lütfen biraz bekleyin.'
        : (e as Error).message;
      const aiMsg: Message = {
        id: uid(),
        role: 'assistant',
        content: '❌ ' + errMsg,
        timestamp: Date.now(),
      };
      setHistory([...updatedHistory, aiMsg]);
      addToast('Hata: ' + errMsg, 'error');
    }
    setIsLoading(false);
  }, [input, isLoading, history, model, systemPrompt, apiKeys, addToast]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = async (content: string, id: string) => {
    await copyToClipboard(content);
    setCopiedId(id);
    addToast('Kopyalandı!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setHistory([]);
    addToast('Premium sohbet temizlendi', 'info');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <Crown size={16} style={{ color: 'var(--gold)' }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
            Premium Free
          </span>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full"
            style={{
              background: 'linear-gradient(135deg,var(--premium),var(--red))',
              color: '#fff',
            }}
          >
            S-Tier
          </span>
        </div>
        {queuePos > 0 && (
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--gold)' }}>
            <Timer size={12} className="animate-pulse" />
            <span>
              Sıra: {queuePos} (~{queuePos * 2}sn)
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Settings */}
        <div
          className="w-64 flex-shrink-0 overflow-y-auto p-3 flex flex-col gap-3"
          style={{ borderRight: '1px solid var(--border)', background: 'var(--surface)' }}
        >
          {/* Badge */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{
              background: 'linear-gradient(135deg,rgba(255,159,67,0.15),rgba(255,107,107,0.1))',
              border: '1px solid var(--premium)',
            }}
          >
            <Crown size={14} style={{ color: 'var(--premium)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--premium)' }}>
              PREMIUM FREE
            </span>
          </div>

          {/* Queue Info */}
          <div
            className="text-[11px] p-2.5 rounded-lg space-y-1"
            style={{
              background: 'var(--surface3)',
              border: '1px solid var(--border2)',
              color: 'var(--text2)',
            }}
          >
            <div>
              ⭐ <span style={{ color: 'var(--gold)', fontWeight: 600 }}>S-Tier</span> modeller
            </div>
            <div>
              ⏳ Sıra:{' '}
              <span id="queue-pos" style={{ color: 'var(--gold)' }}>
                {queuePos > 0 ? queuePos : '-'}
              </span>
            </div>
            <div>
              🕐 Tahmini:{' '}
              <span id="queue-eta" style={{ color: 'var(--gold)' }}>
                {queuePos > 0 ? queuePos * 2 + ' saniye' : '-'}
              </span>
            </div>
          </div>

          {/* Model */}
          <div>
            <label
              className="text-[10px] uppercase tracking-wider font-semibold block mb-1.5"
              style={{ color: 'var(--text3)' }}
            >
              Model Seç
            </label>
            <div className="relative">
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-xs appearance-none cursor-pointer outline-none transition-colors focus:border-[var(--accent)]"
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              >
                {PREMIUM_MODELS.map(group => (
                  <optgroup key={group.tier} label={group.label}>
                    {group.models.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text3)' }}
              />
            </div>
          </div>

          {/* Model Info */}
          <div
            className="text-[11px] p-2.5 rounded-lg"
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              color: 'var(--text2)',
              lineHeight: '1.6',
            }}
          >
            {PREMIUM_INFO[model] || '—'}
          </div>

          {/* System Prompt */}
          <div>
            <label
              className="text-[10px] uppercase tracking-wider font-semibold block mb-1.5"
              style={{ color: 'var(--text3)' }}
            >
              Sistem Prompt
            </label>
            <textarea
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              rows={3}
              className="w-full rounded-lg px-3 py-2 text-xs outline-none resize-none transition-colors focus:border-[var(--accent)]"
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                lineHeight: '1.6',
              }}
            />
          </div>

          {/* Specs */}
          <div
            className="text-[10px] p-2.5 rounded-lg space-y-0.5"
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              color: 'var(--text2)',
            }}
          >
            <div>• Rate limit: 10 req/dak</div>
            <div>• Max token: 4096</div>
            <div>• Context: 128K</div>
            <div>• Queue: Fair-use</div>
          </div>

          <div className="mt-auto" />
          <button
            onClick={handleClear}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs transition-all hover:opacity-80"
            style={{
              background: 'rgba(255,107,107,0.1)',
              color: 'var(--red)',
              border: '1px solid rgba(255,107,107,0.2)',
            }}
          >
            <Trash2 size={12} /> Temizle
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: 'thin' }}>
            {history.length === 0 && (
              <div
                className="flex flex-col items-center justify-center h-full gap-3"
                style={{ color: 'var(--text3)' }}
              >
                <Crown size={48} style={{ color: 'var(--gold)', opacity: 0.3 }} />
                <p className="text-sm">Premium Free modeller burada!</p>
                <p className="text-xs text-center max-w-sm">
                  En kaliteli ücretsiz modelleri kullanabilirsin. Rate limit nedeniyle bazen sıra
                  bekleyebilirsin.
                </p>
              </div>
            )}
            {history.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background:
                      msg.role === 'assistant' ? 'rgba(255,159,67,0.15)' : 'rgba(63,185,80,0.15)',
                    border: `1px solid ${msg.role === 'assistant' ? 'rgba(255,159,67,0.3)' : 'rgba(63,185,80,0.3)'}`,
                  }}
                >
                  {msg.role === 'assistant' ? (
                    <Crown size={14} style={{ color: 'var(--premium)' }} />
                  ) : (
                    <User size={14} style={{ color: 'var(--green)' }} />
                  )}
                </div>
                <div
                  className="max-w-[75%] rounded-xl px-4 py-3 text-[13px] leading-relaxed group relative"
                  style={{
                    background: msg.role === 'assistant' ? 'var(--surface)' : 'var(--surface2)',
                    border: `1px solid ${msg.role === 'assistant' ? 'var(--border)' : 'var(--border2)'}`,
                    color: 'var(--text)',
                  }}
                >
                  <button
                    onClick={() => handleCopy(msg.content, msg.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                    style={{ color: 'var(--text3)', background: 'var(--surface2)' }}
                  >
                    {copiedId === msg.id ? (
                      <Check size={12} style={{ color: 'var(--green)' }} />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                  <div
                    className="markdown-content"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                  />
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="flex-shrink-0 p-3"
            style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}
          >
            <div className="flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Premium mesajın..."
                rows={1}
                className="flex-1 rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all focus:border-[var(--accent)] max-h-[120px]"
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="flex-shrink-0 px-5 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg,var(--premium),var(--red))',
                  color: '#fff',
                }}
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                <span className="hidden sm:inline">{isLoading ? 'Bekle' : 'Gönder'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
