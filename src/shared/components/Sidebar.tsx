import { AudioLines, BookOpen, House, Languages, MessageCircle, PanelLeftClose, PanelLeftOpen, Plane, School, Utensils } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import type { AuthUser } from '../../features/auth/api/authApi'
import UserAvatar from './UserAvatar'
import logo from '../assets/haoxue-logo.png'

const topics = [
  { name: 'Gia đình', icon: House, count: 2 },
  { name: 'Trường học', icon: School, count: 3 },
  { name: 'Giao tiếp', icon: MessageCircle, count: 3 },
  { name: 'Đồ ăn', icon: Utensils, count: 0 },
  { name: 'Du lịch', icon: Plane, count: 0 },
]

interface SidebarProps {
  user: AuthUser | null
  collapsed: boolean
  activeSection?: string
  onToggle: () => void
  onSectionSelect?: (section: string) => void
}

function Sidebar({ user, collapsed, activeSection, onToggle, onSectionSelect }: SidebarProps) {
  return (
    <aside className="sidebar">
      <button className="sidebar-toggle" onClick={onToggle} aria-label={collapsed ? 'Mở thanh điều hướng' : 'Thu gọn thanh điều hướng'} title={collapsed ? 'Mở thanh điều hướng' : 'Thu gọn thanh điều hướng'}>
        {collapsed ? <PanelLeftOpen size={17} aria-hidden="true" /> : <PanelLeftClose size={17} aria-hidden="true" />}
      </button>
      <Link className="brand" to="/" aria-label="HaoXueStudy trang chủ">
        <img className="brand-logo" src={logo} alt="" /><span className="brand-name">HaoXue<span>Study</span></span>
      </Link>
      <div className="side-label">KHÔNG GIAN HỌC</div>
      <nav className="side-nav" aria-label="Điều hướng học tập">
        <NavLink end className={({ isActive }) => `nav-item ${(activeSection === undefined ? isActive : activeSection === 'Tổng quan') ? 'selected' : ''}`} to="/">
          <House className="nav-icon" aria-hidden="true" /><span>Tổng quan</span>
        </NavLink>
        <button className={`nav-item ${activeSection === 'Bài học' ? 'selected' : ''}`} onClick={() => onSectionSelect?.('Bài học')}>
          <BookOpen className="nav-icon" aria-hidden="true" /><span>Bài học</span><span className="nav-count">6</span>
        </button>
        <NavLink className={({ isActive }) => `nav-item ${(activeSection === undefined ? isActive : activeSection === 'Từ vựng') ? 'selected' : ''}`} to="/vocabulary">
          <Languages className="nav-icon" aria-hidden="true" /><span>Từ vựng</span><span className="nav-count">8</span>
        </NavLink>
        <NavLink className={({ isActive }) => `nav-item ${(activeSection === undefined ? isActive : activeSection === 'Phát âm') ? 'selected' : ''}`} to="/pronunciation">
          <AudioLines className="nav-icon" aria-hidden="true" /><span>Phát âm</span>
        </NavLink>
      </nav>
      <div className="side-label topic-label">CHỦ ĐỀ TỪ VỰNG <span>5</span></div>
      <nav className="topic-nav" aria-label="Chủ đề từ vựng">
        {topics.map((topic) => (
          <button className={`nav-item topic-item ${activeSection === topic.name ? 'selected' : ''}`} key={topic.name} onClick={() => onSectionSelect?.(topic.name)}>
            <topic.icon className="nav-icon" aria-hidden="true" /><span>{topic.name}</span><span className={`topic-count ${topic.count === 0 ? 'empty' : ''}`}>{topic.count}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="help-card"><div className="help-art">✦</div><strong>Lộ trình TOCFL A1</strong><p>6 bài học · Hoa ngữ phồn thể</p><button onClick={() => onSectionSelect?.('Bài học')}>Khám phá bài học <span>→</span></button></div>
        <Link className="profile" to="/profile" title="Xem hồ sơ"><UserAvatar className="avatar" avatarUrl={user?.avatarUrl} alt="Ảnh đại diện" /><span className="profile-copy"><strong>{user?.name || user?.username || 'Học viên'}</strong><small>{user?.email || '繁體中文 · TOCFL A1'}</small></span><span className="profile-more">↗</span></Link>
      </div>
    </aside>
  )
}

export default Sidebar
