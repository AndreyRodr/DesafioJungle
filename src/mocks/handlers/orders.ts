import { http, HttpResponse } from 'msw/http'
import { requireUser } from '../state/auth'
import { createOrder, orderById, orderByKey } from '../state/orders'
import { MockBusinessError, changeNftPrice, inventoryState } from '../state/commerce'
import { publishMockEvent } from '../state/events'
import type { CreateOrderInput } from '@/features/checkout/types/orders'

async function respond(action: () => Promise<unknown> | unknown) {
  try { return HttpResponse.json((await action()) as Parameters<typeof HttpResponse.json>[0]) }
  catch (error) {
    if (error instanceof MockBusinessError) return HttpResponse.json({ message: error.message }, { status: error.status })
    return HttpResponse.json({ message: 'Erro inesperado no pedido.', }, { status: 500 })
  }
}
export const orderHandlers = [
  http.post('/api/orders', ({ request }) => respond(async () => {
    const { user } = await requireUser(request)
    const input = await request.json() as CreateOrderInput
    if (!input || typeof input !== 'object') throw new MockBusinessError('Dados do pedido inválidos.', 400)
    const { order, timeout } = await createOrder(user.id, request, input)
    if (timeout) throw new MockBusinessError('O pedido foi criado, mas a resposta excedeu o tempo limite. Consulte a chave de idempotência.', 504)
    return order
  })),
  http.get('/api/orders/by-key/:key', ({ request, params }) => respond(async () => {
    const { user } = await requireUser(request)
    return orderByKey(String(params.key), user.id)
  })),
  http.get('/api/orders/:id', ({ request, params }) => respond(async () => {
    const { user } = await requireUser(request)
    return orderById(String(params.id), user.id)
  })),
  // Painel de cenários para desenvolvimento e testes: nunca disponível no backend real.
  http.patch('/api/mock/nfts/:id', async ({ request, params }) => respond(async () => {
    const { user } = await requireUser(request)
    if (!user) throw new MockBusinessError('Não autorizado.', 401)
    const input = await request.json() as { priceEth?: string }
    if (!input || typeof input.priceEth !== 'string') throw new MockBusinessError('Preço inválido.', 422)
    const updated = changeNftPrice(String(params.id), input.priceEth)
    publishMockEvent({ type: 'nft.updated', payload: { eventId: crypto.randomUUID(), resourceId: String(params.id), version: updated.version, priceEth: input.priceEth, available: inventoryState(String(params.id)).standard + inventoryState(String(params.id)).collector } })
    return { version: updated.version }
  })),
]
