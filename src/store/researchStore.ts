import { create } from 'zustand';

interface ResearchResult {
  id: string;
  title: string;
  summary: string;
  source: string;
  timestamp: number;
}

interface ResearchState {
  query: string;
  results: ResearchResult[];
  loading: boolean;
  error: string | null;
  setQuery: (query: string) => void;
  startResearch: (query: string) => Promise<void>;
  clearResults: () => void;
}

export const useResearchStore = create<ResearchState>((set) => ({
  query: '',
  results: [],
  loading: false,
  error: null,

  setQuery: (query) => set({ query }),

  startResearch: async (query) => {
    set({ loading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      set({
        results: [{
          id: crypto.randomUUID(),
          title: query + ' - Genel Bakis',
          summary: 'Arastirma sonuclari: ' + query + ' hakkinda detayli bilgi...',
          source: 'Kimi AI',
          timestamp: Date.now(),
        }],
        loading: false,
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Bilinmeyen hata', loading: false });
    }
  },

  clearResults: () => set({ results: [], error: null }),
}));
