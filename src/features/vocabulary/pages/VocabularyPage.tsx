import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Alert, Button, Input, Spin, Tag } from 'antd'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import AppLayout from '../../../shared/components/AppLayout'
import { getVocabulary, getVocabularyBooks, getVocabularyLessons, type VocabularyItem, type VocabularyLesson } from '../api/vocabularyApi'
import SpeakButton from '../components/SpeakButton'
import StrokePractice from '../components/StrokePractice'
import VocabularyPractice from '../components/VocabularyPractice'
import '../styles/vocabulary.css'

const BOOK_ONE = {
  code: 'contemporary-chinese-1',
  title: 'Giáo trình Đương Đại 1',
  lessonCount: 15,
}

type WritingCharacter = {
  id: number
  traditionalChar: string
  strokeCount: number | null
}

const vocabularyLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const

function VocabularyPage() {
  const [level, setLevel] = useState<(typeof vocabularyLevels)[number]>('A1')
  const [items, setItems] = useState<VocabularyItem[]>([])
  const [lessons, setLessons] = useState<VocabularyLesson[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [searchParams] = useSearchParams()
  const requestedLesson = Number(searchParams.get('lesson'))
  const [selectedLesson, setSelectedLesson] = useState(
    Number.isInteger(requestedLesson) && requestedLesson >= 1 && requestedLesson <= BOOK_ONE.lessonCount ? requestedLesson : 1,
  )
  const [isCurriculumLoading, setIsCurriculumLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [total, setTotal] = useState(0)
  const selectedLessonData = lessons.find((item) => item.lessonNumber === selectedLesson)

  useEffect(() => {
    let active = true
    getVocabularyBooks()
      .then((books) => {
        if (!books.some((book) => book.code === BOOK_ONE.code)) throw new Error('Book 1 is missing')
        return getVocabularyLessons(BOOK_ONE.code)
      })
      .then((result) => { if (active) setLessons(result) })
      .catch(() => { if (active) setError('Chưa thể tải danh sách bài học. Kiểm tra kết nối backend rồi thử lại.') })
      .finally(() => { if (active) setIsCurriculumLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    if (isCurriculumLoading || error) return () => { active = false }

    if (!selectedLessonData) {
      setItems([])
      setTotal(0)
      setIsLoading(false)
      return () => { active = false }
    }

    getVocabulary({ q: query || undefined, bookCode: BOOK_ONE.code, lessonNumber: selectedLesson, page: 1, pageSize: 50 })
      .then((result) => {
        if (!active) return
        setItems(result.items)
        setTotal(result.total)
        setSelectedId((current) => result.items.some((item) => item.id === current) ? current : result.items[0]?.id ?? null)
        setError('')
      })
      .catch(() => {
        if (active) setError('Chưa thể tải từ vựng. Kiểm tra kết nối backend rồi thử lại.')
      })
      .finally(() => { if (active) setIsLoading(false) })

    return () => { active = false }
  }, [query, selectedLesson, selectedLessonData?.id, isCurriculumLoading, error])

  const selectedWord = useMemo(
    () => items.find((item) => item.id === selectedId) ?? items[0] ?? null,
    [items, selectedId],
  )
  const writingCharacters = useMemo<WritingCharacter[]>(() => {
    if (!selectedWord) return []
    if (selectedWord.characters.length) {
      return selectedWord.characters.map(({ id, traditionalChar, strokeCount }) => ({ id, traditionalChar, strokeCount }))
    }

    const hanzi = Array.from(new Set(Array.from(selectedWord.traditional).filter((character) => /\p{Script=Han}/u.test(character))))
    return hanzi.map((traditionalChar) => ({ id: traditionalChar.codePointAt(0) ?? 0, traditionalChar, strokeCount: null }))
  }, [selectedWord])
  const selectedCharacter = writingCharacters.find((character) => character.id === selectedCharacterId)
    ?? writingCharacters[0]
    ?? null

  function chooseWord(item: VocabularyItem) {
    setSelectedId(item.id)
    setSelectedCharacterId(null)
  }

  function goToLesson(lesson: number) {
    const next = Math.min(BOOK_ONE.lessonCount, Math.max(1, lesson))
    if (next === selectedLesson) return
    setIsLoading(true)
    setSelectedLesson(next)
  }

  const isBookOne = level === 'A1'

  return (
    <AppLayout>
      <main className="main-content vocabulary-page">
        <div className="vocabulary-content">
          {/* Header + level */}
          <header className="vocab-header">
            <div>
              <h1>Từ vựng tiếng Trung phồn thể</h1>
              <p>{isBookOne ? `${BOOK_ONE.title} · học theo từng bài, nghe phát âm và tập viết từng nét.` : 'Giáo trình cho cấp độ này đang được chuẩn bị.'}</p>
            </div>
            <div className="vocab-levels" role="group" aria-label="Cấp độ từ vựng">
              {vocabularyLevels.map((item) => (
                <button key={item} type="button" aria-pressed={level === item} disabled={item !== 'A1'} onClick={() => setLevel(item)}>{item}</button>
              ))}
            </div>
          </header>

          {isBookOne && <>
            {/* Lesson rail */}
            <section className="vocab-lessons" aria-label="Chọn bài học">
              <div className="vocab-lessons-top">
                <div>
                  <strong>Bài {selectedLesson}</strong>
                  <span>{selectedLessonData?.title || 'Chọn bài học'}</span>
                </div>
                <div className="vocab-lessons-nav">
                  <small>{isLoading ? '…' : total} từ trong bài</small>
                  <button type="button" disabled={selectedLesson <= 1} onClick={() => goToLesson(selectedLesson - 1)} aria-label="Bài trước"><ChevronLeft size={18} /></button>
                  <button type="button" disabled={selectedLesson >= BOOK_ONE.lessonCount} onClick={() => goToLesson(selectedLesson + 1)} aria-label="Bài tiếp theo"><ChevronRight size={18} /></button>
                </div>
              </div>
              <div className="vocab-chips">
                {Array.from({ length: BOOK_ONE.lessonCount }, (_, index) => {
                  const lesson = index + 1
                  return (
                    <button key={lesson} type="button" className={lesson === selectedLesson ? 'active' : lesson < selectedLesson ? 'done' : ''} aria-current={lesson === selectedLesson ? 'true' : undefined} onClick={() => goToLesson(lesson)}>
                      {lesson}
                    </button>
                  )
                })}
              </div>
            </section>

            {error ? (
              <Alert type="error" showIcon message={error} action={<Button type="link" onClick={() => window.location.reload()}>Thử lại</Button>} />
            ) : (isLoading || isCurriculumLoading) && items.length === 0 ? (
              <div className="vocab-state"><Spin size="large" /><span>Đang tải từ vựng...</span></div>
            ) : items.length === 0 ? (
              <div className="vocab-state empty">
                <span className="vocab-state-zh">第 {selectedLesson} 課</span>
                <h2>{selectedLessonData ? (query ? 'Không tìm thấy từ phù hợp' : 'Bài này chưa có từ vựng') : 'Chưa tìm thấy bài học này'}</h2>
                <p>{selectedLessonData ? (query ? 'Thử từ khóa khác hoặc xóa nội dung tìm kiếm.' : 'Thêm từ mới vào bài này để bắt đầu học.') : 'Kiểm tra dữ liệu Book và Lesson trong backend.'}</p>
                {query && <Button onClick={() => setQuery('')}>Xóa tìm kiếm</Button>}
              </div>
            ) : selectedWord && (<>
              <VocabularyPractice lesson={selectedLesson} />
              <div className="vocab-workspace">
                {/* Word list */}
                <aside className="vocab-list">
                  <Input className="vocab-search" prefix={<Search size={16} />} value={query} onChange={(event) => { setIsLoading(true); setQuery(event.target.value) }} placeholder="Tìm chữ, pinyin hoặc nghĩa" allowClear />
                  <div className="vocab-rows">
                    {items.map((item) => (
                      <div className={`vocab-row ${selectedWord.id === item.id ? 'selected' : ''}`} key={item.id}>
                        <button type="button" onClick={() => chooseWord(item)} aria-label={`Xem từ ${item.traditional}`} aria-current={selectedWord.id === item.id}>
                          <span className="vocab-row-zh" lang="zh-TW">{item.traditional}</span>
                          <span className="vocab-row-copy"><strong>{item.meaningVi}</strong><small>{item.pinyin || item.zhuyin || 'Chưa có phiên âm'}</small></span>
                        </button>
                        <SpeakButton text={item.traditional} compact />
                      </div>
                    ))}
                  </div>
                </aside>

                {/* Detail */}
                <section className="vocab-detail" aria-live="polite">
                  <div className="vocab-hero">
                    <div className="vocab-grid-box" aria-hidden="true">
                      <span>{selectedWord.traditional}</span>
                    </div>
                    <div className="vocab-hero-copy">
                      <div className="vocab-pron">
                        <strong>{selectedWord.pinyin || 'Chưa có pinyin'}</strong>
                        <span>{selectedWord.zhuyin || 'Chưa có zhuyin'}</span>
                        <SpeakButton text={selectedWord.traditional} />
                      </div>
                      <h2>{selectedWord.meaningVi}</h2>
                      <div className="vocab-tags">
                        {selectedWord.wordType && <Tag>{selectedWord.wordType}</Tag>}
                        {selectedWord.tocflLevel && <Tag color="green">TOCFL {selectedWord.tocflLevel}</Tag>}
                        {selectedWord.categories.map((item) => <Tag key={item.id}>{item.name}</Tag>)}
                      </div>
                      {selectedWord.audioUrl && <audio className="vocab-audio" controls src={selectedWord.audioUrl} />}
                    </div>
                  </div>

                  <div className="vocab-panels">
                    <section className="vocab-panel">
                      <h3>Ví dụ trong câu</h3>
                      {selectedWord.examples.length ? (
                        <div className="vocab-examples">
                          {selectedWord.examples.map((example) => (
                            <article key={example.id}>
                              <strong>{example.sentenceTraditional}</strong>
                              {example.sentencePinyin && <span>{example.sentencePinyin}</span>}
                              {example.sentenceZhuyin && <small>{example.sentenceZhuyin}</small>}
                              <p>{example.meaningVi}</p>
                              {example.audioUrl && <audio controls src={example.audioUrl} />}
                            </article>
                          ))}
                        </div>
                      ) : <p className="vocab-muted">Chưa có câu ví dụ cho từ này.</p>}
                    </section>

                    <section className="vocab-panel">
                      <h3>Tập viết · 筆順</h3>
                      <div className="vocab-char-tabs" aria-label="Chọn chữ để luyện viết">
                        {writingCharacters.map((character) => (
                          <button key={character.id} type="button" className={selectedCharacter?.id === character.id ? 'selected' : ''} onClick={() => setSelectedCharacterId(character.id)} aria-label={`Luyện viết chữ ${character.traditionalChar}`}>
                            {character.traditionalChar}
                          </button>
                        ))}
                      </div>
                      {selectedCharacter
                        ? <StrokePractice key={selectedCharacter.traditionalChar} character={selectedCharacter.traditionalChar} strokeCount={selectedCharacter.strokeCount} />
                        : <p className="vocab-muted">Từ này chưa có chữ Hán để luyện nét.</p>}
                    </section>
                  </div>
                </section>
              </div>
            </>)}
          </>}
        </div>
      </main>
    </AppLayout>
  )
}

export default VocabularyPage
