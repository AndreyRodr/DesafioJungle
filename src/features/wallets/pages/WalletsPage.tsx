import { useState, type FormEvent } from 'react'
import { pageShellClass } from '@/components/layout/pageShell'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listWallets, saveWallet } from '@/features/auth/api/auth'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { actionClass, fieldClass } from '@/features/auth/components/AuthLayout'
import { apiErrorMessage } from '@/features/auth/lib/errors'
import type { Wallet, WalletNetwork } from '@/features/auth/types/auth'
import { ProfileSidebar } from '@/features/profile/components/ProfileSidebar'

function WalletForm({ slot, current }: { slot: 'primary' | 'secondary'; current?: Wallet }) {
  const client = useQueryClient()
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const mutation = useMutation({ mutationFn: saveWallet, onSuccess: () => client.invalidateQueries({ queryKey: ['wallets', user?.id] }) })
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setMessage('')
    const data = new FormData(event.currentTarget)
    try { await mutation.mutateAsync({ slot, label: String(data.get('label') ?? ''), address: String(data.get('address') ?? ''), network: String(data.get('network') ?? 'ethereum') as WalletNetwork }); setMessage('Carteira salva com sucesso.') }
    catch (cause) { setError(apiErrorMessage(cause)) }
  }
  return <section className="border-b border-[#503328] pb-9 lg:border-none lg:bg-transparent lg:p-0">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">Carteira {slot === 'primary' ? 'principal' : 'secundária'}</h2><span className="text-sm font-bold text-[#d38d50]">{current ? 'Alterar' : 'Adicionar'}</span></div>
    {slot === 'primary' && <p className="mt-1 text-xs text-[#b99872]">Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.</p>}
    <form onSubmit={(event) => void submit(event)} className="mt-7 grid gap-x-7 gap-y-5 sm:grid-cols-2">
      <div><label htmlFor={`${slot}-label`} className="text-sm">Apelido da carteira <span className="text-[#d38d50]">*</span></label><input id={`${slot}-label`} className={fieldClass} required minLength={2} maxLength={40} name="label" defaultValue={current?.label ?? ''} /></div>
      <div><label htmlFor={`${slot}-address`} className="text-sm">Endereço da carteira <span className="text-[#d38d50]">*</span></label><input id={`${slot}-address`} className={fieldClass} required pattern="0x[a-fA-F0-9]{40}" title="0x seguido de 40 dígitos hexadecimais" name="address" defaultValue={current?.address ?? ''} placeholder="0x..." /></div>
      <div><label htmlFor={`${slot}-network`} className="text-sm">Rede <span className="text-[#d38d50]">*</span></label><select id={`${slot}-network`} className={fieldClass} name="network" defaultValue={current?.network ?? 'ethereum'}><option value="ethereum">Ethereum</option><option value="polygon">Polygon</option><option value="base">Base</option></select></div>
      <p className="col-span-full text-xs leading-5 text-[#b99872]">A carteira é simulada: nenhuma extensão ou blockchain será conectada.</p>
      <button className={actionClass + " sm:w-fit"} type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Salvando...' : 'Salvar carteira'}</button>
      {message && <p role="status" className="col-span-full text-sm text-[#d38d50]">{message}</p>}
      {error && <p role="alert" className="col-span-full text-sm text-red-300">{error}</p>}
    </form>
  </section>
}
export function WalletsPage() {
  const { user } = useAuth()
  const { data, isPending, isError, refetch } = useQuery({ queryKey: ['wallets', user?.id], queryFn: listWallets, enabled: Boolean(user) })
  return <div className={`${pageShellClass} pb-32 pt-8 font-mono text-[#f4ede5] lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8 lg:pb-16`}>
    <ProfileSidebar active="wallets" />
    <main className="min-w-0">

    {isPending ? <p role="status" className="mt-7">Carregando carteiras...</p> : isError ? <p role="alert" className="mt-7">Falha ao buscar carteiras. <button type="button" onClick={() => void refetch()} className="text-[#d38d50] underline">Tentar novamente</button></p> : <div className="grid gap-9"><WalletForm key="primary" slot="primary" current={data?.find((w) => w.slot === 'primary')} /><WalletForm key="secondary" slot="secondary" current={data?.find((w) => w.slot === 'secondary')} /></div>}
    </main>
  </div>
}
