import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowLeft, ArrowRight, Lightbulb } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import AppLayout from '../../../shared/components/AppLayout'
import { getVocabulary, type VocabularyItem } from '../api/vocabularyApi'
import SpeakButton from '../components/SpeakButton'
import '../styles/vocabulary-practice.css'

function FlashcardDeck({ words }: { words: VocabularyItem[] }) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [hint, setHint] = useState(false)
  const reduceMotion = useReducedMotion()
  const word = words[index]
  const pronunciation = [word.pinyin, word.zhuyin].filter(Boolean).join(' · ') || 'Chưa có phiên âm'

  function move(next: number) {
    setIndex(next)
    setFlipped(false)
    setHint(false)
  }

  return (
    <>
      <article className="flashcard-stage">
        <div className="flashcard-tools">
          <button type="button" aria-pressed={hint} onClick={() => setHint(!hint)}><Lightbulb size={17} />{hint ? 'Ẩn gợi ý' : 'Hiện gợi ý'}</button>
          <SpeakButton text={word.traditional.split('/')[0].trim()} />
        </div>
        <button type="button" className="flashcard-face" onClick={() => setFlipped(!flipped)} aria-label={flipped ? 'Lật về mặt chữ Hán' : 'Lật thẻ để xem nghĩa'}>
          <motion.span
            className="flashcard-rotor"
            key={word.id}
            initial={false}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.52, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="flashcard-side" aria-hidden={flipped}>
              <strong lang="zh-TW">{word.traditional}</strong>
              {hint && <span>{pronunciation}</span>}
            </span>
            <span className="flashcard-side flashcard-side-back" aria-hidden={!flipped}>
              <strong lang="vi">{word.meaningVi}</strong>
              <span>{pronunciation}</span>
            </span>
          </motion.span>
          <small>{flipped ? 'Bấm để xem chữ Hán' : 'Bấm để xem nghĩa'}</small>
        </button>
      </article>
      <nav className="flashcard-controls" aria-label="Điều hướng thẻ">
        <button type="button" disabled={index === 0} onClick={() => move(index - 1)} aria-label="Thẻ trước"><ArrowLeft size={20} /></button>
        <span aria-live="polite">{index + 1} / {words.length}</span>
        <button type="button" disabled={index === words.length - 1} onClick={() => move(index + 1)} aria-label="Thẻ sau"><ArrowRight size={20} /></button>
      </nav>
    </>
  )
}

function LessonFlashcards({ lesson }: { lesson: number }) {
  const [words, setWords] = useState<VocabularyItem[] | null>(null)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let active = true
    getVocabulary({ bookCode: 'contemporary-chinese-1', lessonNumber: lesson, page: 1, pageSize: 50 })
      .then(({ items }) => { if (active) setWords(items) })
      .catch(() => { if (active) setError(true) })
    return () => { active = false }
  }, [lesson, retry])

  return (
    <AppLayout>
      <main className="flashcards-page">
        <div className="page-container flashcards-content">
          <Link className="flashcards-back" to={'/vocabulary?lesson=' + lesson}><ArrowLeft size={17} /> Từ vựng bài {lesson}</Link>
          <header><p>Giáo trình Đương Đại 1 · Bài {lesson}</p><h1>Thẻ ghi nhớ</h1></header>
          {error ? <div role="alert">
            <p>Không tải được từ vựng của bài.</p>
            <button type="button" onClick={() => { setError(false); setRetry((value) => value + 1) }}>Thử lại</button>
          </div> : !words ? <p role="status">Đang tải thẻ…</p> :
            words.length ? <FlashcardDeck words={words} /> : <p>Bài này chưa có từ vựng.</p>}
        </div>
      </main>
    </AppLayout>
  )
}

export default function FlashcardsPage() {
  const lesson = Number(useParams().lesson)
  if (!Number.isInteger(lesson) || lesson < 1 || lesson > 15) return <Navigate to="/vocabulary" replace />
  return <LessonFlashcards key={lesson} lesson={lesson} />
}
