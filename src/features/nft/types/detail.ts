import type { NFT } from './nft'

export interface NFTEdition {
  id: string
  label: string
  priceEth: string
  available: number
}

export interface NFTDetail extends NFT {
  creator: string
  description: string
  gallery: string[]
  editions: NFTEdition[]
  version: number
}
