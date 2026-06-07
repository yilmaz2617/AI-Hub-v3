import { create } from 'zustand';

interface CodeSuggestion {
  id: string;
  type: 'error' | 'warning' | 'info' | 'optimization';
  title: string;
  description: string;
  originalCode?: string;
  improvedCode?: string;
}

export interface ImproveState {
  code: string;
  suggestions: CodeSuggestion[];
  loading: boolean;
  error: string | null;
  setCode: (code: string) => void;
  analyzeCode: (code: string) => Promise<void>;
  clearSuggestions: () => void;
}

export const useImproveStore = create<ImproveState>(set => ({
  code: '',
  suggestions: [],
  loading: false,
  error: null,

  setCode: code => set({ code }),

  analyzeCode: async code => {
    set({ loading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const suggestions: CodeSuggestion[] = [];

      if (code.includes('console.log')) {
        suggestions.push({
          id: crypto.randomUUID(),
          type: 'warning',
          title: 'Console.log kullanimi',
          description: 'Uretim ortaminda console.log kullanimi onerilmez. Logger kullanin.',
        });
      }
      if (code.includes('var ')) {
        suggestions.push({
          id: crypto.randomUUID(),
          type: 'error',
          title: 'var kullanimi',
          description: 'var yerine let veya const kullanin.',
        });
      }
      if (code.includes('any')) {
        suggestions.push({
          id: crypto.randomUUID(),
          type: 'warning',
          title: 'any tip kullanimi',
          description: 'TypeScript any kullanimindan kacinmaya calisin.',
        });
      }

      set({ suggestions, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Analiz hatasi', loading: false });
    }
  },

  clearSuggestions: () => set({ suggestions: [], error: null }),
}));
