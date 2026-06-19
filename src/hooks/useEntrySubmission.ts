/**
 * 日志提交公共 Hook — Terminal + NewEntry 共用
 */
import { useState, useRef, useEffect } from 'react'
import { useCharacterStore } from '../store/characterStore'
import { analyzeEntry } from '../services/aiAnalysis'
import type { AiAnalysis } from '../types'

interface UseEntrySubmissionResult {
  text: string
  setText: (v: string) => void
  loading: boolean
  error: string | null
  cursorVisible: boolean
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  submit: () => Promise<void>
}

export function useEntrySubmission(onSuccess: (entryText: string, analysis: AiAnalysis) => void): UseEntrySubmissionResult {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cursorVisible, setCursorVisible] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const character = useCharacterStore((s) => s)

  useEffect(() => {
    const interval = setInterval(() => setCursorVisible((v) => !v), 530)
    return () => clearInterval(interval)
  }, [])

  const submit = async () => {
    const trimmed = text.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)

    const result = await analyzeEntry(
      {
        status: character.status,
        skills: character.skills,
        entries: character.entries,
      },
      trimmed
    )

    setLoading(false)
    if (result.success) {
      onSuccess(trimmed, result.analysis)
      setText('')
    } else {
      setError(result.error)
    }
  }

  return { text, setText, loading, error, cursorVisible, textareaRef, submit }
}
