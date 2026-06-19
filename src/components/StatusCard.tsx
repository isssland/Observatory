import type { StatusAttributes } from '../types'

interface Props {
  status: StatusAttributes
}

const STATUS = [
  {
    key: 'san' as const,
    label: 'SAN',
    // 大脑/头部的简单线条图标
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <ellipse cx="10" cy="14" rx="4" ry="5" strokeLinecap="round" />
        <ellipse cx="22" cy="14" rx="4" ry="5" strokeLinecap="round" />
        <path d="M10 19c0 0 2 4 6 4s6-4 6-4" strokeLinecap="round" />
        <circle cx="16" cy="12" r="8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'focus' as const,
    label: 'Focus',
    // 眼睛/注视的简单线条图标
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <circle cx="16" cy="16" r="3" />
        <path d="M4 16s5-9 12-9 12 9 12 9-5 9-12 9-12-9-12-9z" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'drive' as const,
    label: 'DRIVE',
    // 闪电图标
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M18 4l-10 14h6l-2 10 10-14h-6l2-10z" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export default function StatusCard({ status }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {STATUS.map(({ key, label, icon }) => (
        <div key={key} className="text-center">
          {/* 图标 */}
          <div className="text-stone-400 mb-1 flex justify-center">
            {icon}
          </div>
          {/* 标签 */}
          <div className="text-[10px] text-stone-500 tracking-widest mb-1">
            {label}
          </div>
          {/* 数值 */}
          <div className="text-2xl text-stone-700 tabular-nums">
            {String(status[key]).padStart(2, '0')}
          </div>
          {/* 状态条 — 打字机短线 */}
          <div className="mt-2 flex justify-center gap-[1px]">
            {Array.from({ length: 10 }).map((_, i) => (
              <span
                key={i}
                className={`inline-block w-1.5 h-1 ${
                  i < Math.round(status[key] / 10)
                    ? 'bg-stone-500'
                    : 'bg-stone-300'
                }`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
