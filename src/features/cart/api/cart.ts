import { api } from '@/lib/api'
import type { AddToCartInput, CartQuote, CartResponse } from '../types/cart'

export async function getCart(signal?: AbortSignal): Promise<CartResponse> {
  const { data } = await api.get<CartResponse>('/cart', { signal })
  return data
}

export async function addToCart(input: AddToCartInput): Promise<CartResponse> {
  const { data } = await api.post<CartResponse>('/cart/items', input)
  return data
}

export async function changeCartQuantity(key: string, quantity: number): Promise<CartResponse> {
  const { data } = await api.patch<CartResponse>(`/cart/items/${encodeURIComponent(key)}`, { quantity })
  return data
}

export async function removeCartItem(key: string): Promise<CartResponse> {
  const { data } = await api.delete<CartResponse>(`/cart/items/${encodeURIComponent(key)}`)
  return data
}

export async function applyCoupon(code: string): Promise<CartResponse> {
  const { data } = await api.post<CartResponse>('/cart/coupon', { code })
  return data
}

export async function removeCoupon(): Promise<CartResponse> {
  const { data } = await api.delete<CartResponse>('/cart/coupon')
  return data
}

export async function getCartQuote(signal?: AbortSignal): Promise<CartQuote> {
  const { data } = await api.get<CartQuote>('/cart/quote', { signal })
  return data
}
