import api from '../../../shared/lib/api'

export interface AssistantMessage {
  id: number
  role: 'USER' | 'ASSISTANT'
  content: string
  createdAt: string
}

interface ChatResponse {
  conversationId: number
  reply: string
}

export async function sendAssistantMessage(message: string, conversationId?: number) {
  const { data } = await api.post<ChatResponse>('/ai-assistant/chat', {
    message,
    ...(conversationId ? { conversationId } : {}),
  })
  return data
}

export async function getAssistantMessages(conversationId: number) {
  const { data } = await api.get<AssistantMessage[]>(`/ai-assistant/conversations/${conversationId}/messages`)
  return data
}
