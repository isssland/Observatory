import { useState, useRef, useEffect } from 'react'
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
  const [cursorVisible, setCursorVisible] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const character = useCharacterStore((s) => s)
  const provider = getStoredProvider()

  // 光标闪烁
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((v) => !v)
    }, 530)
    return () => clearInterval(interval)
  }, [])

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
    <div className="max-w-md mx-auto px-4 pt-6 pb-4">
      {/* ===== CRT 终端容器 ===== */}
      <div className="relative bg-stone-900 rounded-sm border-4 border-stone-700 overflow-hidden"
        style={{ boxShadow: 'inset 0 0 60px rgba(0,0,0,0.5), 0 0 0 2px #292524' }}
      >
        {/* 扫描线效果 */}
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-[0.04]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
          }}
        />

        {/* 屏幕内容 */}
        <div className="relative z-20 p-5 font-typewriter">
          {/* 屏幕顶部标签 */}
          <div className="flex justify-between items-center mb-4 text-[9px] text-amber-600/60 tracking-widest">
            <span>OBSERVATORY.TERMINAL</span>
            <span>{new Date().toLocaleDateString('zh-CN')}</span>
          </div>

          {/* 输入提示 + 文本区 */}
          <div className="relative">
            {/* 提示行 */}
            <div className="text-[10px] text-amber-600/50 mb-2 tracking-wide">
              {'> ENTER LOG. PRESS CTRL+ENTER TO PROCESS.'}
            </div>

            {/* 已输入内容展示 */}
            {text ? (
              <div className="text-sm text-amber-500/80 leading-relaxed whitespace-pre-wrap mb-2">
                {text.split('\n').map((line, i) => (
                  <div key={i} className="flex">
                    <span className="text-amber-600/50 mr-2 select-none">&gt;</span>
                    <span>{line}</span>
                  </div>
                ))}
                <span className={`inline-block w-2 h-4 ml-0.5 align-middle ${cursorVisible ? 'bg-amber-500/70' : 'bg-transparent'}`} />
              </div>
            ) : (
              <div className="text-sm text-amber-600/40 leading-relaxed mb-2 flex">
                <span className="text-amber-600/50 mr-2 select-none">&gt;</span>
                <span className={`inline-block w-2 h-4 align-middle ${cursorVisible ? 'bg-amber-500/60' : 'bg-transparent'}`} />
              </div>
            )}

            {/* 透明 textarea（捕获输入） */}
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              placeholder={
                [
                  'Fixed a bug in the project...',
                  'Studied React useEffect pattern...',
                  'Played games in the evening...',
                ].join('\n')
              }
              rows={7}
              className="w-full bg-transparent border-none outline-none text-amber-500/80 placeholder-amber-700/30 resize-none leading-relaxed font-typewriter text-sm"
              style={{ caretColor: '#d97706' }}
              disabled={loading}
              autoFocus
            />
          </div>

          {/* 底部状态行 */}
          <div className="flex justify-between items-center mt-3 pt-2 border-t border-amber-900/20 text-[9px] text-amber-700/40 tracking-widest">
            <span>LINES: {text.split('\n').filter(Boolean).length}</span>
            <span>{loading ? 'PROCESSING...' : 'READY'}</span>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mt-3 p-3 bg-red-950/30 border border-red-900/50 font-typewriter text-[10px] text-red-400">
          ERROR: {error}
        </div>
      )}

      {/* 缺少 API Key */}
      {!provider && !error && (
        <div className="mt-3 font-typewriter text-[9px] text-stone-400 text-center">
          * API key not configured. Use gear icon on FILE tab.
        </div>
      )}

      {/* PROCESS 按钮 */}
      <button
        onClick={handleSubmit}
        disabled={loading || !text.trim()}
        className={`mt-4 w-full py-3 font-typewriter text-xs tracking-widest border transition-all ${
          loading
            ? 'border-stone-300 text-stone-400 cursor-wait bg-stone-100'
            : text.trim()
              ? 'border-stone-500 text-stone-600 hover:bg-stone-100 hover:border-stone-600 active:bg-stone-200'
              : 'border-stone-300 text-stone-300 cursor-default'
        }`}
      >
        {loading ? 'PROCESSING...' : '[ PROCESS ENTRY ]'}
      </button>

      <p className="mt-2 text-[9px] text-stone-400 text-center font-typewriter">
        Ctrl + Enter to submit
      </p>
    </div>
  )
}
