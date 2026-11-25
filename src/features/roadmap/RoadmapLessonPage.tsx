import api from '../../shared/lib/api'
import ProgressStatus from './ProgressStatus'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, BookOpen } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import AppLayout from '../../shared/components/AppLayout'
import SpeakButton from '../vocabulary/components/SpeakButton'
import { useLessonProgress } from './lessonProgress'
import { useCourseGrammar, type GrammarExample, type GrammarPoint } from './useCourseGrammar'
import './roadmap-lesson.css'
import LessonDialogues from './LessonDialogues'

function getExamples(point: GrammarPoint): GrammarExample[] {
  if (point.details?.examples.length) return point.details.examples
  const pinyin = point.examplePinyin?.split(/\s*\/\s*/) ?? []
  const translations = point.translation?.split(/\s*\/\s*/) ?? []
  return (point.example?.split(/\s*\/\s*/) ?? []).map((text, index) => ({
    text,
    pinyin: pinyin[index],
    translation: translations.length === 1 ? translations[0] : translations[index],
  }))
}

const choices = ['A', 'B', 'C', 'D'] as const
type Choice = typeof choices[number]
type Question = Record<Choice, string> & { position: number; difficulty: string; prompt: string }
type Section = 'vocab' | 'dialogues' | 'grammar' | 'practice'

function Lesson({ number }: { number: number }) {
  const label = 'Bài ' + String(number).padStart(2, '0')
  const { grammar, error } = useCourseGrammar()
  const points = grammar?.filter((point) => Number(point.lessonNumber) === number) ?? []
  const { completed, lessons, save, saving, ready, error: progressError, retry } = useLessonProgress()
  const checkpoint = lessons.find(row => row.lesson === number)
  const answers = Object.fromEntries(Object.entries(checkpoint?.answers ?? {}).filter(([position, value]) =>
    Number(position) > 0 && choices.includes(value as Choice),
  ))
  const feedback = checkpoint?.feedback
  const [questions, setQuestions] = useState<Question[]>()
  const [quizError, setQuizError] = useState(false)
  const [quizRetry, setQuizRetry] = useState(0)
  const step = checkpoint?.step ?? 0
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const vocabularyReviewed = !!checkpoint || number <= completed
  const practicing = points.length > 0 && step === points.length
  const currentSection = selectedSection ?? (practicing ? 'practice' : vocabularyReviewed ? 'grammar' : 'vocab')
  const grammarStep = practicing ? points.length - 1 : step
  const point = points[grammarStep]
  const sectionHeading = useRef<HTMLHeadingElement>(null)
  const previousStep = useRef(step)
  useEffect(() => {
    if (previousStep.current !== step) sectionHeading.current?.focus()
    previousStep.current = step
  }, [step])

  useEffect(() => {
    if (!practicing) return
    const controller = new AbortController()
    api.get<Question[]>(`/learning-progress/a1/${number}/quiz`, { signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) { setQuestions(data); setQuizError(false) } })
      .catch(() => { if (!controller.signal.aborted) setQuizError(true) })
    return () => controller.abort()
  }, [number, practicing, quizRetry])

  const answered = questions?.filter(question => answers[question.position]).length ?? 0
  const score = feedback?.filter(item => answers[item.position] === item.correct).length ?? 0
  if (!ready) return <ProgressStatus error={progressError} retry={retry} />
  if (number > completed + 1) return <Navigate to={'/lession/a1/' + (completed + 1)} replace />

  async function confirmVocabulary() {
    if (vocabularyReviewed || await save(number, 0, {})) setSelectedSection('dialogues')
  }

  async function moveGrammar(next: number) {
    if (next === step || await save(number, next, answers)) {
      setSelectedSection(next === points.length ? 'practice' : 'grammar')
    }
  }

  function choose(index: number, pattern: string) {
    const next = { ...answers, [index]: pattern }
    void save(number, step, next)
  }

  return (
    <AppLayout>
      <main className="lesson-page">
        <div className="page-container lesson-content">
          <Link className="lesson-back" to="/lession/a1">← Bài học A1</Link>

          <header className="lesson-header">
            <div>
              <p><BookOpen size={16} aria-hidden="true" /> Giáo trình Đương Đại 1 · A1</p>
              <h1>{label}</h1>
              <span>Từ vựng và ngữ pháp</span>
            </div>
            <div className="lesson-course-progress">
              <p>Đã hoàn thành <strong>{completed}/15 bài</strong></p>
              <progress value={completed} max={15} aria-label="Tiến độ Quyển 1" />
            </div>
          </header>

          <div className="lesson-layout">
            <nav className="lesson-steps" aria-label="Các bước học">
              <h2>Nội dung bài học</h2>
              <ol>
                <li><button type="button" aria-current={currentSection === 'vocab' ? 'step' : undefined} onClick={() => setSelectedSection('vocab')}><b>1</b>Từ mới</button></li>
                <li><button type="button" disabled={!vocabularyReviewed || saving} aria-current={currentSection === 'dialogues' ? 'step' : undefined} onClick={() => setSelectedSection('dialogues')}><b>2</b>Hội thoại</button></li>
                <li><button type="button" disabled={!vocabularyReviewed || saving} aria-current={currentSection === 'grammar' ? 'step' : undefined} onClick={() => setSelectedSection('grammar')}><b>3</b>Cấu trúc và ví dụ</button></li>
                <li><button type="button" disabled={!practicing || saving} aria-current={currentSection === 'practice' ? 'step' : undefined} onClick={() => setSelectedSection('practice')}><b>4</b>Kiểm tra</button></li>
              </ol>
            </nav>

            <div className="lesson-main">
              {progressError && <p role="alert" className="lesson-note error">{progressError}</p>}
              {currentSection === 'vocab' && <section className="lesson-card lesson-intro">
                <div>
                  <h2>Học từ vựng trước</h2>
                  <p>Mở trang Từ vựng của {label.toLowerCase()} để nghe phát âm, đọc nghĩa và xem ví dụ. Khi ôn xong, quay lại đây để tiếp tục với Hội thoại và Ngữ pháp.</p>
                </div>
                <div className="lesson-vocab-actions">
                  <Link className="lesson-button primary" to={`/vocabulary?lesson=${number}&fromLesson=1`}>Mở từ vựng {label.toLowerCase()} <ArrowRight size={16} aria-hidden="true" /></Link>
                  <button className="lesson-button" type="button" disabled={saving} onClick={confirmVocabulary}>{vocabularyReviewed ? 'Sang hội thoại' : 'Đã học từ vựng · Sang hội thoại'}</button>
                </div>
              </section>}
              {currentSection === 'dialogues' && <>
                <LessonDialogues lesson={number} />
                <div className="lesson-footer"><button type="button" className="lesson-button primary" onClick={() => setSelectedSection('grammar')}>Sang ngữ pháp →</button></div>
              </>}

              {currentSection === 'grammar' && <section id="lesson-grammar" className="lesson-section">
                <h2 ref={sectionHeading} tabIndex={-1}>Cấu trúc và ví dụ</h2>
                {error ? <p className="lesson-note error" role="alert">Không tải được ngữ pháp. Hãy tải lại trang để thử lại.</p>
                  : !grammar ? <p className="lesson-note" role="status">Đang tải ngữ pháp…</p>
                  : points.length === 0 && <p className="lesson-note">Bài này chưa có ngữ pháp.</p>}

                {point && (
                  <article key={step} className="lesson-card lesson-grammar">
                    <div className="lesson-counter"><small>Cấu trúc {grammarStep + 1} / {points.length}</small><progress value={grammarStep + 1} max={points.length} aria-label="Vị trí cấu trúc trong bài" /></div>
                    <h3>{point.title}</h3>
                    {point.details?.englishTitle && <small lang="en">{point.details.englishTitle}</small>}
                    <h4>Công thức</h4>
                    <div className="lesson-pattern">{point.pattern}</div>
                    <h4>Cách dùng</h4>
                    <p className="lesson-usage">{point.description}</p>
                    {point.details?.notes && <aside className="lesson-grammar-note"><h4>Lưu ý khi đặt câu</h4><p>{point.details.notes}</p></aside>}
                    <h4>Ví dụ</h4>
                    <ul className="lesson-examples" aria-label="Ví dụ và phát âm">
                      {getExamples(point).map((example) => (
                        <li key={example.text}>
                          <div className="lesson-example-zh">
                            <strong lang="zh-TW">{example.text}</strong>
                            <SpeakButton text={example.text} />
                          </div>
                          {example.pinyin && <span>{example.pinyin}</span>}
                          {example.translation && <p>{example.translation}</p>}
                          {example.note && <small>{example.note}</small>}
                          {example.simplified && example.simplified !== example.text && (
                            <details><summary>Xem chữ giản thể</summary><span lang="zh-CN">{example.simplified}</span></details>
                          )}
                        </li>
                      ))}
                    </ul>
                    <div className="lesson-footer">
                      <button type="button" className="lesson-button" disabled={saving || grammarStep === 0} onClick={() => moveGrammar(grammarStep - 1)}>Quay lại</button>
                      <button type="button" disabled={saving} className="lesson-button primary" onClick={() => moveGrammar(grammarStep + 1)}>
                        {grammarStep + 1 === points.length ? 'Làm bài kiểm tra' : 'Cấu trúc tiếp theo →'}
                      </button>
                    </div>
                  </article>
                )}
              </section>}

              {currentSection === 'practice' && practicing && (
                <section id="lesson-practice" className="lesson-section">
                  <div className="lesson-practice-head">
                    <div>
                      <h2 ref={sectionHeading} tabIndex={-1}>Kiểm tra cuối bài</h2>
                      {questions && questions.length > 0 && <p>Trả lời đủ {questions.length} câu và đạt ít nhất {Math.ceil(questions.length * 0.7)}/{questions.length} để mở bài tiếp theo.</p>}
                    </div>
                    {questions && questions.length > 0 && <div className="lesson-score" aria-live="polite">
                      <strong>{feedback ? score : answered}/{questions.length}</strong>
                      <small>{feedback ? 'câu đúng' : 'câu đã trả lời'}</small>
                    </div>}
                  </div>

                  {quizError ? <p className="lesson-note error" role="alert">Chưa tải được câu hỏi. <button type="button" onClick={() => setQuizRetry(value => value + 1)}>Thử lại</button></p>
                    : !questions ? <p role="status">Đang tải câu hỏi…</p>
                    : questions.length === 0 && <p className="lesson-note">Bài kiểm tra đang được chuẩn bị.</p>}

                  {questions?.map(({ position, difficulty, prompt, ...options }) => {
                    const chosen = answers[position]
                    const result = feedback?.find(item => item.position === position)
                    return (
                      <article className="lesson-card lesson-question" key={position}>
                        <small>{difficulty}</small>
                        <h3><span>{position}</span>{prompt}</h3>
                        <div className="lesson-options">
                          {choices.map(choice => (
                            <button key={choice} type="button" disabled={saving || !!feedback} aria-pressed={chosen === choice}
                              className={result?.correct === choice ? 'correct' : result && chosen === choice ? 'wrong' : ''}
                              onClick={() => choose(position, choice)}>
                              <strong>{choice}.</strong> {options[choice]}
                            </button>
                          ))}
                        </div>
                        {result && <div className={'lesson-feedback ' + (result.correct === chosen ? 'ok' : 'no')}>
                          <b>{result.correct === chosen ? 'Chính xác' : 'Đáp án đúng là ' + result.correct}</b>
                          <span>{result.explanation}</span>
                        </div>}
                      </article>
                    )
                  })}

                  {feedback && <p className="lesson-note" role="status">
                    {score >= Math.ceil(feedback.length * 0.7)
                      ? 'Bạn đã vượt qua bài kiểm tra.'
                      : 'Bạn chưa đạt. Xem phần giải thích rồi bấm Làm lại để thử lần nữa.'}
                  </p>}

                  <div className="lesson-footer">
                    <button type="button" disabled={saving || !answered} className="lesson-button" onClick={() => save(number, step, {})}>Làm lại</button>
                    {!feedback && <button type="button" className="lesson-button primary"
                      disabled={saving || !questions?.length || answered !== questions.length}
                      onClick={() => save(number, step, answers, true)}>Nộp bài</button>}
                    {completed >= number
                      ? <Link className="lesson-button primary" to={number < 15 ? '/lession/a1/' + (number + 1) : '/lession/a1'}>{number < 15 ? 'Bài tiếp theo →' : 'Hoàn thành A1 · Về danh sách bài'}</Link>
                      : <button type="button" className="lesson-button" disabled>{number < 15 ? 'Bài tiếp theo →' : 'Hoàn thành A1'}</button>}
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
  if (!Number.isInteger(number) || number < 1 || number > 15) return <Navigate to="/lession/a1" replace />
  return <Lesson key={number} number={number} />
}
