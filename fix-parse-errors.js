const fs = require('fs');
const path = require('path');

const projectPath = 'D:\\\\AI-Hub-v3';

// 1. researchStore.ts düzelt
const researchStore = \import { create } from 'zustand';

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

export const useResearchStore = create<<ResearchState>((set) => ({
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
          title: \\ - Genel Bakis\,
          summary: \Arastirma sonuclari: \ hakkinda detayli bilgi...\,
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
\;

fs.writeFileSync(path.join(projectPath, 'src', 'store', 'researchStore.ts'), researchStore, 'utf8');
console.log('✅ researchStore.ts düzeltildi');

// 2. diff.ts düzelt
const diffTs = \export interface DiffResult {
  path: string;
  oldValue: unknown;
  newValue: unknown;
  type: 'added' | 'removed' | 'changed';
}

export function diffObjects(oldObj: Record<string, unknown>, newObj: Record<string, unknown>): DiffResult[] {
  const results: DiffResult[] = [];
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
  for (const key of allKeys) {
    const oldVal = oldObj[key];
    const newVal = newObj[key];
    if (!(key in oldObj)) results.push({ path: key, oldValue: undefined, newValue: newVal, type: 'added' });
    else if (!(key in newObj)) results.push({ path: key, oldValue: oldVal, newValue: undefined, type: 'removed' });
    else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) results.push({ path: key, oldValue: oldVal, newValue: newVal, type: 'changed' });
  }
  return results;
}

export function diffToString(diff: DiffResult[]): string {
  return diff.map(d => {
    if (d.type === 'added') return \+ \: \\;
    if (d.type === 'removed') return \- \: \\;
    return \~ \: \ -> \\;
  }).join('\\\\n');
}
\;

fs.writeFileSync(path.join(projectPath, 'src', 'utils', 'diff.ts'), diffTs, 'utf8');
console.log('✅ diff.ts düzeltildi');

console.log('\\\\n🎉 Tüm parse hataları düzeltildi!');
