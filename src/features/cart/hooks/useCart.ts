import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addToCart, applyCoupon, changeCartQuantity, getCart, getCartQuote, removeCartItem, removeCoupon } from '../api/cart'

export const cartQueryKey = ['cart', 'guest'] as const
export const quoteQueryKey = ['cart-quote', 'guest'] as const

export function useCart() {
  return useQuery({ queryKey: cartQueryKey, queryFn: ({ signal }) => getCart(signal) })
}

export function useCartQuote() {
  return useQuery({ queryKey: quoteQueryKey, queryFn: ({ signal }) => getCartQuote(signal) })
}

export function useCartActions() {
  const queryClient = useQueryClient()
  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: cartQueryKey }),
      queryClient.invalidateQueries({ queryKey: quoteQueryKey }),
    ])
  }
  return {
    add: useMutation({ mutationFn: addToCart, onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ key, quantity }: { key: string; quantity: number }) => changeCartQuantity(key, quantity), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: removeCartItem, onSuccess: invalidate }),
    coupon: useMutation({ mutationFn: applyCoupon, onSuccess: invalidate }),
    clearCoupon: useMutation({ mutationFn: removeCoupon, onSuccess: invalidate }),
  }
}
