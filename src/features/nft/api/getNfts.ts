
import { api } from '@/lib/api'
import type { NFT, CatalogTab } from '../types/nft'
import type { NFTCategory } from '../constants/categories'

export interface NFTListResponse {
  items: NFT[]
  total: number
  page: number
  pageSize: number
}

export async function getNfts(
  tab: CatalogTab,
  category?: NFTCategory,
  q?: string,
  signal?: AbortSignal,
): Promise<NFTListResponse> {
  const { data } = await api.get<NFTListResponse>(
    '/nfts',
    {
      params: {
        ...(tab !== 'all' ? { tab } : {}),
        ...(category ? { category } : {}),
        ...(q ? { q } : {}),
      },
      signal,
    },
  )

  return data
}
