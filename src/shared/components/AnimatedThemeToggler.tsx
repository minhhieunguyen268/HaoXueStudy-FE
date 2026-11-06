import { useRef } from 'react'
import { flushSync } from 'react-dom'
import { Moon, Sun } from 'lucide-react'
import useThemeStore, { type AppTheme } from '../theme/themeStore'

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => ViewTransition
}

function AnimatedThemeToggler() {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const isTransitioning = useRef(false)

  function toggleTheme() {
    if (isTransitioning.current) return
    const nextTheme: AppTheme = theme === 'dark' ? 'light' : 'dark'
    const viewTransitionDocument = document as ViewTransitionDocument
    const startViewTransition = viewTransitionDocument.startViewTransition?.bind(document)

    if (!startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTheme(nextTheme)
      return
    }

    const bounds = buttonRef.current?.getBoundingClientRect()
    const x = bounds ? bounds.left + bounds.width / 2 : window.innerWidth - 32
    const y = bounds ? bounds.top + bounds.height / 2 : 32
    const width = window.innerWidth
    const height = window.innerHeight
    const radius = Math.hypot(Math.max(x, width - x), Math.max(y, height - y))
    const radiusPercent = (radius / (Math.hypot(width, height) / Math.SQRT2)) * 100
    const origin = `${(x / width) * 100}% ${(y / height) * 100}%`
    const clipPaths: [string, string] = [`circle(0% at ${origin})`, `circle(${radiusPercent}% at ${origin})`]

    isTransitioning.current = true
    const transition = startViewTransition(() => {
      flushSync(() => setTheme(nextTheme))
    })

    transition.ready
      .then(() => document.documentElement.animate(
        { clipPath: clipPaths },
        {
          duration: 450,
          easing: 'ease-in-out',
          fill: 'forwards',
          pseudoElement: '::view-transition-new(root)',
        },
      ))
      .catch(() => undefined)

    void transition.finished.then(
      () => { isTransitioning.current = false },
      () => { isTransitioning.current = false },
    )
  }

  const label = theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'

  return (
    <button
      ref={buttonRef}
      className="theme-toggle-button"
      type="button"
      aria-label={label}
      title={label}
      onClick={toggleTheme}
    >
      {theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </button>
  )
}

export default AnimatedThemeToggler
