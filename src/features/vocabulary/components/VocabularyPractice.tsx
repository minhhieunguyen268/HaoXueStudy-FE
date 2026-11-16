import { Link } from 'react-router-dom'
import '../styles/vocabulary-practice.css'

export default function VocabularyPractice({ lesson }: { lesson: number }) {
  return (
    <section className="vocab-practice" aria-label="Phương pháp học từ vựng">
      <h2>Luyện tập bài {lesson}</h2>
      <div className="vocab-practice-modes">
        <Link to={'/vocabulary/flashcards/' + lesson}>Flashcards →</Link>
        {['Ghép từ', 'Luyện viết', 'Xếp câu'].map((label) => (
          <span className="vocab-practice-pending" key={label}>{label}<small>Đang cập nhật</small></span>
        ))}
      </div>
    </section>
  )
}
