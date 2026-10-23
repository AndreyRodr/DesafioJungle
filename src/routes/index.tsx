
import { createFileRoute } from '@tanstack/react-router'
import { HomePage } from '@/features/nft/pages/HomePage'
import type { CatalogTab } from '@/features/nft/types/nft'
import {
  isNFTCategory,
  type NFTCategory,
} from '@/features/nft/constants/categories'

interface CatalogSearch {
  tab?: Exclude<CatalogTab, 'all'>
  category?: NFTCategory
  q?: string
}

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): CatalogSearch => ({
    tab:
      search.tab === 'new' || search.tab === 'trending'
        ? search.tab
        : undefined,

    category: isNFTCategory(search.category)
      ? search.category
      : undefined,

    q:
      typeof search.q === 'string' && search.q.trim()
        ? search.q.trim().slice(0, 100)
        : undefined,
  }),
  component: HomePage,
})
