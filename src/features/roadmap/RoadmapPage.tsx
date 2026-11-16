import { ArrowRight, CircleHelp, Route } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, NavLink, useParams } from 'react-router-dom'
import AppLayout from '../../shared/components/AppLayout'
import { getVocabularyLessons, type VocabularyLesson } from '../vocabulary/api/vocabularyApi'
import { useCourseGrammar } from './useCourseGrammar'
import './roadmap.css'

const levels = [
  { code: 'A1', title: 'Làm quen', goal: 'Phát âm rõ và giao tiếp bằng những câu đơn giản.', topics: ['Thanh điệu và Pinyin', 'Chào hỏi và giới thiệu bản thân', 'Từ vựng Giáo trình Đương Đại 1'] },
  { code: 'A2', title: 'Giao tiếp cơ bản', goal: 'Xử lý các tình huống quen thuộc trong đời sống.', topics: ['Mua sắm và gọi món', 'Hỏi đường và đi lại', 'Kể về sinh hoạt hằng ngày'] },
  { code: 'B1', title: 'Giao tiếp độc lập', goal: 'Kể trải nghiệm và giải thích ý kiến về chủ đề quen thuộc.', topics: ['Kể chuyện theo trình tự', 'Trình bày kế hoạch', 'Đọc văn bản ngắn'] },
  { code: 'B2', title: 'Thảo luận tự tin', goal: 'Theo dõi nội dung dài hơn và bảo vệ một quan điểm.', topics: ['So sánh lựa chọn', 'Thảo luận tin tức', 'Viết đoạn có lập luận'] },
  { code: 'C1', title: 'Sử dụng linh hoạt', goal: 'Diễn đạt rõ ràng trong học tập và công việc.', topics: ['Đọc văn bản chuyên đề', 'Trình bày có cấu trúc', 'Điều chỉnh văn phong'] },
  { code: 'C2', title: 'Diễn đạt tinh tế', goal: 'Nắm sắc thái và diễn đạt chính xác trong nhiều ngữ cảnh.', topics: ['Phân tích hàm ý', 'Tổng hợp nhiều nguồn', 'Diễn đạt sắc thái và lập luận phức tạp'] },
]

const questions = [
  { prompt: '你好 có nghĩa là gì?', options: ['Cảm ơn', 'Xin chào', 'Tạm biệt'], answer: 1 },
  { prompt: 'Âm mǎ mang thanh nào?', options: ['Thanh 3', 'Thanh 1', 'Thanh 4'], answer: 0 },
  { prompt: 'Câu nào có nghĩa là “Tôi là học sinh”?', options: ['你是學生。', '我是老師。', '我是學生。'], answer: 2 },
]

function RoadmapOverview() {
  const [answers, setAnswers] = useState<number[] | null>(null)
  const finished = answers?.length === questions.length
  const question = answers && questions[answers.length]

  return (
    <>
          <header className="roadmap-hero">
            <div>
              <p>華語學習 · TIẾNG TRUNG PHỒN THỂ</p>
              <h1>Kiểm tra kiến thức và chọn lộ trình phù hợp</h1>
              <p>Trả lời 3 câu để chọn phần nên bắt đầu trong A1.</p>
              <div className="roadmap-actions">
                <button type="button" onClick={() => setAnswers([])}>{answers ? 'Làm lại' : 'Bắt đầu kiểm tra'}</button>
              </div>
            </div>
            <Route aria-hidden="true" size={64} />
          </header>
          {question && (
            <section className="roadmap-check" aria-live="polite">
              <small>Câu {(answers?.length ?? 0) + 1} / {questions.length}</small>
              <h2>{question.prompt}</h2>
              <div className="roadmap-actions">
                {question.options.map((option, index) => (
                  <button type="button" key={option} onClick={() => setAnswers((current) => [...(current ?? []), index])}>{option}</button>
                ))}
              </div>
            </section>
          )}
          {finished && answers && (
            <section className="roadmap-check" aria-live="polite">
              <h2>{answers.filter((answer, index) => answer === questions[index].answer).length} / {questions.length} câu đúng</h2>
              <p>{answers.every((answer, index) => answer === questions[index].answer)
                ? 'Bạn có thể bắt đầu với từ vựng và mẫu câu A1.'
                : 'Bạn có thể bắt đầu với phần phát âm và chào hỏi A1.'}</p>
              <div className="roadmap-actions"><Link to={answers.every((answer, index) => answer === questions[index].answer) ? '/vocabulary?lesson=1' : '/pronunciation'}>Bắt đầu học <ArrowRight size={14} /></Link></div>
            </section>
          )}
    </>
  )
}

export default function RoadmapPage() {
  const { level: levelParam } = useParams()
  const level = levels.find(({ code }) => code.toLowerCase() === (levelParam ?? 'a1').toLowerCase())
  const [lessons, setLessons] = useState<VocabularyLesson[]>([])
  const { grammar, error: grammarError } = useCourseGrammar(level?.code === 'A1')

  useEffect(() => {
    let active = true
    getVocabularyLessons('contemporary-chinese-1')
      .then((items) => { if (active) setLessons(items) })
      .catch(() => { if (active) setLessons([]) })
    return () => { active = false }
  }, [])

  if (!level) return <Navigate to="/roadmap" replace />

  return (
    <AppLayout>
      <main className="main-content roadmap-page">
        <div className="roadmap-content roadmap-layout">
          <header className="roadmap-page-heading">
            <div>
              <span className="roadmap-page-kicker">Lộ trình tiếng Trung phồn thể</span>
              <h1>Lộ trình học {level.code}</h1>
              <p>{level.code === 'A1' ? 'Học từ vựng và ngữ pháp theo từng bài trong Giáo trình Đương Đại 1.' : level.goal}</p>
            </div>
            <details className="roadmap-guide">
              <summary><CircleHelp size={17} aria-hidden="true" /> Hướng dẫn</summary>
              <p>Chọn cấp độ ở mục Chọn chặng học. Với A1, bấm vào từng bài để học từ vựng và xem cấu trúc ngữ pháp cùng ví dụ.</p>
            </details>
          </header>
          {level.code === 'A1' && (
            <section className="roadmap-placement">
              <RoadmapOverview />
            </section>
          )}
          <aside className="roadmap-sidebar">
            <header><h2>Chọn chặng học</h2><p>Tiếng Trung phồn thể</p></header>
            <nav aria-label="Cấp độ học">
              {levels.map((item) => (
                <NavLink key={item.code} to={'/roadmap/' + item.code.toLowerCase()} className={item.code === level.code ? 'is-selected' : ''}>
                  <span className="roadmap-level-code">{item.code}</span>
                  <span><strong>{item.title}</strong><small>{item.code === 'A1' ? '15 bài học' : 'Đang chuẩn bị'}</small></span>
                </NavLink>
              ))}
            </nav>
          </aside>
          <section className="roadmap-course">
            <header className="roadmap-course-heading">
              <span className="roadmap-level-code">{level.code}</span>
              <div><h2>{level.code === 'A1' ? 'Nền tảng tiếng Trung phồn thể' : level.title}</h2>
                <p>{level.code === 'A1' ? 'Giáo trình Đương Đại 1 · 15 bài từ vựng và ngữ pháp' : 'Học liệu đang chuẩn bị'}</p>
              </div>
            </header>
            {level.code === 'A1' && <>
              <ol className="roadmap-lesson-list">
                {Array.from({ length: 15 }, (_, index) => {
                  const number = index + 1
                  const label = 'Bài ' + String(number).padStart(2, '0')
                  const lesson = lessons.find((item) => item.lessonNumber === number)
                  const points = grammar?.filter((point) => Number(point.lessonNumber) === number)
                  return (
                    <li key={number}>
                      <span className="roadmap-node" aria-hidden="true">{String(number).padStart(2, '0')}</span>
                      <Link className="roadmap-lesson roadmap-lesson-link" to={'/roadmap/a1/' + number}>
                          <span className="roadmap-lesson-label">{label} · Từ vựng và ngữ pháp</span>
                          <strong>{lesson?.title ?? label}</strong>
                          <span>{lesson && `${lesson.vocabularyCount} từ vựng · `}{points ? `${points.length} điểm ngữ pháp` : grammarError ? 'Không tải được ngữ pháp' : 'Đang tải ngữ pháp…'}</span>
                        <span className="roadmap-lesson-label">Vào bài học →</span></Link>
                    </li>
                  )
                })}
              </ol>
            </>}
          </section>
        </div>
      </main>
    </AppLayout>
  )
}
