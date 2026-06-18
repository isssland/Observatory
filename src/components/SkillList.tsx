import type { Skill } from '../types'

interface Props {
  skills: Skill[]
}

export default function SkillList({ skills }: Props) {
  if (skills.length === 0) {
    return (
      <p className="text-slate-500 text-sm text-center py-8">
        No skills yet. Write a journal entry to discover them.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {skills.map((skill) => {
        const progress = (skill.currentXp / skill.xpToNextLevel) * 100

        return (
          <div
            key={skill.id}
            className="bg-slate-800 rounded-lg p-3 border border-slate-700"
          >
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-200">
                  {skill.name}
                </span>
                {skill.isDynamic && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-400 font-mono">
                    NEW
                  </span>
                )}
              </div>
              <span className="text-sm font-mono text-emerald-400 font-bold">
                Lv.{skill.level}
              </span>
            </div>

            {/* 经验条 */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 font-mono w-16 text-right">
                {skill.currentXp}/{skill.xpToNextLevel} XP
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
