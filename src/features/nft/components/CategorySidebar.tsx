
import { Link } from '@tanstack/react-router'
import {
  nftCategories,
  type NFTCategory,
} from '../constants/categories'

interface CategorySidebarProps {
  activeCategory?: NFTCategory
}

export function CategorySidebar({
  activeCategory,
}: CategorySidebarProps) {
  const baseClass =
    'block rounded-sm py-2 text-sm transition-colors hover:text-[#d38d50] focus-visible:outline-2 focus-visible:outline-[#d38d50]'

  return (
    <aside className="hidden w-56 shrink-0 self-start bg-[#2a1914] p-5 font-mono lg:block">
      <h3 className="mb-3 font-bold text-[#f4ede5]">
        Coleções
      </h3>

      <nav aria-label="Categorias de NFTs" className="space-y-1">
        <Link
          to="/"
          search={(previous) => ({
            ...previous,
            category: undefined,
          })}
          aria-current={!activeCategory ? 'page' : undefined}
          className={`${baseClass} ${
            !activeCategory
              ? 'font-bold text-[#d38d50]'
              : 'text-[#b99872]'
          }`}
        >
          Todas as coleções
        </Link>

        {nftCategories.map((category) => {
          const isActive = activeCategory === category.id

          return (
            <Link
              key={category.id}
              to="/"
              search={(previous) => ({
                ...previous,
                category: category.id,
              })}
              aria-current={isActive ? 'page' : undefined}
              className={`${baseClass} ${
                isActive
                  ? 'font-bold text-[#d38d50]'
                  : 'text-[#b99872]'
              }`}
            >
              {category.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
