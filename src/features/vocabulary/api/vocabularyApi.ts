import api from '../../../shared/lib/api'

export interface VocabularyCategory {
  id: number
  name: string
  slug: string
  description: string | null
  parentId: number | null
}

export interface VocabularyExample {
  id: number
  sentenceTraditional: string
  sentenceSimplified: string | null
  sentencePinyin: string | null
  sentenceZhuyin: string | null
  meaningVi: string
  audioUrl: string | null
}

export interface VocabularyCharacter {
  id: number
  traditionalChar: string
  simplifiedChar: string | null
  pinyin: string | null
  zhuyin: string | null
  meaningVi: string | null
  radical: string | null
  strokeCount: number
  tocflLevel: string | null
  characterOrder: number
}

export interface VocabularyItem {
  id: number
  traditional: string
  simplified: string | null
  pinyin: string | null
  zhuyin: string | null
  meaningVi: string
  meaningEn: string | null
  wordType: string | null
  tocflLevel: string | null
  strokeCount: number | null
  audioUrl: string | null
  categories: VocabularyCategory[]
  examples: VocabularyExample[]
  characters: VocabularyCharacter[]
}

interface VocabularyResponse {
  items: VocabularyItem[]
  total: number
  page: number
  pageSize: number
}

export interface VocabularyFilters {
  q?: string
  category?: string
  tocflLevel?: string
  page?: number
  pageSize?: number
}

export async function getVocabulary(filters: VocabularyFilters = {}) {
  const { data } = await api.get<VocabularyResponse>('/vocabulary', { params: filters })
  return data
}

export async function getVocabularyCategories() {
  const { data } = await api.get<VocabularyCategory[]>('/categories')
  return data
}
