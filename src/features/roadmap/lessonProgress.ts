import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import api from '../../shared/lib/api'
import useAuthStore from '../auth/authStore'

interface Checkpoint {
  lesson: number
  step: number
  answers: Record<number, string>
  revision: number
  feedback?: { position: number; correct: string; explanation: string }[]
}
interface Progress { completed: number; lessons: Checkpoint[] }
const endpoint = '/learning-progress/a1'

export function useLessonProgress() {
  const userId = useAuthStore(state => state.user?.id)
  const [snapshot, setSnapshot] = useState<{ userId: number; data: Progress }>()
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const pending = useRef(false)
  const [reload, setReload] = useState(0)
  const retry = useCallback(() => setReload(value => value + 1), [])

  useEffect(() => {
    if (!userId) return
    const controller = new AbortController()
    const signal = controller.signal
    async function load(id: number) {
      const key = (n: number) => 'haoxue:roadmap:a1:' + id + ':' + n
      let legacy = 0
      try {
        while (legacy < 15 && localStorage.getItem(key(legacy + 1)) === 'done') legacy++
      } catch { /* Storage can be disabled. The server still holds account progress. */ }
      const response = legacy
        ? await api.post<Progress>(endpoint + '/import', { completed: legacy }, { signal })
        : await api.get<Progress>(endpoint, { signal })
      if (signal.aborted) return
      if (legacy && response.data.completed >= legacy) {
        try { for (let i = 1; i <= legacy; i++) localStorage.removeItem(key(i)) } catch { /* Import is idempotent. */ }
      }
      setSnapshot({ userId: id, data: response.data })
      setError('')
    }
    load(userId).catch(() => { if (!signal.aborted) setError('Chưa tải được tiến độ học.') })
    return () => controller.abort()
  }, [userId, reload])

  const data = snapshot?.userId === userId ? snapshot?.data : undefined
  async function save(lesson: number, step: number, answers: Record<number,string>, submit = false) {
    if (!userId || !data || pending.current) return false
    pending.current = true
    setSaving(true)
    const revision = data.lessons.find(row => row.lesson === lesson)?.revision ?? 0
    try {
      const result = await api.put<Progress>(endpoint + '/' + lesson, { step, answers, revision, submit })
      setSnapshot({ userId, data: result.data })
      setError('')
      return true
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        retry()
        setError('Tiến độ trên thiết bị khác đã thay đổi. Đang tải lại…')
      } else {
        setError('Chưa lưu được thay đổi. Hãy thử lại thao tác vừa rồi.')
      }
      return false
    } finally {
      pending.current = false
      setSaving(false)
    }
  }
  return { completed: data?.completed ?? 0, lessons: data?.lessons ?? [], ready: !!data, error, retry, saving, save }
}
