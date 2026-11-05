import { useState, type ReactNode } from 'react'
import useAuthStore from '../../features/auth/authStore'
import Sidebar from './Sidebar'

interface AppLayoutProps {
  children: ReactNode
  activeSection?: string
  onSectionSelect?: (section: string) => void
}

function AppLayout({ children, activeSection, onSectionSelect }: AppLayoutProps) {
  const user = useAuthStore((state) => state.user)
  const [collapsed, setCollapsed] = useState(() => window.innerWidth <= 800)

  return (
    <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar user={user} collapsed={collapsed} activeSection={activeSection} onToggle={() => setCollapsed((value) => !value)} onSectionSelect={onSectionSelect} />
      {!collapsed && <button className="sidebar-backdrop" aria-label="Đóng thanh điều hướng" onClick={() => setCollapsed(true)} />}
      {children}
    </div>
  )
}

export default AppLayout
