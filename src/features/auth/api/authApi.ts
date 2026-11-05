import api from '../../../shared/lib/api'

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput extends LoginInput {
  name: string
}

export interface AuthUser {
  id: number
  username: string
  name: string | null
  email: string
  avatarUrl: string | null
  role: 'USER' | 'ADMIN'
  createdAt: string | null
}

export async function login(input: LoginInput) {
  await api.post('/auth/login', input)
}

export async function register(input: RegisterInput) {
  await api.post('/auth/register', input)
}

export async function getCurrentUser() {
  const { data } = await api.get<AuthUser>('/auth/me')
  return data
}

export async function logout() {
  await api.post('/auth/logout')
}
