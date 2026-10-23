
import { http, HttpResponse } from 'msw/http'
import { nftFixtures } from '../fixtures/nfts'

export const nftHandlers = [
  http.get('/api/nfts', ({ request }) => {
    const url = new URL(request.url)

    const tab = url.searchParams.get('tab')
    const category = url.searchParams.get('category')
    const q = url.searchParams.get('q')?.trim().toLowerCase()

    const items = nftFixtures.filter((nft) => {
      const matchesTab =
        tab === 'new'
          ? nft.isNew === true
          : tab === 'trending'
            ? nft.isTrending === true
            : true

      const matchesCategory =
        !category || nft.category === category

      const matchesSearch =
        !q || nft.name.toLowerCase().includes(q)

      return matchesTab && matchesCategory && matchesSearch
    })

    return HttpResponse.json({
      items,
      total: items.length,
      page: 1,
      pageSize: 12,
    })
  }),
]
