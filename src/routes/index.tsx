import { createFileRoute } from '@tanstack/react-router'
import { HomePage } from '@/features/nft/pages/HomePage'
import type { CatalogSort, CatalogTab, NFTNetwork } from '@/features/nft/types/nft'
import { isNFTCategory, type NFTCategory } from '@/features/nft/constants/categories'

export interface CatalogSearch {
  tab?: Exclude<CatalogTab, 'all'>
  category?: NFTCategory
  q?: string
  network?: NFTNetwork
  minPrice?: string
  maxPrice?: string
  sort?: Exclude<CatalogSort, 'recent'>
  page?: number
}

function validPrice(value: unknown): string | undefined {
  if (typeof value !== 'string' && typeof value !== 'number') return undefined
  const normalized = String(value).trim()
  return /^(0|[1-9]\d{0,6})(\.\d{1,18})?$/.test(normalized)
    ? normalized
    : undefined
}

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): CatalogSearch => {
    const page = Number(search.page)
    return {
      tab: search.tab === 'new' || search.tab === 'trending' ? search.tab : undefined,
      category: isNFTCategory(search.category) ? search.category : undefined,
      q: typeof search.q === 'string' ? search.q.trim().slice(0, 100) || undefined : undefined,
      network: search.network === 'ethereum' || search.network === 'polygon' || search.network === 'base'
        ? search.network : undefined,
      minPrice: validPrice(search.minPrice),
      maxPrice: validPrice(search.maxPrice),
      sort: search.sort === 'price_asc' || search.sort === 'price_desc' || search.sort === 'name_asc'
        ? search.sort : undefined,
      page: Number.isInteger(page) && page > 1 && page <= 1000 ? page : undefined,
    }
  },
  component: HomePage,
})
