import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, Input, Select, Spin, Tag } from 'antd'
import { BookOpenText, ChevronDown, ChevronLeft, ChevronRight, Layers3, MessageCircle, Search } from 'lucide-react'
import AppLayout from '../../../shared/components/AppLayout'
import { getVocabulary, getVocabularyBooks, getVocabularyLessons, type VocabularyItem, type VocabularyLesson } from '../api/vocabularyApi'
import SpeakButton from '../components/SpeakButton'
import StrokePractice from '../components/StrokePractice'
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

function VocabularyPage() {
  const [items, setItems] = useState<VocabularyItem[]>([])
  const [lessons, setLessons] = useState<VocabularyLesson[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [selectedLesson, setSelectedLesson] = useState(1)
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
  const visibleExampleCount = items.reduce((count, item) => count + item.examples.length, 0)

  function chooseWord(item: VocabularyItem) {
    setSelectedId(item.id)
    setSelectedCharacterId(null)
  }

  return (
    <AppLayout>
    <main className="main-content vocabulary-page">
      <div className="vocabulary-content">
        <section className="vocabulary-title-row">
          <div><span className="vocabulary-eyebrow">繁體中文 · TIẾNG TRUNG ĐÀI LOAN</span><h1>Từ vựng {BOOK_ONE.title}</h1><p>Học theo thứ tự bài trong giáo trình, kèm phát âm, ví dụ và luyện viết.</p></div>
          <div className="vocabulary-featured-word" aria-hidden="true"><span>{selectedWord?.traditional || '學'}</span><small>{selectedWord?.pinyin || 'xué xí'}</small></div>
        </section>

        <section className="vocabulary-summary" aria-label="Tổng quan từ vựng">
          <article className="vocabulary-summary-card"><span className="vocabulary-summary-icon"><BookOpenText size={16} /></span><div><strong>{isLoading ? '…' : total}</strong><small>Từ trong kho</small></div><span className="vocabulary-summary-note">繁體</span></article>
          <article className="vocabulary-summary-card"><span className="vocabulary-summary-icon warm"><Layers3 size={16} /></span><div><strong>{BOOK_ONE.lessonCount}</strong><small>Bài trong quyển 1</small></div><span className="vocabulary-summary-note">課</span></article>
          <article className="vocabulary-summary-card"><span className="vocabulary-summary-icon blue"><MessageCircle size={16} /></span><div><strong>{visibleExampleCount}</strong><small>Câu ví dụ trong danh sách</small></div><span className="vocabulary-summary-note">例句</span></article>
        </section>

        <section className="book-one-panel" aria-label="Chọn bài học">
          <div className="book-one-heading">
            <div><span className="vocabulary-eyebrow">QUYỂN 1 · 15 BÀI</span><h2>{BOOK_ONE.title}</h2><p>Học từ vựng và luyện viết theo từng bài.</p></div>
          </div>
          <div className="book-one-current-lesson">
            <button className="book-one-step" type="button" disabled={selectedLesson <= 1} onClick={() => { setIsLoading(true); setSelectedLesson((lesson) => Math.max(1, lesson - 1)) }} aria-label="Bài trước"><ChevronLeft size={18} /></button>
            <div className="book-one-current-copy">
              <span>ĐANG HỌC <i /> BÀI {String(selectedLesson).padStart(2, '0')}</span>
              <strong>{selectedLessonData?.title || 'Chọn bài học'}</strong>
              <small>{selectedLessonData?.vocabularyCount ?? 0} từ vựng</small>
            </div>
            <label className="book-one-select-label">Chọn bài
              <Select
                value={selectedLesson}
                onChange={(value) => { setIsLoading(true); setSelectedLesson(value) }}
                suffixIcon={<ChevronDown size={15} />}
                options={Array.from({ length: BOOK_ONE.lessonCount }, (_, index) => {
                  const lesson = index + 1
                  const count = lessons.find((item) => item.lessonNumber === lesson)?.vocabularyCount
                  return { value: lesson, label: `Bài ${String(lesson).padStart(2, '0')}${count ? ` · ${count} từ` : ''}` }
                })}
                aria-label="Chọn bài trong Giáo trình Đương Đại 1"
              />
            </label>
            <button className="book-one-step" type="button" disabled={selectedLesson >= BOOK_ONE.lessonCount} onClick={() => { setIsLoading(true); setSelectedLesson((lesson) => Math.min(BOOK_ONE.lessonCount, lesson + 1)) }} aria-label="Bài tiếp theo"><ChevronRight size={18} /></button>
          </div>
          <div className="book-one-progress" aria-label={`Bài ${selectedLesson} trên ${BOOK_ONE.lessonCount}`}>
            <span style={{ width: `${(selectedLesson / BOOK_ONE.lessonCount) * 100}%` }} />
          </div>
          <div className="book-one-progress-caption"><span>TIẾN ĐỘ GIÁO TRÌNH</span><span>{String(selectedLesson).padStart(2, '0')} / {String(BOOK_ONE.lessonCount).padStart(2, '0')}</span></div>
        </section>

        <section className="vocabulary-filters" aria-label="Tìm trong bài học">
          <Input className="vocabulary-search" prefix={<Search size={16} />} value={query} onChange={(event) => { setIsLoading(true); setQuery(event.target.value) }} placeholder="Tìm chữ, pinyin hoặc nghĩa tiếng Việt" allowClear />
        </section>

        {error ? <Alert type="error" showIcon message={error} action={<Button type="link" onClick={() => window.location.reload()}>Thử lại</Button>} /> : (isLoading || isCurriculumLoading) && items.length === 0 ? (
          <div className="vocabulary-loading"><Spin size="large" /><span>Đang tải từ vựng...</span></div>
        ) : items.length === 0 ? (
          <div className="vocabulary-empty"><span>第 {String(selectedLesson).padStart(2, '0')} 課</span><h2>{selectedLessonData ? query ? 'Không tìm thấy từ phù hợp' : 'Bài này chưa có từ vựng' : 'Chưa tìm thấy bài học này'}</h2><p>{selectedLessonData ? query ? 'Thử từ khóa khác hoặc xóa nội dung tìm kiếm.' : 'Thêm từ mới vào bài này để bắt đầu học.' : 'Kiểm tra dữ liệu Book và Lesson trong backend.'}</p>{query && <Button onClick={() => setQuery('')}>Xóa tìm kiếm</Button>}</div>
        ) : selectedWord && (
          <div className="vocabulary-workspace">
            <aside className="vocabulary-list-card">
              <div className="vocabulary-list-heading"><strong>Danh sách từ</strong><span>{items.length}</span></div>
              <div className="vocabulary-word-list">
                {items.map((item) => <div className={`vocabulary-word-row ${selectedWord.id === item.id ? 'selected' : ''}`} key={item.id}>
                  <button className="vocabulary-word-select" type="button" onClick={() => chooseWord(item)} aria-label={`Xem từ ${item.traditional}`}>
                    <span className="vocabulary-word-hanzi">{item.traditional}</span>
                    <span className="vocabulary-word-copy"><strong>{item.meaningVi}</strong><small>{item.pinyin || item.zhuyin || 'Chưa có phiên âm'}</small></span>
                    {item.tocflLevel && <span className="vocabulary-level">{item.tocflLevel}</span>}
                  </button>
                  <SpeakButton text={item.traditional} compact />
                </div>)}
              </div>
            </aside>

            <section className="vocabulary-detail" aria-live="polite">
              <Card className="vocabulary-word-card" bordered={false}>
                <div className="vocabulary-word-overview">
                  <div className="vocabulary-word-main"><span className="vocabulary-detail-hanzi">{selectedWord.traditional}</span><SpeakButton text={selectedWord.traditional} /><div className="vocabulary-pronunciations"><strong>{selectedWord.pinyin || 'Chưa có pinyin'}</strong><span>{selectedWord.zhuyin || 'Chưa có zhuyin'}</span></div></div>
                  <div className="vocabulary-definition"><span className="vocabulary-eyebrow">NGHĨA TIẾNG VIỆT</span><h2>{selectedWord.meaningVi}</h2><div className="vocabulary-tags">{selectedWord.wordType && <Tag>{selectedWord.wordType}</Tag>}{selectedWord.tocflLevel && <Tag color="green">TOCFL {selectedWord.tocflLevel}</Tag>}{selectedWord.categories.map((item) => <Tag key={item.id}>{item.name}</Tag>)}</div></div>
                </div>
                {selectedWord.audioUrl && <audio className="vocabulary-audio" controls src={selectedWord.audioUrl} />}
              </Card>

              <div className="vocabulary-detail-grid">
                <Card className="vocabulary-examples-card" bordered={false} title="Ví dụ trong câu">
                  {selectedWord.examples.length ? <div className="vocabulary-examples">{selectedWord.examples.map((example) => <article className="vocabulary-example" key={example.id}>
                    <strong>{example.sentenceTraditional}</strong>
                    {example.sentencePinyin && <span>{example.sentencePinyin}</span>}
                    {example.sentenceZhuyin && <small>{example.sentenceZhuyin}</small>}
                    <p>{example.meaningVi}</p>
                    {example.audioUrl && <audio controls src={example.audioUrl} />}
                  </article>)}</div> : <p className="vocabulary-no-examples">Chưa có câu ví dụ cho từ này.</p>}
                </Card>

                <Card className="vocabulary-writing-card" bordered={false} title={<span><span className="writing-title-zh">筆順</span> Thứ tự nét</span>}>
                  <div className="vocabulary-character-tabs" aria-label="Chọn chữ để luyện viết">
                    {writingCharacters.map((character) => <button key={character.id} className={(selectedCharacter?.id === character.id ? 'selected' : '')} onClick={() => setSelectedCharacterId(character.id)} aria-label={`Luyện viết chữ ${character.traditionalChar}`}>
                      {character.traditionalChar}
                    </button>)}
                  </div>
                  {selectedCharacter ? <StrokePractice key={selectedCharacter.traditionalChar} character={selectedCharacter.traditionalChar} strokeCount={selectedCharacter.strokeCount} /> : <p className="vocabulary-no-examples">Từ này chưa có chữ Hán để luyện nét.</p>}
                </Card>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
    </AppLayout>
  )
}

export default VocabularyPage
