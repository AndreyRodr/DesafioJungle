import { http, HttpResponse } from 'msw/http'
import type { CartResponse, CartQuote } from '@/features/cart/types/cart'
import { addLine, clearCoupon, deleteLine, getNftDetail, MockBusinessError, quoteCart, readCart, setCoupon, updateLine } from '../state/commerce'

function asResponse(action: () => CartResponse | CartQuote) {
  try { return HttpResponse.json({ ...action() }) }
  catch (error) {
    if (error instanceof MockBusinessError) return HttpResponse.json({ message: error.message }, { status: error.status })
    return HttpResponse.json({ message: 'Falha inesperada na simulação' }, { status: 500 })
  }
}

export const commerceHandlers = [
  http.get('/api/nfts/:nftId', ({ params }) => {
    const detail = getNftDetail(String(params.nftId))
    return detail
      ? HttpResponse.json(detail)
      : HttpResponse.json({ message: 'NFT não encontrado' }, { status: 404 })
  }),
  http.get('/api/cart', () => asResponse(readCart)),
  http.get('/api/cart/quote', () => asResponse(quoteCart)),
  http.post('/api/cart/items', async ({ request }) => {
    const body: unknown = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') return HttpResponse.json({ message: 'Dados inválidos' }, { status: 400 })
    const input = body as Record<string, unknown>
    if (typeof input.nftId !== 'string' || typeof input.editionId !== 'string' || typeof input.quantity !== 'number')
      return HttpResponse.json({ message: 'Dados inválidos' }, { status: 400 })
    return asResponse(() => addLine(input.nftId as string, input.editionId as string, input.quantity as number))
  }),
  http.patch('/api/cart/items/:key', async ({ params, request }) => {
    const body: unknown = await request.json().catch(() => null)
    if (!body || typeof body !== 'object' || !('quantity' in body) || typeof body.quantity !== 'number')
      return HttpResponse.json({ message: 'Quantidade inválida' }, { status: 400 })
    return asResponse(() => updateLine(String(params.key), body.quantity as number))
  }),
  http.delete('/api/cart/items/:key', ({ params }) => asResponse(() => deleteLine(String(params.key)))),
  http.post('/api/cart/coupon', async ({ request }) => {
    const body: unknown = await request.json().catch(() => null)
    if (!body || typeof body !== 'object' || !('code' in body) || typeof body.code !== 'string')
      return HttpResponse.json({ message: 'Informe um cupom' }, { status: 400 })
    return asResponse(() => setCoupon(body.code as string))
  }),
  http.delete('/api/cart/coupon', () => asResponse(clearCoupon)),
]
