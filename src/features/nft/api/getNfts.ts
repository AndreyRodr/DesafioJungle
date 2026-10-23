import { api } from '@/lib/api'
import type { NFT, CatalogFilters } from '../types/nft'

export interface NFTListResponse {
  items: NFT[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function getNfts(
  filters: CatalogFilters,
  signal?: AbortSignal,
): Promise<NFTListResponse> {
  const { data } = await api.get<NFTListResponse>('/nfts', {
    params: {
      ...(filters.tab !== 'all' && { tab: filters.tab }),
      ...(filters.category && { category: filters.category }),
      ...(filters.q && { q: filters.q }),
      ...(filters.network && { network: filters.network }),
      ...(filters.minPrice && { minPrice: filters.minPrice }),
      ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      ...(filters.sort !== 'recent' && { sort: filters.sort }),
      page: filters.page,
      pageSize: 8,
    },
    signal,
  })
  return data
}
