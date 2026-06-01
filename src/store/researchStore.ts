import { create } from 'zustand';
import type { ResearchTask } from '@/types';

interface ResearchState {
  tasks: ResearchTask[];
  activeTask: string | null;
  isResearching: boolean;
  addTask: (query: string) => string;
  updateTask: (id: string, updates: Partial<ResearchTask>) => void;
  setActiveTask: (id: string | null) => void;
  clearTasks: () => void;
}

export const useResearchStore = create<ResearchState>((set) => ({
  tasks: [],
  activeTask: null,
  isResearching: false,

  addTask: (query: string) => {
    const id = Math.random().toString(36).substring(2, 15);
    const task: ResearchTask = {
      id,
      query,
      status: 'pending',
      findings: [],
      generatedCode: [],
      testResults: { lint: false, tests: false, errors: [] },
      createdAt: Date.now(),
    };
    set(s => ({ tasks: [...s.tasks, task], activeTask: id, isResearching: true }));
    return id;
  },

  updateTask: (id: string, updates: Partial<ResearchTask>) => {
    set(s => ({
      tasks: s.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  },

  setActiveTask: (id: string | null) => set({ activeTask: id }),
  clearTasks: () => set({ tasks: [], activeTask: null, isResearching: false }),
}));