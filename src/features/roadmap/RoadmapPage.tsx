import ProgressStatus from './ProgressStatus'
import { ArrowRight, BookOpen, Check, CircleHelp, LockKeyhole } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, NavLink, useParams } from 'react-router-dom'
import AppLayout from '../../shared/components/AppLayout'
import { getVocabularyLessons, type VocabularyLesson } from '../vocabulary/api/vocabularyApi'
import { useCourseGrammar } from './useCourseGrammar'
import './roadmap.css'
import { useLessonProgress } from './lessonProgress'

import { levels } from './levels'
import PlacementQuiz from './PlacementQuiz'

export default function RoadmapPage() {
  const { completed, ready, error, retry } = useLessonProgress()
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

  if (!level) return <Navigate to="/lession" replace />

  const isA1 = level.code === 'A1'

  if (!ready) return <ProgressStatus error={error} retry={retry} />

  return (
    <AppLayout>
      <main className="rm-page">
        <div className="page-container rm-content">
          <header className="rm-header">
            <div>
              <p><BookOpen size={15} aria-hidden="true" /> Tiếng Trung phồn thể</p>
              <h1>Bài học {level.code}</h1>
              <span>{isA1 ? 'Khám phá 15 bài trong Giáo trình Đương Đại 1. Mỗi bài giúp bạn làm quen với từ mới, tập đặt câu và luyện tập để mở bài tiếp theo.' : level.goal}</span>
            </div>
            <details className="rm-guide">
              <summary><CircleHelp size={16} aria-hidden="true" /> Hướng dẫn</summary>
              <p>Chọn cấp độ ở danh sách bên trái. Với A1, bấm vào từng bài để học từ vựng và xem cấu trúc ngữ pháp cùng ví dụ.</p>
            </details>
          </header>

          {isA1 && <PlacementQuiz />}
          <div className="rm-layout">
            <aside className="rm-levels">
              <h2>Chọn chặng học</h2>
              <nav aria-label="Cấp độ học">
                {levels.map((item) => (
                  <NavLink key={item.code} to={'/lession/' + item.code.toLowerCase()} className={item.code === level.code ? 'is-selected' : ''}>
                    <b>{item.code}</b>
                    <span><strong>{item.title}</strong><small>{item.code === 'A1' ? '15 bài học' : 'Đang chuẩn bị'}</small></span>
                  </NavLink>
                ))}
              </nav>
            </aside>

            <div className="rm-main">
              <section className="rm-course">
                <header>
                  <h2>{isA1 ? 'Giáo trình Đương Đại 1' : level.title}</h2>
                  {isA1 ? <div className="rm-progress">
                    <p>Đã hoàn thành <strong>{completed}/15 bài</strong></p>
                    <progress max={15} value={completed} aria-label="Tiến độ Quyển 1" />
                    <Link to={'/lession/a1/' + (completed === 15 ? 1 : completed + 1)}>
                      {completed === 15 ? 'Ôn lại từ bài 01' : (completed ? 'Học tiếp bài ' : 'Bắt đầu bài ') + String(completed + 1).padStart(2, '0')} <ArrowRight size={16} />
                    </Link>
                  </div> : <p>Học liệu đang chuẩn bị</p>}
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
                          <LockKeyhole size={16} aria-hidden="true" />
                        </div></li>
                      )
                      return (
                        <li key={number} className={number === completed + 1 ? 'rm-current' : 'rm-done'}>
                          <Link to={'/lession/a1/' + number}>
                            <span className="rm-lesson-no" aria-hidden="true">{number <= completed ? <Check size={20} /> : String(number).padStart(2, '0')}</span>
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
