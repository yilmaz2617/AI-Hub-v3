import { useState, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/appStore';
import { callAPI, callPollinations } from '@/lib/api';
import { renderMarkdown, uid, copyToClipboard } from '@/lib/utils';
import { MODELS, PROVIDERS } from '@/lib/constants';
import type { Provider, Message } from '@/types';
import { Send, Copy, Check, Loader2, Bot, ArrowRightLeft, Sliders } from 'lucide-react';

interface ColumnConfig {
  provider: Provider;
  model: string;
  response: string;
  isLoading: boolean;
  history: Message[];
}

export default function ComparePanel() {
  const { apiKeys, addToast } = useAppStore();
  const [input, setInput] = useState('');
  const [colA, setColA] = useState<ColumnConfig>({
    provider: 'groq',
    model: 'llama-3.3-70b-versatile',
    response: '',
    isLoading: false,
    history: [],
  });
  const [colB, setColB] = useState<ColumnConfig>({
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    response: '',
    isLoading: false,
    history: [],
  });
  const [copiedA, setCopiedA] = useState(false);
  const [copiedB, setCopiedB] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const abortA = useRef<AbortController | null>(null);
  const abortB = useRef<AbortController | null>(null);

  const modelsA = MODELS[colA.provider] || [];
  const modelsB = MODELS[colB.provider] || [];

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');

    const userMsg: Message = { id: uid(), role: 'user', content: text, timestamp: Date.now() };

    // Column A
    setColA(c => ({ ...c, isLoading: true, response: '' }));
    abortA.current = new AbortController();

    // Column B
    setColB(c => ({ ...c, isLoading: true, response: '' }));
    abortB.current = new AbortController();

    const callColumn = async (
      col: ColumnConfig,
      abort: AbortController,
      setCol: React.Dispatch<React.SetStateAction<ColumnConfig>>
    ) => {
      try {
        let reply: string;
        const newHistory = [...col.history, userMsg];
        if (col.provider === 'pollinations') {
          reply = await callPollinations(text);
        } else {
          const key = apiKeys[col.provider];
          if (!key) {
            setCol(c => ({
              ...c,
              isLoading: false,
              response: 'API key bulunamadi. API Durumu panelinden ekleyin.',
            }));
            return;
          }
          reply = await callAPI(col.provider, col.model, key, newHistory, undefined, abort.signal);
        }
        setCol(c => ({
          ...c,
          isLoading: false,
          response: reply,
          history: [
            ...newHistory,
            { id: uid(), role: 'assistant', content: reply, timestamp: Date.now() },
          ],
        }));
      } catch (e: unknown) {
        setCol(c => ({ ...c, isLoading: false, response: 'Hata: ' + (e as Error).message }));
      }
    };

    await Promise.all([
      callColumn(colA, abortA.current!, setColA),
      callColumn(colB, abortB.current!, setColB),
    ]);
    addToast('Karsilastirma tamamlandi!', 'success');
  }, [input, colA, colB, apiKeys, addToast]);

  const handleCopy = async (text: string, isA: boolean) => {
    await copyToClipboard(text);
    if (isA) {
      setCopiedA(true);
      setTimeout(() => setCopiedA(false), 2000);
    } else {
      setCopiedB(true);
      setTimeout(() => setCopiedB(false), 2000);
    }
    addToast('Kopyalandi!', 'success');
  };

  const handleSwap = () => {
    setColA(colB);
    setColB(colA);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderColumn = (col: ColumnConfig, isA: boolean) => (
    <div
      className="flex-1 flex flex-col overflow-hidden rounded-xl"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {/* Column header */}
      <div
        className="flex items-center justify-between px-3 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}
      >
        <div className="flex items-center gap-2">
          <Bot size={14} style={{ color: isA ? 'var(--accent)' : 'var(--purple)' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
            {PROVIDERS.find(p => p.id === col.provider)?.name || col.provider}
          </span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: 'var(--surface3)', color: 'var(--text3)' }}
          >
            {col.model.split('/').pop()?.substring(0, 15)}
          </span>
        </div>
        {col.response && (
          <button
            onClick={() => handleCopy(col.response, isA)}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--text3)' }}
          >
            {isA ? (
              copiedA ? (
                <Check size={12} style={{ color: 'var(--green)' }} />
              ) : (
                <Copy size={12} />
              )
            ) : copiedB ? (
              <Check size={12} style={{ color: 'var(--green)' }} />
            ) : (
              <Copy size={12} />
            )}
          </button>
        )}
      </div>

      {/* Response area */}
      <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: 'thin' }}>
        {col.isLoading ? (
          <div className="flex items-center gap-2 py-4">
            <Loader2
              size={16}
              className="animate-spin"
              style={{ color: isA ? 'var(--accent)' : 'var(--purple)' }}
            />
            <span className="text-sm" style={{ color: 'var(--text3)' }}>
              Yaziyor...
            </span>
          </div>
        ) : col.response ? (
          <div
            className="markdown-content text-[13px] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(col.response) }}
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center h-full gap-2"
            style={{ color: 'var(--text3)' }}
          >
            <Bot size={32} style={{ opacity: 0.3 }} />
            <span className="text-xs">Yanit burada gorunecek</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <ArrowRightLeft size={16} style={{ color: 'var(--accent)' }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
            Karsilastirma Modu
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] transition-all"
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border2)',
              color: 'var(--text2)',
            }}
          >
            <Sliders size={12} /> Model Sec
          </button>
          <button
            onClick={handleSwap}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] transition-all"
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border2)',
              color: 'var(--accent)',
            }}
          >
            <ArrowRightLeft size={12} /> Degistir
          </button>
        </div>
      </div>

      {/* Model settings */}
      {showSettings && (
        <div
          className="flex gap-4 px-4 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}
        >
          {/* Column A settings */}
          <div className="flex-1 flex gap-2">
            <select
              value={colA.provider}
              onChange={e =>
                setColA(c => ({
                  ...c,
                  provider: e.target.value as Provider,
                  model: MODELS[e.target.value]?.[0]?.id || '',
                }))
              }
              className="flex-1 rounded-lg px-2 py-1.5 text-xs outline-none"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            >
              {PROVIDERS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <select
              value={colA.model}
              onChange={e => setColA(c => ({ ...c, model: e.target.value }))}
              className="flex-1 rounded-lg px-2 py-1.5 text-xs outline-none"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            >
              {modelsA.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          {/* Column B settings */}
          <div className="flex-1 flex gap-2">
            <select
              value={colB.provider}
              onChange={e =>
                setColB(c => ({
                  ...c,
                  provider: e.target.value as Provider,
                  model: MODELS[e.target.value]?.[0]?.id || '',
                }))
              }
              className="flex-1 rounded-lg px-2 py-1.5 text-xs outline-none"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            >
              {PROVIDERS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <select
              value={colB.model}
              onChange={e => setColB(c => ({ ...c, model: e.target.value }))}
              className="flex-1 rounded-lg px-2 py-1.5 text-xs outline-none"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            >
              {modelsB.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Two columns */}
      <div className="flex-1 flex gap-3 p-3 overflow-hidden">
        {renderColumn(colA, true)}
        {renderColumn(colB, false)}
      </div>

      {/* Input */}
      <div
        className="flex-shrink-0 p-3"
        style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}
      >
        <div className="flex gap-2 items-center">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Her iki modele ayni soruyu sor..."
            className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || colA.isLoading || colB.isLoading}
            className="px-5 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg,var(--accent),var(--purple))',
              color: '#fff',
            }}
          >
            {colA.isLoading || colB.isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            Gonder
          </button>
        </div>
      </div>
    </div>
  );
}
