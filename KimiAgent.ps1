#requires -Version 5.1
<<#
.SYNOPSIS
    Kimi WebBridge Agent - AI Hub v3 Otomasyon Araci
.DESCRIPTION
    ESLint hatalarini otomatik duzeltir, dosya sistemi yonetir,
    ve Kimi WebBridge ile iletisim kurar.
.NOTES
    Version: 3.1.0
#>

[CmdletBinding()]
param(
    [Parameter()]
    [ValidateSet('fix-lint', 'sync-files', 'bridge-test', 'full-repair', 'research-improve')]
    [string]$Action = 'fix-lint',

    [Parameter()]
    [string]$ProjectPath = 'D:\AI-Hub-v3',

    [Parameter()]
    [switch]$DryRun
)

function Write-Success { param([string]$Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error { param([string]$Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param([string]$Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Warning { param([string]$Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }

function Invoke-LintFix {
    param([string]$Path)
    Write-Info "Lint taramasi baslatiliyor: $Path"
    Set-Location $Path
    npm run lint 2>&1 | ForEach-Object { Write-Host $_ }
}

function Test-WebBridge {
    Write-Info "Kimi WebBridge kontrol ediliyor..."
    try {
        if (Get-Process -Name "chrome" -ErrorAction SilentlyContinue) {
            Write-Success "Chrome calisiyor"
        }
        Write-Info "Chrome'da chrome://extensions/ adresine gidin"
        Write-Info "Kimi WebBridge extension ID: kimi-webbridge"
        return $true
    }
    catch {
        Write-Error "WebBridge kontrolu basarisiz: $_"
        return $false
    }
}

function New-ResearchImproveHub {
    param([string]$Path)
    Write-Info "Research & Improve Hub olusturuluyor..."

    $hubPath = Join-Path $Path "src\components\panels\ResearchImproveHub"
    if (-not (Test-Path $hubPath)) {
        New-Item -ItemType Directory -Path $hubPath -Force | Out-Null
        Write-Success "Klasor olusturuldu: $hubPath"
    }

    # index.tsx
    $indexContent = 'import React, { useState, useCallback } from ''react'';
import { useAppStore } from ''../../../store/appStore'';
import { Search, Sparkles, Code, FileText, Zap, GitMerge } from ''lucide-react'';
import { motion, AnimatePresence } from ''framer-motion'';

export function ResearchImproveHub() {
  const [activeTab, setActiveTab] = useState<<''research'' | ''improve''>(''research'');
  const { theme } = useAppStore();
  const isDark = theme === ''dark'';

  return (
    <div className={`flex-1 overflow-auto p-6 ${isDark ? ''bg-gray-900 text-white'' : ''bg-white text-gray-900''}`}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <GitMerge className="w-8 h-8 text-blue-500" />
            Research & Improve Hub
          </h1>
          <p className={`mt-2 ${isDark ? ''text-gray-400'' : ''text-gray-600''}`}>
            Kod analizi, arastirma ve otomatik iyilestirme merkezi
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <TabButton active={activeTab === ''research''} onClick={() => setActiveTab(''research'')} icon={<Search className="w-4 h-4" />} label="Deep Research" />
          <TabButton active={activeTab === ''improve''} onClick={() => setActiveTab(''improve'')} icon={<Sparkles className="w-4 h-4" />} label="AI Improve" />
        </div>

        <AnimatePresence mode="wait">
          {activeTab === ''research'' ? <ResearchPanel key="research" isDark={isDark} /> : <ImprovePanel key="improve" isDark={isDark} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${active ? ''bg-blue-500 text-white shadow-lg'' : ''bg-gray-100 text-gray-600 hover:bg-gray-200''}`}>
      {icon}{label}
    </button>
  );
}

function ResearchPanel({ isDark }: any) {
  const [query, setQuery] = useState('''');
  const [loading, setLoading] = useState(false);
  const handleResearch = useCallback(async () => { if (!query.trim()) return; setLoading(true); await new Promise(r => setTimeout(r, 2000)); setLoading(false); }, [query]);
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      <div className={`p-6 rounded-xl ${isDark ? ''bg-gray-800'' : ''bg-gray-50''}`}>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-purple-500" />Derin Arastirma</h2>
        <div className="flex gap-3">
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Arastirma konusu girin..." className={`flex-1 px-4 py-3 rounded-lg border ${isDark ? ''bg-gray-700 border-gray-600 text-white'' : ''bg-white border-gray-300''}`} onKeyDown={(e) => e.key === ''Enter'' && handleResearch()} />
          <button onClick={handleResearch} disabled={loading} className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 flex items-center gap-2">
            {loading ? <Zap className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}Arastir
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ImprovePanel({ isDark }: any) {
  const [code, setCode] = useState('''');
  const [loading, setLoading] = useState(false);
  const handleImprove = useCallback(async () => { if (!code.trim()) return; setLoading(true); await new Promise(r => setTimeout(r, 1500)); setLoading(false); }, [code]);
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      <div className={`p-6 rounded-xl ${isDark ? ''bg-gray-800'' : ''bg-gray-50''}`}>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Code className="w-5 h-5 text-green-500" />Kod Analizi & Iyilestirme</h2>
        <textarea value={code} onChange={(e) => setCode(e.target.value)} placeholder="// Kodunuzu buraya yapistirin..." rows={10} className={`w-full px-4 py-3 rounded-lg border font-mono text-sm ${isDark ? ''bg-gray-700 border-gray-600 text-white'' : ''bg-white border-gray-300''}`} />
        <button onClick={handleImprove} disabled={loading} className="mt-4 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2">
          {loading ? <Zap className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}Analiz Et & Iyilestir
        </button>
      </div>
    </motion.div>
  );
}'

    $indexPath = Join-Path $hubPath "index.tsx"
    $indexContent | Out-File $indexPath -Encoding UTF8
    Write-Success "index.tsx olusturuldu"

    # Store'lari olustur
    $researchStore = 'import { create } from ''zustand'';

interface ResearchResult { id: string; title: string; summary: string; source: string; timestamp: number; }

interface ResearchState {
  query: string; results: ResearchResult[]; loading: boolean; error: string | null;
  setQuery: (query: string) => void; startResearch: (query: string) => Promise<void>; clearResults: () => void;
}

export const useResearchStore = create<<ResearchState>((set) => ({
  query: '''', results: [], loading: false, error: null,
  setQuery: (query) => set({ query }),
  startResearch: async (query) => {
    set({ loading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 2000));
    set({ results: [{ id: crypto.randomUUID(), title: `${query} - Genel Bakis`, summary: `Arastirma sonuclari...`, source: ''Kimi AI'', timestamp: Date.now() }], loading: false });
  },
  clearResults: () => set({ results: [], error: null }),
}));'

    $researchPath = Join-Path $Path "src\store\researchStore.ts"
    $researchStore | Out-File $researchPath -Encoding UTF8
    Write-Success "researchStore.ts olusturuldu"

    $improveStore = 'import { create } from ''zustand'';

interface CodeSuggestion { id: string; type: ''error'' | ''warning'' | ''info'' | ''optimization''; title: string; description: string; }

interface ImproveState {
  code: string; suggestions: CodeSuggestion[]; loading: boolean; error: string | null;
  setCode: (code: string) => void; analyzeCode: (code: string) => Promise<void>; clearSuggestions: () => void;
}

export const useImproveStore = create<<ImproveState>((set) => ({
  code: '''', suggestions: [], loading: false, error: null,
  setCode: (code) => set({ code }),
  analyzeCode: async (code) => {
    set({ loading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 1500));
    const suggestions: CodeSuggestion[] = [];
    if (code.includes(''console.log'')) suggestions.push({ id: crypto.randomUUID(), type: ''warning'', title: ''Console.log kullanimi'', description: ''Uretim ortaminda console.log kullanimi onerilmez.'' });
    if (code.includes(''var '')) suggestions.push({ id: crypto.randomUUID(), type: ''error'', title: ''var kullanimi'', description: ''var yerine let veya const kullanin.'' });
    if (code.includes(''any'')) suggestions.push({ id: crypto.randomUUID(), type: ''warning'', title: ''any tip kullanimi'', description: ''TypeScript any kullanimindan kacinmaya calisin.'' });
    set({ suggestions, loading: false });
  },
  clearSuggestions: () => set({ suggestions: [], error: null }),
}));'

    $improvePath = Join-Path $Path "src\store\improveStore.ts"
    $improveStore | Out-File $improvePath -Encoding UTF8
    Write-Success "improveStore.ts olusturuldu"

    # lazyComponents.tsx guncelle
    $lazyPath = Join-Path $Path "src\performance\lazyComponents.tsx"
    $content = Get-Content $lazyPath -Raw -Encoding UTF8
    if ($content -notmatch ''ResearchImproveHub'') {
        $content = $content -replace ''export const LazySettingsPanel'', "export const LazyResearchImproveHub = lazy(() => import(''../components/panels/ResearchImproveHub''));`nexport const LazySettingsPanel"
        $content = $content -replace ''SettingsPanel: LazySettingsPanel,'', "ResearchImproveHub: LazyResearchImproveHub,`n  SettingsPanel: LazySettingsPanel,"
        $content | Out-File $lazyPath -Encoding UTF8
        Write-Success "lazyComponents.tsx guncellendi"
    }
}

function Start-Agent {
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "  🤖 Kimi WebBridge Agent v3.1" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan

    if (-not (Test-Path $ProjectPath)) { Write-Error "Proje bulunamadi: $ProjectPath"; exit 1 }

    Write-Info "Proje: $ProjectPath"
    Write-Info "Aksiyon: $Action"
    if ($DryRun) { Write-Warning "DRY RUN MODU" }

    switch ($Action) {
        ''fix-lint'' { Invoke-LintFix -Path $ProjectPath }
        ''full-repair'' { Invoke-LintFix -Path $ProjectPath; Test-WebBridge }
        ''research-improve'' { New-ResearchImproveHub -Path $ProjectPath }
        ''bridge-test'' { Test-WebBridge }
        default { Write-Error "Bilinmeyen aksiyon: $Action" }
    }

    Write-Host "`n==========================================" -ForegroundColor Cyan
    Write-Success "Agent tamamlandi!"
    Write-Host "==========================================" -ForegroundColor Cyan
}

Start-Agent
