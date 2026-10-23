import { Hero } from '../../../components/Hero'
import { NFTCard } from '../components/NFTCard'
import { NFTCardSkeleton } from '../components/NFTCardSkeleton'
import { useNFTs } from '../hooks/useNFTs'
import { useSearch } from '@tanstack/react-router'
import { CatalogTabs } from '../components/CatalogTabs'
import { CategorySidebar } from '../components/CategorySidebar'
import { MobileHeader } from '@/components/layout/MobileHeader'

export function HomePage() {
  const { tab, category, q } = useSearch({ from: '/' })
  const activeTab = tab ?? 'all'
  const {
    data,
    isPending,
    isError,
    isFetching,
    refetch,

  } = useNFTs(activeTab, category, q)

  return (
  <>
    <MobileHeader />

    <main className="mx-auto w-full max-w-7xl px-4 pb-32 sm:px-6 lg:px-8 lg:pb-12">
      <Hero />

      <section
        id="catalog"
        aria-labelledby="catalog-heading"
        aria-busy={isPending}
        className="scroll-mt-8 pt-6 lg:pt-10"
      >
        <h2 id="catalog-heading" className="sr-only">
          Catálogo de NFTs
        </h2>
        
        <div className="flex items-start gap-6">
          <CategorySidebar activeCategory={category} />

          <div className="min-w-0 flex-1">
            <div className="mb-6">
             <CatalogTabs activeTab={activeTab} />
            </div>
        
        {/* Carregamento */}
        {isPending ? (
          <div role="status">
            <span className="sr-only">
              Carregando NFTs...
            </span>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
              {Array.from({ length: 2 }, (_, index) => (
                <NFTCardSkeleton key={index} />
              ))}
            </div>
          </div>
        ) : isError && !data ? (

          /* Erro inicial */
          <div
            role="alert"
            className="rounded-lg border border-[#503328] bg-[#2a1914] p-6"
          >
            <p className="font-mono text-sm text-[#f4ede5]">
              Não foi possível carregar os NFTs.
            </p>

            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-4 rounded bg-[#d38d50] px-4 py-2 font-mono text-sm text-[#160e0b] focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            {isFetching && (
              <p role="status" className="mb-3 font-mono text-xs text-[#b99872]">
                Atualizando catálogo...
              </p>
            )}

            {isError && (
              <p role="alert" className="mb-3 font-mono text-sm text-[#e69b55]">
                Falha ao atualizar. Exibindo os últimos dados disponíveis.
              </p>
            )}

            {/* Catálogo vazio */}
            {data?.items.length === 0 ? (
              <p className="font-mono text-sm text-[#b99872]">
                Nenhum NFT encontrado.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
                {data?.items.map((nft) => (
                  <NFTCard key={nft.id} nft={nft} />
                ))}
              </div>
            )}
          </>
        )}
          </div>
        </div>
      </section>
    </main>
  </>
  )
}
