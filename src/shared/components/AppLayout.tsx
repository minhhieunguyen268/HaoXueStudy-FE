import { useMatch } from 'react-router-dom'
import Topbar from './Topbar'
import { useState, type ReactNode } from 'react'
import useAuthStore from '../../features/auth/authStore'
import ChatAssistant from '../../features/ai-assistant/components/ChatAssistant'
import Sidebar from './Sidebar'

interface AppLayoutProps {
  search?: string
  onSearch?: (value: string) => void
  children: ReactNode
  activeSection?: string
  onSectionSelect?: (section: string) => void
}

function AppLayout({ children, activeSection, onSectionSelect, search, onSearch }: AppLayoutProps) {
  const lessonDetail = useMatch('/lession/a1/:lesson')
  const user = useAuthStore((state) => state.user)
  const [collapsed, setCollapsed] = useState(() => window.innerWidth <= 800)

  return (
    <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar user={user} collapsed={collapsed} activeSection={activeSection} onToggle={() => setCollapsed((value) => !value)} onSectionSelect={onSectionSelect} />
      {!collapsed && <button className="sidebar-backdrop" aria-label="Đóng thanh điều hướng" onClick={() => setCollapsed(true)} />}
      <div className="main-content app-column">
        {!lessonDetail && <Topbar activeSection={activeSection} onSectionSelect={onSectionSelect} search={search} onSearch={onSearch} />}
        {children}
      </div>
      {user && <ChatAssistant userId={user.id} />}
    </div>
  )
}

export default AppLayout
