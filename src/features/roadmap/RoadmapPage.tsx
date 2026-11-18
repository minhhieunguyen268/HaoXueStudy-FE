import { ArrowRight, CircleHelp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, NavLink, useParams } from 'react-router-dom'
import AppLayout from '../../shared/components/AppLayout'
import { getVocabularyLessons, type VocabularyLesson } from '../vocabulary/api/vocabularyApi'
import { useCourseGrammar } from './useCourseGrammar'
import './roadmap.css'
import { useLessonProgress } from './lessonProgress'

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
  const correctCount = answers?.filter((answer, index) => answer === questions[index].answer).length ?? 0
  const allCorrect = finished && correctCount === questions.length

  return (
    <section className="rm-quiz" aria-live="polite">
      {!answers && (
        <div className="rm-quiz-intro">
          <div>
            <h2>Kiểm tra nhanh để chọn điểm bắt đầu</h2>
            <p>Trả lời 3 câu để biết nên bắt đầu từ phần nào trong A1.</p>
          </div>
          <button type="button" className="rm-button primary" onClick={() => setAnswers([])}>Bắt đầu kiểm tra</button>
        </div>
      )}

      {question && (
        <div className="rm-quiz-body">
          <div className="rm-dots" aria-label={`Câu ${answers.length + 1} trên ${questions.length}`}>
            {questions.map((_, index) => <i key={index} className={index < answers.length ? 'done' : index === answers.length ? 'now' : ''} />)}
            <small>Câu {answers.length + 1} / {questions.length}</small>
          </div>
          <h2 lang="zh-TW">{question.prompt}</h2>
          <div className="rm-options">
            {question.options.map((option, index) => (
              <button type="button" key={option} onClick={() => setAnswers((current) => [...(current ?? []), index])}>{option}</button>
            ))}
          </div>
        </div>
      )}

      {finished && (
        <div className="rm-quiz-result">
          <strong className="rm-result-score">{correctCount}<small>/{questions.length}</small></strong>
          <div>
            <h2>{allCorrect ? 'Bạn đã sẵn sàng cho A1' : 'Hãy bắt đầu từ nền tảng'}</h2>
            <p>{allCorrect ? 'Bạn có thể bắt đầu với từ vựng và mẫu câu A1.' : 'Bạn có thể bắt đầu với phần phát âm và chào hỏi A1.'}</p>
          </div>
          <div className="rm-result-actions">
            <Link className="rm-button primary" to={allCorrect ? '/vocabulary?lesson=1' : '/pronunciation'}>Bắt đầu học <ArrowRight size={14} /></Link>
            <button type="button" className="rm-button" onClick={() => setAnswers([])}>Làm lại</button>
          </div>
        </div>
      )}
    </section>
  )
}

export default function RoadmapPage() {
  const { completed } = useLessonProgress()
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

  const isA1 = level.code === 'A1'

  return (
    <AppLayout>
      <main className="main-content rm-page">
        <div className="rm-content">
          <header className="rm-header">
            <div>
              <p>Lộ trình tiếng Trung phồn thể</p>
              <h1>Lộ trình học {level.code}</h1>
              <span>{isA1 ? 'Học từ vựng và ngữ pháp theo từng bài trong Giáo trình Đương Đại 1.' : level.goal}</span>
            </div>
            <details className="rm-guide">
              <summary><CircleHelp size={16} aria-hidden="true" /> Hướng dẫn</summary>
              <p>Chọn cấp độ ở danh sách bên trái. Với A1, bấm vào từng bài để học từ vựng và xem cấu trúc ngữ pháp cùng ví dụ.</p>
            </details>
          </header>

          <div className="rm-layout">
            <aside className="rm-levels">
              <h2>Chọn chặng học</h2>
              <nav aria-label="Cấp độ học">
                {levels.map((item) => (
                  <NavLink key={item.code} to={'/roadmap/' + item.code.toLowerCase()} className={item.code === level.code ? 'is-selected' : ''}>
                    <b>{item.code}</b>
                    <span><strong>{item.title}</strong><small>{item.code === 'A1' ? '15 bài học' : 'Đang chuẩn bị'}</small></span>
                  </NavLink>
                ))}
              </nav>
            </aside>

            <div className="rm-main">
              {isA1 && <RoadmapOverview />}

              <section className="rm-course">
                <header>
                  <h2>{isA1 ? 'Nền tảng tiếng Trung phồn thể' : level.title}</h2>
                  <p>{isA1 ? 'Giáo trình Đương Đại 1 · 15 bài từ vựng và ngữ pháp' : 'Học liệu đang chuẩn bị'}</p>
                </header>

                {isA1 ? (
                  <ol className="rm-lessons">
                    {Array.from({ length: 15 }, (_, index) => {
                      const number = index + 1
                      const label = 'Bài ' + String(number).padStart(2, '0')
                      const lesson = lessons.find((item) => item.lessonNumber === number)
                      const points = grammar?.filter((point) => Number(point.lessonNumber) === number)
                      if (number > completed + 1) return (
                        <li key={number}><div className="rm-locked-lesson">
                          <span className="rm-lesson-no">{String(number).padStart(2, '0')}</span>
                          <span className="rm-lesson-copy"><strong>{lesson?.title ?? label}</strong><small>Mở sau khi hoàn thành bài {number - 1}</small></span>
                        </div></li>
                      )
                      return (
                        <li key={number}>
                          <Link to={'/roadmap/a1/' + number}>
                            <span className="rm-lesson-no" aria-hidden="true">{String(number).padStart(2, '0')}</span>
                            <span className="rm-lesson-copy">
                              <small>{label}{number <= completed && ' · Đã hoàn thành'}</small>
                              <strong>{lesson?.title ?? label}</strong>
                              <span>{lesson && `${lesson.vocabularyCount} từ vựng · `}{points ? `${points.length} điểm ngữ pháp` : grammarError ? 'Không tải được ngữ pháp' : 'Đang tải ngữ pháp…'}</span>
                            </span>
                            <ArrowRight size={18} aria-label="Vào bài học" />
                          </Link>
                        </li>
                      )
                    })}
                  </ol>
                ) : (
                  <div className="rm-soon">
                    <p>Nội dung dự kiến của chặng này:</p>
                    <ul>{level.topics.map((topic) => <li key={topic}>{topic}</li>)}</ul>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
