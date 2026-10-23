
import { Link } from '@tanstack/react-router'
import { Search, ShoppingCart, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="hidden border-b border-[#3b2a22] bg-[#160e0b] text-[#f4ede5] lg:block">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-8">

        {/* Logo */}
        <Link
          to="/"
          className="w-fit font-mono text-sm font-bold tracking-widest"
        >
          KURIO
        </Link>

        {/* Navegação */}
        <nav
          aria-label="Navegação principal"
          className="flex h-full items-center gap-8 font-mono text-sm"
        >
          <Link
            to="/"
            className="flex h-full items-center border-b-2 border-[#d38d50] text-[#d38d50]"
          >
            Início
          </Link>

          <span className="text-[#f4ede5]">
            Mercado
          </span>

          <span className="text-[#f4ede5]">
            Criadores
          </span>

          <span className="text-[#f4ede5]">
            Aprenda
          </span>
        </nav>

        {/* Ações */}
        <div className="flex items-center justify-end gap-5">
          <button
            type="button"
            disabled
            aria-label="Busca ainda não disponível"
            className="text-[#f4ede5] disabled:cursor-not-allowed"
          >
            <Search size={19} aria-hidden="true" />
          </button>

          <button
            type="button"
            disabled
            aria-label="Carrinho ainda não disponível"
            className="text-[#f4ede5] disabled:cursor-not-allowed"
          >
            <ShoppingCart size={19} aria-hidden="true" />
          </button>

          <Button
            type="button"
            disabled
            className="h-8 rounded-sm bg-[#d38d50] px-3 font-mono text-xs font-semibold text-[#160e0b] disabled:opacity-100"
          >
            <LogIn size={15} aria-hidden="true" />
            Entrar
          </Button>
        </div>
      </div>
    </header>
  )
}
