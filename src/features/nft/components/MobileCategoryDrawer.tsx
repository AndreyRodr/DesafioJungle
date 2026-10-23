
import { useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { SlidersHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

import {
  nftCategories,
  type NFTCategory,
} from '../constants/categories'

export function MobileCategoryDrawer() {
  const { category } = useSearch({ from: '/' })
  const navigate = useNavigate({ from: '/' })

  const [open, setOpen] = useState(false)
  const [draftCategory, setDraftCategory] = useState<
    NFTCategory | undefined
  >(category)

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraftCategory(category)
    }

    setOpen(nextOpen)
  }

  function handleApply() {
    void navigate({
      to: '/',
      search: (previous) => ({
        ...previous,
        category: draftCategory,
      }),
    })

    setOpen(false)
  }

  return (
    <Drawer
      open={open}
      onOpenChange={handleOpenChange}
      swipeDirection="down"
    >
      <DrawerTrigger
        render={
          <button
            type="button"
            aria-label="Abrir filtros de NFTs"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#d38d50] text-[#160e0b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4ede5]"
          />
        }
      >
        <SlidersHorizontal size={24} aria-hidden="true" />
      </DrawerTrigger>

      <DrawerContent className="flex h-[min(85dvh,720px)] flex-col rounded-t-[28px] border-[#503328] bg-[#21140f] text-[#f4ede5]">
        <DrawerHeader>
          <DrawerTitle className="font-mono text-xl text-[#f4ede5]">
            Filtrar NFTs
          </DrawerTitle>

          <DrawerDescription className="font-mono text-xs text-[#b99872]">
            Escolha uma coleção para explorar.
          </DrawerDescription>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <fieldset className="space-y-2">
            <legend className="mb-4 font-mono text-sm font-bold">
              Coleções
            </legend>

            <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 font-mono text-sm ${
              !draftCategory
                ? 'border-[#d38d50] bg-[#3b261b]'
                : 'border-[#503328]'
            }`}>
              <input
                type="radio"
                name="nft-category"
                checked={!draftCategory}
                onChange={() => setDraftCategory(undefined)}
                className="accent-[#d38d50]"
              />
              Todas as coleções
            </label>

            {nftCategories.map((item) => (
              <label
                key={item.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 font-mono text-sm ${
                  draftCategory === item.id
                    ? 'border-[#d38d50] bg-[#3b261b]'
                    : 'border-[#503328]'
                }`}
              >
                <input
                  type="radio"
                  name="nft-category"
                  checked={draftCategory === item.id}
                  onChange={() => setDraftCategory(item.id)}
                  className="accent-[#d38d50]"
                />
                {item.label}
              </label>
            ))}
          </fieldset>
        </div>

        <DrawerFooter className="border-t border-[#503328]">
          <Button
            onClick={handleApply}
            className="w-full bg-[#d38d50] font-mono font-bold text-[#160e0b] hover:bg-[#e9a465]"
          >
            Aplicar filtros
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
