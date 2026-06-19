import { useState } from 'react'
import { useCharacterStore } from '../store/characterStore'
import StatusCard from '../components/StatusCard'
import SkillList from '../components/SkillList'
import SettingsModal from '../components/SettingsModal'
import ReportModal from '../components/ReportModal'

interface Props {
  printing: boolean
}

export default function CharacterSheet({ printing }: Props) {
  const status = useCharacterStore((s) => s.status)
  const skills = useCharacterStore((s) => s.skills)
  const entries = useCharacterStore((s) => s.entries)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)

  const totalLevels = skills.reduce((sum, s) => sum + s.level, 0)
  const latestEntry = entries[0]

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-4 relative">
      {/* ===== 打印动画遮罩 ===== */}
      {printing && (
        <div className="absolute inset-0 z-50 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 bg-white animate-print"
            style={{
              animation: 'printDown 1.2s ease-in-out forwards',
            }}
          />
          <style>{`
            @keyframes printDown {
              0%   { clip-path: inset(0 0 100% 0); }
              100% { clip-path: inset(0 0 0% 0); }
            }
          `}</style>
        </div>
      )}

      {/* ===== 档案纸 ===== */}
      <div className="bg-white border border-stone-300 shadow-sm p-6">
        {/* 页眉 */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-dashed border-stone-300">
          <div>
            <h1 className="text-sm font-bold text-stone-700 tracking-widest font-typewriter">
              CHARACTER FILE
            </h1>
            <p className="text-[9px] text-stone-400 mt-0.5 font-typewriter">
              No. {String(entries.length).padStart(3, '0')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setReportOpen(true)}
              className="text-[9px] text-stone-400 hover:text-stone-600 font-typewriter tracking-wider border border-stone-300 px-1.5 py-0.5"
            >
              REPORT
            </button>
            <div className="text-right">
              <div className="text-lg text-stone-600 tabular-nums font-typewriter">
                TL:{String(totalLevels).padStart(2, '0')}
              </div>
            </div>
            <button
              onClick={() => setSettingsOpen(true)}
              className="text-stone-400 hover:text-stone-600 transition-colors"
              title="Settings"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* 状态 */}
        <section className="mb-6">
          <h2 className="text-[9px] text-stone-500 tracking-widest mb-4 font-typewriter">
            STATUS
          </h2>
          <StatusCard status={status} />
        </section>

        {/* 技能 */}
        <section className="mb-6">
          <h2 className="text-[9px] text-stone-500 tracking-widest mb-3 font-typewriter">
            SKILLS
          </h2>
          <SkillList />
        </section>

        {/* 最近日志 */}
        {latestEntry && (
          <section>
            <h2 className="text-[9px] text-stone-500 tracking-widest mb-2 font-typewriter">
              LAST ENTRY
            </h2>
            <p className="text-[10px] text-stone-500 leading-relaxed font-typewriter line-clamp-2">
              {latestEntry.text}
            </p>
            <p className="text-[8px] text-stone-400 mt-1 font-typewriter">
              {new Date(latestEntry.timestamp).toLocaleDateString('zh-CN')}
            </p>
          </section>
        )}
      </div>

      {entries.length === 0 && (
        <div className="mt-6 text-center">
          <p className="text-xs text-stone-400 font-typewriter">
            No entries yet. Open LOG to begin.
          </p>
        </div>
      )}

      {/* 设置面板 */}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  )
}
