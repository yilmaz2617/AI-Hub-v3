// ═══════════════════════════════════════════
// AI HUB v3 — Yardımcı Fonksiyonlar
// ═══════════════════════════════════════════
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

// ─── Tailwind merge (shadcn/ui için gerekli) ───
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── ID Üretici ───
export const uid = () =>
  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// ─── Zaman Formatlayıcı ───
export const fmtTime = (ts: number) =>
  new Date(ts).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
export const fmtDate = (ts: number) =>
  new Date(ts).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

// ─── Markdown Render (Güvenli) ───
import { marked } from 'marked';

export function renderMarkdown(text: string): string {
  if (!text) return '';
  const raw = marked.parse(text, {
    breaks: true,
    gfm: true,
  }) as string;
  // Sonrasında highlight.js ile kod bloklarını işle
  const highlighted = raw.replace(
    /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g,
    (_match, lang, code) => {
      try {
        const decoded = code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        const highlighted =
          lang && hljs.getLanguage(lang)
            ? hljs.highlight(decoded, { language: lang }).value
            : hljs.highlightAuto(decoded).value;
        return `<pre class="md-pre"><code class="hljs language-${lang}">${highlighted}</code></pre>`;
      } catch {
        return `<pre class="md-pre"><code class="hljs language-${lang}">${code}</code></pre>`;
      }
    }
  );
  // XSS koruması
  return sanitizeHtml(highlighted);
}

const allowedTags = new Set([
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'del',
  'a',
  'code',
  'pre',
  'blockquote',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'hr',
  'span',
  'div',
  'img',
  'sup',
  'sub',
]);

const allowedAttrs: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'target']),
  code: new Set(['class']),
  pre: new Set(['class']),
  span: new Set(['class']),
  img: new Set(['src', 'alt', 'title']),
  table: new Set(['class']),
};

function sanitizeHtml(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  cleanNode(doc.body);
  return doc.body.innerHTML;
}

function cleanNode(node: Node): void {
  const children = Array.from(node.childNodes);
  for (const child of children) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as HTMLElement;
      const tag = el.tagName.toLowerCase();
      if (!allowedTags.has(tag)) {
        const parent = el.parentNode;
        if (parent) {
          while (el.firstChild) {
            parent.insertBefore(el.firstChild, el);
          }
          parent.removeChild(el);
        }
        continue;
      }
      const attrs = Array.from(el.attributes);
      for (const attr of attrs) {
        const allowed = allowedAttrs[tag];
        if (!allowed || !allowed.has(attr.name)) {
          el.removeAttribute(attr.name);
        }
      }
      if (tag === 'a') {
        const href = el.getAttribute('href') || '';
        if (href.startsWith('javascript:') || href.startsWith('data:')) {
          el.removeAttribute('href');
        } else {
          el.setAttribute('target', '_blank');
          el.setAttribute('rel', 'noopener noreferrer');
        }
      }
      cleanNode(el);
    }
  }
}

// ─── Copy to clipboard ───
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }
}

// ─── Dosya İndirme ───
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
