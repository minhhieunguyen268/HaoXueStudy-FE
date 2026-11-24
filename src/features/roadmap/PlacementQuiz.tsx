import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Compass } from 'lucide-react'

const questions = [
  { prompt: '你好 có nghĩa là gì?', options: ['Cảm ơn', 'Xin chào', 'Tạm biệt'], answer: 1 },
  { prompt: 'Âm mǎ mang thanh nào?', options: ['Thanh 3', 'Thanh 1', 'Thanh 4'], answer: 0 },
  { prompt: 'Câu nào có nghĩa là “Tôi là học sinh”?', options: ['你是學生。', '我是老師。', '我是學生。'], answer: 2 },
]

export default function PlacementQuiz() {
  const [answers, setAnswers] = useState<number[] | null>(null)
  const finished = answers?.length === questions.length
  const question = answers && questions[answers.length]
  const correctCount = answers?.filter((answer, index) => answer === questions[index].answer).length ?? 0
  const allCorrect = finished && correctCount === questions.length

  return (
    <section className="rm-quiz" aria-live="polite">
      {!answers && (
        <div className="rm-quiz-intro">
          <span className="rm-compass" aria-hidden="true"><Compass size={44} strokeWidth={1.3} /></span>
          <div>
            <h2>Kiểm tra kiến thức và chọn lộ trình phù hợp</h2>
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

