/**
 * 经验值 / 等级计算工具
 *
 * 规则：
 * - 升级所需经验 = 当前等级 × 100
 * - 升级后 currentXp 归零，超出部分滚入下一级
 */

/** 计算升到下一级需要多少 XP */
export function xpToNextLevel(level: number): number {
  return level * 100
}

/**
 * 给技能添加 XP，返回更新后的技能数据。
 * 如果经验够了会连续升级（比如一次加了足够升 2 级的 XP）。
 */
export interface SkillXpData {
  level: number
  currentXp: number
  xpToNextLevel: number
}

export function addSkillXp(skill: SkillXpData, xpGain: number): SkillXpData {
  let { level, currentXp } = skill
  let remaining = xpGain
  let needed = xpToNextLevel(level)

  while (remaining > 0) {
    const gap = needed - currentXp
    if (remaining >= gap) {
      // 升级
      remaining -= gap
      level += 1
      currentXp = 0
      needed = xpToNextLevel(level)
    } else {
      // 不够升级，经验加上去
      currentXp += remaining
      remaining = 0
    }
  }

  return { level, currentXp, xpToNextLevel: needed }
}
