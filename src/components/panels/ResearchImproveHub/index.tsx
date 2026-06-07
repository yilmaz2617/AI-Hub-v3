import React, { useState, useCallback } from 'react';
import { useAppStore } from '../../../store/appStore';

interface ResearchResult {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

export const ResearchImproveHub: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { theme } = useAppStore();

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);

    try {
      const mockResults: ResearchResult[] = [
        {
          id: crypto.randomUUID(),
          title: `Research: ${query}`,
          content: 'Research results will appear here...',
          timestamp: Date.now(),
        },
      ];

      setResults(mockResults);
    } catch (error: unknown) {
      console.error('Research error:', error);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const clearResults = useCallback(() => {
    setResults([]);
    setQuery('');
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Research & Improve Hub</h2>

      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Enter research topic..."
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Researching...' : 'Search'}
        </button>
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Clear
        </button>
      </div>

      <div className="space-y-2">
        {results.map(result => (
          <div
            key={result.id}
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white">{result.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-1">{result.content}</p>
            <span className="text-xs text-gray-400 mt-2 block">
              {new Date(result.timestamp).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResearchImproveHub;
