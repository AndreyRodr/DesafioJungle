import { useNavigate } from '@tanstack/react-router'
import { Heart } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useFavorites, useFavoriteActions } from '../hooks/useFavorites'
import { apiErrorMessage } from '@/features/auth/lib/errors'
export function FavoriteButton({ nftId, className = '' }: { nftId: string; className?: string }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data, isPending } = useFavorites()
  const mutation = useFavoriteActions()
  const active = data?.includes(nftId) ?? false
  async function toggle() {
    if (!user) { await navigate({ to: '/login', search: { redirect: window.location.pathname } }); return }
    if (mutation.isPending || isPending) return
    try { await mutation.mutateAsync({ id: nftId, favorite: !active }) } catch { /* exibir erro acessível */ }
  }
  return <div className={className}>
    <button type="button" disabled={mutation.isPending || (Boolean(user) && isPending)} onClick={() => void toggle()}
      aria-label={active ? 'Remover dos favoritos' : 'Adicionar aos favoritos'} aria-pressed={active}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#6c4935] bg-[#251711] text-[#d38d50] shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60">
      <Heart size={19} fill={active ? 'currentColor' : 'none'} aria-hidden="true" />
    </button>
    {mutation.isError && <p role="alert" className="mt-1 max-w-40 text-xs text-red-300">{apiErrorMessage(mutation.error)}</p>}
  </div>
}
