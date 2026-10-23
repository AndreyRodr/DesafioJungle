export const SESSION_TOKEN_KEY = 'kurio:access-token:v1'
const CHANGE_EVENT = 'kurio:auth-changed'
export function getAccessToken(): string | null {
  try { return window.localStorage.getItem(SESSION_TOKEN_KEY) } catch { return null }
}
export function updateAccessToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(SESSION_TOKEN_KEY, token)
    else localStorage.removeItem(SESSION_TOKEN_KEY)
  } finally { window.dispatchEvent(new Event(CHANGE_EVENT)) }
}
export function subscribeAuth(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => { window.removeEventListener(CHANGE_EVENT, callback); window.removeEventListener('storage', callback) }
}
export function safeReturnPath(value?: string): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/'
  const allowed = ['/cart', '/profile', '/wallets', '/favorites', '/checkout', '/nft/']
  return allowed.some((prefix) => value === prefix || (prefix.endsWith('/') && value.startsWith(prefix))) ? value : '/'
}
