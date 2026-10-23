import { Link, useRouterState } from '@tanstack/react-router'
import { House, Heart, ScanLine, ShoppingCart, UserRound } from 'lucide-react'
import { useCart } from '@/features/cart/hooks/useCart'

export function MobileBottomNav() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isHome = pathname === '/'
  const isCart = pathname === '/cart'
  const { data } = useCart()
  const count = data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  const itemClass = 'flex h-14 w-full items-center justify-center text-[#c8a782] focus-visible:outline-2 focus-visible:outline-[#d38d50]'
  return (
    <nav aria-label="Navegação inferior" className="fixed inset-x-0 bottom-0 z-40 rounded-t-[2.5rem] bg-[#2a1914] px-4 pt-5 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-5 items-center gap-1">
        <Link to="/" aria-label="Início" aria-current={isHome ? 'page' : undefined} className={`${itemClass} ${isHome ? 'text-[#d38d50]' : ''}`}><House size={27} fill={isHome ? 'currentColor' : 'none'} aria-hidden="true" /></Link>
        <button disabled type="button" aria-label="Favoritos disponíveis após login" className={itemClass}><Heart size={27} aria-hidden="true" /></button>
        <button disabled type="button" aria-label="Scanner fora do escopo" className="relative mx-auto -mt-12 flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#d38d50] text-[#fff1e0] ring-8 ring-[#160e0b]"><ScanLine size={32} strokeWidth={1.8} aria-hidden="true" /></button>
        <Link to="/cart" aria-label={`Carrinho com ${count} itens`} aria-current={isCart ? 'page' : undefined} className={`${itemClass} relative ${isCart ? 'text-[#d38d50]' : ''}`}><ShoppingCart size={27} aria-hidden="true" />{count > 0 && <span className="absolute right-0 top-1 rounded-full bg-[#d38d50] px-1 text-[10px] text-[#160e0b]">{count}</span>}</Link>
        <button disabled type="button" aria-label="Perfil disponível após login" className={itemClass}><UserRound size={27} aria-hidden="true" /></button>
      </div>
    </nav>
  )
}
