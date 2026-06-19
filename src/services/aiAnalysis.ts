/**
 * AI 分析服务
 *
 * 支持 Claude API 和 OpenAI API。
 * 用户需自行配置 API Key（存在 localStorage）。
 *
 * 核心职责：接收日志文本 + 当前角色状态 → 调用 LLM → 返回结构化分析结果
 */

import type { AiAnalysis, CharacterState } from '../types'

// ==================== Prompt 模板 ====================

const SYSTEM_PROMPT = `You are an RPG character attribute analyzer. The user gives you a journal log, and you analyze how it affects their character's status and skills.

## Status Attributes (short-term fluctuations, ±1~3 per change):
- SAN (Sanity): ±0~35, + when solving hard problems or debugging; - when frustrated.
- FOCUS: ±0~35, + when doing deep work; - when distracted or multitasking.
- DRIVE: ±0~35, + when motivated, exercised, rested; - when burnout or staying up late.

## Skills:
The user's current skill list is provided in the context. Use those exact skill names when assigning XP.
If you detect a skill area NOT in the user's list that appeared frequently in recent entries, mark isNewSkill: true.

## Rules:
1. Status changes should be ±0 to ±35 based on clues in the text. Make meaningful changes proportional to activity depth.
2. Skill XP gains should be 1 to 10 based on depth and duration of activity.
3. If you detect a NEW skill area not in the fixed list, set isNewSkill to true for that entry.
4. Do NOT over-interpret. If there's no clear clue for a stat, leave it at 0.
5. You MUST output ONLY the JSON object below. No markdown, no code fences, no other text.

## REQUIRED OUTPUT FORMAT — copy this exact structure:
{"statusChanges":{"san":0,"focus":0,"drive":0},"skillXpChanges":[{"skillName":"Example","xpGain":0,"isNewSkill":false}]}`;

function buildUserPrompt(state: CharacterState, entryText: string): string {
  const skillSummary = state.skills
    .map((s) => `${s.name} (Lv.${s.level})`)
    .join(', ')

  return `Current character state:
SAN: ${state.status.san}, Focus: ${state.status.focus}, Drive: ${state.status.drive}
Skills: ${skillSummary || 'none'}

Journal entry:
---
${entryText}
---`
}

// ==================== API 调用 ====================

type Provider = 'claude' | 'openai' | 'deepseek'

interface ApiConfig {
  provider: Provider
  apiKey: string
}

function getConfig(): ApiConfig | null {
  try {
    const raw = localStorage.getItem('rpg_settings')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed.apiKey && parsed.apiProvider) {
      return { provider: parsed.apiProvider, apiKey: parsed.apiKey }
    }
  } catch {
    // ignore
  }
  return null
}

export function saveConfig(config: ApiConfig): void {
  localStorage.setItem(
    'rpg_settings',
    JSON.stringify({ apiKey: config.apiKey, apiProvider: config.provider })
  )
}

export function getStoredProvider(): Provider | null {
  return getConfig()?.provider ?? null
}

async function callOpenAI(
  apiKey: string,
  state: CharacterState,
  entryText: string
): Promise<unknown> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(state, entryText) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 1024,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenAI API error (${response.status}): ${err}`)
  }

  const data = await response.json()
  const text: string = data.choices[0].message.content
  return parseAiJson(text) // raw unknown
}

async function callDeepSeek(
  apiKey: string,
  state: CharacterState,
  entryText: string
): Promise<unknown> {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(state, entryText) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 1024,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`DeepSeek API error (${response.status}): ${err}`)
  }

  const data = await response.json()
  const text: string = data.choices[0].message.content
  return parseAiJson(text)
}

async function callClaude(
  apiKey: string,
  state: CharacterState,
  entryText: string
): Promise<unknown> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      temperature: 0.3,
      system: SYSTEM_PROMPT + '\n\nYou MUST output ONLY a JSON object. No other text.',
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(state, entryText),
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Claude API error (${response.status}): ${err}`)
  }

  const data = await response.json()
  const text: string = data.content[0].text
  return parseAiJson(text)
}

// ==================== 工具函数 ====================

/** 解析 AI 返回的 JSON，兼容 markdown 代码块包裹 */
function parseAiJson(text: string): unknown {
  let cleaned = text.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '')
  }
  try {
    return JSON.parse(cleaned)
  } catch {
    throw new Error(
      `Failed to parse AI response as JSON.\n\nRaw response (first 500 chars):\n${text.slice(0, 500)}`
    )
  }
}

/** 严格校验并规范化 AI 返回的 analysis */
export function validateAnalysis(raw: unknown): AiAnalysis {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('AI response is not a JSON object')
  }
  const obj = raw as Record<string, unknown>

  // --- statusChanges ---
  const statusRaw = obj.statusChanges as Record<string, unknown> | undefined
  const san = clampDelta(toFinite(statusRaw?.san, 0), -35, 35)
  const focus = clampDelta(toFinite(statusRaw?.focus, 0), -35, 35)
  const drive = clampDelta(toFinite(statusRaw?.drive, 0), -35, 35)

  // --- skillXpChanges ---
  let skillList: SkillXpChangeRaw[] = []
  if (Array.isArray(obj.skillXpChanges)) {
    skillList = obj.skillXpChanges as SkillXpChangeRaw[]
  }

  // 合并同一次返回中的重复 skillName
  const merged = new Map<string, SkillXpChangeRaw>()
  for (const sc of skillList) {
    const name = typeof sc.skillName === 'string' ? sc.skillName.trim() : ''
    if (!name) continue
    const xp = clampDelta(toFinite(sc.xpGain, 0), 0, 100)
    const isNew = typeof sc.isNewSkill === 'boolean' ? sc.isNewSkill : false
    const key = name.toLowerCase()
    const existing = merged.get(key)
    if (existing) {
      existing.xpGain = clampDelta(existing.xpGain + xp, 0, 100)
      existing.isNewSkill = existing.isNewSkill || isNew
    } else {
      merged.set(key, { skillName: name, xpGain: xp, isNewSkill: isNew })
    }
  }

  return {
    statusChanges: { san, focus, drive },
    skillXpChanges: Array.from(merged.values()),
  }
}

interface SkillXpChangeRaw {
  skillName: string
  xpGain: number
  isNewSkill: boolean
}

function toFinite(v: unknown, fallback: number): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const n = Number(v)
    if (Number.isFinite(n)) return n
  }
  return fallback
}

function clampDelta(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

// ==================== 公开接口 ====================

export interface AnalysisResult {
  success: true
  analysis: AiAnalysis
}

export interface AnalysisError {
  success: false
  error: string
}

/**
 * 分析日志文本。
 * 如果没有配置 API Key，返回 null 表示需要先配置。
 */
export async function analyzeEntry(
  state: CharacterState,
  entryText: string
): Promise<AnalysisResult | AnalysisError> {
  const config = getConfig()
  if (!config) {
    return {
      success: false,
      error: 'Please configure your API key in Settings first.',
    }
  }

  try {
    const raw = config.provider === 'openai'
      ? await callOpenAI(config.apiKey, state, entryText)
      : config.provider === 'deepseek'
        ? await callDeepSeek(config.apiKey, state, entryText)
        : await callClaude(config.apiKey, state, entryText)

    const analysis = validateAnalysis(raw)
    return { success: true, analysis }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}
