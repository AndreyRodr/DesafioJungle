import { useEffect, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Search } from 'lucide-react'

interface CatalogSearchInputProps { compact?: boolean; autoFocus?: boolean }

export function CatalogSearchInput({ compact = false, autoFocus = false }: CatalogSearchInputProps) {
  const { q } = useSearch({ from: '/' })
  const navigate = useNavigate({ from: '/' })
  const [draft, setDraft] = useState(q ?? '')

  // Mantém o campo sincronizado com Voltar/Avançar e links externos.
  useEffect(() => {
    const timer = window.setTimeout(() => setDraft(q ?? ''), 0)
    return () => window.clearTimeout(timer)
  }, [q])

  useEffect(() => {
    const normalized = draft.trim()
    if (normalized === (q ?? '')) return
    const timer = window.setTimeout(() => {
      void navigate({ to: '/', replace: true, search: (previous) => ({
        ...previous, q: normalized || undefined, page: undefined,
      }) })
    }, 350)
    return () => window.clearTimeout(timer)
  }, [draft, q, navigate])

  return (
    <label className={`flex min-w-0 items-center gap-3 rounded-2xl bg-[#2a1914] px-4 focus-within:ring-2 focus-within:ring-[#d38d50] ${compact ? 'h-11 w-80' : 'h-14 min-w-0 flex-1'}`}>
      <Search size={20} className="shrink-0 text-[#b99872]" aria-hidden="true" />
      <span className="sr-only">Buscar NFTs pelo nome</span>
      <input autoFocus={autoFocus} type="search" value={draft} maxLength={100}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Explorar coleções" aria-label="Buscar NFTs pelo nome"
        className="w-full min-w-0 bg-transparent font-mono text-sm text-[#f4ede5] placeholder:text-[#b99872] outline-none"
      />
    </label>
  )
}
