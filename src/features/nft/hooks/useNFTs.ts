
import { useQuery } from '@tanstack/react-query'
import { getNfts } from '../api/getNfts'
import type { CatalogTab } from '../types/nft'
import type { NFTCategory } from '../constants/categories'

export function useNFTs(
  tab: CatalogTab,
  category?: NFTCategory,
  q?: string,
) {
  return useQuery({
    queryKey: ['nfts', { tab, category, q }],
    queryFn: ({ signal }) => getNfts(tab, category, q, signal),
  })
}
