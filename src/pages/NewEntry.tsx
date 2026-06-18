import { useState } from 'react'
import { useCharacterStore } from '../store/characterStore'
import { analyzeEntry, getStoredProvider } from '../services/aiAnalysis'
import type { AiAnalysis } from '../types'

interface Props {
  onAnalysisComplete: (entryText: string, analysis: AiAnalysis) => void
}

export default function NewEntry({ onAnalysisComplete }: Props) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const character = useCharacterStore((s) => s)

  const provider = getStoredProvider()

  const handleSubmit = async () => {
    const trimmed = text.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)

    const result = await analyzeEntry(
      {
        status: character.status,
        skills: character.skills,
        entries: character.entries,
      },
      trimmed
    )

    setLoading(false)

    if (result.success) {
      onAnalysisComplete(trimmed, result.analysis)
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-8 pb-4">
      <h1 className="text-xl font-bold mb-2 text-emerald-400 font-mono">
        New Entry
      </h1>
      <p className="text-xs text-slate-500 mb-6">
        Write or paste your journal log. AI will analyze it and update your stats.
      </p>

      {/* 文本框 */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={
          "What did you do today?\n\ne.g. Fixed a bug in the BookMap project, practiced React hooks, played some games in the evening..."
        }
        rows={10}
        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-4 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-emerald-600 transition-colors"
        disabled={loading}
      />

      {/* 错误提示 */}
      {error && (
        <div className="mt-3 p-3 bg-red-900/30 border border-red-800 rounded-lg text-xs text-red-400">
          {error}
        </div>
      )}

      {/* 缺少 API Key 提示 */}
      {!provider && !error && (
        <div className="mt-3 p-3 bg-amber-900/20 border border-amber-800/50 rounded-lg text-xs text-amber-400">
          ⚠ No API key configured. Open Settings (⚙ on Sheet page) to configure your
          Claude or OpenAI API key.
        </div>
      )}

      {/* 提交按钮 */}
      <button
        onClick={handleSubmit}
        disabled={loading || !text.trim()}
        className={`mt-4 w-full py-3 rounded-lg font-semibold text-sm transition-all ${
          loading
            ? 'bg-slate-700 text-slate-400 cursor-wait'
            : text.trim()
              ? 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-[0.98]'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Analyzing...
          </span>
        ) : (
          'Analyze Entry'
        )}
      </button>
    </div>
  )
}
