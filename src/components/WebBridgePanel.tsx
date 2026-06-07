import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  Loader2,
  Play,
  Trash2,
  Terminal,
  Globe,
  MousePointer,
  Type,
  Camera,
  Code,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useWebBridge } from '../hooks/useWebBridge';

const TOOLS = [
  { name: 'navigate', label: 'Navigate', icon: Globe, desc: 'URLye git' },
  { name: 'snapshot', label: 'Snapshot', icon: Camera, desc: 'DOM snapshot al' },
  { name: 'click', label: 'Click', icon: MousePointer, desc: 'Elemente tikla' },
  { name: 'fill', label: 'Fill', icon: Type, desc: 'Form doldur' },
  { name: 'screenshot', label: 'Screenshot', icon: Camera, desc: 'Ekran goruntusu' },
  { name: 'evaluate', label: 'Evaluate', icon: Code, desc: 'JS calistir' },
];

export default function WebBridgePanel() {
  const wb = useWebBridge();
  const [selectedTool, setSelectedTool] = useState('navigate');
  const wb = useWebBridge();
  const [selectedTool, setSelectedTool] = useState('navigate');
  const [toolArgs, setToolArgs] = useState<Record<string, string>>({});
  const [isExecuting, setIsExecuting] = useState(false);

  const getStatusIcon = () => {
    switch (wb.status) {
      case 'connected':
        return <Wifi className="w-5 h-5 text-green-500" />;
      case 'connecting':
        return <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <WifiOff className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (wb.status) {
      case 'connected':
        return 'Bağlı';
      case 'connecting':
        return 'Bağlanıyor...';
      case 'error':
        return 'Hata';
      default:
        return 'Bağlı Değil';
    }
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      const args: Record<string, unknown> = {};
      Object.entries(toolArgs).forEach(([k, v]) => {
        if (v.trim()) args[k] = v;
      });
      await wb.executeTool(selectedTool, args);
    } catch (err) {
      console.error('Tool execution failed:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  const renderToolInputs = () => {
    switch (selectedTool) {
      case 'navigate':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL
              </label>
              <input
                type="text"
                value={toolArgs.url || ''}
                onChange={e => setToolArgs({ ...toolArgs, url: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={toolArgs.newTab === 'true'}
                onChange={e =>
                  setToolArgs({ ...toolArgs, newTab: e.target.checked ? 'true' : 'false' })
                }
                className="rounded"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Yeni sekmede aç</span>
            </label>
          </div>
        );
      case 'snapshot':
        return (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Snapshot almak için çalıştır butonuna tıklayın. Aktif sekmenin erişilebilirlik ağacı
            döndürülür.
          </div>
        );
      case 'click':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              CSS Seçici veya @e Referansı
            </label>
            <input
              type="text"
              value={toolArgs.selector || ''}
              onChange={e => setToolArgs({ ...toolArgs, selector: e.target.value })}
              placeholder="#button veya @e1"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
        );
      case 'fill':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CSS Seçici
              </label>
              <input
                type="text"
                value={toolArgs.selector || ''}
                onChange={e => setToolArgs({ ...toolArgs, selector: e.target.value })}
                placeholder="#input-field"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Değer
              </label>
              <input
                type="text"
                value={toolArgs.value || ''}
                onChange={e => setToolArgs({ ...toolArgs, value: e.target.value })}
                placeholder="Yazılacak metin"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>
        );
      case 'screenshot':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Format
              </label>
              <select
                value={toolArgs.format || 'png'}
                onChange={e => setToolArgs({ ...toolArgs, format: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CSS Seçici (opsiyonel - belirli element)
              </label>
              <input
                type="text"
                value={toolArgs.selector || ''}
                onChange={e => setToolArgs({ ...toolArgs, selector: e.target.value })}
                placeholder="#element"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>
        );
      case 'evaluate':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              JavaScript Kodu
            </label>
            <textarea
              value={toolArgs.code || ''}
              onChange={e => setToolArgs({ ...toolArgs, code: e.target.value })}
              placeholder="document.title"
              rows={4}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 font-mono text-sm"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Kimi WebBridge
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tarayıcı Otomasyonu</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span
              className={`text-sm font-medium ${
                wb.status === 'connected'
                  ? 'text-green-600'
                  : wb.status === 'error'
                    ? 'text-red-600'
                    : wb.status === 'connecting'
                      ? 'text-yellow-600'
                      : 'text-gray-500'
              }`}
            >
              {getStatusText()}
            </span>
          </div>
        </div>
      </div>

      {/* Connection Controls */}
      <div className="p-4 border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              WebSocket URL
            </label>
            <input
              type="text"
              value={wb.serverUrl}
              onChange={e => wb.setServerUrl(e.target.value)}
              disabled={wb.status === 'connected'}
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 disabled:opacity-50"
            />
          </div>
          <div className="flex gap-2 pt-5">
            {wb.status === 'connected' ? (
              <button
                onClick={wb.disconnect}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Bağlantıyı Kes
              </button>
            ) : (
              <button
                onClick={() => wb.connect()}
                disabled={wb.status === 'connecting'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {wb.status === 'connecting' && <Loader2 className="w-4 h-4 animate-spin" />}
                Bağlan
              </button>
            )}
            <button
              onClick={() => wb.testConnection()}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              title="Bağlantı Testi"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!wb.isExtensionInstalled && (
          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium">Kimi WebBridge Extension bulunamadı</p>
              <p className="text-xs mt-1">
                Extension'ı Chrome Web Store'dan yükleyin veya developer mode ile manuel yükleyin.
                Kurulumdan sonra sayfayı yenileyin.
              </p>
            </div>
          </div>
        )}

        {wb.lastError && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-red-800 dark:text-red-200">{wb.lastError}</span>
          </div>
        )}
      </div>

      {/* Tool Selection */}
      <div className="p-4 border-b dark:border-gray-800">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          Araçlar
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {TOOLS.map(tool => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.name}
                onClick={() => {
                  setSelectedTool(tool.name);
                  setToolArgs({});
                }}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedTool === tool.name
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Icon
                  className={`w-4 h-4 mb-1 ${
                    selectedTool === tool.name ? 'text-blue-600' : 'text-gray-500'
                  }`}
                />
                <div className="text-xs font-medium text-gray-900 dark:text-white">
                  {tool.label}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">{tool.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tool Arguments */}
      <div className="p-4 border-b dark:border-gray-800 flex-1">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {TOOLS.find(t => t.name === selectedTool)?.label} Parametreleri
        </h3>
        <div className="space-y-4">
          {renderToolInputs()}
          <button
            onClick={handleExecute}
            disabled={isExecuting || wb.status !== 'connected'}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isExecuting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isExecuting ? 'Çalıştırılıyor...' : 'Çalıştır'}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex-1 overflow-auto">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Sonuç
          </h3>
          {wb.toolHistory.length > 0 && (
            <button
              onClick={wb.clearHistory}
              className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Temizle
            </button>
          )}
        </div>

        {wb.lastResult ? (
          <div className="space-y-2">
            <div
              className={`p-3 rounded-lg border ${
                wb.lastResult.error
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {wb.lastResult.name}
                </span>
                <span className="text-[10px] text-gray-400">
                  {new Date(wb.lastResult.timestamp).toLocaleTimeString()}
                </span>
              </div>
              {wb.lastResult.error ? (
                <p className="text-sm text-red-700 dark:text-red-300">{wb.lastResult.error}</p>
              ) : (
                <pre className="text-xs text-green-800 dark:text-green-200 overflow-auto max-h-40 font-mono">
                  {JSON.stringify(wb.lastResult.data, null, 2)}
                </pre>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
            Henüz bir araç çalıştırılmadı
          </p>
        )}

        {/* History */}
        {wb.toolHistory.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Geçmiş ({wb.toolHistory.length})
            </h4>
            <div className="space-y-1 max-h-32 overflow-auto">
              {wb.toolHistory.slice(0, 10).map(call => (
                <div
                  key={call.id}
                  className="p-2 bg-white dark:bg-gray-800 rounded border dark:border-gray-700 text-xs"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-300">{call.name}</span>
                  <span className="text-gray-400 ml-2">
                    {new Date(call.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
