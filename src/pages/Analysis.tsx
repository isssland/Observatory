import { useState } from 'react'
import type { AiAnalysis, SkillXpChange, StatusAttributes } from '../types'

interface Props {
  entryText: string
  analysis: AiAnalysis
  onConfirm: () => void
  onDiscard: () => void
}

export default function Analysis({ entryText, analysis, onConfirm, onDiscard }: Props) {
  // 用户可编辑的临时副本
  const [editing, setEditing] = useState(false)
  const [edited, setEdited] = useState<AiAnalysis>(() =>
    structuredClone(analysis)
  )

  const data = editing ? edited : analysis

  return (
    <div className="max-w-md mx-auto px-4 pt-8 pb-4">
      <h1 className="text-xl font-bold mb-1 text-amber-400 font-mono">Analysis</h1>
      <p className="text-xs text-slate-500 mb-6">
        AI analyzed your entry. Review the changes, then confirm or edit.
      </p>

      {/* 原始日志摘要 */}
      <div className="mb-6 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
          Journal Entry
        </div>
        <p className="text-xs text-slate-400 line-clamp-3">{entryText}</p>
      </div>

      {/* 状态变化 */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Status Changes
        </h2>
        <StatusChangeRow label="SAN" value={data.statusChanges.san} editing={editing} onChange={(v) => updateStatus('san', v)} />
        <StatusChangeRow label="Focus" value={data.statusChanges.focus} editing={editing} onChange={(v) => updateStatus('focus', v)} />
        <StatusChangeRow label="Energy" value={data.statusChanges.energy} editing={editing} onChange={(v) => updateStatus('energy', v)} />
      </section>

      {/* 技能变化 */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Skill XP Changes
        </h2>
        {data.skillXpChanges.length === 0 ? (
          <p className="text-xs text-slate-600 py-2">No skill changes detected.</p>
        ) : (
          <div className="space-y-1.5">
            {data.skillXpChanges.map((sc, i) => (
              <SkillChangeRow key={i} change={sc} editing={editing} onChange={(v) => updateSkill(i, v)} />
            ))}
          </div>
        )}
      </section>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        {editing ? (
          <>
            <button
              onClick={() => {
                setEditing(false)
                setEdited(structuredClone(analysis))
              }}
              className="flex-1 py-3 rounded-lg font-semibold text-sm bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
            >
              Cancel Edit
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex-1 py-3 rounded-lg font-semibold text-sm bg-sky-600 text-white hover:bg-sky-500 transition-colors"
            >
              Done Editing
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onDiscard}
              className="flex-1 py-3 rounded-lg font-semibold text-sm bg-slate-700 text-slate-400 hover:bg-slate-600 transition-colors"
            >
              Discard
            </button>
            <button
              onClick={() => setEditing(true)}
              className="flex-1 py-3 rounded-lg font-semibold text-sm bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 rounded-lg font-semibold text-sm bg-emerald-600 text-white hover:bg-emerald-500 active:scale-[0.98] transition-all"
            >
              Confirm
            </button>
          </>
        )}
      </div>
    </div>
  )

  // ===== 内联更新函数 =====
  function updateStatus(key: keyof StatusAttributes, value: number) {
    setEdited((prev) => ({
      ...prev,
      statusChanges: { ...prev.statusChanges, [key]: value },
    }))
  }

  function updateSkill(index: number, xpGain: number) {
    setEdited((prev) => {
      const updated = [...prev.skillXpChanges]
      updated[index] = { ...updated[index], xpGain }
      return { ...prev, skillXpChanges: updated }
    })
  }
}

// ===== 子组件 =====

function StatusChangeRow({
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
  const isPositive = value > 0
  const hasChange = value !== 0

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg border border-slate-800">
      <span className="text-sm font-mono text-slate-300">{label}</span>
      {editing ? (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChange(value - 1)}
            className="w-7 h-7 rounded bg-slate-700 text-slate-300 text-sm hover:bg-slate-600"
          >
            −
          </button>
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
            className="w-14 text-center bg-slate-700 rounded py-1 text-sm font-mono text-slate-200 border border-slate-600"
          />
          <button
            onClick={() => onChange(value + 1)}
            className="w-7 h-7 rounded bg-slate-700 text-slate-300 text-sm hover:bg-slate-600"
          >
            +
          </button>
        </div>
      ) : (
        <span
          className={`text-sm font-mono font-bold ${
            hasChange
              ? isPositive
                ? 'text-emerald-400'
                : 'text-red-400'
              : 'text-slate-600'
          }`}
        >
          {hasChange ? (isPositive ? `+${value}` : `${value}`) : '—'}
        </span>
      )}
    </div>
  )
}

function SkillChangeRow({
  change,
  editing,
  onChange,
}: {
  change: SkillXpChange
  editing: boolean
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg border border-slate-800">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-300">{change.skillName}</span>
        {change.isNewSkill && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-400 font-mono">
            NEW
          </span>
        )}
      </div>
      {editing ? (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChange(Math.max(0, change.xpGain - 1))}
            className="w-7 h-7 rounded bg-slate-700 text-slate-300 text-sm hover:bg-slate-600"
          >
            −
          </button>
          <input
            type="number"
            value={change.xpGain}
            onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
            className="w-14 text-center bg-slate-700 rounded py-1 text-sm font-mono text-slate-200 border border-slate-600"
          />
          <button
            onClick={() => onChange(change.xpGain + 1)}
            className="w-7 h-7 rounded bg-slate-700 text-slate-300 text-sm hover:bg-slate-600"
          >
            +
          </button>
        </div>
      ) : (
        <span className="text-sm font-mono font-bold text-emerald-400">
          +{change.xpGain} XP
        </span>
      )}
    </div>
  )
}
