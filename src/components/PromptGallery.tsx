import { useState } from 'react';
import { PROMPT_TEMPLATES, PROMPT_CATEGORIES } from '@/lib/promptTemplates';
import type { PromptTemplate } from '@/lib/promptTemplates';
import { Search, X, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PromptGalleryProps {
  onSelect: (prompt: string) => void;
  onClose: () => void;
}

export default function PromptGallery({ onSelect, onClose }: PromptGalleryProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tümü');
  const [selected, setSelected] = useState<PromptTemplate | null>(null);

  const filtered = PROMPT_TEMPLATES.filter(t => {
    const matchesSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === 'Tümü' || t.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl max-h-[80vh] rounded-2xl overflow-hidden flex flex-col"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <Sparkles size={18} style={{ color: 'var(--purple)' }} />
            <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
              Prompt Galerisi
            </span>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: 'var(--surface2)', color: 'var(--text3)' }}
            >
              {PROMPT_TEMPLATES.length} sablon
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--surface2)] transition-colors"
            style={{ color: 'var(--text3)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text3)' }}
            />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Prompt ara..."
              className="w-full rounded-lg pl-9 pr-3 py-2 text-sm outline-none"
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />
          </div>
        </div>

        {/* Categories */}
        <div
          className="flex gap-1.5 px-5 py-2 overflow-x-auto flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          {['Tumu', ...PROMPT_CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-3 py-1 rounded-full text-[11px] whitespace-nowrap transition-all"
              style={{
                background: activeCategory === cat ? 'var(--accent)' : 'var(--surface2)',
                color: activeCategory === cat ? '#fff' : 'var(--text2)',
                border: '1px solid ' + (activeCategory === cat ? 'var(--accent)' : 'var(--border)'),
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Templates */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2" style={{ scrollbarWidth: 'thin' }}>
          <AnimatePresence>
            {filtered.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="group cursor-pointer rounded-xl p-3.5 transition-all hover:border-[var(--accent)]"
                style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
                onClick={() => setSelected(t)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{t.icon}</span>
                  <span className="text-sm font-medium flex-1" style={{ color: 'var(--text)' }}>
                    {t.title}
                  </span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--surface3)', color: 'var(--text3)' }}
                  >
                    {t.category}
                  </span>
                  <ChevronRight
                    size={14}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--accent)' }}
                  />
                </div>
                <p className="text-[11px] ml-7" style={{ color: 'var(--text2)' }}>
                  {t.description}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-sm" style={{ color: 'var(--text3)' }}>
              Sonuc bulunamadi
            </div>
          )}
        </div>

        {/* Detail Modal */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
              onClick={() => setSelected(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-lg rounded-xl p-5 space-y-3"
                style={{ background: 'var(--surface)', border: '1px solid var(--accent)' }}
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selected.icon}</span>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                      {selected.title}
                    </div>
                    <div className="text-[10px]" style={{ color: 'var(--text3)' }}>
                      {selected.category}
                    </div>
                  </div>
                </div>
                <p className="text-xs" style={{ color: 'var(--text2)' }}>
                  {selected.description}
                </p>
                <pre
                  className="text-[11px] p-3 rounded-lg overflow-auto max-h-[200px]"
                  style={{
                    background: 'var(--surface3)',
                    border: '1px solid var(--border2)',
                    color: 'var(--text)',
                    lineHeight: '1.6',
                  }}
                >
                  {selected.prompt}
                </pre>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onSelect(selected.prompt);
                      onClose();
                    }}
                    className="flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: 'var(--accent)', color: '#fff' }}
                  >
                    Kullan
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="px-4 py-2.5 rounded-lg text-xs transition-all"
                    style={{
                      background: 'var(--surface2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text2)',
                    }}
                  >
                    Kapat
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
