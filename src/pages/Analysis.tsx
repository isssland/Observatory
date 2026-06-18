import { useState } from 'react'
import type { AiAnalysis, SkillXpChange, StatusAttributes } from '../types'

interface Props {
  entryText: string
  analysis: AiAnalysis
  onConfirm: () => void
  onDiscard: () => void
}

export default function Analysis({ entryText, analysis, onConfirm, onDiscard }: Props) {
  const [editing, setEditing] = useState(false)
  const [edited, setEdited] = useState<AiAnalysis>(() =>
    structuredClone(analysis)
  )

  const data = editing ? edited : analysis

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-stone-900/80" onClick={onDiscard} />

      {/* 弹窗 — CRT 终端风格 */}
      <div className="relative bg-stone-900 border-4 border-stone-600 w-full max-w-sm overflow-hidden"
        style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.4)' }}
      >
        {/* 扫描线 */}
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
          }}
        />

        <div className="relative z-20 p-5 font-typewriter">
          {/* 页眉 */}
          <div className="text-[9px] text-amber-600/60 tracking-widest mb-4 flex justify-between">
            <span>ANALYSIS RESULT</span>
            <span className="animate-pulse">●</span>
          </div>

          {/* 源日志 */}
          <div className="mb-4 p-2 border border-amber-900/20 bg-amber-900/5">
            <div className="text-[8px] text-amber-700/50 tracking-widest mb-1">SOURCE</div>
            <p className="text-[9px] text-amber-600/40 leading-relaxed line-clamp-2">{entryText}</p>
          </div>

          {/* 状态变化 */}
          <div className="mb-4">
            <div className="text-[8px] text-amber-700/50 tracking-widest mb-2">
              STATUS DELTA
            </div>
            <div className="space-y-1">
              <DeltaLine label="SAN" value={data.statusChanges.san} editing={editing} onChange={(v) => updateStatus('san', v)} />
              <DeltaLine label="Focus" value={data.statusChanges.focus} editing={editing} onChange={(v) => updateStatus('focus', v)} />
              <DeltaLine label="Energy" value={data.statusChanges.energy} editing={editing} onChange={(v) => updateStatus('energy', v)} />
            </div>
          </div>

          {/* 技能变化 */}
          <div className="mb-5">
            <div className="text-[8px] text-amber-700/50 tracking-widest mb-2">
              SKILL EXPERIENCE
            </div>
            {data.skillXpChanges.length === 0 ? (
              <div className="text-[10px] text-amber-600/30 py-2">NO_CHANGES</div>
            ) : (
              <div className="space-y-1">
                {data.skillXpChanges.map((sc, i) => (
                  <SkillDeltaLine key={i} change={sc} editing={editing} onChange={(v) => updateSkill(i, v)} />
                ))}
              </div>
            )}
          </div>

          {/* 按钮 */}
          <div className="space-y-2">
            {editing ? (
              <>
                <button
                  onClick={() => {
                    setEditing(false)
                    setEdited(structuredClone(analysis))
                  }}
                  className="w-full py-2.5 border border-amber-800/30 text-amber-600/50 text-[10px] font-typewriter tracking-widest hover:border-amber-700/50 hover:text-amber-500/70"
                >
                  CANCEL EDIT
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="w-full py-2.5 border border-amber-600/40 text-amber-500 text-[10px] font-typewriter tracking-widest hover:border-amber-500 hover:text-amber-400"
                >
                  DONE EDITING
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onConfirm}
                  className="w-full py-2.5 border border-amber-600/40 text-amber-500 text-[10px] font-typewriter tracking-widest hover:border-amber-500 hover:text-amber-400 hover:bg-amber-900/10 transition-colors"
                >
                  [ WRITE TO FILE ]
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(true)}
                    className="flex-1 py-2.5 border border-amber-800/30 text-amber-600/50 text-[10px] font-typewriter tracking-widest hover:border-amber-700/50 hover:text-amber-500/70"
                  >
                    EDIT
                  </button>
                  <button
                    onClick={onDiscard}
                    className="flex-1 py-2.5 border border-amber-800/20 text-amber-700/30 text-[10px] font-typewriter tracking-widest hover:border-amber-700/40 hover:text-amber-600/50"
                  >
                    DISCARD
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  function updateStatus(key: keyof StatusAttributes, value: number) {
    setEdited((prev) => ({
      ...prev,
      statusChanges: { ...prev.statusChanges, [key]: value },
    }))
  }

  function updateSkill(index: number, xpGain: number) {
    setEdited((prev) => {
      const updated = [...prev.skillXpChanges]
      updated[index] = { ...updated[index], xpGain: Math.max(0, xpGain) }
      return { ...prev, skillXpChanges: updated }
    })
  }
}

// ===== 子组件 =====

function DeltaLine({
  label,
  value,
  editing,
  onChange,
}: {
  label: string
  value: number
  editing: boolean
  onChange: (v: number) => void
}) {
  const sign = value > 0 ? '+' : ''
  const color = value > 0 ? 'text-amber-400' : value < 0 ? 'text-amber-700/50' : 'text-amber-700/30'

  return (
    <div className="flex items-center justify-between py-1.5 px-2">
      <span className="text-[10px] text-amber-500/70 tracking-wider">{label}</span>
      {editing ? (
        <div className="flex items-center gap-1">
          <button onClick={() => onChange(value - 1)} className="w-5 h-5 border border-amber-800/40 text-amber-600/50 text-xs hover:border-amber-700/60">−</button>
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
            className="w-10 text-center bg-transparent border border-amber-800/40 py-0.5 text-[10px] text-amber-400 tabular-nums"
          />
          <button onClick={() => onChange(value + 1)} className="w-5 h-5 border border-amber-800/40 text-amber-600/50 text-xs hover:border-amber-700/60">+</button>
        </div>
      ) : (
        <span className={`text-[10px] tabular-nums ${color}`}>
          {value === 0 ? '·' : `${sign}${value}`}
        </span>
      )}
    </div>
  )
}

function SkillDeltaLine({
  change,
  editing,
  onChange,
}: {
  change: SkillXpChange
  editing: boolean
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between py-1.5 px-2">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-amber-500/70 tracking-wider">{change.skillName}</span>
        {change.isNewSkill && (
          <span className="text-[7px] text-red-600/60 border border-red-700/30 px-1 uppercase tracking-widest">
            NEW
          </span>
        )}
      </div>
      {editing ? (
        <div className="flex items-center gap-1">
          <button onClick={() => onChange(change.xpGain - 1)} className="w-5 h-5 border border-amber-800/40 text-amber-600/50 text-xs hover:border-amber-700/60">−</button>
          <input
            type="number"
            value={change.xpGain}
            onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
            className="w-10 text-center bg-transparent border border-amber-800/40 py-0.5 text-[10px] text-amber-400 tabular-nums"
          />
          <button onClick={() => onChange(change.xpGain + 1)} className="w-5 h-5 border border-amber-800/40 text-amber-600/50 text-xs hover:border-amber-700/60">+</button>
        </div>
      ) : (
        <span className="text-[10px] text-amber-400 tabular-nums">+{change.xpGain} XP</span>
      )}
    </div>
  )
}
