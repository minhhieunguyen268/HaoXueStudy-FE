import { create } from 'zustand'

export type AppTheme = 'light' | 'dark'

interface ThemeState {
  theme: AppTheme
  setTheme: (theme: AppTheme) => void
}

function getInitialTheme(): AppTheme {
  return window.localStorage.getItem('haoxue-theme') === 'dark' ? 'dark' : 'light'
}

const initialTheme = getInitialTheme()
document.documentElement.classList.toggle('dark', initialTheme === 'dark')

const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,
  setTheme: (theme) => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem('haoxue-theme', theme)
    set({ theme })
  },
}))

export default useThemeStore
