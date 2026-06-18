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
  const hydrate = useCharacterStore((s) => s.hydrate)
  const applyAnalysis = useCharacterStore((s) => s.applyAnalysis)

  // 启动时从 IndexedDB 加载数据
  useEffect(() => {
    hydrate()
  }, [hydrate])

  // Entry → Analysis（AI 分析完成后）
  const handleAnalysisComplete = (entryText: string, analysis: AiAnalysis) => {
    setPendingEntry(entryText)
    setPendingAnalysis(analysis)
    setCurrentPage('analysis')
  }

  // Analysis → Sheet（用户确认）
  const handleConfirm = () => {
    if (pendingAnalysis) {
      applyAnalysis(pendingEntry, pendingAnalysis)
    }
    setPendingEntry('')
    setPendingAnalysis(null)
    setCurrentPage('sheet')
  }

  // Analysis → Entry（用户修改）
  const handleCancel = () => {
    setPendingEntry('')
    setPendingAnalysis(null)
    setCurrentPage('entry')
  }

  const showTabBar = currentPage !== 'analysis'

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-16">
      {/* Page content */}
      {currentPage === 'sheet' && <CharacterSheet />}
      {currentPage === 'entry' && (
        <NewEntry onAnalysisComplete={handleAnalysisComplete} />
      )}
      {currentPage === 'analysis' && pendingAnalysis && (
        <Analysis
          entryText={pendingEntry}
          analysis={pendingAnalysis}
          onConfirm={handleConfirm}
          onDiscard={handleCancel}
        />
      )}

      {/* Bottom Tab Bar（Analysis 页面隐藏） */}
      {showTabBar && (
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700">
          <div className="flex justify-around items-center h-14 max-w-md mx-auto">
            <button
              onClick={() => setCurrentPage('sheet')}
              className={`flex flex-col items-center px-6 py-1 text-xs transition-colors ${
                currentPage === 'sheet' ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Sheet
            </button>
            <button
              onClick={() => setCurrentPage('entry')}
              className={`flex flex-col items-center px-6 py-1 text-xs transition-colors ${
                currentPage === 'entry' ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Entry
            </button>
          </div>
        </nav>
      )}
    </div>
  )
}
