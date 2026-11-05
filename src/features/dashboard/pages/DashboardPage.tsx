import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CalendarDays, Search } from 'lucide-react'
import AppLayout from '../../../shared/components/AppLayout'
import UserAvatar from '../../../shared/components/UserAvatar'
import PromotionalBannerCarousel from '../components/PromotionalBannerCarousel'
import useAuthStore from '../../auth/authStore'

const lessons = [
  { unit: 'BÀI 05 · GIAO TIẾP', title: 'Gọi món ở nhà hàng', detail: 'Từ vựng · 12 phút', icon: '🍜', tone: 'peach', progress: 68 },
  { unit: 'BÀI 06 · TỪ VỰNG', title: 'Một ngày của tôi', detail: 'Từ vựng · 15 phút', icon: '☀️', tone: 'lilac', progress: 0 },
  { unit: 'BÀI 07 · NGỮ PHÁP', title: 'Câu hỏi với 怎么', detail: 'Ngữ pháp · 10 phút', icon: '💬', tone: 'mint', progress: 0 },
]

function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const [active, setActive] = useState('Tổng quan')
  const [search, setSearch] = useState('')
  const [playing, setPlaying] = useState(false)
  const visibleLessons = lessons.filter((lesson) => lesson.title.toLowerCase().includes(search.toLowerCase()))

  function requireLogin(action?: () => void) {
    action?.()
  }

  return (
    <AppLayout activeSection={active} onSectionSelect={(section) => requireLogin(() => setActive(section))}>
      <main className="main-content" id="home">
        <header className="topbar">
          <div className="topbar-leading">
            <div className="breadcrumb">Không gian học tập <span>/</span> <strong>{active}</strong></div>
          </div>
          <div className="top-actions">
            <label className="search-box" onClick={() => requireLogin()}><Search aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm bài học..." aria-label="Tìm bài học" /><kbd>⌘ K</kbd></label>
            <button className="icon-button notification" aria-label="Thông báo" onClick={() => requireLogin(() => setActive('Thông báo'))}><Bell aria-hidden="true" /><i /></button>
            <Link className="top-avatar-link" aria-label="Tài khoản" to="/profile"><UserAvatar className="top-avatar" avatarUrl={user?.avatarUrl} alt="" /></Link>
          </div>
        </header>

        <div className="page-wrap">
          <section className="welcome-row">
            <div><div className="eyebrow"><span className="sparkle">✳</span> THỨ HAI, 24 THÁNG 6, 2024</div><h1>Chào buổi sáng, {user?.name?.split(' ')[0] || user?.username || 'bạn'} <span>👋</span></h1><p className="welcome-sub">Sẵn sàng chinh phục thêm một chút tiếng Trung hôm nay chưa?</p></div>
            <button className="week-button" onClick={() => requireLogin(() => setActive('Tổng quan'))}><CalendarDays aria-hidden="true" /> <span>Tuần này</span>⌄</button>
          </section>

          <PromotionalBannerCarousel />

          <section className="stats-grid" aria-label="Tiến độ học tập">
            <article className="stat-card"><div className="stat-top"><span className="stat-icon flame">♨</span><span className="stat-change">↗ 2 ngày</span></div><strong className="stat-value">5 <small>ngày</small></strong><span className="stat-label">Chuỗi học liên tiếp</span><div className="mini-week"><i className="done">T2</i><i className="done">T3</i><i className="done">T4</i><i className="done">T5</i><i className="today">T6</i><i>T7</i><i>CN</i></div></article>
            <article className="stat-card"><div className="stat-top"><span className="stat-icon book">▤</span><span className="stat-note">Mục tiêu: 5 bài</span></div><strong className="stat-value">3 <small>/ 5</small></strong><span className="stat-label">Bài học tuần này</span><div className="progress-line"><i style={{ width: '60%' }} /></div><span className="stat-foot">Còn 2 bài nữa — bạn làm được! ✨</span></article>
            <article className="stat-card"><div className="stat-top"><span className="stat-icon vocab">文</span><span className="stat-note">+8 tuần này</span></div><strong className="stat-value">128 <small>từ</small></strong><span className="stat-label">Từ vựng đã ghi nhớ</span><div className="vocab-bars"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><span className="stat-foot">Tiếp tục ôn tập để nhớ lâu hơn</span></article>
          </section>

          <section className="learning-layout">
            <div className="lessons-section"><div className="section-heading"><div><div className="eyebrow">TIẾP TỤC HÀNH TRÌNH</div><h2>Bài học của bạn <span>✦</span></h2></div><button className="text-link" onClick={() => requireLogin(() => setActive('Bài học'))}>Xem tất cả <b>→</b></button></div>
              <div className="lesson-list">{visibleLessons.map((lesson, index) => <article className={`lesson-card ${index === 0 ? 'current-lesson' : ''}`} key={lesson.title}><div className={`lesson-art ${lesson.tone}`}><span>{lesson.icon}</span>{index === 0 && <i>ĐANG HỌC</i>}</div><div className="lesson-info"><div className="lesson-unit">{lesson.unit}</div><h3>{lesson.title}</h3><p>{lesson.detail}</p>{lesson.progress > 0 && <div className="lesson-progress"><span><i style={{ width: `${lesson.progress}%` }} /></span><small>{lesson.progress}%</small></div>}</div><button className={`lesson-action ${index === 0 ? 'resume' : ''}`} aria-label={`${index === 0 ? 'Tiếp tục' : 'Bắt đầu'} ${lesson.title}`} onClick={() => requireLogin(() => setPlaying(true))}>{index === 0 ? '→' : '▷'}</button></article>)}{visibleLessons.length === 0 && <div className="empty-state">Không tìm thấy bài học phù hợp.</div>}</div>
            </div>
            <aside className="right-column"><section className="goal-card"><div className="goal-top"><div><div className="eyebrow">MỤC TIÊU HÔM NAY</div><h3>12 <small>/ 20 phút</small></h3></div><span className="goal-icon">◷</span></div><div className="goal-track"><i /></div><div className="goal-foot"><span>⚡ Bạn đang đi đúng hướng!</span><strong>60%</strong></div></section>
              <section className="word-card"><div className="word-head"><div><div className="eyebrow">TỪ VỰNG HÔM NAY</div><span className="word-tag">DANH TỪ</span></div><button className="sound-button" onClick={() => requireLogin(() => setPlaying(!playing))} aria-label="Nghe phát âm">{playing ? 'Ⅱ' : '♫'}</button></div><div className="word-body"><span className="hanzi">朋友</span><span className="pinyin">péng you</span><strong>người bạn</strong><p>我有一個中國朋友。</p><small>Wǒ yǒu yí ge Zhōngguó péngyou.</small></div><button className="word-more" onClick={() => requireLogin(() => setActive('Từ vựng'))}>Ôn tập từ này <span>→</span></button></section></aside>
          </section>
          <footer className="page-footer"><span>好好學習，天天向上 <i>·</i> Học tập chăm chỉ, mỗi ngày tiến bộ</span><span>Được tạo bằng <b>♥</b> cho hành trình của bạn</span></footer>
        </div>
      </main>
    </AppLayout>
  )
}

export default DashboardPage
