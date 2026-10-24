import { Link } from '@tanstack/react-router'
import { Activity, BadgePercent, CircleHelp, Download, Heart, LogOut, UserRound, WalletCards } from 'lucide-react'
import { useAuthActions } from '@/features/auth/hooks/useAuth'

type Section = 'profile' | 'wallets'

const activeClass = 'flex items-center gap-3 border-l-4 border-[#d38d50] bg-[#2c1b15] px-4 py-3 text-sm font-medium text-[#d38d50]'
const inactiveClass = 'flex items-center gap-3 border-l-4 border-transparent px-4 py-3 text-sm text-[#d38d50] hover:bg-[#302018] focus-visible:outline-2 focus-visible:outline-[#d38d50]'
const disabledClass = 'flex cursor-not-allowed items-center gap-3 px-5 py-3 text-sm text-[#8d735e] opacity-70'

export function ProfileSidebar({ active }: { active: Section }) {
  const { logout } = useAuthActions()
  async function signOut() {
    try { await logout() } finally { window.location.assign('/') }
  }

  return (
    <>
      <nav aria-label="Área do colecionador" className="mb-6 flex gap-2 overflow-x-auto border-b border-[#503328] pb-3 font-mono text-sm lg:hidden">
        <Link to="/profile" aria-current={active === 'profile' ? 'page' : undefined} className={active === 'profile' ? 'whitespace-nowrap rounded bg-[#d38d50] px-4 py-2 font-bold text-[#160e0b]' : 'whitespace-nowrap rounded px-4 py-2 text-[#d38d50]'}>Meu perfil</Link>
        <Link to="/wallets" aria-current={active === 'wallets' ? 'page' : undefined} className={active === 'wallets' ? 'whitespace-nowrap rounded bg-[#d38d50] px-4 py-2 font-bold text-[#160e0b]' : 'whitespace-nowrap rounded px-4 py-2 text-[#d38d50]'}>Carteiras</Link>
        <Link to="/favorites" className="whitespace-nowrap rounded px-4 py-2 text-[#d38d50]">Favoritos</Link>
      </nav>
      <aside className="hidden h-fit bg-[#251711] font-mono text-[#f4ede5] lg:block" aria-label="Menu do colecionador">
        <h2 className="px-4 pb-2 pt-5 text-lg font-bold">Meu perfil</h2>
        <nav aria-label="Minha conta">
          <Link to="/profile" aria-current={active === 'profile' ? 'page' : undefined} className={active === 'profile' ? activeClass : inactiveClass}><UserRound size={18}/> Dados do perfil</Link>
          <Link to="/wallets" aria-current={active === 'wallets' ? 'page' : undefined} className={active === 'wallets' ? activeClass : inactiveClass}><WalletCards size={18}/> Carteiras</Link>
          <span aria-disabled="true" title="Fora do escopo do desafio" className={disabledClass}><Activity size={18}/> Atividade</span>
          <Link to="/favorites" className={inactiveClass}><Heart size={18}/> Lista de interesses</Link>
          <span aria-disabled="true" title="Fora do escopo do desafio" className={disabledClass}><BadgePercent size={18}/> Ofertas</span>
          <span aria-disabled="true" title="Fora do escopo do desafio" className={disabledClass}><Download size={18}/> Arquivos baixados</span>
          <span aria-disabled="true" title="Fora do escopo do desafio" className={disabledClass}><CircleHelp size={18}/> Suporte</span>
          <div className="mt-1 border-t border-[#503328]">
            <button type="button" onClick={() => void signOut()} className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm font-semibold text-[#d38d50] hover:bg-[#302018] focus-visible:outline-2 focus-visible:outline-[#d38d50]"><LogOut size={18}/> Sair</button>
          </div>
        </nav>
      </aside>
    </>
  )
}
