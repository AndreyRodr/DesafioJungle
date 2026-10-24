import { Link } from '@tanstack/react-router'
import nft1 from '@/assets/nft1.png'

export function FeaturedNftAside() {
  return (
    <aside aria-label="NFT em destaque" className="mt-8 overflow-hidden rounded-lg bg-[#251711] p-4 font-mono">
      <div className="rounded-lg bg-[#38261f] p-2"><img src={nft1} alt="Emerald Ape, NFT em destaque" loading="lazy" className="aspect-square w-full rounded-md object-cover" /></div>
      <div className="px-2 pb-4 pt-6">
        <h2 className="text-xl font-bold text-[#f4ede5]">NFT em destaque</h2>
        <p className="mt-3 text-sm leading-6 text-[#b99872]">Obras extraordinárias da próxima geração de criadores.</p>
        <Link to="/nft/$nftId" params={{ nftId: 'emerald-ape-042' }} className="mt-6 inline-flex rounded bg-[#d38d50] px-5 py-3 text-sm font-bold text-[#160e0b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4ede5]">Explorar NFT</Link>
      </div>
    </aside>
  )
}