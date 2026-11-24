import ProgressStatus from './ProgressStatus'
import { useState } from 'react'
import { ArrowUpRight, BookOpen, Briefcase, Compass, GraduationCap, Headphones, Mic, PenLine, Plane, Sprout, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import AppLayout from '../../shared/components/AppLayout'
import PlacementQuiz from './PlacementQuiz'
import { levels } from './levels'
import { useLessonProgress } from './lessonProgress'
import './roadmap.css'
import './learning-path.css'

const goals = [
  { name: 'Học từ số 0', icon: Sprout, steps: ['Làm quen thanh điệu', 'Nhận mặt chữ qua flashcards', 'Đặt câu theo mẫu'], tools: ['sound','cards','lesson'] },
  { name: 'Đi làm', icon: Briefcase, steps: ['Đọc câu giới thiệu bản thân', 'Nghe và nhắc lại từ mới', 'Tập giới thiệu đồng nghiệp theo mẫu'], tools: ['lesson','words','lesson'] },
  { name: 'Thi TOCFL', icon: Trophy, steps: ['Ôn nghĩa từ qua flashcards', 'Nghe câu ví dụ rồi đối chiếu nghĩa', 'Nhận diện cấu trúc trong bài đọc'], tools: ['cards','words','lesson'] },
  { name: 'Du lịch Đài Loan', icon: Plane, steps: ['Luyện phát âm lời chào', 'Nghe từ và câu giao tiếp', 'Tập đặt câu hỏi theo mẫu'], tools: ['sound','words','lesson'] },
  { name: 'Du học', icon: GraduationCap, steps: ['Đọc ví dụ và ghi lại từ mới', 'Luyện viết chữ phồn thể', 'Ôn lại từ bằng flashcards'], tools: ['lesson','words','cards'] },
] as const

const stages = ['入門級', '基礎級', '進階級', '高階級', '流利級', '精通級']

export default function LearningPathPage() {
  const { completed, ready, error, retry } = useLessonProgress()
  const [selected, setSelected] = useState(0)
  const lesson = completed === 15 ? 1 : completed + 1
  const destinations = { lesson: '/lession/a1/' + lesson, cards: '/vocabulary/flashcards/' + lesson, words: '/vocabulary?lesson=' + lesson, sound: '/pronunciation' }
  const skills = [
    { name: 'Luyện nghe', hint: 'Nghe câu ví dụ', to: destinations.words, icon: Headphones },
    { name: 'Luyện nói', hint: 'Đọc theo thanh điệu', to: destinations.sound, icon: Mic },
    { name: 'Luyện đọc', hint: 'Hiểu mẫu câu', to: destinations.lesson, icon: BookOpen },
    { name: 'Luyện viết', hint: 'Viết theo thứ tự nét', to: destinations.words, icon: PenLine },
  ]
  const goal = goals[selected]
  if (!ready) return <ProgressStatus error={error} retry={retry} />

  return (
    <AppLayout>
      <main className="rm-page">
        <div className="page-container rm-content tocfl">
          <header className="rm-header"><div>
            <p><Compass size={16} /> Tiếng Trung phồn thể · 臺灣華語</p>
            <h1>Lộ trình học theo TOCFL</h1>
            <span>Chọn mục tiêu để xây nền tảng nghe, nói, đọc và viết với Giáo trình Đương Đại.</span>
          </div></header>
          <div className="tocfl-layout">
            <div className="tocfl-main">
              <section className="tocfl-overview" aria-label="Tiến độ và kỹ năng">
                <div className="rm-course tocfl-progress">
                  <h2>Tiến độ Quyển 1</h2>
                  <p><strong>{completed}</strong> / 15 bài</p>
                  <progress max={15} value={completed} aria-label="Số bài đã hoàn thành" />
                  <Link className="rm-button primary" to={destinations.lesson}>{completed === 15 ? 'Ôn lại' : completed ? 'Học tiếp' : 'Bắt đầu'} bài {String(lesson).padStart(2,'0')} →</Link>
                </div>
                <div className="tocfl-skills">
                  {skills.map(({ name, hint, to, icon: Icon }) => <Link key={name} to={to}><Icon size={21} /><strong>{name}</strong><small>{hint}</small></Link>)}
                </div>
              </section>
              <section className="tocfl-goals">
                <h2>Bạn học tiếng Trung để làm gì?</h2>
                <div role="group" aria-label="Mục tiêu học tập">
                  {goals.map(({ name, icon: Icon }, index) => <button key={name} type="button" aria-pressed={selected === index} onClick={() => setSelected(index)}><Icon size={20} />{name}</button>)}
                </div>
              </section>
              <section className="rm-course tocfl-plan" aria-live="polite">
                <header><h2>{goal.name}</h2><p>Ba bước gợi ý cho buổi học · Bài {String(lesson).padStart(2,'0')}</p></header>
                <ol>{goal.steps.map((step, i) => <li key={step}><Link to={destinations[goal.tools[i]]}><b>{i + 1}</b>{step}<ArrowUpRight size={16} /></Link></li>)}</ol>
              </section>
            </div>
            <aside className="tocfl-side">
              <PlacementQuiz />
              <section className="rm-course tocfl-bands">
                <header><h2>Các cấp TOCFL</h2><p>Chặng A1–C2 của HaoXueStudy</p></header>
                {['A','B','C'].map((band, i) => <div key={band}><h3>Band {band}</h3>
                  {levels.slice(i*2, i*2+2).map((level, j) => <p key={level.code}><strong>{level.code}</strong><span lang="zh-TW">{stages[i*2+j]}</span><small>Cấp {i*2+j+1}</small></p>)}
                </div>)}
                <Link to="/lession/a1">Xem bài học A1 →</Link>
                <small>A2–C2 đang chuẩn bị học liệu.</small>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
