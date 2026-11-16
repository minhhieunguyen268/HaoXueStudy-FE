import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import AppLayout from '../../shared/components/AppLayout'
import SpeakButton from '../vocabulary/components/SpeakButton'
import { useCourseGrammar, type GrammarPoint } from './useCourseGrammar'
import './roadmap-lesson.css'

function getExamples(point: GrammarPoint) {
  const pinyin = point.examplePinyin?.split(/\s*\/\s*/) ?? []
  const translations = point.translation?.split(/\s*\/\s*/) ?? []
  return (point.example?.split(/\s*\/\s*/) ?? []).map((text, index) => ({
    text,
    pinyin: pinyin[index],
    translation: translations.length === 1 ? translations[0] : translations[index],
  }))
}

function Lesson({ number }: { number: number }) {
  const label = 'Bài ' + String(number).padStart(2, '0')
  const { grammar, error } = useCourseGrammar()
  const points = grammar?.filter((point) => Number(point.lessonNumber) === number) ?? []
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const answered = Object.keys(answers).length
  const score = points.filter((point, index) => answers[index] === point.pattern).length

  return (
    <AppLayout>
      <main className="main-content lesson-page">
        <div className="lesson-content">
          <Link className="lesson-back" to="/roadmap/a1">← Lộ trình A1</Link>

          <header className="lesson-header">
            <div>
              <p>Giáo trình Đương Đại 1 · A1</p>
              <h1>{label}</h1>
              <span>Từ vựng và ngữ pháp</span>
            </div>
            <div className="lesson-progress" aria-label={`Bài ${number} trên 15`}>
              <div><span style={{ width: `${(number / 15) * 100}%` }} /></div>
              <small>{number} / 15</small>
            </div>
          </header>

          <div className="lesson-layout">
            <nav className="lesson-steps" aria-label="Các bước học">
              <ol>
                <li><a href="#lesson-vocab"><b>1</b>Từ mới</a></li>
                <li><a href="#lesson-grammar"><b>2</b>Cấu trúc và ví dụ</a></li>
                <li><a href="#lesson-practice"><b>3</b>Luyện tập</a></li>
              </ol>
            </nav>

            <div className="lesson-main">
              <section id="lesson-vocab" className="lesson-card lesson-intro">
                <div>
                  <h2>Bắt đầu với từ mới</h2>
                  <p>Nghe và đọc lại từ mới, rồi thử đặt một câu với cấu trúc bên dưới. Sau đó làm bài luyện tập để kiểm tra.</p>
                </div>
                <Link className="lesson-button primary" to={'/vocabulary?lesson=' + number}>Học từ vựng {label.toLowerCase()}</Link>
              </section>

              <section id="lesson-grammar" className="lesson-section">
                <h2>Cấu trúc và ví dụ</h2>
                {error ? <p className="lesson-note error" role="alert">Không tải được ngữ pháp. Hãy tải lại trang để thử lại.</p>
                  : !grammar ? <p className="lesson-note" role="status">Đang tải ngữ pháp…</p>
                  : points.length === 0 && <p className="lesson-note">Bài này chưa có ngữ pháp.</p>}

                {points.map((point, index) => (
                  <article key={index} className="lesson-card lesson-grammar">
                    <h3>{point.title}</h3>
                    <div className="lesson-pattern" lang="zh-TW">{point.pattern}</div>
                    <p className="lesson-usage">{point.description}</p>
                    <ul className="lesson-examples" aria-label="Ví dụ và phát âm">
                      {getExamples(point).map((example) => (
                        <li key={example.text}>
                          <div className="lesson-example-zh">
                            <strong lang="zh-TW">{example.text}</strong>
                            <SpeakButton text={example.text} />
                          </div>
                          {example.pinyin && <span>{example.pinyin}</span>}
                          {example.translation && <p>{example.translation}</p>}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </section>

              {points.length > 0 && (
                <section id="lesson-practice" className="lesson-section">
                  <div className="lesson-practice-head">
                    <div>
                      <h2>Luyện tập</h2>
                      <p>Chọn cấu trúc phù hợp với mục đích sử dụng.</p>
                    </div>
                    <div className="lesson-score" aria-live="polite">
                      <strong>{score}/{points.length}</strong>
                      <small>đúng · đã trả lời {answered}/{points.length}</small>
                    </div>
                  </div>

                  {points.map((point, index) => {
                    const alternatives = [...new Set([...points, ...(grammar ?? [])].map((item) => item.pattern))]
                      .filter((pattern) => pattern && pattern !== point.pattern).slice(0, 2)
                    alternatives.splice(index % 3, 0, point.pattern)
                    const chosen = answers[index]
                    const correct = chosen === point.pattern
                    return (
                      <article className="lesson-card lesson-question" key={index}>
                        <h3><span>{index + 1}</span>{point.description}</h3>
                        <div className="lesson-options">
                          {alternatives.map((pattern) => {
                            const state = !chosen ? '' : pattern === point.pattern ? 'correct' : pattern === chosen ? 'wrong' : ''
                            return (
                              <button key={pattern} type="button" lang="zh-TW" className={state} aria-pressed={chosen === pattern} onClick={() => setAnswers((current) => ({ ...current, [index]: pattern }))}>
                                {pattern}
                              </button>
                            )
                          })}
                        </div>
                        {chosen && (
                          <p className={'lesson-feedback ' + (correct ? 'ok' : 'no')} role="status">
                            <b>{correct ? 'Chính xác!' : 'Chưa đúng. Đáp án: ' + point.pattern}</b>
                            <span>Ví dụ: <span lang="zh-TW">{getExamples(point)[0]?.text}</span></span>
                          </p>
                        )}
                      </article>
                    )
                  })}

                  <div className="lesson-footer">
                    <button type="button" className="lesson-button" onClick={() => setAnswers({})}>Làm lại</button>
                    {number < 15 && <Link className="lesson-button primary" to={'/roadmap/a1/' + (number + 1)}>Bài tiếp theo →</Link>}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}

export default function RoadmapLessonPage() {
  const { lesson } = useParams()
  const number = Number(lesson)
  if (!Number.isInteger(number) || number < 1 || number > 15) return <Navigate to="/roadmap/a1" replace />
  return <Lesson key={number} number={number} />
}