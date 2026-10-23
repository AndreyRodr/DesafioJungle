import { MobileCategoryDrawer } from '@/features/nft/components/MobileCategoryDrawer'
import { Search } from 'lucide-react'

export function MobileHeader() {
  return (
    <header className="bg-[#160e0b] px-5 py-5 lg:hidden">
      <div className="mx-auto flex max-w-xl items-center gap-3">

        {/* Busca */}
        <div className="flex h-14 min-w-0 flex-1 items-center gap-3 rounded-2xl bg-[#2a1914] px-4">
          <Search
            size={22}
            className="shrink-0 text-[#b99872]"
            aria-hidden="true"
          />

          <input
            type="search"
            placeholder="Explorar coleções"
            aria-label="Buscar NFTs"
            disabled
            className="w-full min-w-0 bg-transparent font-mono text-sm text-[#f4ede5] placeholder:text-[#b99872] focus:outline-none"
          />
        </div>

        {/* Filtros */}
        <button
          type="button"
          aria-label="Filtros ainda não disponíveis"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#d38d50] text-[#160e0b]"
        >
          <MobileCategoryDrawer />
        </button>
      </div>
    </header>
  )
}
