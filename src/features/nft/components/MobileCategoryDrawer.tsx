import { useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { nftCategories, type NFTCategory } from '../constants/categories'
import type { CatalogSort, NFTNetwork } from '../types/nft'
import { ethToWei } from '../lib/price'

export function MobileCategoryDrawer() {
  const search = useSearch({ from: '/' })
  const navigate = useNavigate({ from: '/' })
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<NFTCategory | undefined>(search.category)
  const [network, setNetwork] = useState<NFTNetwork | undefined>(search.network)
  const [sort, setSort] = useState<CatalogSort>(search.sort ?? 'recent')
  const [minPrice, setMinPrice] = useState(search.minPrice ?? '')
  const [maxPrice, setMaxPrice] = useState(search.maxPrice ?? '')
  const pricePattern = /^(0|[1-9]\d{0,6})(\.\d{1,18})?$/
  const valid = (!minPrice || pricePattern.test(minPrice)) && (!maxPrice || pricePattern.test(maxPrice))
    && (!minPrice || !maxPrice || ethToWei(minPrice) <= ethToWei(maxPrice))

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setCategory(search.category)
      setNetwork(search.network)
      setSort(search.sort ?? 'recent')
      setMinPrice(search.minPrice ?? '')
      setMaxPrice(search.maxPrice ?? '')
    }
    setOpen(nextOpen)
  }

  function apply() {
    if (!valid) return
    void navigate({ to: '/', search: (previous) => ({ ...previous,
      category, network,
      sort: sort === 'recent' ? undefined : sort,
      minPrice: minPrice || undefined, maxPrice: maxPrice || undefined,
      page: undefined,
    }) })
    setOpen(false)
  }

  const field = 'w-full rounded-lg border border-[#503328] bg-[#2a1914] px-3 py-2 font-mono text-sm text-[#f4ede5] focus-visible:outline-2 focus-visible:outline-[#d38d50]'
  return (
    <Drawer open={open} onOpenChange={handleOpenChange} swipeDirection="down">
      <DrawerTrigger render={<button type="button" aria-label="Abrir filtros de NFTs" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#d38d50] text-[#160e0b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4ede5]" />}>
        <SlidersHorizontal size={24} aria-hidden="true" />
      </DrawerTrigger>
      <DrawerContent className="flex h-[min(85dvh,720px)] flex-col rounded-t-[28px] border-[#503328] bg-[#21140f] text-[#f4ede5]">
        <DrawerHeader>
          <DrawerTitle className="font-mono text-xl text-[#f4ede5]">Filtrar NFTs</DrawerTitle>
          <DrawerDescription className="font-mono text-xs text-[#b99872]">Combine categorias, rede, preço e ordenação.</DrawerDescription>
        </DrawerHeader>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <fieldset className="space-y-2">
            <legend className="mb-3 font-mono text-sm font-bold">Coleções</legend>
            <label className={`flex cursor-pointer gap-3 rounded-lg border p-3 font-mono text-sm ${!category ? 'border-[#d38d50] bg-[#3b261b]' : 'border-[#503328]'}`}>
              <input type="radio" name="nft-category" checked={!category} onChange={() => setCategory(undefined)} className="accent-[#d38d50]" />Todas as coleções
            </label>
            {nftCategories.map((item) => <label key={item.id} className={`flex cursor-pointer gap-3 rounded-lg border p-3 font-mono text-sm ${category === item.id ? 'border-[#d38d50] bg-[#3b261b]' : 'border-[#503328]'}`}>
              <input type="radio" name="nft-category" checked={category === item.id} onChange={() => setCategory(item.id)} className="accent-[#d38d50]" />{item.label}
            </label>)}
          </fieldset>
          <label className="block space-y-2 font-mono text-sm">Rede
            <select className={field} value={network ?? 'all'} onChange={(e) => setNetwork(e.target.value === 'all' ? undefined : e.target.value as NFTNetwork)}>
              <option value="all">Todas as redes</option><option value="ethereum">Ethereum</option><option value="polygon">Polygon</option><option value="base">Base</option>
            </select>
          </label>
          <label className="block space-y-2 font-mono text-sm">Ordenação
            <select className={field} value={sort} onChange={(e) => setSort(e.target.value as CatalogSort)}>
              <option value="recent">Mais recentes</option><option value="price_asc">Menor preço</option><option value="price_desc">Maior preço</option><option value="name_asc">Nome A–Z</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-2 font-mono text-sm">Preço mín. (ETH)
              <input className={field} inputMode="decimal" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" />
            </label>
            <label className="space-y-2 font-mono text-sm">Preço máx. (ETH)
              <input className={field} inputMode="decimal" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="10" />
            </label>
          </div>
          {!valid && <p role="alert" className="font-mono text-xs text-[#e6a06a]">Intervalo de preço inválido.</p>}
        </div>
        <DrawerFooter className="border-t border-[#503328]">
          <Button disabled={!valid} onClick={apply} className="w-full bg-[#d38d50] font-mono font-bold text-[#160e0b] hover:bg-[#e9a465]">Aplicar filtros</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
