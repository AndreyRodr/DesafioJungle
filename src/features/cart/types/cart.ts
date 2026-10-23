import type { NFTNetwork } from '@/features/nft/types/nft'

export interface CartItem {
  key: string
  nftId: string
  editionId: string
  name: string
  editionLabel: string
  imageUrl: string
  network: NFTNetwork
  unitPriceEth: string
  available: number
  quantity: number
  version: number
}

export interface CartResponse {
  items: CartItem[]
  coupon: string | null
}

export interface CartQuote {
  items: CartItem[]
  coupon: string | null
  subtotalEth: string
  discountEth: string
  networkFeeEth: string
  totalEth: string
  valid: boolean
  issues: string[]
}

export interface AddToCartInput {
  nftId: string
  editionId: string
  quantity: number
}
