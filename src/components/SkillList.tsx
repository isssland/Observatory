import type { Skill } from '../types'

interface Props {
  skills: Skill[]
}

export default function SkillList({ skills }: Props) {
  if (skills.length === 0) {
    return (
      <p className="text-stone-400 text-xs text-center py-6 font-typewriter">
        No skills on file.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {skills.map((skill) => {
        const filled = Math.round((skill.currentXp / skill.xpToNextLevel) * 16)
        const empty = 16 - filled

        return (
          <div
            key={skill.id}
            className="group py-2 border-b border-dashed border-stone-300 last:border-b-0"
          >
            {/* 技能名 + 等级 */}
            <div className="flex justify-between items-baseline">
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-stone-700 font-typewriter">
                  {skill.name}
                </span>
                {skill.isDynamic && (
                  <span className="text-[8px] text-red-700 border border-red-700/40 px-1.5 py-0 uppercase tracking-widest font-typewriter opacity-80">
                    DISCOVERED
                  </span>
                )}
              </div>
              <span className="text-sm text-stone-600 tabular-nums font-typewriter">
                Lv.{String(skill.level).padStart(2, '0')}
              </span>
            </div>

            {/* XP 进度线 */}
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xs text-stone-500 select-none tracking-tighter">
                {'|'.repeat(filled)}
                <span className="text-stone-300">{':'.repeat(empty)}</span>
              </span>
              <span className="text-[9px] text-stone-400 tabular-nums whitespace-nowrap">
                {skill.currentXp}/{skill.xpToNextLevel}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
