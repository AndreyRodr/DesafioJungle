import { useMemo, useState, type FormEvent } from 'react'
import { pageShellClass } from '@/components/layout/pageShell'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { WalletCards } from 'lucide-react'
import { multiplyEth, weiToEth } from '@/features/cart/lib/money'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { listWallets } from '@/features/auth/api/auth'
import type { Wallet } from '@/features/auth/types/auth'
import { useCartQuote } from '@/features/cart/hooks/useCart'
import { quoteFingerprint, type CheckoutBuyer, type OrderSnapshot } from '../types/orders'
import { revalidateQuote } from '../api/checkout'
import { findOrderByKey, submitOrder } from '@/features/orders/api/orders'

const field = 'mt-2 w-full rounded border border-[#503328] bg-transparent px-3 py-3 text-sm text-[#f4ede5] focus-visible:outline-2 focus-visible:outline-[#d38d50]'
const providers: { id: OrderSnapshot['walletProvider']; label: string }[] = [
  { id: 'walletconnect', label: 'WalletConnect' },
  { id: 'metamask', label: 'MetaMask' },
  { id: 'coinbase', label: 'Coinbase Wallet' },
]
function getMessage(cause: unknown): string {
  if (isAxiosError<{ message?: string }>(cause)) return cause.response?.data?.message ?? 'Falha de rede. Verifique o pedido antes de tentar novamente.'
  return 'Ocorreu um erro inesperado. Consulte seu pedido antes de tentar novamente.'
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const client = useQueryClient()
  const { user } = useAuth()
  const { data: quote, isPending: loadingQuote, isError: quoteError, refetch: refetchQuote } = useCartQuote()
  const walletsQuery = useQuery({ queryKey: ['wallets', user?.id], queryFn: listWallets, enabled: Boolean(user) })
  const wallets = walletsQuery.data ?? []
  const [slot, setSlot] = useState<'primary' | 'secondary'>('primary')
  const selectedWallet = wallets.find((wallet) => wallet.slot === slot) ?? wallets[0]
  const [provider, setProvider] = useState<OrderSnapshot['walletProvider']>('coinbase')
  const [buyer, setBuyer] = useState<CheckoutBuyer>({ displayName: '', email: '' })
  const [reviewedSignature, setReviewedSignature] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const currentSignature = useMemo(() => quote ? quoteFingerprint(quote) : '', [quote])
  const quoteChanged = reviewedSignature !== currentSignature
  const ready = Boolean(quote?.valid && selectedWallet && reviewedSignature && !quoteChanged)

  async function reviewQuote() {
    setMessage('')
    try {
      const fresh = await revalidateQuote()
      client.setQueriesData({ queryKey: ['cart-quote'] }, fresh)
      if (!fresh.valid) { setReviewedSignature(null); setMessage(fresh.issues.join('; ') || 'Cotação inválida.'); return }
      setReviewedSignature(quoteFingerprint(fresh))
    } catch (cause) { setReviewedSignature(null); setMessage(getMessage(cause)) }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedWallet || !quote || !ready || busy) return
    setBusy(true); setMessage('')
    const fingerprint = quoteFingerprint(quote)
    try {
      // Checagem fresh obrigatória: um preço alterado entre revisão e clique bloqueia a compra.
      const fresh = await revalidateQuote()
      if (!fresh.valid || quoteFingerprint(fresh) !== fingerprint) {
        setReviewedSignature(null)
        await client.invalidateQueries({ queryKey: ['cart-quote'] })
        setMessage('A cotação foi alterada. Revise os valores novamente antes de comprar.')
        return
      }
      const payloadBase = { quoteFingerprint: fingerprint, buyer, walletSlot: selectedWallet.slot, walletProvider: provider, network: selectedWallet.network }
      const pendingKey = `kurio:pending-order:${user?.id}`
      const existing = sessionStorage.getItem(pendingKey)
      const stored = existing ? JSON.parse(existing) as { fingerprint: string; key: string } : null
      const key = stored?.fingerprint === JSON.stringify(payloadBase) ? stored.key : crypto.randomUUID()
      sessionStorage.setItem(pendingKey, JSON.stringify({ fingerprint: JSON.stringify(payloadBase), key }))
      let order
      try { order = await submitOrder({ ...payloadBase, idempotencyKey: key }) }
      catch (cause) {
        if (isAxiosError(cause) && (cause.response?.status === 504 || !cause.response)) {
          order = await findOrderByKey(key)
        } else throw cause
      }
      sessionStorage.removeItem(pendingKey)
      await navigate({ to: '/orders/$orderId', params: { orderId: order.id } })
    } catch (cause) {
      if (isAxiosError(cause) && cause.response?.status === 409) {
        setReviewedSignature(null)
        await client.invalidateQueries({ queryKey: ['cart-quote'] })
      }
      setMessage(getMessage(cause))
    } finally { setBusy(false) }
  }

  const updateBuyer = (fieldName: keyof CheckoutBuyer, value: string) => setBuyer((prev) => ({ ...prev, [fieldName]: value }))
  return <main className={`${pageShellClass} pb-32 pt-6 font-mono text-[#f4ede5] lg:pb-16`}>
    <nav aria-label="Caminho do pagamento" className="mb-6 text-xs font-bold text-[#f4ede5]"><Link to="/" className="hover:text-[#d38d50]">Início</Link> / <Link to="/" hash="catalog" className="hover:text-[#d38d50]">Mercado</Link> / Pagamento</nav>
    <h1 className="sr-only">Pagamento com carteira</h1>
    <form onSubmit={(event) => void submit(event)} className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,0.9fr)] lg:gap-8">
      <section aria-label="Dados do colecionador" className="space-y-5">
        <h2 className="text-base font-bold">Perfil do colecionador</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">Nome de exibição *<input required minLength={2} maxLength={80} className={field} value={buyer.displayName} onChange={e => updateBuyer('displayName', e.target.value)} autoComplete="name" /></label>
          <label className="text-sm">Nome de usuário<input className={field} value={user?.name ?? ''} readOnly /></label>
          <label className="text-sm">E-mail *<input required type="email" className={field} value={buyer.email} onChange={e => updateBuyer('email', e.target.value)} autoComplete="email" /></label>
          <label className="text-sm">Rede selecionada<input readOnly className={field} value={selectedWallet?.network ?? 'Cadastre uma carteira'} /></label>
        </div>
        <h2 className="pt-2 text-base font-bold">Carteira conectada</h2>
        {walletsQuery.isPending ? <div className="nft-shimmer h-28 rounded" role="status" aria-label="Carregando carteiras"/> : walletsQuery.isError ? <p role="alert">Falha ao carregar carteiras. <button type="button" onClick={() => void walletsQuery.refetch()} className="underline">Tentar novamente</button></p> : wallets.length === 0 ? <p className="rounded-lg border border-[#503328] bg-[#251711] p-5 text-sm">Nenhuma carteira cadastrada. <Link to="/wallets" className="text-[#d38d50] underline">Cadastrar carteira</Link></p> : <fieldset className="space-y-3"><legend className="sr-only">Selecionar carteira</legend>{wallets.map((w: Wallet) => <label key={w.slot} className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 ${selectedWallet?.slot === w.slot ? 'border-[#d38d50]' : 'border-[#503328]'} bg-[#251711]`}><input type="radio" name="wallet" checked={selectedWallet?.slot === w.slot} onChange={() => { setSlot(w.slot); setReviewedSignature(null) }} className="accent-[#d38d50]"/><WalletCards size={24} className="text-[#d38d50]"/><span className="min-w-0"><strong className="block">{w.label}</strong><span className="block truncate text-xs text-[#b99872]">{w.address} · {w.network}</span></span></label>)}</fieldset>}
        <div><Link to="/wallets" className="text-sm text-[#d38d50] underline">Trocar ou cadastrar carteira</Link></div>
        <label className="block text-sm">Observações do colecionador (opcional)<textarea className={`${field} min-h-24 resize-y`} maxLength={500} value={buyer.notes ?? ''} onChange={e => updateBuyer('notes', e.target.value)}/></label>
      </section>
      <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start" aria-label="Resumo do pagamento">
        <section><h2 className="border-b border-[#503328] pb-3 text-base font-bold">Seus NFTs</h2>{loadingQuote ? <div role="status" className="nft-shimmer mt-4 h-44 rounded" aria-label="Carregando resumo"/> : quoteError ? <button type="button" onClick={() => void refetchQuote()} className="mt-4 text-red-300 underline">Falha ao buscar cotação. Tentar novamente</button> : !quote?.items.length ? <p className="mt-5 text-sm">Seu carrinho está vazio. <Link to="/" className="text-[#d38d50] underline">Explorar</Link></p> : <div className="mt-3 space-y-2"><div className="flex justify-between border-b border-[#503328] pb-2 text-xs"><span>NFTs</span><span>Subtotal</span></div>{quote.items.map(item => <div key={item.key} className="flex items-center gap-2 bg-[#251711] p-2"><img src={item.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded object-cover"/><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{item.name}</p><p className="text-[11px] text-[#b99872]">{item.editionLabel} (x {item.quantity})</p></div><span className="shrink-0 text-xs font-bold text-[#d38d50]">{weiToEth(multiplyEth(item.unitPriceEth, item.quantity))} ETH</span></div>)}</div>}</section>
        {quote && <section className="space-y-3 text-sm"><p className="text-center text-xs text-[#b99872]">Tem um código promocional? <Link to="/cart" className="text-[#f4ede5] underline">Aplique aqui</Link></p><div className="flex justify-between gap-2"><span>Subtotal</span><span>{quote.subtotalEth} ETH</span></div><div className="flex justify-between gap-2"><span>Desconto</span><span>− {quote.discountEth} ETH</span></div><div className="flex justify-between gap-2"><span>Taxa da rede</span><span>{quote.networkFeeEth} ETH</span></div><div className="flex justify-between gap-2 border-t border-[#503328] pt-4 text-lg font-bold"><span>Total</span><span className="text-[#d38d50]">{quote.totalEth} ETH</span></div>{!quote.valid && <p role="alert" className="text-red-300">{quote.issues.join('; ') || 'Carrinho inválido.'}</p>}</section>}
        <fieldset><legend className="mb-3 text-center text-sm font-bold">Carteira e rede</legend><div className="space-y-2">{providers.map(item => <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded border border-[#503328] p-3"><input type="radio" name="provider" className="accent-[#d38d50]" checked={provider === item.id} onChange={() => { setProvider(item.id); setReviewedSignature(null) }}/>{item.label}</label>)}</div></fieldset>
        {message && <p role="alert" className="text-sm text-red-300">{message}</p>}
        {quote && quoteChanged && <p role="status" className="text-sm text-[#d38d50]">Antes de comprar, confirme a cotação mais recente da API.</p>}
        <button type="button" onClick={() => void reviewQuote()} disabled={!quote?.valid || busy} className="w-full rounded border border-[#d38d50] px-5 py-3 text-sm font-bold text-[#d38d50] disabled:opacity-50">{quoteChanged ? 'Revisar valores atualizados' : 'Revalidar cotação'}</button>
        <button type="submit" disabled={!ready || busy} className="w-full rounded-sm bg-[#d38d50] px-5 py-3 font-bold text-[#160e0b] disabled:opacity-40">{busy ? 'Processando...' : 'Confirmar compra'}</button>
        <p className="text-center text-xs text-[#b99872]">Operação simulada. Nenhuma transação blockchain real será enviada.</p>
      </aside>
    </form>
  </main>
}
