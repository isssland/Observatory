/**
 * Zustand 角色状态管理
 *
 * 这是整个应用的"数据中心"。所有页面都从这里读写数据。
 * 数据变更时自动保存到 IndexedDB。
 */

import { create } from 'zustand'
import type { CharacterState, StatusAttributes, AiAnalysis, JournalEntry, Skill } from '../types'
import { addSkillXp } from '../utils/xp'
import { loadCharacter, saveCharacter } from '../db'
import { generateId } from '../utils/id'

// ==================== 初始值 ====================

const FIXED_SKILLS: Skill[] = [
  { id: 'programming', name: 'Programming', level: 1, currentXp: 0, xpToNextLevel: 100, isDynamic: false, createdAt: new Date().toISOString() },
  { id: 'project-building', name: 'Project Building', level: 1, currentXp: 0, xpToNextLevel: 100, isDynamic: false, createdAt: new Date().toISOString() },
  { id: 'english', name: 'English', level: 1, currentXp: 0, xpToNextLevel: 100, isDynamic: false, createdAt: new Date().toISOString() },
  { id: 'writing', name: 'Writing', level: 1, currentXp: 0, xpToNextLevel: 100, isDynamic: false, createdAt: new Date().toISOString() },
]

const DEFAULT_STATUS: StatusAttributes = {
  san: 50,
  focus: 50,
  energy: 50,
}

const DEFAULT_STATE: CharacterState = {
  status: { ...DEFAULT_STATUS },
  skills: FIXED_SKILLS.map((s) => ({ ...s })),
  entries: [],
}

// ==================== Store ====================

interface CharacterActions {
  /** 应用 AI 分析结果（用户确认后调用） */
  applyAnalysis: (entryText: string, analysis: AiAnalysis) => void
  /** 直接修改某个状态值（用户手动调整时用） */
  setStatusValue: (key: keyof StatusAttributes, value: number) => void
  /** 直接修改某个技能的 XP（用户手动调整时用） */
  setSkillXp: (skillName: string, xpGain: number) => void
  /** 从数据库加载数据（应用启动时调用） */
  hydrate: () => Promise<void>
  /** 获取某个技能的数据 */
  getSkill: (name: string) => Skill | undefined
}

type CharacterStore = CharacterState & CharacterActions

export const useCharacterStore = create<CharacterStore>()((set, get) => ({
  ...DEFAULT_STATE,

  applyAnalysis: (entryText: string, analysis: AiAnalysis) => {
    const state = get()
    const now = new Date().toISOString()

    // 1. 更新状态属性（限制在 0-100 范围）
    const newStatus: StatusAttributes = {
      san: clamp(state.status.san + analysis.statusChanges.san, 0, 100),
      focus: clamp(state.status.focus + analysis.statusChanges.focus, 0, 100),
      energy: clamp(state.status.energy + analysis.statusChanges.energy, 0, 100),
    }

    // 2. 更新技能经验
    const updatedSkills = state.skills.map((skill) => {
      const change = analysis.skillXpChanges.find(
        (c) => c.skillName.toLowerCase() === skill.name.toLowerCase()
      )
      if (!change || change.isNewSkill) return skill
      const updated = addSkillXp(skill, change.xpGain)
      return { ...skill, ...updated }
    })

    // 3. 处理 AI 提议的新技能
    const newSkills = analysis.skillXpChanges
      .filter((c) => c.isNewSkill)
      .map((c) => {
        const initial = addSkillXp({ level: 1, currentXp: 0, xpToNextLevel: 100 }, c.xpGain)
        return {
          id: generateId(),
          name: c.skillName,
          level: initial.level,
          currentXp: initial.currentXp,
          xpToNextLevel: initial.xpToNextLevel,
          isDynamic: true,
          createdAt: now,
        } satisfies Skill
      })

    // 4. 创建日志条目
    const entry: JournalEntry = {
      id: generateId(),
      text: entryText,
      timestamp: now,
      analysis,
    }

    const newState: CharacterState = {
      status: newStatus,
      skills: [...updatedSkills, ...newSkills],
      entries: [entry, ...state.entries].slice(0, 100), // 最多保留 100 条
    }

    set(newState)
    saveCharacter(newState)
  },

  setStatusValue: (key, value) => {
    const state = get()
    const newStatus = { ...state.status, [key]: clamp(value, 0, 100) }
    const newState = { ...state, status: newStatus }
    set(newState)
    saveCharacter(newState)
  },

  setSkillXp: (skillName, xpGain) => {
    const state = get()
    const updatedSkills = state.skills.map((skill) => {
      if (skill.name.toLowerCase() !== skillName.toLowerCase()) return skill
      const updated = addSkillXp(skill, xpGain)
      return { ...skill, ...updated }
    })
    const newState = { ...state, skills: updatedSkills }
    set(newState)
    saveCharacter(newState)
  },

  hydrate: async () => {
    const saved = await loadCharacter()
    if (saved) set(saved)
  },

  getSkill: (name: string) => {
    return get().skills.find(
      (s) => s.name.toLowerCase() === name.toLowerCase()
    )
  },
}))

// ==================== 工具函数 ====================

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
