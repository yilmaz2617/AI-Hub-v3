import { useState, useRef, useEffect, useCallback } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useAppStore } from '@/store/appStore';
import { useSettingsStore } from '@/store/settingsStore';
import { callAPI, callPollinations } from '@/lib/api';
import { renderMarkdown, uid, copyToClipboard } from '@/lib/utils';
import { useSound } from '@/hooks/useSound';
import { MODELS, PROVIDERS, QUICK_PROMPTS } from '@/lib/constants';
import type { Message, Provider } from '@/types';
import {
  Send,
  Trash2,
  Copy,
  Check,
  Bot,
  User,
  Loader2,
  ChevronDown,
  Sparkles,
  Settings,
  Hash,
  Type,
} from 'lucide-react';
import TranslateBar from '@/components/TranslateBar';
import PromptGallery from '@/components/PromptGallery';
import SettingsPanel from '@/sections/SettingsPanel';

// Basit token sayacı (~4 char = 1 token)
const estimateTokens = (text: string) => Math.ceil(text.length / 4);

export default function ChatPanel() {
  const {
    activeSessionId,
    provider,
    model,
    systemPrompt,
    setProvider,
    setModel,
    setSystemPrompt,
    addMessage,
    updateMessage,
    clearSession,
    getActiveSession,
    setIsStreaming,
  } = useChatStore();
  const { apiKeys, addToast } = useAppStore();
  const { soundEnabled, streamSpeed } = useSettingsStore();
  const { notify, send: playSend } = useSound();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Streaming state for AI response
  const [streamingMsgId, setStreamingMsgId] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const streamTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const session = getActiveSession();

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => scrollToBottom(), [session?.messages.length, streamingText]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }, [input]);

  // Character & token counter
  const charCount = input.length;
  const tokenCount = estimateTokens(input);

  // Streaming effect
  const streamText = useCallback(
    (text: string, msgId: string) => {
      setStreamingMsgId(msgId);
      let index = 0;
      const fullText = text;

      const streamNext = () => {
        if (index < fullText.length) {
          const chunk = Math.max(1, Math.floor(fullText.length / 50)); // ~50 frames
          index = Math.min(index + chunk, fullText.length);
          setStreamingText(fullText.substring(0, index));
          streamTimerRef.current = setTimeout(streamNext, streamSpeed);
        } else {
          setStreamingMsgId(null);
          setStreamingText('');
          if (soundEnabled) notify();
        }
      };
      streamTimerRef.current = setTimeout(streamNext, streamSpeed);
    },
    [streamSpeed, soundEnabled, notify]
  );

  const cancelStream = useCallback(() => {
    if (streamTimerRef.current) clearTimeout(streamTimerRef.current);
    setStreamingMsgId(null);
    setStreamingText('');
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    if (soundEnabled) playSend();

    const sid = activeSessionId!;
    const userMsg: Message = {
      id: uid(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      provider,
      model,
    };
    addMessage(sid, userMsg);

    const aiMsgId = uid();
    const aiMsg: Message = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      provider,
      model,
      isStreaming: true,
    };
    addMessage(sid, aiMsg);

    setIsLoading(true);
    setIsStreaming(true);
    abortRef.current = new AbortController();

    try {
      let reply: string;
      if (provider === 'pollinations') {
        reply = await callPollinations(text, systemPrompt);
        updateMessage(sid, aiMsgId, reply);
        streamText(reply, aiMsgId);
      } else {
        const key = apiKeys[provider];
        if (!key) {
          throw new Error(
            'API key bulunamadı. API Durumu panelinden ekleyin veya Pollinations kullanın.'
          );
        }
        const history =
          session?.messages
            .filter(m => m.id !== aiMsgId)
            .map(m => ({
              id: m.id,
              role: m.role as 'user' | 'assistant',
              content: m.content,
              timestamp: m.timestamp,
            })) || [];

        const supportsStream = provider === 'groq' || provider === 'openrouter';
        if (supportsStream) {
          // Gerçek SSE streaming
          setStreamingMsgId(aiMsgId);
          let accumulated = '';
          reply = await callAPI(
            provider,
            model,
            key,
            history,
            systemPrompt,
            abortRef.current.signal,
            chunk => {
              accumulated += chunk;
              setStreamingText(accumulated + '▋');
            }
          );
          setStreamingMsgId(null);
          setStreamingText('');
          updateMessage(sid, aiMsgId, reply);
        } else {
          // Diğer sağlayıcılar: simüle streaming
          reply = await callAPI(
            provider,
            model,
            key,
            history,
            systemPrompt,
            abortRef.current.signal
          );
          updateMessage(sid, aiMsgId, reply);
          streamText(reply, aiMsgId);
        }
      }
    } catch (e: unknown) {
      if ((e as Error).name === 'AbortError') {
        updateMessage(sid, aiMsgId, '⛔ İptal edildi.');
      } else {
        updateMessage(sid, aiMsgId, '❌ ' + (e as Error).message);
        addToast('Hata: ' + (e as Error).message, 'error');
      }
      setStreamingMsgId(null);
    }

    setIsLoading(false);
    setIsStreaming(false);
    abortRef.current = null;
  }, [
    input,
    isLoading,
    activeSessionId,
    provider,
    model,
    systemPrompt,
    session,
    apiKeys,
    soundEnabled,
    playSend,
    addMessage,
    updateMessage,
    setIsStreaming,
    streamText,
    addToast,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      cancelStream();
      abortRef.current?.abort();
    }
  };

  const handleCopy = async (content: string, id: string) => {
    await copyToClipboard(content);
    setCopiedId(id);
    addToast('Kopyalandı!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    cancelStream();
  };

  const modelsForProvider = MODELS[provider] || [];

  // Filter messages by search
  const displayedMessages =
    session?.messages.filter(msg => {
      if (!showSearch || !searchQuery) return true;
      return msg.content.toLowerCase().includes(searchQuery.toLowerCase());
    }) || [];

  // Get display text for a message (streaming or full)
  const getMessageContent = (msg: Message) => {
    if (streamingMsgId === msg.id && streamingText) {
      return streamingText + '▋';
    }
    return msg.content;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
            Sohbet
          </span>
          {session && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{
                background: 'var(--surface2)',
                color: 'var(--text3)',
                border: '1px solid var(--border)',
              }}
            >
              {session.messages.length} mesaj
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Search toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-1.5 rounded-lg transition-colors"
            style={{
              color: showSearch ? 'var(--accent)' : 'var(--text3)',
              background: showSearch ? 'var(--surface2)' : 'transparent',
            }}
            title="Ara"
          >
            <Hash size={14} />
          </button>
          {/* Prompt Gallery */}
          <button
            onClick={() => setShowGallery(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] transition-all"
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border2)',
              color: 'var(--purple)',
            }}
            title="Prompt Galerisi"
          >
            <Sparkles size={12} /> Galeri
          </button>
          {/* Settings */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 rounded-lg transition-colors hover:bg-[var(--surface2)]"
            style={{ color: 'var(--text3)' }}
            title="Ayarlar"
          >
            <Settings size={14} />
          </button>
          <TranslateBar onTranslate={setInput} compact />
        </div>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div
          className="px-4 py-2 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}
        >
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Mesajlarda ara..."
            className="w-full rounded-lg px-3 py-1.5 text-xs outline-none"
            style={{
              background: 'var(--surface3)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
          />
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Settings Sidebar */}
        <div
          className="w-64 flex-shrink-0 overflow-y-auto p-3 flex flex-col gap-3"
          style={{ borderRight: '1px solid var(--border)', background: 'var(--surface)' }}
        >
          {/* Provider */}
          <div>
            <label
              className="text-[10px] uppercase tracking-wider font-semibold block mb-1.5"
              style={{ color: 'var(--text3)' }}
            >
              Sağlayıcı
            </label>
            <div className="relative">
              <select
                value={provider}
                onChange={e => {
                  const p = e.target.value as Provider;
                  setProvider(p, MODELS[p]?.[0]?.id);
                }}
                className="w-full rounded-lg px-3 py-2 text-xs appearance-none cursor-pointer outline-none transition-colors focus:border-[var(--accent)]"
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              >
                {PROVIDERS.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.emoji} {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text3)' }}
              />
            </div>
          </div>

          {/* Model */}
          <div>
            <label
              className="text-[10px] uppercase tracking-wider font-semibold block mb-1.5"
              style={{ color: 'var(--text3)' }}
            >
              Model
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
                {modelsForProvider.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
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
          {modelsForProvider.find(m => m.id === model)?.info && (
            <div
              className="text-[11px] p-2.5 rounded-lg leading-relaxed"
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                color: 'var(--text2)',
              }}
            >
              {modelsForProvider.find(m => m.id === model)?.info}
            </div>
          )}

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

          {/* Quick Prompts */}
          <div>
            <label
              className="text-[10px] uppercase tracking-wider font-semibold block mb-1.5"
              style={{ color: 'var(--text3)' }}
            >
              Hızlı
            </label>
            <div className="flex flex-col gap-1">
              {QUICK_PROMPTS.map(qp => (
                <button
                  key={qp.label}
                  onClick={() => handleQuickPrompt(qp.prompt)}
                  className="text-left px-2.5 py-1.5 rounded-md text-xs transition-all hover:bg-[var(--surface3)] flex items-center gap-2"
                  style={{ color: 'var(--text2)', border: '1px solid transparent' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                  }}
                >
                  <span>{qp.icon}</span>
                  <span>{qp.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto" />
          <button
            onClick={() => activeSessionId && clearSession(activeSessionId)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs transition-all hover:opacity-80"
            style={{
              background: 'rgba(255,107,107,0.1)',
              color: 'var(--red)',
              border: '1px solid rgba(255,107,107,0.2)',
            }}
          >
            <Trash2 size={12} /> Sohbeti Temizle
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: 'thin' }}>
            {displayedMessages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background:
                      msg.role === 'assistant' ? 'rgba(88,166,255,0.15)' : 'rgba(63,185,80,0.15)',
                    border: `1px solid ${msg.role === 'assistant' ? 'rgba(88,166,255,0.3)' : 'rgba(63,185,80,0.3)'}`,
                  }}
                >
                  {msg.role === 'assistant' ? (
                    <Bot size={14} style={{ color: 'var(--accent)' }} />
                  ) : (
                    <User size={14} style={{ color: 'var(--green)' }} />
                  )}
                </div>

                {/* Content */}
                <div
                  className="max-w-[75%] rounded-xl px-4 py-3 text-[13px] leading-relaxed group relative"
                  style={{
                    background: msg.role === 'assistant' ? 'var(--surface)' : 'var(--surface2)',
                    border: `1px solid ${msg.role === 'assistant' ? 'var(--border)' : 'var(--border2)'}`,
                    color: 'var(--text)',
                  }}
                >
                  {/* Copy button */}
                  <button
                    onClick={() => handleCopy(msg.content, msg.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                    style={{ color: 'var(--text3)', background: 'var(--surface2)' }}
                    title="Kopyala"
                  >
                    {copiedId === msg.id ? (
                      <Check size={12} style={{ color: 'var(--green)' }} />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>

                  {msg.isStreaming && !msg.content ? (
                    <div className="flex items-center gap-2 py-1">
                      <Loader2
                        size={14}
                        className="animate-spin"
                        style={{ color: 'var(--accent)' }}
                      />
                      <span style={{ color: 'var(--text3)' }}>Yazıyor...</span>
                    </div>
                  ) : (
                    <div
                      className="markdown-content"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(getMessageContent(msg)),
                      }}
                    />
                  )}

                  {/* Meta */}
                  <div
                    className="flex items-center gap-2 mt-2"
                    style={{ color: 'var(--text3)', fontSize: '10px' }}
                  >
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {msg.provider && (
                      <>
                        <span>·</span>
                        <span style={{ color: 'var(--text2)' }}>
                          {msg.provider} · {msg.model}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            className="flex-shrink-0 p-3"
            style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}
          >
            {/* Token counter */}
            {input.length > 0 && (
              <div
                className="flex items-center gap-3 px-1 pb-1.5 text-[10px]"
                style={{ color: 'var(--text3)' }}
              >
                <span className="flex items-center gap-1">
                  <Type size={10} /> {charCount} karakter
                </span>
                <span className="flex items-center gap-1">
                  <Hash size={10} /> ~{tokenCount} token
                </span>
              </div>
            )}
            <div className="flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Mesajını yaz... (Enter = gönder, Shift+Enter = yeni satır)"
                rows={1}
                className="flex-1 rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all focus:border-[var(--accent)] max-h-[120px]"
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  lineHeight: '1.5',
                }}
              />
              {isLoading ? (
                <button
                  onClick={handleCancel}
                  className="flex-shrink-0 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                  style={{ background: 'var(--red)', color: '#fff' }}
                >
                  <Loader2 size={16} className="animate-spin" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="flex-shrink-0 px-5 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 flex items-center gap-2"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  <Send size={14} /> Gönder
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showGallery && <PromptGallery onSelect={setInput} onClose={() => setShowGallery(false)} />}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}
