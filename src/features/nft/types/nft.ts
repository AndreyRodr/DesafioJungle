import type { NFTCategory } from '../constants/categories'
export type CatalogTab = 'all' | 'new' | 'trending'

export interface NFT {
  id: string
  name: string
  category: NFTCategory
  imageUrl: string
  priceEth: string
  previousPriceEth?: string
  isRare?: boolean
  isNew?: boolean
  isTrending?: boolean
}
