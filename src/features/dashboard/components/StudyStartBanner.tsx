import { ArrowRight, BookOpen, Flame, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import './study-start-banner.css'

export default function StudyStartBanner() {
  const today = new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(new Date())

  return (
    <section className="study-start-banner" aria-label="Bắt đầu hành trình học">
      <div className="study-start-copy">
        <span className="study-start-label"><Sparkles size={15} /> Bắt đầu cùng HaoXue</span>
        <h2>Tìm lộ trình hợp với bạn</h2>
        <p>Kiểm tra kiến thức và chọn bài học để bắt đầu.</p>
        <div className="study-start-action">
          <span>Học từng bài, tiến bộ mỗi ngày</span>
          <Link to="/roadmap">Bắt đầu <ArrowRight size={18} /></Link>
        </div>
      </div>
      <aside className="study-start-daily">
        <div className="study-start-daily-heading">
          <span className="study-start-flame"><Flame size={24} /></span>
          <div><strong>Dành một chút thời gian cho tiếng Trung</strong><small>Hôm nay · {today}</small></div>
        </div>
        <div className="study-start-week" aria-hidden="true">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
            <span key={day}><Flame size={19} /><small>{day}</small></span>
          ))}
        </div>
        <p>Học một bài hôm nay để giữ nhịp học của bạn.</p>
        <Link to="/vocabulary"><BookOpen size={16} /> Mở bài từ vựng <ArrowRight size={16} /></Link>
      </aside>
    </section>
  )
}
