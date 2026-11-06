import { lazy, Suspense, useEffect } from 'react'
import { ConfigProvider, theme as antdTheme } from 'antd'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import '../features/dashboard/styles/dashboard.css'
import useAuthStore from '../features/auth/authStore'
import useThemeStore from '../shared/theme/themeStore'

const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage'))
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'))
const ProfilePage = lazy(() => import('../features/auth/pages/ProfilePage'))
const VocabularyPage = lazy(() => import('../features/vocabulary/pages/VocabularyPage'))
const PronunciationPage = lazy(() => import('../features/pronunciation/pages/PronunciationPage'))

function AppRoutes() {
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    void initialize()
  }, [initialize])

  return (
    <Suspense fallback={<div className="auth-loading">Đang tải trang...</div>}>
      <Routes>
        <Route path="/" element={isLoading ? <div className="auth-loading">Đang kiểm tra phiên đăng nhập...</div> : user ? <DashboardPage /> : <Navigate to="/login" replace />} />
        <Route path="/profile" element={isLoading ? <div className="auth-loading">Đang kiểm tra phiên đăng nhập...</div> : user ? <ProfilePage /> : <Navigate to="/login" replace />} />
        <Route path="/vocabulary" element={isLoading ? <div className="auth-loading">Đang kiểm tra phiên đăng nhập...</div> : user ? <VocabularyPage /> : <Navigate to="/login" replace />} />
        <Route path="/pronunciation" element={isLoading ? <div className="auth-loading">Đang kiểm tra phiên đăng nhập...</div> : user ? <PronunciationPage /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={isLoading ? <div className="auth-loading">Đang kiểm tra phiên đăng nhập...</div> : user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

function App() {
  const theme = useThemeStore((state) => state.theme)

  return (
    <ConfigProvider theme={{ algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm, token: { colorPrimary: '#244e3a', borderRadius: 7, fontFamily: "'DM Sans', sans-serif" } }}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
