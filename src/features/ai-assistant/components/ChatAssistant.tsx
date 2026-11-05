import axios from 'axios'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Plus, Send, Sparkles, X } from 'lucide-react'
import { Lottie } from 'lottie-react'
import { getAssistantMessages, sendAssistantMessage, type AssistantMessage } from '../api/aiAssistantApi'
import pandaMascot from '../../dashboard/assets/haoxue-panda-mascot.json'
import '../styles/chat-assistant.css'

interface ChatAssistantProps {
  userId: number
}

interface ChatMessage {
  id: number | string
  role: 'USER' | 'ASSISTANT'
  content: string
}

const greeting: ChatMessage = {
  id: 'greeting',
  role: 'ASSISTANT',
  content: '你好! Mình là trợ lý học tiếng Trung phồn thể của bạn. Bạn muốn hỏi về từ vựng, ngữ pháp hay cách dùng câu nào?',
}

const suggestions = ['Giải thích cách dùng 怎麼', 'Phân biệt 你好 và 您好', 'Cho mình một câu giao tiếp ở quán ăn']

function getAssistantError(error: unknown) {
  if (!axios.isAxiosError(error)) return 'Trợ lý AI gặp lỗi không xác định. Vui lòng thử lại.'
  if (!error.response) return 'Không kết nối được backend. Hãy kiểm tra NestJS đang chạy ở cổng 3000.'

  const message = error.response.data?.message
  if (typeof message === 'string') return message
  if (Array.isArray(message)) return message.join(' ')
  if (error.response.status === 401) return 'Phiên đăng nhập hết hạn. Hãy đăng nhập lại rồi thử tiếp.'
  return `Trợ lý phản hồi lỗi ${error.response.status}. Vui lòng thử lại.`
}

function ChatAssistant({ userId }: ChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([greeting])
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const scrollEndRef = useRef<HTMLDivElement>(null)
  const localMessageId = useRef(0)
  const storageKey = `haoxue-ai-conversation-${userId}`

  useEffect(() => {
    const savedId = Number(window.localStorage.getItem(storageKey))
    if (!savedId) return

    let active = true
    void Promise.resolve()
      .then(() => {
        if (active) setIsLoadingHistory(true)
        return getAssistantMessages(savedId)
      })
      .then((history: AssistantMessage[]) => {
        if (!active) return
        setConversationId(savedId)
        setMessages(history.length
          ? history.map((message) => ({ id: message.id, role: message.role, content: message.content }))
          : [greeting])
      })
      .catch(() => {
        window.localStorage.removeItem(storageKey)
        if (active) setMessages([greeting])
      })
      .finally(() => { if (active) setIsLoadingHistory(false) })

    return () => { active = false }
  }, [storageKey])

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isSending, isOpen])

  function startNewConversation() {
    window.localStorage.removeItem(storageKey)
    setConversationId(null)
    setMessages([greeting])
    setDraft('')
  }

  async function submitMessage(event?: FormEvent, suggestedText?: string) {
    event?.preventDefault()
    const content = (suggestedText ?? draft).trim()
    if (!content || isSending) return

    localMessageId.current += 1
    const optimisticMessage: ChatMessage = { id: `user-${localMessageId.current}`, role: 'USER', content }
    setMessages((current) => [...current, optimisticMessage])
    setDraft('')
    setIsSending(true)

    try {
      const result = await sendAssistantMessage(content, conversationId ?? undefined)
      setConversationId(result.conversationId)
      window.localStorage.setItem(storageKey, String(result.conversationId))
      localMessageId.current += 1
      setMessages((current) => [...current, { id: `assistant-${localMessageId.current}`, role: 'ASSISTANT', content: result.reply }])
    } catch (error) {
      localMessageId.current += 1
      setMessages((current) => [...current, {
        id: `error-${localMessageId.current}`,
        role: 'ASSISTANT',
        content: getAssistantError(error),
      }])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="ai-assistant-widget">
      {isOpen && (
        <section className="ai-assistant-panel" aria-label="Trợ lý tiếng Trung">
          <header className="ai-assistant-header">
            <span className="ai-assistant-mark"><Sparkles size={17} aria-hidden="true" /></span>
            <div><strong>HaoXue AI</strong><small>Trợ lý tiếng Trung phồn thể</small></div>
            <button type="button" className="ai-assistant-header-action" onClick={startNewConversation} aria-label="Cuộc trò chuyện mới" title="Cuộc trò chuyện mới"><Plus size={17} /></button>
            <button type="button" className="ai-assistant-header-action" onClick={() => setIsOpen(false)} aria-label="Đóng trợ lý"><X size={17} /></button>
          </header>

          <div className="ai-assistant-messages" aria-live="polite">
            {isLoadingHistory && <div className="ai-assistant-history-loading">Đang tải cuộc trò chuyện…</div>}
            {messages.map((message) => (
              <article className={`ai-assistant-message ${message.role === 'USER' ? 'from-user' : 'from-assistant'}`} key={message.id}>
                {message.role === 'ASSISTANT' && <span className="ai-assistant-message-mark"><Sparkles size={12} aria-hidden="true" /></span>}
                <p>{message.content}</p>
              </article>
            ))}
            {messages.length === 1 && !isLoadingHistory && (
              <div className="ai-assistant-suggestions">
                <span>Gợi ý câu hỏi</span>
                {suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => void submitMessage(undefined, suggestion)}>{suggestion}</button>)}
              </div>
            )}
            {isSending && <div className="ai-assistant-typing"><i /><i /><i /></div>}
            <div ref={scrollEndRef} />
          </div>

          <form className="ai-assistant-composer" onSubmit={(event) => void submitMessage(event)}>
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Hỏi về tiếng Trung phồn thể…" aria-label="Tin nhắn cho trợ lý" maxLength={2000} rows={1} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void submitMessage() } }} />
            <button type="submit" disabled={!draft.trim() || isSending} aria-label="Gửi tin nhắn"><Send size={16} aria-hidden="true" /></button>
          </form>
          <div className="ai-assistant-footnote">AI có thể trả lời chưa chính xác. Hãy kiểm tra ví dụ trước khi ghi nhớ.</div>
        </section>
      )}
      <button type="button" className={`ai-assistant-launcher ${isOpen ? 'is-open' : ''}`} onClick={() => setIsOpen((open) => !open)} aria-label={isOpen ? 'Đóng trợ lý AI' : 'Mở trợ lý AI'} title={isOpen ? 'Đóng trợ lý AI' : 'Mở trợ lý AI'}>
        {isOpen ? <X size={21} aria-hidden="true" /> : <Lottie className="ai-assistant-launcher-mascot" src={pandaMascot} loop autoplay aria-hidden="true" />}
      </button>
    </div>
  )
}

export default ChatAssistant
