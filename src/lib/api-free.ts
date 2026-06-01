// ═══════════════════════════════════════════
// AI HUB v3 — Ücretsiz AI API (Groq + Gemini)
// ═══════════════════════════════════════════

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export async function callFreeAI(prompt: string, apiKeys: Record<string, string>): Promise<string> {
  // 1. Groq (ana)
  if (apiKeys.groq) {
    try {
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${apiKeys.groq}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          model: 'llama-3.3-70b-versatile', 
          messages: [{ role: 'user', content: prompt }] 
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data.choices[0].message.content;
      }
    } catch { /* fallback */ }
  }

  // 2. Gemini (yedek)
  if (apiKeys.gemini) {
    try {
      const res = await fetch(`${GEMINI_URL}?key=${apiKeys.gemini}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: prompt }] }] 
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data.candidates[0].content.parts[0].text;
      }
    } catch { /* fallback */ }
  }

  throw new Error('Groq veya Gemini API key gerekli. Ücretsiz tier: console.groq.com / aistudio.google.com');
}