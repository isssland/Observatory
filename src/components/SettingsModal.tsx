import { useState, useEffect } from 'react'
import { getStoredProvider, saveConfig } from '../services/aiAnalysis'

interface Props {
  open: boolean
  onClose: () => void
}

export default function SettingsModal({ open, onClose }: Props) {
  const [provider, setProvider] = useState<'claude' | 'openai' | 'deepseek'>('deepseek')
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (open) {
      const stored = getStoredProvider()
      if (stored) setProvider(stored)
      try {
        const raw = localStorage.getItem('rpg_settings')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed.apiKey) setApiKey(parsed.apiKey)
        }
      } catch {
        // ignore
      }
      setSaved(false)
    }
  }, [open])

  const handleSave = () => {
    saveConfig({ provider, apiKey: apiKey.trim() })
    setSaved(true)
    setTimeout(() => {
      onClose()
      setSaved(false)
    }, 800)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* 面板 */}
      <div className="relative bg-slate-800 rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 border border-slate-700 shadow-2xl">
        <h2 className="text-lg font-bold text-slate-100 mb-4 font-mono">Settings</h2>

        {/* API 提供商 */}
        <label className="block text-xs text-slate-400 mb-1.5">API Provider</label>
        <div className="flex gap-1.5 mb-4">
          <button
            onClick={() => setProvider('deepseek')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              provider === 'deepseek'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            DeepSeek
          </button>
          <button
            onClick={() => setProvider('claude')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              provider === 'claude'
                ? 'bg-violet-600 text-white'
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            Claude
          </button>
          <button
            onClick={() => setProvider('openai')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              provider === 'openai'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            OpenAI
          </button>
        </div>

        {/* API Key 输入 */}
        <label className="block text-xs text-slate-400 mb-1.5">API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={provider === 'claude' ? 'sk-ant-...' : 'sk-...'}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-600"
        />
        <p className="text-[10px] text-slate-600 mt-1.5">
          Your key is stored locally in your browser. It is never sent to any server other than the API provider.
        </p>

        {/* 保存 */}
        <button
          onClick={handleSave}
          disabled={!apiKey.trim()}
          className={`mt-4 w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${
            saved
              ? 'bg-emerald-600 text-white'
              : apiKey.trim()
                ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          {saved ? '✓ Saved!' : 'Save'}
        </button>

        {/* 关闭 */}
        <button
          onClick={onClose}
          className="mt-2 w-full py-2 rounded-lg text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}
