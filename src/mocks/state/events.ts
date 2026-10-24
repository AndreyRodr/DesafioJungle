export interface VersionedEvent {
  eventId: string
  resourceId: string
  version: number
  userId?: string
}
export type NftUpdate = VersionedEvent & { priceEth: string; available: number }
export type OrderUpdate = VersionedEvent & { status: 'pending' | 'confirmed' | 'declined' }
export type ServerEvent =
  | { type: 'nft.updated'; payload: NftUpdate }
  | { type: 'order.updated'; payload: OrderUpdate }

const listeners = new Set<(event: ServerEvent) => void>()
export function subscribeMockEvents(listener: (event: ServerEvent) => void) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}
export function publishMockEvent(event: ServerEvent) {
  for (const listener of listeners) listener(event)
}
