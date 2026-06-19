import { useMemo, useState } from 'react'
import { useCharacterStore } from '../store/characterStore'
import { generateReport, monthlyAverages, type Report } from '../utils/report'

interface Props {
  open: boolean
  onClose: () => void
}

export default function ReportModal({ open, onClose }: Props) {
  const entries = useCharacterStore((s) => s.entries)
  const [mode, setMode] = useState<'weekly' | 'monthly'>('weekly')

  const report = useMemo<Report | null>(() => {
    if (!entries.length) return null
    if (mode === 'weekly') return generateReport(entries, 7, 'weekly')
    return generateReport(entries, 30, 'monthly')
  }, [entries, mode])

  // 月报平均值只算一次
  const monthAvgs = useMemo(() => {
    if (mode === 'monthly' && entries.length) return monthlyAverages(entries, 30)
    return null
  }, [entries, mode])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 p-4">
      <div className="absolute inset-0 bg-stone-900/70" onClick={onClose} />

      <div className="relative bg-[#faf7f2] border border-stone-300 shadow-lg w-full max-w-sm p-5 font-typewriter max-h-[85vh] overflow-y-auto">
        {/* 页眉 */}
        <h2 className="text-sm font-bold text-stone-700 tracking-[0.25em] mb-1">
          {mode === 'weekly' ? 'WEEKLY REPORT' : 'MONTHLY REPORT'}
        </h2>
        <p className="text-[9px] text-stone-400 mb-4">{report?.label}</p>

        {!report ? (
          <p className="text-[10px] text-stone-400 py-6 text-center">No data yet.</p>
        ) : (
          <>
            {/* Status */}
            <div className="mb-4 pb-3 border-b border-dashed border-stone-300">
              <h3 className="text-[9px] text-stone-500 tracking-widest mb-2">
                {mode === 'weekly' ? 'Status' : 'Status (avg)'}
              </h3>
              {(['san', 'focus', 'drive'] as const).map((key) => {
                const s = report.status[key]
                return (
                  <div key={key} className="flex items-center gap-2 py-0.5 text-[10px]">
                    <span className="text-stone-600 w-12 font-typewriter">{key.toUpperCase()}</span>
                    <span className="text-stone-700 tabular-nums w-8 text-right font-typewriter">
                      {mode === 'weekly' ? String(s.current).padStart(2, '0') : monthAvgs ? String(monthAvgs[key]).padStart(2, '0') : '--'}
                    </span>
                    {mode === 'weekly' && (
                      <span className="text-stone-500 text-xs tracking-wider">{s.sparkline}</span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Skill Growth */}
            <div className="mb-4">
              <h3 className="text-[9px] text-stone-500 tracking-widest mb-2">Skill Growth</h3>
              {report.skills.length === 0 ? (
                <p className="text-[10px] text-stone-400">No skill changes in this period.</p>
              ) : (
                <div className="divide-y divide-dashed divide-stone-300">
                  {report.skills.map((sk) => (
                    <div key={sk.name} className="py-1.5 flex items-center gap-2 text-[10px]">
                      <span className="text-stone-700 font-typewriter flex-1">{sk.name}</span>
                      <span className="text-stone-500 tabular-nums">
                        {sk.startLevel !== sk.endLevel
                          ? `Lv.${sk.startLevel} → Lv.${sk.endLevel}`
                          : `Lv.${sk.endLevel}`}
                      </span>
                      <span className="text-stone-400 tabular-nums w-16 text-right">+{sk.totalXp} XP</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* 切换按钮 + 关闭 */}
        <div className="flex gap-2 mt-3 pt-2 border-t border-dashed border-stone-300">
          <button
            onClick={() => setMode(mode === 'weekly' ? 'monthly' : 'weekly')}
            className="flex-1 py-2 border border-stone-300 text-[9px] text-stone-500 font-typewriter tracking-wider hover:border-stone-400 hover:text-stone-600"
          >
            {mode === 'weekly' ? 'MONTH' : 'WEEK'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-stone-300 text-[9px] text-stone-500 font-typewriter tracking-wider hover:border-stone-400 hover:text-stone-600"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  )
}
