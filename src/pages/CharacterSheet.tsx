import { useState } from 'react'
import { useCharacterStore } from '../store/characterStore'
import StatusCard from '../components/StatusCard'
import SkillList from '../components/SkillList'
import SettingsModal from '../components/SettingsModal'

export default function CharacterSheet() {
  const status = useCharacterStore((s) => s.status)
  const skills = useCharacterStore((s) => s.skills)
  const entries = useCharacterStore((s) => s.entries)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const totalLevels = skills.reduce((sum, s) => sum + s.level, 0)

  return (
    <div className="max-w-md mx-auto px-4 pt-8 pb-4">
      {/* ===== 头部 ===== */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-slate-100 font-mono">
            Observatory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {entries.length} entries logged
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              {totalLevels}
            </div>
            <div className="text-[10px] text-slate-500">Total Levels</div>
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-500 hover:text-slate-300"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ===== 状态属性 ===== */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Status
        </h2>
        <StatusCard status={status} />
      </section>

      {/* ===== 技能 ===== */}
      <section>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Skills
        </h2>
        <SkillList skills={skills} />
      </section>

      {/* ===== 空状态提示 ===== */}
      {entries.length === 0 && (
        <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-dashed border-slate-700 text-center">
          <p className="text-sm text-slate-400">
            No entries yet. Go to <span className="text-emerald-400 font-semibold">Entry</span> tab
            and write your first journal log.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            AI will analyze your text and update your stats automatically.
          </p>
        </div>
      )}

      {/* ===== 最近日志 ===== */}
      {entries.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Recent
          </h2>
          <div className="space-y-1.5">
            {entries.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="text-xs text-slate-500 bg-slate-800/50 rounded px-3 py-2 truncate border border-slate-800"
              >
                <span className="text-slate-600 font-mono mr-2">
                  {new Date(entry.timestamp).toLocaleDateString('zh-CN')}
                </span>
                {entry.text.slice(0, 60)}
                {entry.text.length > 60 ? '...' : ''}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== 设置面板 ===== */}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
