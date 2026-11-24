import { useEffect, useState } from 'react'
import api from '../../shared/lib/api'

export interface GrammarExample {
  text: string
  simplified?: string
  pinyin?: string
  translation?: string
  note?: string
}

interface GrammarPoint {
  lessonNumber: number
  title: string
  pattern: string
  description: string
  example: string | null
  examplePinyin: string | null
  translation: string | null
  details?: { englishTitle: string; notes: string; examples: GrammarExample[] } | null
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
