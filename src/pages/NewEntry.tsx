import { useEntrySubmission } from '../hooks/useEntrySubmission'
import { getStoredProvider } from '../services/aiAnalysis'
import type { AiAnalysis } from '../types'

interface Props {
  onAnalysisComplete: (entryText: string, analysis: AiAnalysis) => void
}

export default function NewEntry({ onAnalysisComplete }: Props) {
  const { text, setText, loading, error, cursorVisible, textareaRef, submit } = useEntrySubmission(onAnalysisComplete)
  const provider = getStoredProvider()

  const displayLines = text
    ? text.split('\n').map((line) => `> ${line}`).join('\n')
    : ''

  return (
    <div className="max-w-md mx-auto px-4 pt-8 pb-4">
      <div className="mb-6">
        <h1 className="text-lg font-bold text-stone-300 font-mono tracking-wide">
          Today&rsquo;s Log
        </h1>
        <div className="mt-1 h-px bg-stone-700" />
      </div>

      <div className="border border-stone-600 bg-stone-900/50 p-4 font-mono text-sm">
        {text ? (
          <div className="text-stone-400 mb-1 whitespace-pre-wrap leading-relaxed">
            {displayLines}
            <span className={`inline-block w-2 h-4 align-middle ml-0.5 ${cursorVisible ? 'bg-stone-500' : 'bg-transparent'}`} />
          </div>
        ) : (
          <div className="text-stone-600 leading-relaxed">
            <span className="text-stone-500">&gt; </span>
            <span className={`inline-block w-2 h-4 align-middle ${cursorVisible ? 'bg-stone-600' : 'bg-transparent'}`} />
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault()
              submit()
            }
          }}
          placeholder={['> Fixed a bug in the project...', '> Studied React useEffect pattern...', '> Played some games in the evening...'].join('\n')}
          rows={8}
          className="w-full bg-transparent border-none outline-none text-stone-200 placeholder-stone-700 resize-none leading-relaxed font-mono text-sm"
          style={{ caretColor: '#a8a29e' }}
          disabled={loading}
        />

        <div className="flex justify-between items-end mt-3 pt-2 border-t border-dashed border-stone-800">
          <span className="text-[10px] text-stone-700 font-mono">
            {text.split('\n').filter(Boolean).length} lines
          </span>
          <span className="text-[10px] text-stone-700 font-mono">
            {new Date().toLocaleDateString('zh-CN')}
          </span>
        </div>
      </div>

      {error && (
        <div className="mt-3 p-3 border border-red-900/50 bg-red-950/20 font-mono text-xs text-red-400">
          ERROR: {error}
        </div>
      )}

      {!provider && !error && (
        <div className="mt-3 p-3 border border-stone-700 bg-stone-900/30 font-mono text-[10px] text-stone-500">
          * API key not configured. Use the gear icon on the FILE tab.
        </div>
      )}

      <button
        onClick={submit}
        disabled={loading || !text.trim()}
        className={`mt-4 w-full py-3 border font-mono text-sm tracking-wider transition-all ${
          loading
            ? 'border-stone-700 text-stone-600 cursor-wait'
            : text.trim()
              ? 'border-stone-500 text-stone-300 hover:border-stone-400 hover:bg-stone-900/50 active:bg-stone-900'
              : 'border-stone-800 text-stone-700 cursor-default'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            PROCESSING
            <span className="inline-block w-2 h-4 bg-stone-500 animate-pulse" />
          </span>
        ) : (
          '[ PROCESS ENTRY ]'
        )}
      </button>

      <p className="mt-2 text-[10px] text-stone-700 font-mono text-center">
        Ctrl + Enter to submit
      </p>
    </div>
  )
}
