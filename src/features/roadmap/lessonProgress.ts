import useAuthStore from '../auth/authStore'

export function useLessonProgress() {
  const userId = useAuthStore((state) => state.user?.id)
  const key = (lesson: number) => `haoxue:roadmap:a1:${userId}:${lesson}`
  let completed = 0
  while (userId && completed < 15 && localStorage.getItem(key(completed + 1)) === 'done') {
    completed++
  }
  function finish(lesson: number) {
    if (userId && lesson === completed + 1) localStorage.setItem(key(lesson), 'done')
  }
  return { completed, finish }
}
