import type { StatusAttributes } from '../types'

interface Props {
  status: StatusAttributes
}

const STATUS_CONFIG: { key: keyof StatusAttributes; label: string; color: string }[] = [
  { key: 'san', label: 'SAN', color: 'text-violet-400' },
  { key: 'focus', label: 'Focus', color: 'text-sky-400' },
  { key: 'energy', label: 'Energy', color: 'text-emerald-400' },
]

export default function StatusCard({ status }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {STATUS_CONFIG.map(({ key, label, color }) => (
        <div
          key={key}
          className="bg-slate-800 rounded-xl p-4 text-center border border-slate-700"
        >
          <div className="text-xs text-slate-400 mb-1 font-mono">{label}</div>
          <div className={`text-3xl font-bold font-mono ${color}`}>
            {status[key]}
          </div>
          {/* 简易进度条 */}
          <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                key === 'san' ? 'bg-violet-500' : key === 'focus' ? 'bg-sky-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${status[key]}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
