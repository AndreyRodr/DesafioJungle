import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { ArrowLeft, MoreVertical, WalletCards } from 'lucide-react'
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
const walletNetworkLabel: Record<Wallet['network'], string> = {
  ethereum: 'Ethereum',
  polygon: 'Polygon',
  base: 'Base',
}
const truncateWalletAddress = (address: string) =>
  address.length > 22 ? `${address.slice(0, 8)}…${address.slice(-4)}` : address

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
  const [showBuyerOnMobile, setShowBuyerOnMobile] = useState(false)
  useEffect(() => {
    if (!user) return
    setBuyer((previous) => ({
      ...previous,
      displayName: previous.displayName || user.name,
      email: previous.email || user.email,
    }))
  }, [user])
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
  return <main className="mx-auto max-w-7xl px-5 pb-[calc(9rem+env(safe-area-inset-bottom))] pt-6 font-mono text-[#f4ede5] lg:px-8 lg:pb-16">
    <Link to="/cart" className="hidden items-center gap-2 text-sm text-[#d38d50] lg:inline-flex"><ArrowLeft size={17}/> Voltar ao carrinho</Link>
    <h1 className="mt-5 hidden text-2xl font-bold lg:block lg:text-3xl">Pagamento com carteira</h1>
    <div className="flex items-center gap-4 lg:hidden">
      <Link to="/cart" aria-label="Voltar ao carrinho" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#503328] bg-[#302018] text-[#b99872] focus-visible:outline-2 focus-visible:outline-[#d38d50]"><ArrowLeft size={22} aria-hidden="true"/></Link>
      <h1 className="text-lg font-bold leading-tight sm:text-2xl">Pagamento com carteira</h1>
    </div>
    <form onSubmit={(event) => void submit(event)} className="mt-8 grid gap-9 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12">
      <section aria-label="Carteiras no mobile" className="space-y-8 lg:hidden">
        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold sm:text-xl">Carteira conectada</h2>
            <Link to="/wallets" className="shrink-0 text-sm font-bold text-[#d38d50] underline-offset-4 hover:underline">Trocar carteira</Link>
          </div>
          {walletsQuery.isPending ? (
            <div className="nft-shimmer h-28 rounded-3xl" role="status" aria-label="Carregando carteiras"/>
          ) : walletsQuery.isError ? (
            <p role="alert" className="rounded-2xl bg-[#251711] p-5 text-sm">Falha ao carregar carteiras. <button type="button" onClick={() => void walletsQuery.refetch()} className="text-[#d38d50] underline">Tentar novamente</button></p>
          ) : wallets.length === 0 ? (
            <p className="rounded-3xl bg-[#251711] p-5 text-sm">Nenhuma carteira cadastrada. <Link to="/wallets" className="text-[#d38d50] underline">Cadastrar carteira</Link></p>
          ) : (
            <fieldset className="space-y-4">
              <legend className="sr-only">Selecionar carteira</legend>
              {wallets.map((wallet: Wallet) => (
                <label key={wallet.slot} className={`flex min-h-28 cursor-pointer items-center gap-4 rounded-3xl border px-5 py-5 shadow-sm focus-within:ring-2 focus-within:ring-[#d38d50] ${selectedWallet?.slot === wallet.slot ? 'border-[#6d4730]' : 'border-transparent'} bg-[#251711]`}>
                  <input type="radio" name="wallet-mobile" checked={selectedWallet?.slot === wallet.slot} onChange={() => { setSlot(wallet.slot); setReviewedSignature(null) }} className="size-5 shrink-0 accent-[#d38d50]" />
                  <span className="min-w-0 flex-1">
                    <strong className="block text-lg font-bold">{wallet.label}</strong>
                    <span className="mt-1 block truncate text-sm text-[#b99872]">{truncateWalletAddress(wallet.address)}</span>
                    <span className="mt-1 block text-xs text-[#b99872]">Rede {walletNetworkLabel[wallet.network]}</span>
                  </span>
                  <MoreVertical size={20} aria-hidden="true" className="shrink-0 text-[#b99872]"/>
                </label>
              ))}
            </fieldset>
          )}
        </div>
        <fieldset>
          <legend className="mb-4 text-lg font-bold sm:text-xl">Carteira e rede</legend>
          <div className="space-y-4">
            {providers.map((item) => (
              <label key={item.id} className={`flex min-h-20 cursor-pointer items-center gap-4 rounded-3xl border px-5 py-4 focus-within:ring-2 focus-within:ring-[#d38d50] ${provider === item.id ? 'border-[#6d4730]' : 'border-transparent'} bg-[#251711]`}>
                <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-full border border-[#503328] bg-[#302018] text-lg font-bold text-[#d38d50]">{item.id === 'walletconnect' ? 'W' : item.id === 'metamask' ? 'M' : <WalletCards size={23}/>}</span>
                <span className="min-w-0 flex-1 text-base">{item.label}</span>
                <input type="radio" name="provider-mobile" className="size-5 shrink-0 accent-[#d38d50]" checked={provider === item.id} onChange={() => { setProvider(item.id); setReviewedSignature(null) }} />
              </label>
            ))}
          </div>
        </fieldset>
        <button type="button" aria-controls="mobile-buyer-fields" aria-expanded={showBuyerOnMobile} onClick={() => setShowBuyerOnMobile((current) => !current)} className="text-left text-sm text-[#b99872] underline decoration-[#503328] underline-offset-4 focus-visible:outline-2 focus-visible:outline-[#d38d50]">
          {showBuyerOnMobile ? 'Ocultar dados do colecionador' : 'Editar dados do colecionador'}
        </button>
      </section>
      <section id="mobile-buyer-fields" aria-label="Dados do colecionador" className={`${showBuyerOnMobile ? 'block' : 'hidden'} space-y-6 lg:block`}>
        <h2 className="text-lg font-bold">Perfil do colecionador</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm">Nome de exibição *<input required minLength={2} maxLength={80} className={field} value={buyer.displayName} onChange={e => updateBuyer('displayName', e.target.value)} autoComplete="name" /></label>
          <label className="text-sm">Nome de usuário<input className={field} value={user?.name ?? ''} readOnly /></label>
          <label className="text-sm">E-mail *<input required type="email" className={field} value={buyer.email} onChange={e => updateBuyer('email', e.target.value)} autoComplete="email" /></label>
          <label className="text-sm">Rede selecionada<input readOnly className={field} value={selectedWallet?.network ?? 'Cadastre uma carteira'} /></label>
        </div>
        <h2 className="pt-2 text-lg font-bold">Carteira conectada</h2>
        {walletsQuery.isPending ? <div className="nft-shimmer h-28 rounded" role="status" aria-label="Carregando carteiras"/> : walletsQuery.isError ? <p role="alert">Falha ao carregar carteiras. <button type="button" onClick={() => void walletsQuery.refetch()} className="underline">Tentar novamente</button></p> : wallets.length === 0 ? <p className="rounded-lg border border-[#503328] bg-[#251711] p-5 text-sm">Nenhuma carteira cadastrada. <Link to="/wallets" className="text-[#d38d50] underline">Cadastrar carteira</Link></p> : <fieldset className="space-y-3"><legend className="sr-only">Selecionar carteira</legend>{wallets.map((w: Wallet) => <label key={w.slot} className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 ${selectedWallet?.slot === w.slot ? 'border-[#d38d50]' : 'border-[#503328]'} bg-[#251711]`}><input type="radio" name="wallet" checked={selectedWallet?.slot === w.slot} onChange={() => { setSlot(w.slot); setReviewedSignature(null) }} className="accent-[#d38d50]"/><WalletCards size={24} className="text-[#d38d50]"/><span className="min-w-0"><strong className="block">{w.label}</strong><span className="block truncate text-xs text-[#b99872]">{w.address} · {w.network}</span></span></label>)}</fieldset>}
        <div><Link to="/wallets" className="text-sm text-[#d38d50] underline">Trocar ou cadastrar carteira</Link></div>
        <label className="block text-sm">Observações do colecionador (opcional)<textarea className={`${field} min-h-24 resize-y`} maxLength={500} value={buyer.notes ?? ''} onChange={e => updateBuyer('notes', e.target.value)}/></label>
      </section>
      <aside className="hidden space-y-6 lg:sticky lg:top-6 lg:block lg:self-start" aria-label="Resumo do pagamento">
        <section><h2 className="border-b border-[#503328] pb-3 text-lg font-bold">Seus NFTs</h2>{loadingQuote ? <div role="status" className="nft-shimmer mt-4 h-44 rounded" aria-label="Carregando resumo"/> : quoteError ? <button type="button" onClick={() => void refetchQuote()} className="mt-4 text-red-300 underline">Falha ao buscar cotação. Tentar novamente</button> : !quote?.items.length ? <p className="mt-5 text-sm">Seu carrinho está vazio. <Link to="/" className="text-[#d38d50] underline">Explorar</Link></p> : <div className="mt-3 space-y-2">{quote.items.map(item => <div key={item.key} className="flex items-center gap-3 bg-[#251711] p-2"><img src={item.imageUrl} alt="" className="h-16 w-16 shrink-0 rounded object-cover"/><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{item.name}</p><p className="text-xs text-[#b99872]">{item.editionLabel} × {item.quantity}</p></div><span className="shrink-0 text-sm font-bold text-[#d38d50]">{item.unitPriceEth} ETH</span></div>)}</div>}</section>
        {quote && <section className="space-y-3 text-sm"><div className="flex justify-between gap-2"><span>Subtotal</span><span>{quote.subtotalEth} ETH</span></div><div className="flex justify-between gap-2"><span>Desconto</span><span>− {quote.discountEth} ETH</span></div><div className="flex justify-between gap-2"><span>Taxa da rede</span><span>{quote.networkFeeEth} ETH</span></div><div className="flex justify-between gap-2 border-t border-[#503328] pt-4 text-lg font-bold"><span>Total</span><span className="text-[#d38d50]">{quote.totalEth} ETH</span></div>{!quote.valid && <p role="alert" className="text-red-300">{quote.issues.join('; ') || 'Carrinho inválido.'}</p>}</section>}
        <fieldset><legend className="mb-3 text-sm font-bold">Carteira e rede (simulação)</legend><div className="space-y-2">{providers.map(item => <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded border border-[#503328] p-3"><input type="radio" name="provider" className="accent-[#d38d50]" checked={provider === item.id} onChange={() => { setProvider(item.id); setReviewedSignature(null) }}/>{item.label}</label>)}</div></fieldset>
        {message && <p role="alert" className="text-sm text-red-300">{message}</p>}
        {quote && quoteChanged && <p role="status" className="text-sm text-[#d38d50]">Antes de comprar, confirme a cotação mais recente da API.</p>}
        <button type="button" onClick={() => void reviewQuote()} disabled={!quote?.valid || busy} className="w-full rounded border border-[#d38d50] px-5 py-3 text-sm font-bold text-[#d38d50] disabled:opacity-50">{quoteChanged ? 'Revisar valores atualizados' : 'Revalidar cotação'}</button>
        <button type="submit" disabled={!ready || busy} className="w-full rounded-lg bg-[#d38d50] px-5 py-4 font-bold text-[#160e0b] disabled:opacity-40">{busy ? 'Processando...' : 'Confirmar compra'}</button>
        <p className="text-center text-xs text-[#b99872]">Operação simulada. Nenhuma transação blockchain real será enviada.</p>
      </aside>
      <section aria-label="Resumo do pagamento no mobile" className="space-y-5 lg:hidden">
        {loadingQuote ? <div role="status" aria-label="Carregando resumo" className="nft-shimmer h-14 rounded-xl"/> : quoteError ? <button type="button" onClick={() => void refetchQuote()} className="text-sm text-red-300 underline">Falha ao buscar cotação. Tentar novamente</button> : quote && (
          <div>
            <div className="flex items-baseline justify-end gap-3 border-t border-[#503328] pt-5 text-lg font-bold">
              <span>Total:</span><span className="text-[#d38d50]">{quote.totalEth} ETH</span>
            </div>
            {!quote.valid && <p role="alert" className="mt-3 text-sm text-red-300">{quote.issues.join('; ') || 'Carrinho inválido.'}</p>}
            <details className="mt-3 text-right text-xs text-[#b99872]">
              <summary className="cursor-pointer underline underline-offset-4">Detalhes do valor</summary>
              <div className="mt-3 space-y-2 text-sm">
                <p className="flex justify-between"><span>Subtotal</span><span>{quote.subtotalEth} ETH</span></p>
                <p className="flex justify-between"><span>Desconto</span><span>− {quote.discountEth} ETH</span></p>
                <p className="flex justify-between"><span>Taxa da rede</span><span>{quote.networkFeeEth} ETH</span></p>
              </div>
            </details>
          </div>
        )}
        {message && <p role="alert" className="text-sm text-red-300">{message}</p>}
        {quoteChanged && quote?.valid && <button type="button" onClick={() => void reviewQuote()} disabled={busy} className="w-full rounded-full border border-[#d38d50] px-5 py-3 text-sm font-bold text-[#d38d50] disabled:opacity-50">Revisar valores atualizados</button>}
        <p className="text-center text-xs text-[#b99872]">Pagamento simulado. Nenhuma transação real será enviada.</p>
      </section>
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#302018] bg-[#160e0b] px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] lg:hidden">
        <button type="submit" disabled={!ready || busy} className="mx-auto block min-h-16 w-full max-w-xl rounded-full bg-[#d38d50] px-5 py-4 text-base font-bold text-[#160e0b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4ede5] disabled:opacity-40">
          {busy ? 'Processando...' : 'Confirmar compra'}
        </button>
      </div>
    </form>
  </main>
}
