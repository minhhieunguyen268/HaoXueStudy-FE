import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, Input, Select, Spin, Tag } from 'antd'
import { BookOpenText, Layers3, MessageCircle, Search } from 'lucide-react'
import AppLayout from '../../../shared/components/AppLayout'
import { getVocabulary, getVocabularyCategories, type VocabularyCategory, type VocabularyItem } from '../api/vocabularyApi'
import SpeakButton from '../components/SpeakButton'
import StrokePractice from '../components/StrokePractice'
import '../styles/vocabulary.css'

function VocabularyPage() {
  const [items, setItems] = useState<VocabularyItem[]>([])
  const [categories, setCategories] = useState<VocabularyCategory[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [tocflLevel, setTocflLevel] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [total, setTotal] = useState(0)

  useEffect(() => {
    let active = true
    getVocabularyCategories()
      .then((result) => { if (active) setCategories(result) })
      .catch(() => { if (active) setCategories([]) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    getVocabulary({ q: query || undefined, category: category || undefined, tocflLevel: tocflLevel || undefined, page: 1, pageSize: 50 })
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
  }, [query, category, tocflLevel, reloadKey])

  const selectedWord = useMemo(
    () => items.find((item) => item.id === selectedId) ?? items[0] ?? null,
    [items, selectedId],
  )
  const selectedCharacter = selectedWord?.characters.find((character) => character.id === selectedCharacterId)
    ?? selectedWord?.characters[0]
    ?? null
  const tocflOptions = Array.from(new Set(items.map((item) => item.tocflLevel).filter((level): level is string => Boolean(level))))
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
          <div><span className="vocabulary-eyebrow">詞彙 · TỪ VỰNG</span><h1>Từ vựng phồn thể</h1><p>Tra cứu từ, xem ví dụ và luyện viết đúng thứ tự nét.</p></div>
          <div className="vocabulary-featured-word" aria-hidden="true"><span>{selectedWord?.traditional || '學'}</span><small>{selectedWord?.pinyin || 'xué xí'}</small></div>
        </section>

        <section className="vocabulary-summary" aria-label="Tổng quan từ vựng">
          <article className="vocabulary-summary-card"><span className="vocabulary-summary-icon"><BookOpenText size={16} /></span><div><strong>{isLoading ? '…' : total}</strong><small>Từ trong kho</small></div><span className="vocabulary-summary-note">繁體</span></article>
          <article className="vocabulary-summary-card"><span className="vocabulary-summary-icon warm"><Layers3 size={16} /></span><div><strong>{categories.length}</strong><small>Chủ đề học</small></div><span className="vocabulary-summary-note">分類</span></article>
          <article className="vocabulary-summary-card"><span className="vocabulary-summary-icon blue"><MessageCircle size={16} /></span><div><strong>{visibleExampleCount}</strong><small>Câu ví dụ trong danh sách</small></div><span className="vocabulary-summary-note">例句</span></article>
        </section>

        <section className="vocabulary-filters" aria-label="Lọc từ vựng">
          <Input className="vocabulary-search" prefix={<Search size={16} />} value={query} onChange={(event) => { setIsLoading(true); setQuery(event.target.value) }} placeholder="Tìm chữ, pinyin hoặc nghĩa tiếng Việt" allowClear />
          <Select
            value={tocflLevel}
            onChange={(value) => { setIsLoading(true); setTocflLevel(value) }}
            options={[{ value: '', label: 'Tất cả cấp độ' }, ...tocflOptions.map((level) => ({ value: level, label: `TOCFL ${level}` }))]}
            aria-label="Lọc theo cấp độ TOCFL"
          />
        </section>

        <nav className="vocabulary-categories" aria-label="Lọc theo chủ đề">
          <button className={!category ? 'active' : ''} onClick={() => { setIsLoading(true); setCategory('') }}>Tất cả</button>
          {categories.map((item) => <button className={category === item.slug ? 'active' : ''} key={item.id} onClick={() => { setIsLoading(true); setCategory(item.slug) }}>{item.name}</button>)}
        </nav>

        {error ? <Alert type="error" showIcon message={error} action={<Button type="link" onClick={() => { setIsLoading(true); setError(''); setReloadKey((key) => key + 1) }}>Thử lại</Button>} /> : isLoading && items.length === 0 ? (
          <div className="vocabulary-loading"><Spin size="large" /><span>Đang tải từ vựng...</span></div>
        ) : items.length === 0 ? (
          <div className="vocabulary-empty"><span>暫無詞彙</span><h2>Chưa có từ trong mục này</h2><p>Thử chủ đề khác hoặc xóa bộ lọc tìm kiếm.</p><Button onClick={() => { setCategory(''); setQuery(''); setTocflLevel('') }}>Xóa bộ lọc</Button></div>
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
                    {selectedWord.characters.map((character) => <button key={character.id} className={(selectedCharacter?.id === character.id ? 'selected' : '')} onClick={() => setSelectedCharacterId(character.id)} aria-label={`Luyện viết chữ ${character.traditionalChar}`}>
                      {character.traditionalChar}
                    </button>)}
                  </div>
                  {selectedCharacter ? <StrokePractice key={selectedCharacter.id} character={selectedCharacter.traditionalChar} strokeCount={selectedCharacter.strokeCount} /> : <p className="vocabulary-no-examples">Không có dữ liệu chữ để luyện viết.</p>}
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
