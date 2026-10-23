import { Link } from '@tanstack/react-router'
import type { CatalogTab } from '../types/nft'

interface CatalogTabsProps { activeTab: CatalogTab }

const tabs: { id: CatalogTab; label: string }[] = [
  { id: 'all', label: 'Todos os NFTs' },
  { id: 'new', label: 'Novos lançamentos' },
  { id: 'trending', label: 'Em alta' },
]

export function CatalogTabs({ activeTab }: CatalogTabsProps) {
  return (
    <nav aria-label="Coleções em destaque" className="flex gap-5 overflow-x-auto whitespace-nowrap font-mono [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => {
        const active = activeTab === tab.id
        return (
          <Link key={tab.id} to="/" search={(previous) => ({
            ...previous, tab: tab.id === 'all' ? undefined : tab.id, page: undefined,
          })}
          aria-current={active ? 'page' : undefined}
          className={`shrink-0 border-b-2 pb-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-[#d38d50] ${active ? 'border-[#d38d50] font-bold text-[#d38d50]' : 'border-transparent text-[#f4ede5] hover:text-[#d38d50]'}`}
          >{tab.label}</Link>
        )
      })}
    </nav>
  )
}
