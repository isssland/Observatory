/**
 * 周报 / 月报数据计算（纯函数）
 */
import type { JournalEntry, StatusAttributes } from '../types'

const SPARK_BLOCKS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█']

export interface StatusReport {
  san: { current: number; trend: number[]; sparkline: string }
  focus: { current: number; trend: number[]; sparkline: string }
  drive: { current: number; trend: number[]; sparkline: string }
}

export interface SkillGrowth {
  name: string
  startLevel: number
  endLevel: number
  totalXp: number
}

export interface Report {
  type: 'weekly' | 'monthly'
  label: string
  status: StatusReport
  skills: SkillGrowth[]
}

/** 生成本地日期字符串（YYYY-MM-DD） */
function localDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 生成日期范围（往前 days 天） */
function getDateRange(days: number): string[] {
  const result: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    result.push(localDate(d))
  }
  return result
}

/** 生成报告 */
export function generateReport(entries: JournalEntry[], days: number, type: 'weekly' | 'monthly'): Report {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  cutoff.setHours(0, 0, 0, 0)

  // 筛选区间内条目，按时间升序
  const rangeEntries = entries
    .filter((e) => new Date(e.timestamp) >= cutoff)
    .reverse()

  // 按本地日期分组
  const byDay = new Map<string, JournalEntry[]>()
  for (const e of rangeEntries) {
    const d = localDate(new Date(e.timestamp))
    if (!byDay.has(d)) byDay.set(d, [])
    byDay.get(d)!.push(e)
  }

  // 累计计算每天末的状态值（不每天重置为 50）
  const dates = getDateRange(days)
  let san = 50, focus = 50, drive = 50
  const dailyValues = dates.map((d) => {
    const dayEntries = byDay.get(d) || []
    for (const e of dayEntries) {
      san = clamp(san + (e.analysis.statusChanges.san ?? 0))
      focus = clamp(focus + (e.analysis.statusChanges.focus ?? 0))
      drive = clamp(drive + (e.analysis.statusChanges.drive ?? 0))
    }
    return { san, focus, drive }
  })

  const current = { san, focus, drive }

  const status: StatusReport = {
    san: { current: current.san, trend: dailyValues.map((v) => v.san), sparkline: toSparkline(dailyValues.map((v) => v.san)) },
    focus: { current: current.focus, trend: dailyValues.map((v) => v.focus), sparkline: toSparkline(dailyValues.map((v) => v.focus)) },
    drive: { current: current.drive, trend: dailyValues.map((v) => v.drive), sparkline: toSparkline(dailyValues.map((v) => v.drive)) },
  }

  // 技能增长（按名称聚合）
  const skillMap = new Map<string, { startLv: number; endLv: number; xp: number }>()
  for (const e of rangeEntries) {
    for (const sc of e.analysis.skillXpChanges) {
      const prev = skillMap.get(sc.skillName) || { startLv: 1, endLv: 1, xp: 0 }
      if (sc.isNewSkill) prev.startLv = 1
      prev.xp += sc.xpGain
      prev.endLv = calcLevel(prev.startLv, prev.xp)
      skillMap.set(sc.skillName, prev)
    }
  }
  const skills: SkillGrowth[] = Array.from(skillMap.entries())
    .sort((a, b) => b[1].xp - a[1].xp)
    .map(([name, s]) => ({ name, startLevel: s.startLv, endLevel: s.endLv, totalXp: s.xp }))

  const today = new Date()
  const label = type === 'weekly'
    ? `${dates[0]} ~ ${dates[dates.length - 1]}`
    : `${today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`

  return { type, label, status, skills }
}

/** 月报状态平均值（单独计算，聚合一次） */
export function monthlyAverages(entries: JournalEntry[], days: number): StatusAttributes {
  const r = generateReport(entries, days, 'monthly')
  const t = r.status
  const avg = (arr: number[]) => Math.round(arr.reduce((a, b) => a + b, 0) / (arr.length || 1))
  return { san: avg(t.san.trend), focus: avg(t.focus.trend), drive: avg(t.drive.trend) }
}

// ===== helpers =====

function toSparkline(values: number[]): string {
  if (!values.length) return ''
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  if (hi === lo) return SPARK_BLOCKS[3].repeat(values.length)
  return values
    .map((v) => {
      const idx = Math.round(((v - lo) / (hi - lo)) * (SPARK_BLOCKS.length - 1))
      return SPARK_BLOCKS[Math.min(idx, SPARK_BLOCKS.length - 1)]
    })
    .join('')
}

function clamp(v: number) { return Math.max(0, Math.min(100, v)) }

function calcLevel(startLv: number, totalXp: number): number {
  let lv = startLv
  let xp = totalXp
  while (xp >= lv * 100) { xp -= lv * 100; lv++ }
  return lv
}
