import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

interface CatalogPaginationProps { page: number; totalPages: number }

export function CatalogPagination({ page, totalPages }: CatalogPaginationProps) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  return (
    <nav aria-label="Paginação de NFTs" className="mt-10 flex items-center justify-end gap-2 font-mono">
      {pages.map(number => (
        <Link key={number} to="/" search={previous => ({ ...previous, page: number === 1 ? undefined : number })} hash="catalog"
          aria-label={`Ir para a página ${number}`}
          aria-current={number === page ? 'page' : undefined}
          className={`inline-flex h-10 w-10 items-center justify-center rounded text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d38d50] ${number === page ? 'bg-[#d38d50] text-[#160e0b]' : 'border border-[#503328] bg-[#251711] text-[#f4ede5] hover:border-[#d38d50]'}`}
        >{number}</Link>
      ))}
      {page < totalPages && <Link to="/" search={previous => ({ ...previous, page: page + 1 })} hash="catalog" aria-label="Próxima página" className="inline-flex h-10 w-10 items-center justify-center rounded border border-[#503328] bg-[#251711] text-[#f4ede5] hover:border-[#d38d50] focus-visible:outline-2 focus-visible:outline-[#d38d50]"><ChevronRight size={18} aria-hidden="true" /></Link>}
    </nav>
  )
}
