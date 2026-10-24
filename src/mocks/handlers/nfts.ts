import { simulateNetwork } from '../networkScenario'
import { http, HttpResponse } from 'msw/http'
import { ethToWei } from '@/features/nft/lib/price'
import { nftFixtures } from '../fixtures/nfts'
import { inventoryState } from '../state/commerce'
import type { CatalogSort } from '@/features/nft/types/nft'

const sortOptions = new Set<CatalogSort>(['recent', 'price_asc', 'price_desc', 'name_asc'])

export const nftHandlers = [
  http.get('/api/nfts', async ({ request }) => {
    const injected = await simulateNetwork(request)
    if (injected) return injected
    const url = new URL(request.url)
    const tab = url.searchParams.get('tab')
    const category = url.searchParams.get('category')
    const q = url.searchParams.get('q')?.trim().toLocaleLowerCase('pt-BR')
    const network = url.searchParams.get('network')
    const minPrice = url.searchParams.get('minPrice')
    const maxPrice = url.searchParams.get('maxPrice')
    const requestedSort = url.searchParams.get('sort')
    const sort: CatalogSort = sortOptions.has(requestedSort as CatalogSort)
      ? requestedSort as CatalogSort : 'recent'

    let minWei: bigint | undefined
    let maxWei: bigint | undefined
    try {
      minWei = minPrice ? ethToWei(minPrice) : undefined
      maxWei = maxPrice ? ethToWei(maxPrice) : undefined
    } catch {
      return HttpResponse.json({ message: 'Intervalo de preço inválido' }, { status: 400 })
    }
    if (minWei !== undefined && maxWei !== undefined && minWei > maxWei) {
      return HttpResponse.json({ message: 'O preço mínimo supera o máximo' }, { status: 400 })
    }

    const filtered = nftFixtures.map((nft) => ({ ...nft, priceEth: inventoryState(nft.id).priceEth ?? nft.priceEth })).filter((nft) => {
      const matchesTab = tab === 'new' ? nft.isNew === true
        : tab === 'trending' ? nft.isTrending === true : true
      const price = ethToWei(nft.priceEth)
      return matchesTab && (!category || nft.category === category)
        && (!network || nft.network === network)
        && (!q || nft.name.toLocaleLowerCase('pt-BR').includes(q))
        && (minWei === undefined || price >= minWei)
        && (maxWei === undefined || price <= maxWei)
    })

    filtered.sort((a, b) => {
      if (sort === 'name_asc') return a.name.localeCompare(b.name, 'pt-BR')
      if (sort === 'price_asc' || sort === 'price_desc') {
        const x = ethToWei(a.priceEth)
        const y = ethToWei(b.priceEth)
        const comparison = x < y ? -1 : x > y ? 1 : 0
        return (sort === 'price_asc' ? comparison : -comparison) || a.id.localeCompare(b.id)
      }
      return b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id)
    })

    const pageSize = 9
    const requestedPage = Number(url.searchParams.get('page') ?? 1)
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    const page = Number.isInteger(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, totalPages) : 1
    return HttpResponse.json({
      items: filtered.slice((page - 1) * pageSize, page * pageSize),
      total: filtered.length,
      page,
      pageSize,
      totalPages,
    })
  }),
]
