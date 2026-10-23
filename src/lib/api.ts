import axios from 'axios'
import { getAccessToken, updateAccessToken } from '@/features/auth/lib/session'

export const api = axios.create({
  baseURL: '/api', timeout: 10000,
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
    if (axios.isAxiosError(error) && error.response?.status === 401 && getAccessToken()) {
      updateAccessToken(null)
    }
    return Promise.reject(error)
  },
)
