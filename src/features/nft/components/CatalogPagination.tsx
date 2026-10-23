import { Link } from '@tanstack/react-router'

interface CatalogPaginationProps { page: number; totalPages: number }

export function CatalogPagination({ page, totalPages }: CatalogPaginationProps) {
  if (totalPages <= 1) return null
  const control = 'rounded-lg border border-[#503328] px-4 py-2 font-mono text-xs text-[#f4ede5] hover:border-[#d38d50] focus-visible:outline-2 focus-visible:outline-[#d38d50]'
  return (
    <nav aria-label="Paginação de NFTs" className="mt-8 flex items-center justify-center gap-3">
      {page > 1 ? (
        <Link className={control} to="/" search={(previous) => ({ ...previous, page: page - 1 === 1 ? undefined : page - 1 })} hash="catalog">Anterior</Link>
      ) : <span aria-disabled="true" className={`${control} opacity-40`}>Anterior</span>}
      <span className="font-mono text-xs text-[#b99872]" aria-live="polite">Página {page} de {totalPages}</span>
      {page < totalPages ? (
        <Link className={control} to="/" search={(previous) => ({ ...previous, page: page + 1 })} hash="catalog">Próxima</Link>
      ) : <span aria-disabled="true" className={`${control} opacity-40`}>Próxima</span>}
    </nav>
  )
}
