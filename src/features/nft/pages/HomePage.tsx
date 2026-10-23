import { useSearch, Link } from '@tanstack/react-router'
import { Hero } from '../../../components/Hero'
import { NFTCard } from '../components/NFTCard'
import { NFTCardSkeleton } from '../components/NFTCardSkeleton'
import { CatalogTabs } from '../components/CatalogTabs'
import { CategorySidebar } from '../components/CategorySidebar'
import { CatalogToolbar } from '../components/CatalogToolbar'
import { CatalogPagination } from '../components/CatalogPagination'
import { MobileHeader } from '@/components/layout/MobileHeader'
import { useNFTs } from '../hooks/useNFTs'
import type { CatalogFilters } from '../types/nft'

export function HomePage() {
  const search = useSearch({ from: '/' })
  const filters: CatalogFilters = {
    tab: search.tab ?? 'all',
    category: search.category,
    q: search.q,
    network: search.network,
    minPrice: search.minPrice,
    maxPrice: search.maxPrice,
    sort: search.sort ?? 'recent',
    page: search.page ?? 1,
  }
  const { data, isPending, isError, isFetching, refetch } = useNFTs(filters)

  return (
    <>
      <MobileHeader />
      <main className="mx-auto w-full max-w-7xl px-4 pb-32 sm:px-6 lg:px-8 lg:pb-12">
        <Hero />
        <section id="catalog" aria-labelledby="catalog-heading" aria-busy={isPending} className="scroll-mt-8 pt-6 lg:pt-10">
          <h2 id="catalog-heading" className="sr-only">Catálogo de NFTs</h2>
          <div className="flex items-start gap-6">
            <CategorySidebar activeCategory={filters.category} />
            <div className="min-w-0 flex-1">
              <div className="mb-5"><CatalogTabs activeTab={filters.tab} /></div>
              <CatalogToolbar />
              {isPending ? (
                <div role="status" className="mt-5">
                  <span className="sr-only">Carregando NFTs...</span>
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
                    {Array.from({ length: 8 }, (_, index) => <NFTCardSkeleton key={index} />)}
                  </div>
                </div>
              ) : isError && !data ? (
                <div role="alert" className="mt-5 rounded-lg border border-[#503328] bg-[#2a1914] p-6">
                  <p className="font-mono text-sm text-[#f4ede5]">Não foi possível carregar os NFTs.</p>
                  <button type="button" onClick={() => void refetch()} className="mt-4 rounded bg-[#d38d50] px-4 py-2 font-mono text-sm text-[#160e0b]">Tentar novamente</button>
                </div>
              ) : (
                <>
                  <div className="my-4 flex items-center justify-between gap-3 font-mono text-xs text-[#b99872]">
                    <span aria-live="polite">{data?.total ?? 0} NFTs encontrados</span>
                    {isFetching && <span role="status">Atualizando catálogo...</span>}
                  </div>
                  {isError && <p role="alert" className="mb-3 font-mono text-sm text-[#e69b55]">Falha ao atualizar. Exibindo os últimos dados disponíveis.</p>}
                  {data?.items.length === 0 ? (
                    <div className="rounded-lg border border-[#503328] bg-[#2a1914] px-5 py-12 text-center font-mono">
                      <p className="text-sm text-[#f4ede5]">Nenhum NFT encontrado.</p>
                      <Link to="/" search={{}} className="mt-4 inline-block text-sm font-bold text-[#d38d50] underline">Limpar filtros</Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
                      {data?.items.map((nft) => <NFTCard key={nft.id} nft={nft} />)}
                    </div>
                  )}
                  {data && <CatalogPagination page={data.page} totalPages={data.totalPages} />}
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
