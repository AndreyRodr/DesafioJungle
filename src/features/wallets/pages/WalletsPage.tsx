import { useState, type FormEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listWallets, saveWallet } from '@/features/auth/api/auth'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { actionClass, fieldClass } from '@/features/auth/components/AuthLayout'
import { apiErrorMessage } from '@/features/auth/lib/errors'
import type { Wallet, WalletNetwork } from '@/features/auth/types/auth'

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
  return <section className="rounded-xl border border-[#503328] bg-[#251711] p-6">
    <h2 className="text-xl font-bold">Carteira {slot === 'primary' ? 'principal' : 'secundária'}</h2>
    <form onSubmit={(event) => void submit(event)} className="mt-5 space-y-5">
      <div><label htmlFor={`${slot}-label`} className="text-sm">Apelido</label><input id={`${slot}-label`} className={fieldClass} required minLength={2} maxLength={40} name="label" defaultValue={current?.label ?? ''} /></div>
      <div><label htmlFor={`${slot}-address`} className="text-sm">Endereço EVM</label><input id={`${slot}-address`} className={fieldClass} required pattern="0x[a-fA-F0-9]{40}" title="0x seguido de 40 dígitos hexadecimais" name="address" defaultValue={current?.address ?? ''} placeholder="0x..." /></div>
      <div><label htmlFor={`${slot}-network`} className="text-sm">Rede</label><select id={`${slot}-network`} className={fieldClass} name="network" defaultValue={current?.network ?? 'ethereum'}><option value="ethereum">Ethereum</option><option value="polygon">Polygon</option><option value="base">Base</option></select></div>
      <p className="text-xs leading-5 text-[#b99872]">A carteira é apenas simulada: nenhuma extensão ou blockchain será conectada.</p>
      <button className={actionClass} type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Salvando...' : 'Salvar carteira'}</button>
      {message && <p role="status" className="text-sm text-[#d38d50]">{message}</p>}
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    </form>
  </section>
}
export function WalletsPage() {
  const { user } = useAuth()
  const { data, isPending, isError, refetch } = useQuery({ queryKey: ['wallets', user?.id], queryFn: listWallets, enabled: Boolean(user) })
  return <main className="mx-auto max-w-5xl px-5 pb-32 pt-10 font-mono text-[#f4ede5] lg:pb-16">
    <Link to="/profile" className="text-sm text-[#d38d50]">← Voltar ao perfil</Link>
    <h1 className="mt-5 text-3xl font-bold">Minhas carteiras</h1>
    <p className="mt-2 text-sm text-[#b99872]">Gerencie os endereços para o checkout simulado.</p>
    {isPending ? <p role="status" className="mt-7">Carregando carteiras...</p> : isError ? <p role="alert" className="mt-7">Falha ao buscar carteiras. <button type="button" onClick={() => void refetch()} className="text-[#d38d50] underline">Tentar novamente</button></p> : <div className="mt-8 grid gap-6 lg:grid-cols-2"><WalletForm key={`primary:${data?.find((w) => w.slot === 'primary')?.address ?? 'none'}`} slot="primary" current={data?.find((w) => w.slot === 'primary')} /><WalletForm key={`secondary:${data?.find((w) => w.slot === 'secondary')?.address ?? 'none'}`} slot="secondary" current={data?.find((w) => w.slot === 'secondary')} /></div>}
  </main>
}
