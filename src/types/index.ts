// ========================================
// RPG Character Tracker — Type Definitions
// ========================================

/** 状态属性（短期波动） */
export interface StatusAttributes {
  san: number       // 理智，范围 0–100
  focus: number     // 专注，范围 0–100
  energy: number    // 精力，范围 0–100
}

/** 技能（长期成长） */
export interface Skill {
  id: string
  name: string
  level: number
  currentXp: number
  xpToNextLevel: number
  isDynamic: boolean
  createdAt: string
}

/** AI 分析结果 */
export interface AiAnalysis {
  statusChanges: StatusAttributes
  skillXpChanges: SkillXpChange[]
}

export interface SkillXpChange {
  skillName: string
  xpGain: number
  isNewSkill: boolean
}

/** 日志条目 */
export interface JournalEntry {
  id: string
  text: string
  timestamp: string
  analysis: AiAnalysis
}

/** 应用设置 */
export interface AppSettings {
  apiKey: string
  apiProvider: 'claude' | 'openai'
}

/** 角色完整状态 */
export interface CharacterState {
  status: StatusAttributes
  skills: Skill[]
  entries: JournalEntry[]
}
