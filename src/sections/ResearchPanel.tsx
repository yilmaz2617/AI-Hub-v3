import { useState } from 'react';
import { useResearchStore } from '@/store/researchStore';
import { useAppStore } from '@/store/appStore';
import { Search, Brain, Loader2 } from 'lucide-react';

export default function ResearchPanel() {
  const { tasks, isResearching, addTask, updateTask, clearTasks } = useResearchStore();
  const { addToast } = useAppStore();
  const [query, setQuery] = useState('');

  const handleResearch = async () => {
    if (!query.trim()) { addToast('Sorgu girin!', 'warning'); return; }
    
    const taskId = addTask(query);
    addToast('Arastirma basladi...', 'info');

    await simulatePhase(taskId, 'researching', 2000);
    await simulatePhase(taskId, 'coding', 3000);
    await simulatePhase(taskId, 'testing', 2000);
    
    updateTask(taskId, { 
      status: 'done', 
      completedAt: Date.now(),
      findings: [
        { source: 'React Docs', title: 'Best Practices', snippet: 'Use useEffect for side effects...', relevance: 0.95 }
      ],
      generatedCode: [
        { path: 'src/components/NewFeature.tsx', content: '// Generated code...', description: 'Main component' }
      ],
      testResults: { lint: true, tests: true, errors: [] }
    });
    
    addToast('Arastirma tamamlandi!', 'success');
  };

  const simulatePhase = (taskId: string, status: string, delay: number) => {
    return new Promise(resolve => {
      setTimeout(() => {
        updateTask(taskId, { status: status as 'pending' | 'researching' | 'coding' | 'testing' | 'done' | 'error' });
        resolve(null);
      }, delay);
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <Brain size={16} style={{ color: 'var(--purple)' }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Deep Research</span>
        </div>
        <button onClick={clearTasks} className="text-xs px-2 py-1 rounded" style={{ color: 'var(--text3)' }}>
          Temizle
        </button>
      </div>

      <div className="p-4 flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ne arastirmak istiyorsun?"
            className="flex-1 rounded-lg px-3 py-2 text-xs outline-none"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            onKeyDown={e => e.key === 'Enter' && handleResearch()}
          />
          <button
            onClick={handleResearch}
            disabled={isResearching}
            className="px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5"
            style={{ background: 'var(--purple)', color: '#fff' }}
          >
            {isResearching ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
            Arastir
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {tasks.length === 0 && (
          <div className="text-center py-8 text-xs" style={{ color: 'var(--text3)' }}>
            <Brain size={32} className="mx-auto mb-2 opacity-30" />
            <p>Deep Research ile otomatik kod uretimi</p>
          </div>
        )}

        {tasks.map(task => (
          <div key={task.id} className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{task.query}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--surface2)', color: 'var(--purple)' }}>
                {task.status}
              </span>
            </div>
            {task.status !== 'done' && (
              <div className="w-full h-1 rounded-full mb-3" style={{ background: 'var(--surface2)' }}>
                <div className="h-1 rounded-full transition-all duration-500" style={{ width: task.status === 'pending' ? '10%' : task.status === 'researching' ? '30%' : task.status === 'coding' ? '60%' : '90%', background: 'var(--purple)' }} />
              </div>
            )}
            {task.status === 'done' && (
              <div className="text-xs" style={{ color: 'var(--green)' }}>✓ Tamamlandi</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}