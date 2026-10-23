import { api } from '@/lib/api'
import type { CreateOrderInput, Order } from '@/features/checkout/types/orders'

export async function submitOrder(input: CreateOrderInput): Promise<Order> {
  const { data } = await api.post<Order>('/orders', input)
  return data
}
export async function fetchOrder(id: string, signal?: AbortSignal): Promise<Order> {
  const { data } = await api.get<Order>(`/orders/${encodeURIComponent(id)}`, { signal })
  return data
}
export async function findOrderByKey(key: string): Promise<Order> {
  const { data } = await api.get<Order>(`/orders/by-key/${encodeURIComponent(key)}`)
  return data
}
