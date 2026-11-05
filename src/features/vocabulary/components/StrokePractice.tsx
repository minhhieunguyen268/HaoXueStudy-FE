import { Button } from 'antd'
import { CircleHelp, RotateCcw, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import HanziWriter from 'hanzi-writer'
import '../styles/stroke-practice.css'

interface StrokePracticeProps {
  character: string
  strokeCount?: number | null
}

function StrokePractice({ character, strokeCount }: StrokePracticeProps) {
  const targetRef = useRef<HTMLDivElement>(null)
  const writerRef = useRef<HanziWriter | null>(null)
  const [isQuiz, setIsQuiz] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    target.replaceChildren()

    const writer = HanziWriter.create(target, character, {
      width: 240,
      height: 240,
      padding: 22,
      showOutline: true,
      showCharacter: true,
      strokeColor: '#244e3a',
      outlineColor: '#d7dfd3',
      radicalColor: '#d49a60',
      drawingColor: '#244e3a',
      highlightColor: '#d49a60',
      onLoadCharDataError: () => setLoadError(true),
    })
    writerRef.current = writer

    return () => {
      writer.cancelQuiz()
      target.replaceChildren()
      if (writerRef.current === writer) writerRef.current = null
    }
  }, [character])

  function animate() {
    setIsQuiz(false)
    setIsComplete(false)
    writerRef.current?.showCharacter({ duration: 0 })
    writerRef.current?.animateCharacter()
  }

  function startQuiz() {
    const writer = writerRef.current
    if (!writer) return
    setIsQuiz(true)
    setIsComplete(false)
    writer.cancelQuiz()
    void writer.hideCharacter({ duration: 0 }).then(() => writer.quiz({
      showHintAfterMisses: 2,
      onComplete: () => setIsComplete(true),
    }))
  }

  function reset() {
    const writer = writerRef.current
    if (!writer) return
    writer.cancelQuiz()
    setIsQuiz(false)
    setIsComplete(false)
    void writer.setCharacter(character)
  }

  return (
    <section className="stroke-practice-card" aria-label={`Luyện viết chữ ${character}`}>
      <div className="stroke-practice-heading">
        <div><span className="stroke-eyebrow">HANZI WRITER</span><h3>Luyện viết nét</h3></div>
        {strokeCount != null && <span className="stroke-count">{strokeCount} nét</span>}
      </div>
      <div className="stroke-grid">
        <div className="stroke-target-wrap"><div className="stroke-target" ref={targetRef} />{loadError && <p className="stroke-load-error">Không tải được dữ liệu nét. Kiểm tra kết nối rồi thử lại.</p>}</div>
        <div className="stroke-actions">
          <p>{isComplete ? 'Viết đúng rồi! 好棒！' : isQuiz ? 'Vẽ từng nét theo đúng thứ tự.' : 'Xem thứ tự nét hoặc tự viết thử.'}</p>
          <Button type="primary" icon={<Sparkles size={15} />} onClick={animate}>Xem thứ tự nét</Button>
          <Button icon={<CircleHelp size={15} />} onClick={startQuiz}>Luyện viết</Button>
          <Button type="text" icon={<RotateCcw size={15} />} onClick={reset}>Làm lại</Button>
        </div>
      </div>
      <div className="stroke-practice-note">Kéo chuột hoặc dùng ngón tay để viết trên ô chữ.</div>
    </section>
  )
}

export default StrokePractice
