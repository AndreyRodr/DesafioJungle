import { useState } from 'react'
import { pageShellClass } from './pageShell'
import { Link, useRouterState } from '@tanstack/react-router'
import { Search, ShoppingCart, LogIn } from 'lucide-react'
import { CatalogSearchInput } from '@/features/nft/components/CatalogSearchInput'
import { useCart } from '@/features/cart/hooks/useCart'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const hash = useRouterState({ select: (state) => state.location.hash })
  const onHome = pathname === '/'
  const onMarket = pathname.startsWith('/nft/') || pathname === '/cart' || (onHome && hash === 'catalog')
  const { data: cart } = useCart()
  const { user } = useAuth()
  const count = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  return (
    <header className="relative z-20 hidden border-b border-[#3b2a22] bg-[#160e0b] text-[#f4ede5] lg:block">
      <div className={`${pageShellClass} grid h-16 grid-cols-[1fr_auto_1fr] items-center`}>
        <Link to="/" className="w-fit font-mono text-sm font-bold tracking-widest">KURIO</Link>
        <nav aria-label="Navegação principal" className="flex h-full items-center gap-8 font-mono text-sm">
          <Link to="/" className={`flex h-full items-center border-b-2 ${onHome && !onMarket ? 'border-[#d38d50] text-[#d38d50]' : 'border-transparent text-[#f4ede5]'}`}>Início</Link>
          <Link to="/" hash="catalog" aria-current={onMarket ? 'page' : undefined} className={`flex h-full items-center border-b-2 ${onMarket ? 'border-[#d38d50] text-[#d38d50]' : 'border-transparent text-[#f4ede5]'}`}>Mercado</Link><span className="text-[#f4ede5]">Criadores</span><span className="text-[#f4ede5]">Aprenda</span>
        </nav>
        <div className="flex items-center justify-end gap-5">
          <button type="button" disabled={!onHome} aria-label="Buscar NFTs" aria-controls="desktop-nft-search" aria-expanded={searchOpen && onHome} onClick={() => setSearchOpen((open) => !open)} className="text-[#f4ede5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d38d50] disabled:opacity-40"><Search size={19} aria-hidden="true" /></button>
          <Link to="/cart" aria-label={`Carrinho com ${count} itens`} className="relative rounded-sm text-[#f4ede5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d38d50]"><ShoppingCart size={19} aria-hidden="true" />{count > 0 && <span className="absolute -right-3 -top-3 rounded-full bg-[#d38d50] px-1 text-[10px] font-bold text-[#160e0b]">{count}</span>}</Link>
          {user ? <Link to="/profile" className="flex h-9 items-center gap-2 rounded-sm bg-[#d38d50] px-3 font-mono text-xs font-semibold text-[#160e0b]"><LogIn size={15} aria-hidden="true" />Perfil</Link> : <Link to="/login" className="flex h-9 items-center gap-2 rounded-sm bg-[#d38d50] px-3 font-mono text-xs font-semibold text-[#160e0b]"><LogIn size={15} aria-hidden="true" />Entrar</Link>}
        </div>
      </div>
      {onHome && searchOpen && <div id="desktop-nft-search" className="absolute right-8 top-full rounded-b-2xl border border-[#503328] bg-[#160e0b] p-3 shadow-xl"><CatalogSearchInput compact autoFocus /></div>}
    </header>
  )
}
