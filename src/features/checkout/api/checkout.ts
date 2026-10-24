import { api } from '@/lib/api'
import type { CartQuote } from '@/features/cart/types/cart'

/** GET autoritativo imediatamente antes da compra, sem reutilizar cache local. */
export async function revalidateQuote(): Promise<CartQuote> {
  const { data } = await api.get<CartQuote>('/cart/quote', { headers: { 'Cache-Control': 'no-cache' } })
  return data
}
