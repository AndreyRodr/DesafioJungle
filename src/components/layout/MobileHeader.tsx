import { MobileCategoryDrawer } from '@/features/nft/components/MobileCategoryDrawer'
import { CatalogSearchInput } from '@/features/nft/components/CatalogSearchInput'

export function MobileHeader() {
  return (
    <header className="bg-[#160e0b] px-5 py-5 lg:hidden">
      <div className="mx-auto flex max-w-xl items-center gap-3">
        <CatalogSearchInput />
        <MobileCategoryDrawer />
      </div>
    </header>
  )
}
