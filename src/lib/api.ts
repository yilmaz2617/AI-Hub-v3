// ═══════════════════════════════════════════
// AI HUB v3 — API Servisleri
// ═══════════════════════════════════════════
import type { Message } from '@/types';

// ─── Pollinations Text API (Key yok!) ───
export async function callPollinations(userMsg: string, systemPrompt?: string): Promise<string> {
  const body = JSON.stringify({
    model: 'openai',
    messages: [
      { role: 'system', content: systemPrompt || 'Sen yardımcı bir AI asistansın.' },
      { role: 'user', content: userMsg },
    ],
    private: true,
    seed: Math.floor(Math.random() * 99999),
  });
  const res = await fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  if (!res.ok) throw new Error('Pollinations hata: ' + res.status);
  const j = await res.json();
  return (j.choices?.[0]?.message?.content || '').trim();
}

// ─── Çeviri Servisi ───
export async function translateText(text: string, targetLang: string = 'en'): Promise<string> {
  return callPollinations(
    targetLang === 'en'
      ? `Translate this to English. Return ONLY the translated text, nothing else:\n${text}`
      : `Bunu Türkçeye çevir. SADECE çeviriyi döndür:\n${text}`
  );
}

// ─── Ana API Çağrısı ───
export async function callAPI(
  provider: string,
  model: string,
  key: string,
  history: Message[],
  system?: string,
  signal?: AbortSignal,
): Promise<string> {
  const systemMsg = system || 'Sen yardımcı bir AI asistansın.';
  const messages = history.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));

  if (provider === 'groq' || provider === 'openrouter') {
    const url = provider === 'groq'
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://openrouter.ai/api/v1/chat/completions';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + key,
    };
    if (provider === 'openrouter') {
      headers['HTTP-Referer'] = 'https://aihub.local';
      headers['X-Title'] = 'AI Hub';
    }
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: systemMsg }, ...messages],
        max_tokens: 4096,
        temperature: 0.7,
      }),
      signal,
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error?.message || res.statusText);
    }
    return (await res.json()).choices[0].message.content;
  }

  if (provider === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemMsg }] },
        contents,
        generationConfig: { maxOutputTokens: 4096, temperature: 0.7 },
      }),
      signal,
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error?.message || res.statusText);
    }
    return (await res.json()).candidates[0].content.parts[0].text;
  }

  if (provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system: systemMsg,
        messages,
      }),
      signal,
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error?.message || res.statusText);
    }
    return (await res.json()).content[0].text;
  }

  throw new Error('Bilinmeyen sağlayıcı: ' + provider);
}

// ─── Premium Free API (OpenRouter free tier) ───
export async function callPremiumAPI(
  model: string,
  history: Message[],
  system: string,
  hasKey: boolean,
  key: string,
  signal?: AbortSignal,
): Promise<string> {
  const url = 'https://openrouter.ai/api/v1/chat/completions';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://aihub.local',
    'X-Title': 'AI Hub Premium',
  };
  if (hasKey && key) {
    headers['Authorization'] = 'Bearer ' + key;
  } else {
    // Boş key gönderme — OpenRouter free tier boş key ile de çalışabilir
    // ama daha agresif rate limit uygular
    headers['Authorization'] = 'Bearer sk-or-v1-demo';
  }
  const messages = history.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: model + ':free',
      messages: [{ role: 'system', content: system }, ...messages],
      max_tokens: 4096,
      temperature: 0.7,
    }),
    signal,
  });
  if (res.status === 429) {
    throw new Error('Rate limit aşıldı. Biraz bekleyip tekrar deneyin.');
  }
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error?.message || res.statusText);
  }
  return (await res.json()).choices[0].message.content;
}

// ─── Görsel Üretimi (Pollinations) ───
export function generateImageUrl(
  prompt: string,
  model: string,
  seed: number,
  width: number,
  height: number,
  negative?: string,
): string {
  const params = new URLSearchParams({
    model,
    seed: String(seed),
    width: String(width),
    height: String(height),
    nologo: 'true',
    enhance: 'true',
  });
  if (negative) params.set('negative', negative);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params}`;
}
