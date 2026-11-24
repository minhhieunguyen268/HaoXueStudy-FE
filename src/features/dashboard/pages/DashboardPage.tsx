import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import AppLayout from '../../../shared/components/AppLayout'
import PromotionalBannerCarousel from '../components/PromotionalBannerCarousel'
import useAuthStore from '../../auth/authStore'

import { useLessonProgress } from '../../roadmap/lessonProgress'
import { getVocabularyLessons, type VocabularyLesson } from '../../vocabulary/api/vocabularyApi'

function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const [active, setActive] = useState('Tổng quan')
  const [params] = useSearchParams()
  const [search, setSearch] = useState(() => params.get('q') ?? '')
  const [playing, setPlaying] = useState(false)
  const { completed, ready, error, retry } = useLessonProgress()
  const [catalog, setCatalog] = useState<VocabularyLesson[]>([])
  useEffect(() => {
    let active = true
    getVocabularyLessons('contemporary-chinese-1')
      .then(items => { if (active) setCatalog(items) })
      .catch(() => { /* Keep numbered lessons available if titles cannot load. */ })
    return () => { active = false }
  }, [])
  const nextLesson = Math.min(completed + 1, 15)
  const visibleLessons = Array.from({ length: nextLesson }, (_, index) => {
    const number = nextLesson - index
    const title = catalog.find(item => item.lessonNumber === number)?.title ?? 'Bài ' + number
    return { number, title }
  }).filter(lesson => (lesson.title + ' Bài ' + lesson.number).toLowerCase().includes(search.toLowerCase())).slice(0, 3)
  function requireLogin(action?: () => void) {
    action?.()
  }

  return (
    <AppLayout search={search} onSearch={setSearch} activeSection={active} onSectionSelect={(section) => requireLogin(() => setActive(section))}>
      <main id="home">


        <div className="page-container page-wrap">
          <section className="welcome-row">
            <div><div className="eyebrow"><span className="sparkle">✳</span> THỨ HAI, 24 THÁNG 6, 2024</div><h1>Chào buổi sáng, {user?.name?.split(' ')[0] || user?.username || 'bạn'} <span>👋</span></h1><p className="welcome-sub">Sẵn sàng chinh phục thêm một chút tiếng Trung hôm nay chưa?</p></div>
            <button className="week-button" onClick={() => requireLogin(() => setActive('Tổng quan'))}><CalendarDays aria-hidden="true" /> <span>Tuần này</span>⌄</button>
          </section>

          <PromotionalBannerCarousel />

          <section className="stats-grid" aria-label="Tiến độ học tập">
            <article className="stat-card"><div className="stat-top"><span className="stat-icon flame">♨</span><span className="stat-change">↗ 2 ngày</span></div><strong className="stat-value">5 <small>ngày</small></strong><span className="stat-label">Chuỗi học liên tiếp</span><div className="mini-week"><i className="done">T2</i><i className="done">T3</i><i className="done">T4</i><i className="done">T5</i><i className="today">T6</i><i>T7</i><i>CN</i></div></article>
            <article className="stat-card"><div className="stat-top"><span className="stat-icon book">▤</span></div><strong className="stat-value">{ready ? completed : '…'} <small>/ 15</small></strong><span className="stat-label">Bài đã hoàn thành · Quyển 1</span>{ready && <div className="progress-line"><i style={{ width: (completed / 15 * 100) + '%' }} /></div>}</article>
            <article className="stat-card"><div className="stat-top"><span className="stat-icon vocab">文</span><span className="stat-note">+8 tuần này</span></div><strong className="stat-value">128 <small>từ</small></strong><span className="stat-label">Từ vựng đã ghi nhớ</span><div className="vocab-bars"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><span className="stat-foot">Tiếp tục ôn tập để nhớ lâu hơn</span></article>
          </section>

          <section className="learning-layout">
            <div className="lessons-section"><div className="section-heading"><div><div className="eyebrow">TIẾP TỤC HÀNH TRÌNH</div><h2>Lộ trình của bạn <span>✦</span></h2></div><Link className="text-link" to="/roadmap">Xem tất cả <b>→</b></Link></div>
              <div className="lesson-list">
                {error ? <p role="alert">{error} <button onClick={retry}>Thử lại</button></p> : !ready ? <p>Đang tải tiến độ…</p> : visibleLessons.length ? visibleLessons.map(({ number, title }) => (
                  <Link key={number} to={'/lession/a1/' + number} className="lesson-card">
                    <div className="lesson-art mint">{String(number).padStart(2, '0')}</div>
                    <div className="lesson-info"><div className="lesson-unit">BÀI {number} · A1</div><h3>{title}</h3><p>{number <= completed ? 'Đã hoàn thành · Ôn lại' : 'Học tiếp'} →</p></div>
                  </Link>
                )) : <p>Không tìm thấy bài học phù hợp.</p>}
              </div>
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
