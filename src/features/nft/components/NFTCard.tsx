import { Link } from '@tanstack/react-router'
import type { NFT } from '../types/nft'
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton'
interface NFTCardProps { nft: NFT }
export function NFTCard({ nft }: NFTCardProps) {
  return <article className="group min-w-0 font-mono">
    <div className="relative rounded-2xl bg-[#2a1914] p-2">
      {nft.isRare && <span className="absolute left-3 top-4 z-10 bg-[#d38d50] px-3 py-2 text-xs font-bold text-[#160e0b]">RARO</span>}
      <FavoriteButton nftId={nft.id} className="absolute right-3 top-3 z-10" />
      <Link to="/nft/$nftId" params={{ nftId: nft.id }} className="block overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-[#d38d50]">
        <img src={nft.imageUrl} alt={`NFT ${nft.name}`} loading="lazy" decoding="async" className="aspect-square w-full rounded-xl object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none" />
      </Link>
    </div>
    <div className="mt-3 px-1">
      <Link to="/nft/$nftId" params={{ nftId: nft.id }} className="block truncate text-sm font-medium text-[#f4ede5] hover:text-[#d38d50] sm:text-base">{nft.name}</Link>
      <div className="mt-1 flex flex-wrap items-center gap-2"><span className="text-sm font-bold text-[#d38d50]">{nft.priceEth} ETH</span>
      {nft.previousPriceEth && <span className="text-xs text-[#b99872] line-through">{nft.previousPriceEth} ETH</span>}</div>
    </div>
  </article>

interface NFTCardProps { nft: NFT }

export function NFTCard({ nft }: NFTCardProps) {
  return (
    <article className="group min-w-0 font-mono">
      <Link to="/nft/$nftId" params={{ nftId: nft.id }} className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d38d50]">
        <div className="relative overflow-hidden rounded-2xl bg-[#2a1914] p-2">
          {nft.isRare && <span className="absolute left-2 top-4 z-10 bg-[#d38d50] px-3 py-2 text-xs font-bold text-[#160e0b]">RARO</span>}
          <img src={nft.imageUrl} alt={nft.name} loading="lazy" decoding="async" className="aspect-square w-full rounded-xl object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none" />
        </div>
        <div className="mt-3 px-1">
          <h3 className="truncate text-sm font-medium text-[#f4ede5] sm:text-base">{nft.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-[#d38d50]">{nft.priceEth} ETH</span>
            {nft.previousPriceEth && <span className="text-xs text-[#b99872] line-through">{nft.previousPriceEth} ETH</span>}
          </div>
        </div>
      </Link>
    </article>
  )
}
