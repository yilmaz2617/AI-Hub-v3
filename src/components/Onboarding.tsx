import { useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { motion } from 'framer-motion';
import {
  MessageSquare, Crown, Image, Zap, Keyboard,
  ArrowRight, ArrowLeft, Sparkles, Check
} from 'lucide-react';

const STEPS = [
  {
    icon: Sparkles,
    title: 'AI Hub\'a Hos Geldin!',
    desc: '5 farkli AI saglayici, 50+ hazir prompt, gorsel uretimi ve kendi kendini gelistiren bir AI paneli.',
    color: 'var(--accent)',
  },
  {
    icon: MessageSquare,
    title: 'Sohbet Et',
    desc: 'Groq, OpenRouter, Google Gemini, Anthropic Claude ve Pollinations ile sohbet et. API key\'lerini API Durumu panelinden ekle.',
    color: 'var(--green)',
  },
  {
    icon: Crown,
    title: 'Premium Modeller',
    desc: 'Ucretsiz S-Tier modelleri kullan. GPT-4o Mini, Claude 3 Haiku, Gemini 2.5 Flash ve daha fazlasi.',
    color: 'var(--gold)',
  },
  {
    icon: Image,
    title: 'Gorsel Uret',
    desc: 'Flux, SDXL modelleriyle AI gorselleri olustur. Prompt\'unu cevir, guclendir, varyantlar uret.',
    color: 'var(--purple)',
  },
  {
    icon: Zap,
    title: 'Kendini Gelistir',
    desc: 'AI Hub kendi kodunu analiz eder ve senin onayinla gelistirir. Her degisiklik oncesi yedek alinir.',
    color: 'var(--yellow)',
  },
  {
    icon: Keyboard,
    title: 'Klavye Kisayollari',
    desc: 'Ctrl+1-5 panel gecisi, Ctrl+K komut paleti, Ctrl+T tema degistirme. Tam liste: Ayarlar > Klavye.',
    color: 'var(--accent)',
  },
];

export default function Onboarding() {
  const { showOnboarding, setOnboarding } = useUIStore();
  const [step, setStep] = useState(0);

  if (!showOnboarding) return null;

  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setOnboarding(false)} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border2)',
          boxShadow: '0 25px 80px -12px rgba(0,0,0,0.7), 0 0 40px rgba(88,166,255,0.05)',
        }}
      >
        {/* Progress */}
        <div className="flex gap-1 p-4 pb-0">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all"
              style={{
                background: i <= step ? current.color : 'var(--border2)',
                opacity: i <= step ? 1 : 0.3,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center text-center">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: current.color + '15',
                border: '2px solid ' + current.color + '30',
                boxShadow: '0 0 20px ' + current.color + '10',
              }}
            >
              <Icon size={28} style={{ color: current.color }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>{current.title}</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{current.desc}</p>
          </motion.div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--border)', background: 'var(--surface2)' }}>
          <button
            onClick={() => setOnboarding(false)}
            className="text-xs transition-colors"
            style={{ color: 'var(--text3)' }}
          >
            Atla
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs transition-all"
                style={{ background: 'var(--surface3)', border: '1px solid var(--border)', color: 'var(--text2)' }}
              >
                <ArrowLeft size={12} /> Geri
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                Ileri <ArrowRight size={12} />
              </button>
            ) : (
              <button
                onClick={() => setOnboarding(false)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{ background: 'var(--green)', color: '#fff' }}
              >
                <Check size={12} /> Basla
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
