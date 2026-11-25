import { useEffect, useRef, useState } from 'react'
import { Square, Volume2 } from 'lucide-react'
import api from '../../shared/lib/api'

interface DialogueLine {
  position: number
  dialogue: string
  speaker: string
  traditional: string
  pinyin: string
  meaningVi: string
}

const wordSegmenter = typeof Intl.Segmenter === 'function'
  ? new Intl.Segmenter('zh-TW', { granularity: 'word' })
  : null

function getSpokenSegments(text: string) {
  if (wordSegmenter) {
    return Array.from(wordSegmenter.segment(text))
      .filter(part => part.isWordLike)
      .map(({ index, segment }) => ({ start: index, end: index + segment.length }))
  }

  return Array.from(text.matchAll(/[\p{L}\p{N}]/gu), match => ({
    start: match.index, end: match.index + match[0].length,
  }))
}

export default function LessonDialogues({ lesson }: { lesson: number }) {
  const [lines, setLines] = useState<DialogueLine[]>()
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [playing, setPlaying] = useState<{ position: number; start: number; end: number } | null>(null)
  const [playingPosition, setPlayingPosition] = useState<number | null>(null)
  const [audioError, setAudioError] = useState('')
  const utterance = useRef<SpeechSynthesisUtterance | null>(null)
  const highlightTimer = useRef<number | undefined>(undefined)
  const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window

  useEffect(() => {
    const controller = new AbortController()
    api.get<DialogueLine[]>(`/vocabulary/books/contemporary-chinese-1/lessons/${lesson}/dialogues`, { signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setLines(data) })
      .catch(() => { if (!controller.signal.aborted) setError(true) })
    return () => controller.abort()
  }, [lesson, attempt])

  useEffect(() => () => {
    window.clearTimeout(highlightTimer.current)
    if (!utterance.current) return
    utterance.current = null
    window.speechSynthesis.cancel()
  }, [])

  function stop() {
    window.clearTimeout(highlightTimer.current)
    utterance.current = null
    window.speechSynthesis.cancel()
    setPlaying(null)
    setPlayingPosition(null)
  }

  function play(queue: DialogueLine[]) {
    if (!supported || queue.length === 0) return
    stop()
    setAudioError('')
    const isTaiwanese = (voice: SpeechSynthesisVoice) => /(?:^|-)tw$/i.test(voice.lang)
    const mandarinVoices = window.speechSynthesis.getVoices()
      .filter(voice => /^(zh|cmn)(?:-|$)/i.test(voice.lang) && !/-(HK|MO)$/i.test(voice.lang))
      .sort((a, b) => Number(isTaiwanese(b)) - Number(isTaiwanese(a)) || a.voiceURI.localeCompare(b.voiceURI))
    const voices = [...new Map(mandarinVoices.map(voice => [voice.voiceURI, voice])).values()]
    const turns = (lines ?? queue).filter(line => line.dialogue === queue[0].dialogue)
    const speakers = [...new Set(turns.map(line => line.speaker))]
    const hasEnoughVoices = voices.length >= speakers.length

    function speak(index: number) {
      const line = queue[index]
      if (!line) {
        utterance.current = null
        setPlaying(null)
        return
      }
      const next = new SpeechSynthesisUtterance(line.traditional)
      const segments = getSpokenSegments(line.traditional)
      const speakerIndex = speakers.indexOf(line.speaker)
      const voice = voices.length ? voices[speakerIndex % voices.length] : undefined
      const pitchOffset = speakers.length > 1 ? speakerIndex / (speakers.length - 1) - 0.5 : 0
      next.lang = voice?.lang ?? 'zh-TW'
      // Distinguish every role even if the device exposes only one Mandarin voice.
      next.pitch = hasEnoughVoices ? 1 : 1 + pitchOffset * 0.34
      next.rate = hasEnoughVoices ? 1.03 : 1.03 + pitchOffset * 0.10
      if (voice) next.voice = voice
      function highlight(segmentIndex: number, spokenOffset?: number) {
        if (utterance.current !== next) return
        window.clearTimeout(highlightTimer.current)
        const segment = segments[segmentIndex]
        if (!segment) return
        setPlaying({ position: line.position, ...segment })
        const following = segments[segmentIndex + 1]
        if (!following) return
        const gap = line.traditional.slice(segment.end, following.start)
        const pause = /[。！？.!?]/u.test(gap) ? 230 : /[，、；：,;:]/u.test(gap) ? 110 : 0
        const remaining = Array.from(line.traditional.slice(spokenOffset ?? segment.start, segment.end)).length
        highlightTimer.current = window.setTimeout(() => highlight(segmentIndex + 1), (210 * remaining + pause) / next.rate)
      }
      next.onstart = () => highlight(0)
      next.onboundary = ({ charIndex }) => {
        const index = segments.findIndex(segment => segment.start <= charIndex && charIndex < segment.end)
        if (index !== -1) highlight(index, charIndex)
      }
      next.onend = () => {
        if (utterance.current !== next) return
        window.clearTimeout(highlightTimer.current)
        setPlaying(null)
        setPlayingPosition(null)
        speak(index + 1)
      }
      next.onerror = event => {
        if (utterance.current !== next) return
        window.clearTimeout(highlightTimer.current)
        utterance.current = null
        setPlaying(null)
        setPlayingPosition(null)
        if (event.error !== 'canceled' && event.error !== 'interrupted') {
          setAudioError('Không phát được tiếng Hoa. Kiểm tra giọng đọc trên trình duyệt hoặc thiết bị.')
        }
      }
      utterance.current = next
      setPlayingPosition(line.position)
      window.speechSynthesis.speak(next)
    }

    speak(0)
  }

  const groups = new Map<string, DialogueLine[]>()
  for (const line of lines ?? []) {
    const group = groups.get(line.dialogue)
    if (group) group.push(line)
    else groups.set(line.dialogue, [line])
  }

  return (
    <section id="lesson-dialogues" className="lesson-section" aria-labelledby="lesson-dialogues-heading">
      <h2 id="lesson-dialogues-heading">Hội thoại</h2>
      {error ? <p className="lesson-note error" role="alert">Chưa tải được hội thoại. <button type="button" onClick={() => { setError(false); setAttempt(value => value + 1) }}>Thử lại</button></p>
        : !lines ? <p className="lesson-note" role="status">Đang tải hội thoại…</p>
        : lines.length === 0 && <p className="lesson-note">Bài này chưa có hội thoại.</p>}
      {!supported && lines?.length ? <p className="lesson-note">Trình duyệt này chưa hỗ trợ đọc hội thoại.</p> : null}
      {audioError && <p className="lesson-note error" role="alert">{audioError}</p>}
      {[...groups].map(([name, turns], index) => (
        <details key={name} className="lesson-card lesson-dialogue" open={index === 0 || undefined}>
          <summary>{name}</summary>
          <div className="lesson-dialogue-actions">
            <button type="button" className="lesson-button" disabled={!supported} onClick={() => play(turns)}><Volume2 size={16} /> Nghe cả đoạn</button>
            {turns.some(line => line.position === playingPosition) && <button type="button" className="lesson-button" onClick={stop}><Square size={14} /> Dừng</button>}
          </div>
          <ol className="lesson-dialogue-lines">
            {turns.map(line => {
              const active = playing?.position === line.position ? playing : null
              return (
              <li key={line.position}>
                <div>
                  <small>{line.speaker}</small>
                  <p lang="zh-TW">{active?.start === undefined ? line.traditional : <>
                    {line.traditional.slice(0, active.start)}
                    <mark className="lesson-dialogue-highlight">{line.traditional.slice(active.start, active.end)}</mark>
                    {line.traditional.slice(active.end)}
                  </>}</p>
                  <p className="lesson-dialogue-pinyin">{line.pinyin}</p>
                  <p>{line.meaningVi}</p>
                </div>
                <button type="button" className="lesson-button" disabled={!supported} aria-label={'Nghe câu ' + line.position} onClick={() => play([line])}><Volume2 size={17} aria-hidden="true" /></button>
              </li>
              )
            })}
          </ol>
        </details>
      ))}
    </section>
  )
}
