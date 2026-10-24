import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { nftCategories, type NFTCategory } from '../constants/categories'

interface CategorySidebarProps { activeCategory?: NFTCategory }

export function CategorySidebar({ activeCategory }: CategorySidebarProps) {
  const navigate = useNavigate({ from: '/' })
  const search = useSearch({ from: '/' })
  const [min, setMin] = useState(search.minPrice ?? '')
  const [max, setMax] = useState(search.maxPrice ?? '')
  const base = 'block rounded-sm py-2 text-sm transition-colors hover:text-[#d38d50] focus-visible:outline-2 focus-visible:outline-[#d38d50]'
  return (
    <aside className="w-full bg-[#251711] p-5 font-mono">
      <h3 className="mb-3 font-bold text-[#f4ede5]">Coleções</h3>
      <nav aria-label="Categorias de NFTs" className="space-y-1">
        <Link to="/" search={(previous) => ({ ...previous, category: undefined, page: undefined })}
          aria-current={!activeCategory ? 'page' : undefined}
          className={`${base} ${!activeCategory ? 'font-bold text-[#d38d50]' : 'text-[#b99872]'}`}
        >Todas as coleções</Link>
        {nftCategories.map((category) => (
          <Link key={category.id} to="/" search={(previous) => ({ ...previous, category: category.id, page: undefined })}
            aria-current={activeCategory === category.id ? 'page' : undefined}
            className={`${base} ${activeCategory === category.id ? 'font-bold text-[#d38d50]' : 'text-[#b99872]'}`}
          >{category.label}</Link>
        ))}
      </nav>

      <section className="mt-7 border-t border-[#503328] pt-6">
        <h3 className="mb-3 font-bold text-[#f4ede5]">Faixa de preço</h3>
        <form className="space-y-3" onSubmit={event => { event.preventDefault(); void navigate({ to: '/', search: previous => ({ ...previous, minPrice: min || undefined, maxPrice: max || undefined, page: undefined }) }) }}>
          <div className="flex gap-2">
            <label className="min-w-0 flex-1 text-xs text-[#b99872]">Mín. ETH<input aria-label="Preço mínimo em ETH" type="number" min="0" step="any" value={min} onChange={e => setMin(e.target.value)} className="mt-1 w-full rounded bg-[#160e0b] p-2 text-[#f4ede5]" /></label>
            <label className="min-w-0 flex-1 text-xs text-[#b99872]">Máx. ETH<input aria-label="Preço máximo em ETH" type="number" min="0" step="any" value={max} onChange={e => setMax(e.target.value)} className="mt-1 w-full rounded bg-[#160e0b] p-2 text-[#f4ede5]" /></label>
          </div>
          <button type="submit" className="w-full rounded bg-[#d38d50] px-3 py-2 text-xs font-bold text-[#160e0b]">Aplicar</button>
        </form>
      </section>
      <section className="mt-7 border-t border-[#503328] pt-6">
        <h3 className="mb-3 font-bold text-[#f4ede5]">Redes</h3>
        <label className="sr-only" htmlFor="sidebar-network">Filtrar por rede</label>
        <select id="sidebar-network" className="w-full rounded bg-[#160e0b] p-2 text-xs text-[#f4ede5]" value={search.network ?? 'all'} onChange={event => void navigate({ to: '/', search: previous => ({ ...previous, network: event.target.value === 'all' ? undefined : event.target.value as 'ethereum' | 'polygon' | 'base', page: undefined }) })}>
          <option value="all">Todas as redes</option><option value="ethereum">Ethereum</option><option value="polygon">Polygon</option><option value="base">Base</option>
        </select>
      </section>

    </aside>
  )
}
