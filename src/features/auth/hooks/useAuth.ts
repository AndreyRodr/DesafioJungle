import { useSyncExternalStore } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getAccessToken, subscribeAuth, updateAccessToken } from '../lib/session'
import { getSession, login, logout, register } from '../api/auth'

export function useAuth() {
  const token = useSyncExternalStore(subscribeAuth, getAccessToken, () => null)
  const session = useQuery({
    queryKey: ['session', token],
    queryFn: getSession,
    enabled: Boolean(token),
    retry: false,
    staleTime: 30_000,
  })
  return { ...session, user: token ? session.data?.user : undefined, token, loading: Boolean(token) && session.isPending }
}

export function useAuthActions() {
  const client = useQueryClient()
  const establish = (token: string) => { client.clear(); updateAccessToken(token) }
  return {
    login: async (email: string, password: string) => {
      const response = await login({ email, password }); establish(response.token); return response
    },
    register: async (name: string, email: string, password: string) => {
      const response = await register({ name, email, password }); establish(response.token); return response
    },
    logout: async () => {
      try { await logout() } finally { client.clear(); updateAccessToken(null) }
    },
  }
}
