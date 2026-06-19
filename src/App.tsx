import { useState, useEffect } from 'react'
import CharacterSheet from './pages/CharacterSheet'
import NewEntry from './pages/NewEntry'
import Analysis from './pages/Analysis'
import { useCharacterStore } from './store/characterStore'
import type { AiAnalysis } from './types'

type Page = 'sheet' | 'entry' | 'analysis'

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('sheet')
  const [pendingEntry, setPendingEntry] = useState<string>('')
  const [pendingAnalysis, setPendingAnalysis] = useState<AiAnalysis | null>(null)
  const [printing, setPrinting] = useState(false)

  const hydrate = useCharacterStore((s) => s.hydrate)
  const applyAnalysis = useCharacterStore((s) => s.applyAnalysis)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const handleAnalysisComplete = (entryText: string, analysis: AiAnalysis) => {
    setPendingEntry(entryText)
    setPendingAnalysis(analysis)
    setCurrentPage('analysis')
  }

  // 确认 → 打印动画 → 更新数据（使用编辑后的 analysis）
  const handleConfirm = (finalAnalysis: AiAnalysis) => {
    setCurrentPage('sheet')
    setPrinting(true)

    setTimeout(() => {
      applyAnalysis(pendingEntry, finalAnalysis)
      setPendingEntry('')
      setPendingAnalysis(null)
      setPrinting(false)
    }, 1200)
  }

  const handleDiscard = () => {
    setPendingEntry('')
    setPendingAnalysis(null)
    setCurrentPage('entry')
  }

  return (
    <div className="min-h-screen bg-stone-200 text-stone-800 font-typewriter pb-14">
      {/* ===== 纸张纹理背景 ===== */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='60' height='60' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ===== 页面内容 ===== */}
      {currentPage === 'sheet' && <CharacterSheet printing={printing} />}
      {currentPage === 'entry' && (
        <NewEntry onAnalysisComplete={handleAnalysisComplete} />
      )}
      {currentPage === 'analysis' && pendingAnalysis && (
        <Analysis
          entryText={pendingEntry}
          analysis={pendingAnalysis}
          onConfirm={handleConfirm}
          onDiscard={handleDiscard}
        />
      )}

      {/* ===== 底部 Tab Bar — 档案标签 ===== */}
      {currentPage !== 'analysis' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-stone-100 border-t border-stone-300 z-40">
          <div className="flex max-w-md mx-auto">
            <button
              onClick={() => setCurrentPage('sheet')}
              className={`flex-1 py-3 font-typewriter text-xs tracking-widest border-b-2 transition-colors ${
                currentPage === 'sheet'
                  ? 'border-stone-600 text-stone-700'
                  : 'border-transparent text-stone-400 hover:text-stone-500'
              }`}
            >
              FILE
            </button>
            <button
              onClick={() => setCurrentPage('entry')}
              className={`flex-1 py-3 font-typewriter text-xs tracking-widest border-b-2 transition-colors ${
                currentPage === 'entry'
                  ? 'border-stone-600 text-stone-700'
                  : 'border-transparent text-stone-400 hover:text-stone-500'
              }`}
            >
              LOG
            </button>
          </div>
        </nav>
      )}
    </div>
  )
}
