import { Link } from '@tanstack/react-router'
import { pageShellClass } from '@/components/layout/pageShell'
import { useQueries } from '@tanstack/react-query'
import { getNft } from '@/features/nft/api/getNft'
import { NFTCard } from '@/features/nft/components/NFTCard'
import { useFavorites } from '../hooks/useFavorites'
export function FavoritesPage() {
  const { data: ids, isPending, isError } = useFavorites()
  const details = useQueries({ queries: (ids ?? []).map((id) => ({ queryKey: ['nft', id], queryFn: ({ signal }: { signal: AbortSignal }) => getNft(id, signal), retry: false })) })
  return <main className={`${pageShellClass} pb-32 pt-10 font-mono text-[#f4ede5] lg:pb-16`}>
    <h1 className="text-3xl font-bold">Meus favoritos</h1>
    {isPending || details.some((item) => item.isPending) ? <p role="status" className="mt-8 text-[#b99872]">Carregando favoritos...</p>
      : isError || details.some((item) => item.isError) ? <p role="alert" className="mt-8 text-red-300">Não foi possível carregar seus favoritos.</p>
      : !ids?.length ? <div className="mt-8 rounded-xl border border-[#503328] bg-[#251711] p-8">Nenhum NFT favorito. <Link to="/" className="text-[#d38d50] underline">Explorar NFTs</Link></div>
      : <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">{details.map((item) => item.data).filter((item) => item !== undefined).map((nft) => <NFTCard key={nft.id} nft={nft} />)}</div>}
  </main>
}
