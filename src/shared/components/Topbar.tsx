import { useState } from 'react'
import { Bell, Search } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuthStore from '../../features/auth/authStore'
import AnimatedThemeToggler from './AnimatedThemeToggler'
import UserAvatar from './UserAvatar'

const sections: Record<string, string> = {
  '/': 'Tổng quan', '/profile': 'Tài khoản', '/roadmap': 'Lộ trình',
  '/vocabulary': 'Từ vựng', '/pronunciation': 'Phát âm', '/login': 'Tài khoản',
}

interface Props {
  activeSection?: string
  search?: string
  onSearch?: (value: string) => void
  onSectionSelect?: (section: string) => void
}

export default function Topbar({ activeSection, search, onSearch, onSectionSelect }: Props) {
  const user = useAuthStore(state => state.user)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [notifications, setNotifications] = useState(false)
  const title = activeSection ?? sections[pathname.replace(/\/$/, '') || '/']
    ?? (pathname.split('/')[1] === 'lession' ? 'Bài học' : 'Flashcards')
  return <header className="topbar">
    <div className="topbar-leading"><div className="breadcrumb">Không gian học tập <span>/</span> <strong>{title}</strong></div></div>
    <div className="top-actions">
      {user && <form className="search-box" role="search" onSubmit={event => {
        event.preventDefault()
        if (!onSearch) navigate('/?q=' + encodeURIComponent(query.trim()))
      }}>
        <Search aria-hidden="true" /><input aria-label="Tìm bài học" placeholder="Tìm bài học..." value={search ?? query} onChange={event => (onSearch ?? setQuery)(event.target.value)} />
      </form>}
      <AnimatedThemeToggler />
      {user && <>
        <div className="topbar-alerts"><button type="button" className="icon-button notification" aria-label="Thông báo" aria-expanded={notifications} onClick={() => {
          setNotifications(!notifications)
          onSectionSelect?.('Thông báo')
        }}><Bell aria-hidden="true" /></button>
        {notifications && <div role="status" className="topbar-alert-panel">Chưa có thông báo mới.</div>}</div>
        <Link className="top-avatar-link" aria-label="Tài khoản" to="/profile"><UserAvatar className="top-avatar" avatarUrl={user.avatarUrl} alt="" /></Link>
      </>}
    </div>
  </header>
}
