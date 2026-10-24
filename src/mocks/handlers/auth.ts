import { simulateNetwork } from '../networkScenario'
import { http, HttpResponse } from 'msw/http'
import {
  changeAvatar, changeFavorite, changePassword, changeProfile, getFavorites,
  getWallets, loginAccount, logoutAccount, putWallet, registerAccount, requireUser,
} from '../state/auth'
import { mergeGuestCart, MockBusinessError } from '../state/commerce'

async function payload(request: Request): Promise<Record<string, unknown>> {
  const input: unknown = await request.json().catch(() => null)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new MockBusinessError('Dados inválidos.', 400)
  return input as Record<string, unknown>
}
async function handle<T>(operation: () => Promise<T> | T) {
  try {
    const result = (await operation()) as unknown as Parameters<typeof HttpResponse.json>[0]
    return HttpResponse.json(result)
  }
  catch (error) {
    if (error instanceof MockBusinessError) return HttpResponse.json({ message: error.message }, { status: error.status })
    return HttpResponse.json({ message: 'Erro inesperado na simulação.' }, { status: 500 })
  }
}
function string(value: unknown): string { return typeof value === 'string' ? value : '' }
export const authHandlers = [
  http.post('/api/auth/login', ({ request }) => handle(async () => {
    const data = await payload(request)
    const result = await loginAccount(string(data.email), string(data.password))
    mergeGuestCart(result.user.id)
    return result
  })),
  http.post('/api/auth/register', ({ request }) => handle(async () => {
    const data = await payload(request)
    const result = await registerAccount(string(data.name), string(data.email), string(data.password))
    mergeGuestCart(result.user.id)
    return result
  })),
  http.get('/api/auth/session', async ({ request }) => {
    const injected = await simulateNetwork(request)
    if (injected) return injected
    return handle(() => requireUser(request))
  }),
  http.post('/api/auth/logout', ({ request }) => handle(() => { logoutAccount(request); return { message: 'Sessão encerrada.' } })),
  http.get('/api/profile', ({ request }) => handle(async () => (await requireUser(request)).user)),
  http.patch('/api/profile', ({ request }) => handle(async () => {
    const data = await payload(request)
    return changeProfile(request, string(data.name), string(data.email))
  })),
  http.patch('/api/profile/avatar', ({ request }) => handle(async () => {
    const data = await payload(request)
    return changeAvatar(request, string(data.avatarUrl))
  })),
  http.patch('/api/profile/password', ({ request }) => handle(async () => {
    const data = await payload(request)
    return changePassword(request, string(data.currentPassword), string(data.newPassword))
  })),
  http.get('/api/wallets', ({ request }) => handle(() => getWallets(request))),
  http.put('/api/wallets/:slot', ({ request, params }) => handle(async () => putWallet(request, params.slot, await payload(request)))),
  http.get('/api/favorites', ({ request }) => handle(() => getFavorites(request))),
  http.put('/api/favorites/:nftId', ({ request, params }) => handle(() => changeFavorite(request, String(params.nftId), true))),
  http.delete('/api/favorites/:nftId', ({ request, params }) => handle(() => changeFavorite(request, String(params.nftId), false))),
]
