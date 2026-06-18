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
      } catch { /* ignore */ }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/70" onClick={onClose} />

      <div className="relative bg-white border border-stone-300 shadow-lg w-full max-w-sm p-6 font-typewriter">
        <h2 className="text-sm font-bold text-stone-700 tracking-widest mb-4">SETTINGS</h2>

        <label className="block text-[9px] text-stone-500 tracking-widest mb-1.5">
          API PROVIDER
        </label>
        <div className="flex gap-1.5 mb-4">
          {(['deepseek', 'claude', 'openai'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setProvider(p)}
              className={`flex-1 py-2 border text-[10px] font-typewriter tracking-widest transition-colors ${
                provider === p
                  ? 'border-stone-600 text-stone-700 bg-stone-100'
                  : 'border-stone-300 text-stone-400 hover:border-stone-400'
              }`}
            >
              {p === 'deepseek' ? 'DEEPSEEK' : p === 'claude' ? 'CLAUDE' : 'OPENAI'}
            </button>
          ))}
        </div>

        <label className="block text-[9px] text-stone-500 tracking-widest mb-1.5">
          API KEY
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          className="w-full border border-stone-300 px-3 py-2 text-[10px] text-stone-700 placeholder-stone-400 font-typewriter focus:outline-none focus:border-stone-500"
        />
        <p className="text-[8px] text-stone-400 mt-1.5 font-typewriter">
          Key stored locally. Never sent to any server except the API provider.
        </p>

        <button
          onClick={handleSave}
          disabled={!apiKey.trim()}
          className={`mt-4 w-full py-2.5 border font-typewriter text-[10px] tracking-widest transition-colors ${
            saved
              ? 'border-stone-600 text-stone-700 bg-stone-100'
              : apiKey.trim()
                ? 'border-stone-600 text-stone-700 hover:bg-stone-100'
                : 'border-stone-300 text-stone-300 cursor-default'
          }`}
        >
          {saved ? 'SAVED' : 'SAVE'}
        </button>

        <button
          onClick={onClose}
          className="mt-2 w-full py-2 text-[10px] text-stone-400 hover:text-stone-600 font-typewriter tracking-widest transition-colors"
        >
          CLOSE
        </button>
      </div>
    </div>
  )
}
