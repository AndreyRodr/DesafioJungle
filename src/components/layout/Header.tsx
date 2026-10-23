import { useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { Search, ShoppingCart, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CatalogSearchInput } from '@/features/nft/components/CatalogSearchInput'

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const onHome = pathname === '/'
  return (
    <header className="relative z-20 hidden border-b border-[#3b2a22] bg-[#160e0b] text-[#f4ede5] lg:block">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-8">
        <Link to="/" className="w-fit font-mono text-sm font-bold tracking-widest">KURIO</Link>
        <nav aria-label="Navegação principal" className="flex h-full items-center gap-8 font-mono text-sm">
          <Link to="/" className="flex h-full items-center border-b-2 border-[#d38d50] text-[#d38d50]">Início</Link>
          <span className="text-[#f4ede5]">Mercado</span>
          <span className="text-[#f4ede5]">Criadores</span>
          <span className="text-[#f4ede5]">Aprenda</span>
        </nav>
        <div className="flex items-center justify-end gap-5">
          <button type="button" disabled={!onHome} aria-label="Buscar NFTs" aria-controls="desktop-nft-search"
            aria-expanded={searchOpen && onHome} onClick={() => setSearchOpen((open) => !open)}
            className="text-[#f4ede5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d38d50] disabled:opacity-40">
            <Search size={19} aria-hidden="true" />
          </button>
          <button type="button" disabled aria-label="Carrinho indisponível" className="text-[#f4ede5] disabled:cursor-not-allowed"><ShoppingCart size={19} aria-hidden="true" /></button>
          <Button type="button" disabled className="h-8 rounded-sm bg-[#d38d50] px-3 font-mono text-xs font-semibold text-[#160e0b] disabled:opacity-100"><LogIn size={15} aria-hidden="true" />Entrar</Button>
        </div>
      </div>
      {onHome && searchOpen && <div id="desktop-nft-search" className="absolute right-8 top-full rounded-b-2xl border border-[#503328] bg-[#160e0b] p-3 shadow-xl">
        <CatalogSearchInput compact autoFocus />
      </div>}
    </header>
  )
}
