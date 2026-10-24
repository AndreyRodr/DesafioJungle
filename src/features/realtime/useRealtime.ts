import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io } from 'socket.io-client'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { NftUpdate, OrderUpdate } from '@/mocks/state/events'

/** Cada sessão tem seus listeners e versões próprios; eventos antigos são descartados. */
export function useRealtime() {
  const { token, user } = useAuth()
  const queryClient = useQueryClient()
  const userId = user?.id
  useEffect(() => {
    if (!token || !userId) return
    const latestVersion = new Map<string, number>()
    const seenEvents = new Set<string>()
    const socket = io(window.location.origin, {
      path: '/socket.io/', transports: ['websocket'], autoConnect: false,
      auth: { token }, reconnection: true,
    })
    function accept(event: { eventId: string; resourceId: string; version: number }, namespace: string) {
      if (seenEvents.has(event.eventId)) return false
      const key = `${namespace}:${event.resourceId}`
      if (event.version <= (latestVersion.get(key) ?? 0)) return false
      latestVersion.set(key, event.version)
      seenEvents.add(event.eventId)
      return true
    }
    function onNft(event: NftUpdate) {
      if (!accept(event, 'nft')) return
      void queryClient.invalidateQueries({ queryKey: ['nfts'] })
      void queryClient.invalidateQueries({ queryKey: ['nft'] })
      void queryClient.invalidateQueries({ queryKey: ['cart'] })
      void queryClient.invalidateQueries({ queryKey: ['cart-quote'] })
    }
    function onOrder(event: OrderUpdate) {
      if (event.userId !== userId || !accept(event, 'order')) return
      void queryClient.invalidateQueries({ queryKey: ['order', userId, event.resourceId] })
      void queryClient.invalidateQueries({ queryKey: ['cart'] })
      void queryClient.invalidateQueries({ queryKey: ['cart-quote'] })
    }
    function reconcile() {
      void queryClient.invalidateQueries({ queryKey: ['nfts'] })
      void queryClient.invalidateQueries({ queryKey: ['nft'] })
      void queryClient.invalidateQueries({ queryKey: ['cart'] })
      void queryClient.invalidateQueries({ queryKey: ['cart-quote'] })
      void queryClient.invalidateQueries({ queryKey: ['order'] })
    }
    socket.on('nft.updated', onNft)
    socket.on('order.updated', onOrder)
    socket.on('connect', reconcile)
    socket.connect()
    return () => {
      socket.off('nft.updated', onNft)
      socket.off('order.updated', onOrder)
      socket.off('connect', reconcile)
      socket.disconnect()
      latestVersion.clear()
      seenEvents.clear()
    }
  }, [token, userId, queryClient])
}
