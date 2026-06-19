import { useEntrySubmission } from '../hooks/useEntrySubmission'
import { getStoredProvider } from '../services/aiAnalysis'
import type { AiAnalysis } from '../types'

interface Props {
  onAnalysisComplete: (entryText: string, analysis: AiAnalysis) => void
}

export default function Terminal({ onAnalysisComplete }: Props) {
  const { text, setText, loading, error, cursorVisible, textareaRef, submit } = useEntrySubmission(onAnalysisComplete)
  const provider = getStoredProvider()

  return (
    <div className="max-w-sm mx-auto px-2 pb-3 relative z-10">
      {/* ===== 终端机身（灰色外壳） ===== */}
      <div className="bg-stone-400 rounded-t-xl px-3 pt-3 pb-1.5">
        {/* 黑色屏幕 */}
        <div className="relative bg-stone-900 rounded-md overflow-hidden border-2 border-stone-700"
          style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6)' }}
        >
          {/* 扫描线 */}
          <div
            className="absolute inset-0 pointer-events-none z-10 opacity-[0.04]"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
            }}
          />

          <div className="relative p-3 font-typewriter">
            {/* 屏幕标头 */}
            <div className="flex justify-between items-center mb-1.5 text-[8px] text-amber-600/50 tracking-[0.25em]">
              <span>TERMINAL</span>
              <span className={loading ? 'animate-pulse text-amber-500/70' : 'text-amber-600/40'}>
                {loading ? 'PROCESSING' : 'READY'}
              </span>
            </div>

            {/* 输入回显 */}
            {text ? (
              <div className="text-xs text-amber-500/80 leading-relaxed whitespace-pre-wrap mb-1">
                {text.split('\n').map((line, i) => (
                  <div key={i} className="flex">
                    <span className="text-amber-600/60 mr-1.5 select-none">&gt;</span>
                    <span className="text-amber-400/80">{line}</span>
                  </div>
                ))}
                <span className={`inline-block w-1.5 h-3.5 ml-0.5 align-middle ${cursorVisible ? 'bg-amber-400/70' : 'bg-transparent'}`} />
              </div>
            ) : (
              <div className="text-xs leading-relaxed mb-1 flex">
                <span className="text-amber-500/60 mr-1.5 select-none">&gt;</span>
                <span className={`inline-block w-1.5 h-3.5 align-middle ${cursorVisible ? 'bg-amber-400/70' : 'bg-transparent'}`} />
              </div>
            )}

            {/* 透明 textarea */}
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
              placeholder="…"
              rows={3}
              className="w-full bg-transparent border-none outline-none text-amber-400/80 placeholder-amber-700/30 resize-none leading-relaxed font-typewriter text-xs"
              style={{ caretColor: 'transparent' }}
              disabled={loading}
            />

            {/* API Key 未配置提示 — 在屏幕内 */}
            {!provider && !error && (
              <div className="mt-1 text-[8px] text-amber-600/30 tracking-wider">
                NO API KEY
              </div>
            )}

            {/* 错误 */}
            {error && (
              <div className="mt-1 text-[8px] text-red-400/70">{error}</div>
            )}
          </div>
        </div>

        {/* ===== 按键栏 ===== */}
        <div className="flex items-center gap-3 mt-2 pb-0.5 px-1">
          <button
            onClick={() => textareaRef.current?.focus()}
            className="text-[9px] text-amber-800/50 font-typewriter tracking-[0.2em] border border-amber-800/20 px-2.5 py-0.5 hover:text-amber-700/70 hover:border-amber-700/40 transition-colors"
          >
            INSERT
          </button>
          <span className="text-[8px] text-stone-400/50 font-typewriter tracking-widest">
            {text.split('\n').filter(Boolean).length}L
          </span>
          <div className="flex-1" />
          <button
            onClick={submit}
            disabled={loading || !text.trim()}
            className={`text-[9px] font-typewriter tracking-[0.2em] border px-3 py-0.5 transition-all ${
              loading || !text.trim()
                ? 'text-stone-400/30 border-stone-400/20 cursor-default'
                : 'text-amber-600/90 border-amber-600/60 hover:text-amber-500 hover:border-amber-500/70 active:bg-amber-900/20'
            }`}
          >
            ENTER
          </button>
        </div>
      </div>
    </div>
  )
}
