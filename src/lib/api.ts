import axios from 'axios'
import { getAccessToken, updateAccessToken } from '@/features/auth/lib/session'

export const api = axios.create({
  baseURL: '/api',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // Um 401 em outro endpoint nao deve apagar a sessao indiscriminadamente.
    // O endpoint de validacao e responsavel por informar que a sessao expirou.
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      error.config?.url?.replace(/^\//, '') === 'auth/session' &&
      getAccessToken()
    ) {
      updateAccessToken(null)
    }
    return Promise.reject(error)
  },
)
