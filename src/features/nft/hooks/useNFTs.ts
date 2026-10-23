import { useQuery } from '@tanstack/react-query'
import { getNfts } from '../api/getNfts'
import type { CatalogFilters } from '../types/nft'

export function useNFTs(filters: CatalogFilters) {
  return useQuery({
    queryKey: ['nfts', filters],
    queryFn: ({ signal }) => getNfts(filters, signal),
  })
}
