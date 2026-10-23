import { redirect } from '@tanstack/react-router'
import { getAccessToken, updateAccessToken } from './session'
import { getSession } from '../api/auth'
export async function requireAuth(href: string): Promise<void> {
  const destination = { to: '/login' as const, search: { redirect: href } }
  if (!getAccessToken()) throw redirect(destination)
  try { await getSession() }
  catch { updateAccessToken(null); throw redirect(destination) }
}
