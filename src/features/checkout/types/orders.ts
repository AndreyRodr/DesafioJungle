import type { CartQuote } from '@/features/cart/types/cart'
import type { WalletNetwork } from '@/features/auth/types/auth'

export type OrderStatus = 'pending' | 'confirmed' | 'declined'
export interface CheckoutBuyer {
  displayName: string
  email: string
  notes?: string
  username?: string
  profileName?: string
  walletType?: 'software' | 'hardware'
  referralCode?: string
  ensName?: string
  secondaryWallet?: string
}
export interface OrderSnapshot {
  quote: CartQuote
  buyer: CheckoutBuyer
  walletAddress: string
  walletLabel: string
  network: WalletNetwork
  walletProvider: 'metamask' | 'walletconnect' | 'coinbase'
}
export interface Order {
  id: string
  status: OrderStatus
  transactionId: string | null
  createdAt: string
  updatedAt: string
  reason?: string
  snapshot: OrderSnapshot
  version: number
}
export interface CreateOrderInput {
  idempotencyKey: string
  quoteFingerprint: string
  buyer: CheckoutBuyer
  walletSlot: 'primary' | 'secondary'
  walletProvider: OrderSnapshot['walletProvider']
  network: WalletNetwork
}
export function quoteFingerprint(quote: CartQuote): string {
  return JSON.stringify({
    items: quote.items.map(({ key, quantity, unitPriceEth, available, version }) => ({ key, quantity, unitPriceEth, available, version })),
    coupon: quote.coupon,
    subtotalEth: quote.subtotalEth,
    discountEth: quote.discountEth,
    networkFeeEth: quote.networkFeeEth,
    totalEth: quote.totalEth,
  })
}
