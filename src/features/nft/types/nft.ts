import type { NFTCategory } from '../constants/categories'

export type CatalogTab = 'all' | 'new' | 'trending'
export type CatalogSort = 'recent' | 'price_asc' | 'price_desc' | 'name_asc'
export type NFTNetwork = 'ethereum' | 'polygon' | 'base'

export interface CatalogFilters {
  tab: CatalogTab
  category?: NFTCategory
  q?: string
  network?: NFTNetwork
  minPrice?: string
  maxPrice?: string
  sort: CatalogSort
  page: number
}

export interface NFT {
  id: string
  name: string
  category: NFTCategory
  network: NFTNetwork
  imageUrl: string
  priceEth: string
  previousPriceEth?: string
  isRare?: boolean
  isNew?: boolean
  isTrending?: boolean
  createdAt: string
}
