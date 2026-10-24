import { useState, type FormEvent } from 'react'
import { pageShellClass } from '@/components/layout/pageShell'
import { CartRecommendations } from '../components/CartRecommendations'
import { Link } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart, useCartActions, useCartQuote } from '../hooks/useCart'
import { multiplyEth, weiToEth } from '../lib/money'
import type { CartItem } from '../types/cart'

function errorMessage(error: unknown): string {
  if (isAxiosError<{ message?: string }>(error)) return error.response?.data?.message ?? 'Erro ao consultar a API.'
  return 'Não foi possível completar a operação.'
}

function ItemRow({ item }: { item: CartItem }) {
  const { update, remove } = useCartActions()
  const [message, setMessage] = useState('')
  const busy = update.isPending || remove.isPending

  async function updateQuantity(quantity: number) {
    setMessage('')
    try { await update.mutateAsync({ key: item.key, quantity }) }
    catch (error) { setMessage(errorMessage(error)) }
  }

  async function deleteItem() {
    setMessage('')
    try { await remove.mutateAsync(item.key) }
    catch (error) { setMessage(errorMessage(error)) }
  }

  return (
    <article className="overflow-hidden rounded-[22px] bg-[#251711] font-mono lg:rounded-sm lg:px-3 lg:py-3" aria-label={item.name}>
      {/* Figma mobile card: artwork at left, edition and quantity beside the title. */}
      <div className="grid min-h-[122px] grid-cols-[112px_minmax(0,1fr)] items-stretch gap-3 lg:hidden">
        <Link to="/nft/$nftId" params={{ nftId: item.nftId }} className="block overflow-hidden rounded-[20px]">
          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
        </Link>
        <div className="flex min-w-0 flex-col justify-between py-3 pr-3">
          <div className="flex min-w-0 items-start gap-1">
            <Link to="/nft/$nftId" params={{ nftId: item.nftId }} className="min-w-0 flex-1 text-sm font-bold leading-5 text-[#f4ede5] hover:text-[#d38d50]">{item.name}</Link>
            <button type="button" disabled={busy} onClick={() => void deleteItem()} aria-label={`Remover ${item.name}`} className="shrink-0 p-1 text-[#b99872] disabled:opacity-40"><Trash2 size={16} /></button>
          </div>
          <div className="flex items-center justify-between gap-1">
            <span className="truncate text-xs text-[#b99872]">{item.editionLabel}</span>
            <div className="flex shrink-0 items-center gap-2">
              <button type="button" disabled={busy || item.quantity <= 1} onClick={() => void updateQuantity(item.quantity - 1)} aria-label={`Diminuir quantidade de ${item.name}`} className="flex h-7 w-7 items-center justify-center rounded-full border border-[#503328] text-[#f4ede5] disabled:opacity-40"><Minus size={16} /></button>
              <span className="min-w-4 text-center text-sm" aria-live="polite">{item.quantity}</span>
              <button type="button" disabled={busy || item.quantity >= item.available} onClick={() => void updateQuantity(item.quantity + 1)} aria-label={`Aumentar quantidade de ${item.name}`} className="flex h-7 w-7 items-center justify-center rounded-full border border-[#503328] text-[#f4ede5] disabled:opacity-40"><Plus size={16} /></button>
            </div>
          </div>
          <strong className="text-lg text-[#d38d50]">{weiToEth(multiplyEth(item.unitPriceEth, item.quantity))} ETH</strong>
        </div>
      </div>
      {/* Preserve the approved desktop table row. */}
      <div className="hidden items-center gap-3 lg:grid lg:grid-cols-[minmax(0,1.55fr)_minmax(88px,0.65fr)_minmax(102px,0.8fr)_minmax(90px,0.8fr)_28px]">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/nft/$nftId" params={{ nftId: item.nftId }} className="w-[72px] shrink-0 overflow-hidden rounded-sm">
            <img src={item.imageUrl} alt={item.name} className="aspect-square w-full object-cover" loading="lazy" />
          </Link>
          <div className="min-w-0">
            <Link to="/nft/$nftId" params={{ nftId: item.nftId }} className="block truncate text-sm font-bold text-[#f4ede5] hover:text-[#d38d50]">{item.name}</Link>
            <p className="mt-1 truncate text-[11px] text-[#b99872]">{item.editionLabel}</p>
          </div>
        </div>
        <div className="whitespace-nowrap text-xs font-bold text-[#d38d50]">{item.unitPriceEth} ETH</div>
        <div className="flex items-center gap-2">
          <button type="button" disabled={busy || item.quantity <= 1} onClick={() => void updateQuantity(item.quantity - 1)} aria-label={`Diminuir quantidade de ${item.name}`} className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d38d50] text-[#160e0b] disabled:opacity-40"><Minus size={14}/></button>
          <span className="min-w-4 text-center text-sm" aria-live="polite">{item.quantity}</span>
          <button type="button" disabled={busy || item.quantity >= item.available} onClick={() => void updateQuantity(item.quantity + 1)} aria-label={`Aumentar quantidade de ${item.name}`} className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d38d50] text-[#160e0b] disabled:opacity-40"><Plus size={14}/></button>
        </div>
        <div className="text-sm font-bold text-[#d38d50]">{weiToEth(multiplyEth(item.unitPriceEth, item.quantity))} ETH</div>
        <button type="button" disabled={busy} onClick={() => void deleteItem()} aria-label={`Remover ${item.name}`} className="rounded p-1 text-[#b99872] hover:text-red-300 disabled:opacity-40"><Trash2 size={18}/></button>
      </div>
      {message && <p role="alert" className="px-3 pb-2 text-xs text-red-300 lg:px-0">{message}</p>}
    </article>
  )
}

function Summary() {
  const { data: quote, isPending, isError, refetch } = useCartQuote()
  const { coupon, clearCoupon } = useCartActions()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  async function handleCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    try { await coupon.mutateAsync(code); setCode('') }
    catch (cause) { setError(errorMessage(cause)) }
  }

  async function handleRemoveCoupon() {
    setError('')
    try { await clearCoupon.mutateAsync() }
    catch (cause) { setError(errorMessage(cause)) }
  }

  return (
    <aside className="fixed inset-x-0 bottom-0 z-40 max-h-[min(62dvh,520px)] overflow-y-auto overscroll-contain rounded-t-[36px] border-t border-[#503328] bg-[#251711] px-5 pb-[max(18px,env(safe-area-inset-bottom))] pt-5 font-mono shadow-[0_-12px_32px_rgba(0,0,0,0.3)] lg:sticky lg:inset-auto lg:z-auto lg:max-h-none lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:top-6 flex flex-col" aria-label="Resumo do carrinho">
      <h2 className="sr-only lg:not-sr-only lg:border-b lg:border-[#503328] lg:pb-3 lg:text-base lg:font-bold lg:text-[#f4ede5]">Resumo da carteira</h2>
      {isPending ? <div role="status" className="mt-6 space-y-3"><span className="sr-only">Carregando valores</span><div className="nft-shimmer h-5 rounded"/><div className="nft-shimmer h-5 rounded"/><div className="nft-shimmer h-5 rounded"/></div> : isError ? <div role="alert" className="mt-5 text-sm text-red-300">Não foi possível calcular a cotação. <button type="button" onClick={() => void refetch()} className="underline">Tentar novamente</button></div> : quote ? <>
        <dl className="order-2 mt-5 space-y-3 text-sm lg:order-none lg:mt-6 lg:space-y-4">
          <div className="flex justify-between gap-4"><dt className="text-[#b99872]">Subtotal</dt><dd>{quote.subtotalEth} ETH</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-[#b99872]">Desconto</dt><dd>- {quote.discountEth} ETH</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-[#b99872]">Taxa de rede (simulada)</dt><dd>{quote.networkFeeEth} ETH</dd></div>
          <div className="flex justify-between gap-4 border-t border-[#503328] pt-4 text-lg font-bold"><dt>Total</dt><dd className="text-[#d38d50]">{quote.totalEth} ETH</dd></div>
        </dl>
        {quote.issues.length > 0 && <p role="alert" className="mt-4 text-xs text-red-300">{quote.issues.join('; ')}</p>}
        <p className="mt-4 text-xs leading-5 text-[#b99872]">A cotação é recalculada pela API simulada. Preços e disponibilidade serão revalidados no checkout.</p>
      </> : null}

      <div className="order-1 border-b border-[#503328] pb-4 lg:order-none lg:mt-5 lg:border-b-0 lg:border-t lg:pt-5 lg:pb-0">
        <label htmlFor="cart-coupon" className="mb-2 hidden text-sm font-bold lg:block">Código promocional</label>
        {quote?.coupon ? <div className="flex items-center justify-between gap-3 rounded-lg border border-[#6c4935] p-3 text-sm"><span className="text-[#d38d50]">{quote.coupon} aplicado</span><button type="button" onClick={() => void handleRemoveCoupon()} disabled={clearCoupon.isPending} className="underline disabled:opacity-40">Remover</button></div> : <form onSubmit={(event) => void handleCoupon(event)} className="flex gap-0 overflow-hidden rounded-full border border-[#503328] lg:gap-2 lg:overflow-visible lg:rounded-none lg:border-0"><input id="cart-coupon" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Código do cupom" className="min-w-0 flex-1 border-0 bg-[#251711] px-4 py-3 text-sm focus-visible:outline-2 focus-visible:outline-[#d38d50] lg:rounded-lg lg:border lg:border-[#6c4935] lg:bg-[#160e0b] lg:px-3 lg:py-2"/><button type="submit" disabled={!code.trim() || coupon.isPending} className="rounded-full bg-[#d38d50] px-5 text-sm font-bold text-[#160e0b] disabled:opacity-40 lg:rounded-lg lg:px-3 lg:text-xs">Aplicar</button></form>}
        {error && <p role="alert" className="mt-2 text-xs text-red-300">{error}</p>}
        
      </div>
      {quote?.valid ? <Link to="/checkout" className="order-3 mt-5 block w-full rounded-full bg-[#d38d50] px-5 py-4 text-center text-sm font-bold text-[#160e0b] hover:bg-[#eda667] lg:order-none lg:mt-6 lg:rounded-sm lg:py-3">Conectar e finalizar</Link> : <button type="button" disabled className="order-3 mt-5 w-full rounded-full bg-[#d38d50] px-5 py-4 text-sm font-bold text-[#160e0b] opacity-50 lg:order-none lg:mt-6 lg:rounded-sm lg:py-3">Carrinho indisponível para pagamento</button>}
      <Link to="/" hash="catalog" className="order-4 mt-3 hidden text-center text-xs font-bold text-[#d38d50] lg:order-none lg:block">Continuar explorando</Link>
    </aside>
  )
}

export function CartPage() {
  const { data, isPending, isError, refetch } = useCart()
  return (
    <main className={`${pageShellClass} pb-[min(72dvh,620px)] pt-6 text-[#f4ede5] lg:pb-16 lg:pt-8`}>
      <nav aria-label="Caminho do carrinho" className="mb-5 hidden font-mono text-xs font-bold text-[#f4ede5] lg:block"><Link to="/" className="hover:text-[#d38d50]">Início</Link> / <Link to="/" hash="catalog" className="hover:text-[#d38d50]">Mercado</Link> / Carrinho</nav>
      <div className="mb-6 flex items-center gap-3 lg:hidden"><Link to="/" aria-label="Voltar ao catálogo" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#503328] text-[#d38d50]">←</Link><span className="flex-1 text-center font-mono text-xl font-bold text-[#f4ede5]">Carrinho de NFTs</span><span className="w-11" aria-hidden="true" /></div>
      <h1 className="sr-only">Carrinho de NFTs</h1>
      {isPending ? <div role="status" className="nft-shimmer h-48 rounded-2xl"><span className="sr-only">Carregando carrinho</span></div> : isError ? <div role="alert" className="rounded-xl bg-[#251711] p-6">Não foi possível carregar o carrinho. <button type="button" onClick={() => void refetch()} className="text-[#d38d50] underline">Tentar novamente</button></div> : !data?.items.length ? <div className="rounded-2xl border border-[#503328] bg-[#251711] p-10 text-center font-mono"><ShoppingBag size={44} className="mx-auto text-[#d38d50]"/><p className="mt-5">Seu carrinho está vazio.</p><Link to="/" className="mt-5 inline-block rounded-lg bg-[#d38d50] px-5 py-3 font-bold text-[#160e0b]">Explorar NFTs</Link></div> : <>
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
          <section aria-label="Itens do carrinho" className="min-w-0">
            <div className="mb-2 hidden grid-cols-[minmax(0,1.55fr)_minmax(88px,0.65fr)_minmax(102px,0.8fr)_minmax(90px,0.8fr)_28px] gap-3 border-b border-[#503328] pb-3 font-mono text-xs font-bold text-[#f4ede5] lg:grid">
              <span>NFTs</span><span>Preço</span><span>Edições</span><span>Total</span><span className="sr-only">Remover</span>
            </div>
            <div className="space-y-2">{data.items.map(item => <ItemRow key={item.key} item={item} />)}</div>
          </section>
          <Summary />
        </div>
        <CartRecommendations excludeIds={data.items.map(item => item.nftId)} />
      </>}
    </main>
  )
}
