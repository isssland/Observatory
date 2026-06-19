import { useEntrySubmission } from '../hooks/useEntrySubmission'
import { getStoredProvider } from '../services/aiAnalysis'
import type { AiAnalysis } from '../types'

const C = { r: 146, g: 92, b: 8 } // #925c08

interface Props {
  onAnalysisComplete: (entryText: string, analysis: AiAnalysis) => void
}

export default function Terminal({ onAnalysisComplete }: Props) {
  const { text, setText, loading, error, cursorVisible, textareaRef, submit } = useEntrySubmission(onAnalysisComplete)
  const provider = getStoredProvider()
  const lines = text.split('\n').filter(Boolean).length
  const canSubmit = !loading && text.trim().length > 0

  return (
    <div className="max-w-sm mx-auto">
      {/* ===== 终端外壳 ===== */}
      <div className="bg-stone-400 border-2 border-stone-500 px-2.5 pt-2.5 pb-2"
        style={{ borderRadius: '6px 6px 2px 2px' }}>
        {/* ===== 屏幕 ===== */}
        <div className="relative bg-[#1a1814] border-2 border-stone-700 overflow-hidden"
          style={{ borderRadius: '3px', boxShadow: 'inset 0 0 50px rgba(0,0,0,0.7)' }}>
          {/* 扫描线 */}
          <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.05]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)' }} />
          {/* 屏幕辉光 */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{ background: `radial-gradient(ellipse at center, rgba(${C.r},${C.g},${C.b},0.12) 0%, transparent 70%)` }} />

          <div className="relative z-20 p-4 font-typewriter">
            {/* 标头 */}
            <div className="flex justify-between items-center mb-2 text-[9px] tracking-[0.3em]"
              style={{ color: `rgba(${C.r},${C.g},${C.b},0.55)` }}>
              <span>OBSERVATORY_TERMINAL</span>
              <span>{new Date().toLocaleDateString('zh-CN').replace(/\//g, '/')}</span>
            </div>

            {/* 提示行 */}
            <div className="text-[9px] tracking-wider mb-2"
              style={{ color: `rgba(${C.r},${C.g},${C.b},0.5)` }}>
              &gt; ENTER LOG. PRESS CTRL+ENTER TO PROCESS.
            </div>

            {/* 输入区域 */}
            <div className="mb-2 text-sm" style={{ lineHeight: 1.6 }}>
              {text ? (
                text.split('\n').map((line, i, arr) => {
                  const isLast = i === arr.length - 1
                  return (
                    <div key={i} className="flex">
                      <span className="mr-1.5 select-none flex-shrink-0"
                        style={{ color: `rgba(${C.r},${C.g},${C.b},0.7)` }}>&gt;</span>
                      <span style={{ color: `rgba(${C.r},${C.g},${C.b},0.95)` }}>
                        {line}
                        {isLast && cursorVisible && (
                          <span className="inline-block w-1.5 h-4 ml-0.5 align-middle"
                            style={{ backgroundColor: `rgba(${C.r},${C.g},${C.b},0.9)` }} />
                        )}
                      </span>
                    </div>
                  )
                })
              ) : (
                <div className="flex">
                  <span className="mr-1.5 select-none flex-shrink-0"
                    style={{ color: `rgba(${C.r},${C.g},${C.b},0.7)` }}>&gt;</span>
                  {cursorVisible && (
                    <span className="inline-block w-1.5 h-4 align-middle"
                      style={{ backgroundColor: `rgba(${C.r},${C.g},${C.b},0.9)` }} />
                  )}
                </div>
              )}
            </div>

            {/* 透明 textarea */}
            <div className="relative">
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
                rows={5}
                className="absolute inset-0 w-full bg-transparent border-none outline-none resize-none font-typewriter text-sm opacity-0"
                style={{ caretColor: 'transparent', color: 'transparent' }}
                disabled={loading}
                autoFocus
              />
              <div style={{ height: '7rem' }} />
            </div>

            {/* 底部分割 + 状态栏 */}
            <div className="mt-1 pt-2 flex justify-between items-center text-[9px] tracking-wider"
              style={{ borderTop: `1px solid rgba(${C.r},${C.g},${C.b},0.15)`, color: `rgba(${C.r},${C.g},${C.b},0.55)` }}>
              <span>LINES: {lines}</span>
              <span>
                {loading ? 'PROCESSING…' : provider ? 'STANDBY' : 'API: NOT SET'}
              </span>
            </div>

            {/* 错误信息 */}
            {error && (
              <div className="mt-1.5 text-[8px] tracking-wider" style={{ color: 'rgba(240,100,80,0.7)' }}>
                {error}
              </div>
            )}
          </div>
        </div>

        {/* ===== 屏幕下方按键区 ===== */}
        <div className="flex items-center gap-3 mt-2 px-0.5">
          <span className="text-[8px] text-stone-600 font-typewriter tracking-widest">
            {lines} LINE{lines !== 1 ? 'S' : ''}
          </span>
          <span className="flex-1" />
          <button
            onClick={submit}
            disabled={!canSubmit}
            className="font-typewriter text-[9px] tracking-[0.2em] px-3 py-1 border transition-colors select-none"
            style={canSubmit
              ? { color: `rgba(${C.r},${C.g},${C.b},0.8)`, borderColor: `rgba(${C.r},${C.g},${C.b},0.5)` }
              : { color: 'rgba(80,70,60,0.4)', borderColor: 'rgba(80,70,60,0.2)' }}
            onMouseEnter={(e) => { if (canSubmit) { e.currentTarget.style.color = `rgba(${C.r},${C.g},${C.b},0.95)`; e.currentTarget.style.borderColor = `rgba(${C.r},${C.g},${C.b},0.65)`; e.currentTarget.style.backgroundColor = `rgba(${C.r},${C.g},${C.b},0.06)` } }}
            onMouseLeave={(e) => { e.currentTarget.style.color = canSubmit ? `rgba(${C.r},${C.g},${C.b},0.8)` : ''; e.currentTarget.style.borderColor = canSubmit ? `rgba(${C.r},${C.g},${C.b},0.5)` : ''; e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            [ PROCESS ENTRY ]
          </button>
        </div>
      </div>

      {/* 快捷键提示 */}
      <p className="mt-1.5 text-center font-typewriter text-[9px] text-stone-400 tracking-wider">
        Ctrl + Enter to submit
      </p>
    </div>
  )
}
