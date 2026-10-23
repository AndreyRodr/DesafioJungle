
import { Link, useRouterState } from '@tanstack/react-router'
import {
  House,
  Heart,
  ScanLine,
  ShoppingCart,
  UserRound,
} from 'lucide-react'

export function MobileBottomNav() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const isHome = pathname === '/'

  const itemClass =
    'flex h-14 w-full items-center justify-center text-[#c8a782]'

  return (
    <nav
      aria-label="Navegação inferior"
      className="fixed inset-x-0 bottom-0 z-40 rounded-t-[2.5rem] bg-[#2a1914] px-4 pt-5 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      <div className="mx-auto grid max-w-xl grid-cols-5 items-center gap-1">

        {/* Início */}
        <Link
          to="/"
          aria-label="Início"
          aria-current={isHome ? 'page' : undefined}
          className={`${itemClass} ${
            isHome ? 'text-[#d38d50]' : ''
          }`}
        >
          <House
            size={27}
            fill={isHome ? 'currentColor' : 'none'}
            aria-hidden="true"
          />
        </Link>

        {/* Favoritos */}
        <button
          type="button"
          disabled
          aria-label="Favoritos indisponíveis"
          className={itemClass}
        >
          <Heart size={27} fill="currentColor" aria-hidden="true" />
        </button>

        {/* Scanner central */}
        <button
          type="button"
          disabled
          aria-label="Scanner indisponível"
          className="relative -mt-12 mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#d38d50] text-[#fff1e0] ring-8 ring-[#160e0b]"
        >
          <ScanLine size={32} strokeWidth={1.8} aria-hidden="true" />
        </button>

        {/* Carrinho */}
        <button
          type="button"
          disabled
          aria-label="Carrinho indisponível"
          className={itemClass}
        >
          <ShoppingCart size={27} fill="currentColor" aria-hidden="true" />
        </button>

        {/* Perfil */}
        <button
          type="button"
          disabled
          aria-label="Perfil indisponível"
          className={itemClass}
        >
          <UserRound size={27} fill="currentColor" aria-hidden="true" />
        </button>

      </div>
    </nav>
  )
}
