import { Volume2, VolumeX } from 'lucide-react'

interface SpeakButtonProps {
  text: string
  compact?: boolean
}

function SpeakButton({ text, compact = false }: SpeakButtonProps) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  function speak() {
    if (!supported || !text.trim()) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-TW'
    utterance.rate = 0.85

    const voices = window.speechSynthesis.getVoices()
    const taiwaneseVoice = voices.find((voice) => voice.lang.toLowerCase() === 'zh-tw')
    if (taiwaneseVoice) utterance.voice = taiwaneseVoice

    window.speechSynthesis.speak(utterance)
  }

  return (
    <button
      className={`vocabulary-speak-button ${compact ? 'compact' : ''}`}
      type="button"
      onClick={speak}
      disabled={!supported || !text.trim()}
      aria-label={`Nghe phát âm ${text}`}
      title={supported ? `Nghe phát âm ${text} · Tiếng Hoa Đài Loan` : 'Trình duyệt không hỗ trợ phát âm'}
    >
      {supported ? <Volume2 size={15} aria-hidden="true" /> : <VolumeX size={15} aria-hidden="true" />}
      {!compact && <span>Nghe</span>}
    </button>
  )
}

export default SpeakButton
