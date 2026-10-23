import { useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { ethToWei } from '../lib/price'
import type { CatalogSort, NFTNetwork } from '../types/nft'

export function CatalogToolbar() {
  const search = useSearch({ from: '/' })
  const navigate = useNavigate({ from: '/' })
  const [minDraft, setMinDraft] = useState(search.minPrice ?? '')
  const [maxDraft, setMaxDraft] = useState(search.maxPrice ?? '')
  const [previousPrices, setPreviousPrices] = useState(`${search.minPrice ?? ''}|${search.maxPrice ?? ''}`)
  const priceKey = `${search.minPrice ?? ''}|${search.maxPrice ?? ''}`
  if (previousPrices !== priceKey) {
    setPreviousPrices(priceKey)
    setMinDraft(search.minPrice ?? '')
    setMaxDraft(search.maxPrice ?? '')
  }

  const control = 'rounded-lg border border-[#503328] bg-[#2a1914] px-3 py-2 font-mono text-xs text-[#f4ede5] focus-visible:outline-2 focus-visible:outline-[#d38d50]'
  const pricePattern = /^(0|[1-9]\d{0,6})(\.\d{1,18})?$/
  const validMin = minDraft === '' || pricePattern.test(minDraft)
  const validMax = maxDraft === '' || pricePattern.test(maxDraft)
  const validRange = validMin && validMax && (
    !minDraft || !maxDraft || ethToWei(minDraft) <= ethToWei(maxDraft)
  )

  return (
    <div className="hidden flex-wrap items-end gap-3 border-b border-[#3b2a22] pb-4 lg:flex">
      <label className="flex flex-col gap-1 font-mono text-xs text-[#b99872]">
        Ordenar por
        <select className={control} value={search.sort ?? 'recent'}
          onChange={(event) => void navigate({ to: '/', search: (previous) => ({ ...previous,
            sort: event.target.value === 'recent' ? undefined : event.target.value as Exclude<CatalogSort, 'recent'>,
            page: undefined,
          }) })}
        >
          <option value="recent">Mais recentes</option>
          <option value="price_asc">Menor preço</option>
          <option value="price_desc">Maior preço</option>
          <option value="name_asc">Nome A–Z</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 font-mono text-xs text-[#b99872]">
        Rede
        <select className={control} value={search.network ?? 'all'}
          onChange={(event) => void navigate({ to: '/', search: (previous) => ({ ...previous,
            network: event.target.value === 'all' ? undefined : event.target.value as NFTNetwork,
            page: undefined,
          }) })}
        >
          <option value="all">Todas as redes</option>
          <option value="ethereum">Ethereum</option>
          <option value="polygon">Polygon</option>
          <option value="base">Base</option>
        </select>
      </label>
      <form className="flex items-end gap-2" onSubmit={(event) => {
        event.preventDefault()
        if (!validRange) return
        void navigate({ to: '/', search: (previous) => ({ ...previous,
          minPrice: minDraft || undefined, maxPrice: maxDraft || undefined, page: undefined,
        }) })
      }}>
        <label className="flex flex-col gap-1 font-mono text-xs text-[#b99872]">ETH mín.
          <input className={`${control} w-24`} inputMode="decimal" placeholder="0" value={minDraft}
            onChange={(event) => setMinDraft(event.target.value)} aria-invalid={!validMin} />
        </label>
        <label className="flex flex-col gap-1 font-mono text-xs text-[#b99872]">ETH máx.
          <input className={`${control} w-24`} inputMode="decimal" placeholder="10" value={maxDraft}
            onChange={(event) => setMaxDraft(event.target.value)} aria-invalid={!validMax} />
        </label>
        <button disabled={!validRange} type="submit"
          className="rounded-lg bg-[#d38d50] px-3 py-2 font-mono text-xs font-bold text-[#160e0b] disabled:opacity-50"
        >Aplicar</button>
      </form>
      {!validRange && <span role="alert" className="font-mono text-xs text-[#e6a06a]">Confira o intervalo de preço.</span>}
    </div>
  )
}
