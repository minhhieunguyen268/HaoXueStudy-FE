import { useEffect, useState } from 'react'
import api from '../../shared/lib/api'

interface GrammarPoint {
  lessonNumber: number
  title: string
  pattern: string
  description: string
  example: string | null
  examplePinyin: string | null
  translation: string | null
}

export function useCourseGrammar(enabled = true) {
  const [grammar, setGrammar] = useState<GrammarPoint[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    api.get<GrammarPoint[]>('/vocabulary/books/contemporary-chinese-1/grammar', { signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setGrammar(data) })
      .catch(() => { if (!controller.signal.aborted) setError(true) })
    return () => controller.abort()
  }, [enabled])

  return { grammar, error }
}

export type { GrammarPoint }
