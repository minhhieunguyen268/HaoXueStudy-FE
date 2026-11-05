import { create } from 'zustand'
import { getCurrentUser, type AuthUser } from './api/authApi'

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  refreshUser: () => Promise<AuthUser>
  setUser: (user: AuthUser | null) => void
  initialize: () => Promise<void>
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  refreshUser: async () => {
    const user = await getCurrentUser()
    set({ user })
    return user
  },
  setUser: (user) => set({ user }),
  initialize: async () => {
    try {
      const user = await getCurrentUser()
      set({ user })
    } catch {
      set({ user: null })
    } finally {
      set({ isLoading: false })
    }
  },
}))

export default useAuthStore
