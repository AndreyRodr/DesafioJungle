import { useNFTs } from '@/features/nft/hooks/useNFTs'
import { NFTCard } from '@/features/nft/components/NFTCard'

export function CartRecommendations({ excludeIds }: { excludeIds: string[] }) {
  const { data, isPending, isError } = useNFTs({ tab: 'all', sort: 'recent', page: 1 })
  const candidates = data?.items.filter(nft => !excludeIds.includes(nft.id)).slice(0, 5) ?? []
  if (isError || (!isPending && candidates.length === 0)) return null
  return (
    <section aria-labelledby="cart-recommendations-title" className="mt-16 font-mono lg:mt-24">
      <h2 id="cart-recommendations-title" className="border-b border-[#503328] pb-4 text-base font-bold text-[#d38d50]">Colecionadores também viram</h2>
      {isPending ? (
        <div role="status" aria-label="Carregando recomendações" className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, i) => <div key={i} className="nft-shimmer aspect-[4/5] rounded-lg" />)}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
          {candidates.map(nft => <NFTCard key={nft.id} nft={nft} />)}
        </div>
      )}
    </section>
  )
}
