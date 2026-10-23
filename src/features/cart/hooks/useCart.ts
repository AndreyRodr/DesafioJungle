import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { addToCart, applyCoupon, changeCartQuantity, getCart, getCartQuote, removeCartItem, removeCoupon } from '../api/cart'

export function useCart() {
  const { user, token } = useAuth()
  return useQuery({ queryKey: ['cart', token ? (user?.id ?? token) : 'guest'], queryFn: ({ signal }) => getCart(signal) })
}
export function useCartQuote() {
  const { user, token } = useAuth()
  return useQuery({ queryKey: ['cart-quote', token ? (user?.id ?? token) : 'guest'], queryFn: ({ signal }) => getCartQuote(signal) })
}
export function useCartActions() {
  const queryClient = useQueryClient()
  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['cart'] }),
      queryClient.invalidateQueries({ queryKey: ['cart-quote'] }),
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
