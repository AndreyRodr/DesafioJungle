import { useMemo, useState, type FormEvent } from 'react'
import { pageShellClass } from '@/components/layout/pageShell'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { ArrowLeft, MoreVertical, WalletCards } from 'lucide-react'
import { multiplyEth, weiToEth } from '@/features/cart/lib/money'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { listWallets } from '@/features/auth/api/auth'
import type { Wallet, WalletNetwork } from '@/features/auth/types/auth'
import { useCartQuote } from '@/features/cart/hooks/useCart'
import { quoteFingerprint, type CheckoutBuyer, type OrderSnapshot } from '../types/orders'
import { revalidateQuote } from '../api/checkout'
import { findOrderByKey, submitOrder } from '@/features/orders/api/orders'

const field = 'kurio-checkout-field'
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
  const [networkChoice, setNetworkChoice] = useState<WalletNetwork | ''>('')
  const effectiveNetwork = networkChoice || selectedWallet?.network || ''
  const networkMatchesWallet = Boolean(selectedWallet && effectiveNetwork === selectedWallet.network)
  function chooseNetwork(value: WalletNetwork | '') {
    setNetworkChoice(value)
    const matchingWallet = wallets.find(wallet => wallet.network === value)
    if (matchingWallet) setSlot(matchingWallet.slot)
    setReviewedSignature(null)
  }
  function chooseWallet(wallet: Wallet) {
    setSlot(wallet.slot)
    setNetworkChoice(wallet.network)
    setReviewedSignature(null)
  }
  const [ensPrefix, setEnsPrefix] = useState('')
  const [ensSuffix, setEnsSuffix] = useState('.eth')
  function updateEns(prefix: string, suffix: string) {
    setEnsPrefix(prefix)
    setEnsSuffix(suffix)
    updateBuyer('ensName', prefix.trim() ? `${prefix.trim()}${suffix}` : '')
  }
  const [provider, setProvider] = useState<OrderSnapshot['walletProvider']>('coinbase')
  const [buyer, setBuyer] = useState<CheckoutBuyer>({ displayName: '', email: '', username: '', profileName: '', walletType: 'software', referralCode: '', ensName: '', secondaryWallet: '' })
  const [reviewedSignature, setReviewedSignature] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const currentSignature = useMemo(() => quote ? quoteFingerprint(quote) : '', [quote])
  const quoteChanged = reviewedSignature !== currentSignature
  const ready = Boolean(quote?.valid && selectedWallet && networkMatchesWallet && reviewedSignature && !quoteChanged)

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
    if (!selectedWallet || !networkMatchesWallet || !quote || !ready || busy) return
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
  return <main className={`${pageShellClass} pb-44 pt-6 font-mono text-[#f4ede5] lg:pb-16`}>
    <nav aria-label="Caminho do pagamento" className="mb-6 hidden text-xs lg:block font-bold text-[#f4ede5]"><Link to="/" className="hover:text-[#d38d50]">Início</Link> / <Link to="/" hash="catalog" className="hover:text-[#d38d50]">Mercado</Link> / Pagamento</nav>
    <div className="mb-7 flex items-center gap-5 lg:hidden"><Link to="/cart" aria-label="Voltar ao carrinho" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#503328] text-[#d38d50]"><ArrowLeft size={22}/></Link><h1 className="text-xl font-bold">Pagamento com carteira</h1></div><h1 className="sr-only">Pagamento com carteira</h1>
    <form id="kurio-checkout-form" onSubmit={(event) => void submit(event)} className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,0.9fr)] lg:gap-8">
      <section aria-label="Dados do colecionador" className="order-2 space-y-5 lg:order-1">
        <h2 className="text-base font-bold">Perfil do colecionador</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">Nome de exibição <span className="text-[#d38d50]">*</span><input required minLength={2} maxLength={80} className={field} value={buyer.displayName} onChange={e => updateBuyer('displayName', e.target.value)} autoComplete="name" /></label>
          <label className="text-sm">Nome de usuário <span className="text-[#d38d50]">*</span><input required maxLength={40} className={field} value={buyer.username || user?.name || ''} onChange={e => updateBuyer('username', e.target.value)} /></label>
          <div className="text-sm"><label htmlFor="checkout-network">Rede <span className="text-[#d38d50]">*</span></label><select id="checkout-network" required className={field} value={effectiveNetwork} onChange={event => chooseNetwork(event.target.value as WalletNetwork | '')}><option value="">Selecione uma rede</option><option value="ethereum">Ethereum</option><option value="polygon">Polygon</option><option value="base">Base</option></select>{effectiveNetwork && !networkMatchesWallet && <p role="status" className="mt-2 text-xs leading-5 text-[#d38d50]">Você não possui carteira cadastrada para essa rede. <Link to="/wallets" className="underline">Cadastrar carteira</Link> ou selecione outra rede.</p>}</div>
          <label className="text-sm">Nome do perfil <span className="text-[#d38d50]">*</span><input required className={field} value={buyer.profileName || buyer.displayName} onChange={e => updateBuyer('profileName', e.target.value)} /></label>
          <label className="text-sm">Endereço da carteira <span className="text-[#d38d50]">*</span><input required readOnly className={field} value={selectedWallet?.address ?? ''} placeholder="Cadastre uma carteira" /></label>
          <label className="text-sm">ENS ou carteira secundária (opcional)<input className={field} maxLength={100} placeholder="nome.eth ou 0x..." value={buyer.secondaryWallet ?? ''} onChange={e => updateBuyer('secondaryWallet', e.target.value)} /></label>
          <label className="text-sm">Tipo de carteira <span className="text-[#d38d50]">*</span><select required className={field} value={buyer.walletType ?? 'software'} onChange={e => updateBuyer('walletType', e.target.value as 'software' | 'hardware')}><option value="software">Software</option><option value="hardware">Hardware</option></select></label>
          <label className="text-sm">Código de indicação (opcional)<input className={field} maxLength={32} value={buyer.referralCode ?? ''} onChange={e => updateBuyer('referralCode', e.target.value)} /></label>
          <label className="text-sm">E-mail <span className="text-[#d38d50]">*</span><input required type="email" className={field} value={buyer.email} onChange={e => updateBuyer('email', e.target.value)} autoComplete="email" /></label>
          <div className="text-sm"><label htmlFor="checkout-ens-prefix">Nome ENS (opcional)</label><div className="kurio-checkout-ens mt-2 flex h-11 w-full min-w-0 overflow-hidden rounded-sm border border-[#503328] bg-[#251711] focus-within:outline-2 focus-within:outline-[#d38d50]"><input id="checkout-ens-prefix" maxLength={90} placeholder="nome" value={ensPrefix} onChange={event => updateEns(event.target.value.replaceAll('.', ''), ensSuffix)} className="h-full min-w-0 w-full flex-1 bg-transparent px-3 py-2 text-sm text-[#f4ede5] outline-none" /><label htmlFor="checkout-ens-suffix" className="sr-only">Extensão ENS ou domínio</label><select id="checkout-ens-suffix" value={ensSuffix} onChange={event => updateEns(ensPrefix, event.target.value)} className="kurio-checkout-ens-suffix h-full w-24 shrink-0 border-l border-[#503328] bg-[#251711] px-2 py-2 text-sm text-[#f4ede5] focus-visible:outline-2 focus-visible:outline-[#d38d50]"><option value=".eth">.eth</option><option value=".xyz">.xyz</option><option value=".com">.com</option></select></div><p className="mt-1 text-[11px] text-[#b99872]">Sufixos ilustrativos; o nome não é verificado na rede.</p></div>
        </div>
        <h2 className="hidden pt-2 text-base font-bold lg:block">Carteira conectada</h2>
        {walletsQuery.isPending ? <div className="nft-shimmer h-28 rounded" role="status" aria-label="Carregando carteiras"/> : walletsQuery.isError ? <p role="alert">Falha ao carregar carteiras. <button type="button" onClick={() => void walletsQuery.refetch()} className="underline">Tentar novamente</button></p> : wallets.length === 0 ? <p className="hidden rounded-lg border border-[#503328] bg-[#251711] p-5 text-sm lg:block">Nenhuma carteira cadastrada. <Link to="/wallets" className="text-[#d38d50] underline">Cadastrar carteira</Link></p> : <fieldset className="hidden space-y-3 lg:block"><legend className="sr-only">Selecionar carteira</legend>{wallets.map((w: Wallet) => <label key={w.slot} className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 ${selectedWallet?.slot === w.slot ? 'border-[#d38d50]' : 'border-[#503328]'} bg-[#251711]`}><input type="radio" name="wallet" checked={selectedWallet?.slot === w.slot} onChange={() => chooseWallet(w)} className="accent-[#d38d50]"/><WalletCards size={24} className="text-[#d38d50]"/><span className="min-w-0"><strong className="block">{w.label}</strong><span className="block truncate text-xs text-[#b99872]">{w.address} · {w.network}</span></span></label>)}</fieldset>}
        <div className="hidden lg:block"><Link to="/wallets" className="text-sm text-[#d38d50] underline">Trocar ou cadastrar carteira</Link></div>
        <label className="block text-sm">Observações do colecionador (opcional)<textarea className={`${field} min-h-24 resize-y`} maxLength={500} value={buyer.notes ?? ''} onChange={e => updateBuyer('notes', e.target.value)}/></label>
      </section>
      <section aria-label="Seleção de carteira no celular" className="order-1 space-y-7 lg:hidden">
        <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold">Carteira conectada</h2><Link to="/wallets" className="text-sm font-bold text-[#d38d50]">Trocar carteira</Link></div>
        {walletsQuery.isPending ? <p role="status">Carregando carteiras...</p> : walletsQuery.isError ? <p role="alert">Não foi possível carregar as carteiras.</p> : wallets.length === 0 ? <p className="text-sm text-[#b99872]">Nenhuma carteira cadastrada. <Link to="/wallets" className="underline text-[#d38d50]">Cadastrar carteira</Link></p> : <fieldset className="space-y-4"><legend className="sr-only">Carteira conectada no celular</legend>{wallets.map(w => <label key={w.slot} className="flex cursor-pointer items-center gap-4 rounded-2xl bg-[#251711] p-5"><input type="radio" name="mobile-wallet" className="accent-[#d38d50]" checked={selectedWallet?.slot === w.slot} onChange={() => chooseWallet(w)} /><span className="min-w-0 flex-1"><strong className="block text-base">{w.label}</strong><span className="block truncate text-sm text-[#b99872]">{w.address.length > 24 ? `${w.address.slice(0,8)}…${w.address.slice(-5)}` : w.address}</span><span className="block text-sm text-[#b99872]">Rede {w.network}</span></span><MoreVertical size={18} className="text-[#b99872]" aria-hidden="true" /></label>)}</fieldset>}
        <h2 className="text-lg font-bold">Carteira e rede</h2>
        <fieldset className="space-y-3"><legend className="sr-only">Provedor de carteira no celular</legend>{providers.map((item) => <label key={item.id} className="flex cursor-pointer items-center gap-4 rounded-2xl bg-[#251711] p-4"><span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#503328] text-[#d38d50]">{item.label[0]}</span><span className="flex-1 text-base">{item.label}</span><input type="radio" name="mobile-provider" className="accent-[#d38d50]" checked={provider === item.id} onChange={() => {setProvider(item.id);setReviewedSignature(null)}} /></label>)}</fieldset>
        <div className="flex items-center justify-end gap-4 text-lg font-bold"><span>Total:</span><span className="text-[#d38d50]">{quote?.totalEth ?? '—'} ETH</span></div>
        <p className="text-xs text-[#b99872]">Preencha os dados do colecionador abaixo para confirmar a compra simulada.</p>
      </section>
      <aside className="order-3 hidden space-y-5 lg:top-6 lg:self-start lg:block" aria-label="Resumo do pagamento">
        <section><h2 className="border-b border-[#503328] pb-3 text-base font-bold">Seus NFTs</h2>{loadingQuote ? <div role="status" className="nft-shimmer mt-4 h-44 rounded" aria-label="Carregando resumo"/> : quoteError ? <button type="button" onClick={() => void refetchQuote()} className="mt-4 text-red-300 underline">Falha ao buscar cotação. Tentar novamente</button> : !quote?.items.length ? <p className="mt-5 text-sm">Seu carrinho está vazio. <Link to="/" className="text-[#d38d50] underline">Explorar</Link></p> : <div className="mt-3 space-y-2"><div className="flex justify-between border-b border-[#503328] pb-2 text-xs"><span>NFTs</span><span>Subtotal</span></div>{quote.items.map(item => <div key={item.key} className="flex items-center gap-2 bg-[#251711] p-2"><img src={item.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded object-cover"/><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{item.name}</p><p className="text-[11px] text-[#b99872]">{item.editionLabel} (x {item.quantity})</p></div><span className="shrink-0 text-xs font-bold text-[#d38d50]">{weiToEth(multiplyEth(item.unitPriceEth, item.quantity))} ETH</span></div>)}</div>}</section>
        {quote && <section className="space-y-3 text-sm"><p className="text-center text-xs text-[#b99872]">Tem um código promocional? <Link to="/cart" className="text-[#f4ede5] underline">Aplique aqui</Link></p><div className="flex justify-between gap-2"><span>Subtotal</span><span>{quote.subtotalEth} ETH</span></div><div className="flex justify-between gap-2"><span>Desconto</span><span>− {quote.discountEth} ETH</span></div><div className="flex justify-between gap-2"><span>Taxa da rede</span><span>{quote.networkFeeEth} ETH</span></div><div className="flex justify-between gap-2 border-t border-[#503328] pt-4 text-lg font-bold"><span>Total</span><span className="text-[#d38d50]">{quote.totalEth} ETH</span></div>{!quote.valid && <p role="alert" className="text-red-300">{quote.issues.join('; ') || 'Carrinho inválido.'}</p>}</section>}
        <fieldset className="hidden lg:block"><legend className="mb-3 text-center text-sm font-bold">Carteira e rede</legend><div className="space-y-2">{providers.map(item => <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded border border-[#503328] p-3"><input type="radio" name="provider" className="accent-[#d38d50]" checked={provider === item.id} onChange={() => { setProvider(item.id); setReviewedSignature(null) }}/>{item.label}</label>)}</div></fieldset>
        {message && <p role="alert" className="text-sm text-red-300">{message}</p>}
        {quote && quoteChanged && <p role="status" className="text-sm text-[#d38d50]">Antes de comprar, confirme a cotação mais recente da API.</p>}
        <button type="button" onClick={() => void reviewQuote()} disabled={!quote?.valid || busy} className="hidden w-full rounded border border-[#d38d50] px-5 py-3 text-sm font-bold text-[#d38d50] disabled:opacity-50 lg:block">{quoteChanged ? 'Revisar valores atualizados' : 'Revalidar cotação'}</button>
        <button type="submit" disabled={!ready || busy} className="hidden w-full rounded-sm bg-[#d38d50] px-5 py-3 font-bold text-[#160e0b] disabled:opacity-40 lg:block">{busy ? 'Processando...' : 'Confirmar compra'}</button>
        <p className="text-center text-xs text-[#b99872]">Operação simulada. Nenhuma transação blockchain real será enviada.</p>
      </aside>
    </form>
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#503328] bg-[#251711] px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-4 lg:hidden"><button type="submit" form="kurio-checkout-form" disabled={!ready || busy} className="w-full rounded-full bg-[#d38d50] px-5 py-4 font-bold text-[#160e0b] disabled:opacity-40">{busy ? "Processando..." : "Confirmar compra"}</button><button type="button" disabled={!quote?.valid || busy} onClick={() => void reviewQuote()} className="mt-2 w-full text-xs text-[#d38d50]">{quoteChanged ? "Revisar valores atualizados" : "Revalidar cotação"}</button>{message && <p role="alert" className="mt-2 text-xs text-red-300">{message}</p>}</div>
  </main>
}
