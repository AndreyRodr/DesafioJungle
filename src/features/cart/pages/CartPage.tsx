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
    <article className="rounded-sm bg-[#251711] px-3 py-3 font-mono sm:px-4" aria-label={item.name}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 lg:grid-cols-[minmax(0,1.55fr)_minmax(88px,0.65fr)_minmax(102px,0.8fr)_minmax(90px,0.8fr)_28px] lg:gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/nft/$nftId" params={{ nftId: item.nftId }} className="w-16 shrink-0 overflow-hidden rounded-sm sm:w-[72px]">
            <img src={item.imageUrl} alt={item.name} className="aspect-square w-full object-cover" loading="lazy" />
          </Link>
          <div className="min-w-0">
            <Link to="/nft/$nftId" params={{ nftId: item.nftId }} className="block truncate text-xs font-bold text-[#f4ede5] hover:text-[#d38d50] sm:text-sm">{item.name}</Link>
            <p className="mt-1 truncate text-[11px] text-[#b99872]">{item.editionLabel}</p>
          </div>
        </div>
        <button type="button" disabled={busy} onClick={() => void deleteItem()} aria-label={`Remover ${item.name}`} className="rounded p-1 text-[#b99872] hover:text-red-300 disabled:opacity-40 lg:order-last"><Trash2 size={18}/></button>
        <div className="hidden whitespace-nowrap text-xs font-bold text-[#d38d50] lg:block">{item.unitPriceEth} ETH</div>
        <div className="col-span-2 flex items-center justify-between gap-3 border-t border-[#503328]/50 pt-3 lg:col-span-1 lg:border-0 lg:pt-0">
          <span className="text-xs text-[#b99872] lg:hidden">{item.unitPriceEth} ETH</span>
          <div className="flex items-center gap-2">
            <button type="button" disabled={busy || item.quantity <= 1} onClick={() => void updateQuantity(item.quantity - 1)} aria-label={`Diminuir quantidade de ${item.name}`} className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d38d50] text-[#160e0b] disabled:opacity-40"><Minus size={14}/></button>
            <span className="min-w-4 text-center text-sm text-[#f4ede5]" aria-live="polite">{item.quantity}</span>
            <button type="button" disabled={busy || item.quantity >= item.available} onClick={() => void updateQuantity(item.quantity + 1)} aria-label={`Aumentar quantidade de ${item.name}`} className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d38d50] text-[#160e0b] disabled:opacity-40"><Plus size={14}/></button>
          </div>
        </div>
        <div className="col-span-2 text-right text-sm font-bold text-[#d38d50] lg:col-span-1 lg:text-left">{weiToEth(multiplyEth(item.unitPriceEth, item.quantity))} ETH</div>
      </div>
      {message && <p role="alert" className="mt-2 text-xs text-red-300">{message}</p>}
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
    <aside className="font-mono lg:sticky lg:top-6" aria-label="Resumo do carrinho">
      <h2 className="border-b border-[#503328] pb-3 text-base font-bold text-[#f4ede5]">Resumo da carteira</h2>
      {isPending ? <div role="status" className="mt-6 space-y-3"><span className="sr-only">Carregando valores</span><div className="nft-shimmer h-5 rounded"/><div className="nft-shimmer h-5 rounded"/><div className="nft-shimmer h-5 rounded"/></div> : isError ? <div role="alert" className="mt-5 text-sm text-red-300">Não foi possível calcular a cotação. <button type="button" onClick={() => void refetch()} className="underline">Tentar novamente</button></div> : quote ? <>
        <dl className="mt-6 space-y-4 text-sm">
          <div className="flex justify-between gap-4"><dt className="text-[#b99872]">Subtotal</dt><dd>{quote.subtotalEth} ETH</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-[#b99872]">Desconto</dt><dd>- {quote.discountEth} ETH</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-[#b99872]">Taxa de rede (simulada)</dt><dd>{quote.networkFeeEth} ETH</dd></div>
          <div className="flex justify-between gap-4 border-t border-[#503328] pt-4 text-lg font-bold"><dt>Total</dt><dd className="text-[#d38d50]">{quote.totalEth} ETH</dd></div>
        </dl>
        {quote.issues.length > 0 && <p role="alert" className="mt-4 text-xs text-red-300">{quote.issues.join('; ')}</p>}
        <p className="mt-4 text-xs leading-5 text-[#b99872]">A cotação é recalculada pela API simulada. Preços e disponibilidade serão revalidados no checkout.</p>
      </> : null}

      <div className="mt-5 border-t border-[#503328] pt-5">
        <label htmlFor="cart-coupon" className="mb-2 block text-sm font-bold">Código promocional</label>
        {quote?.coupon ? <div className="flex items-center justify-between gap-3 rounded-lg border border-[#6c4935] p-3 text-sm"><span className="text-[#d38d50]">{quote.coupon} aplicado</span><button type="button" onClick={() => void handleRemoveCoupon()} disabled={clearCoupon.isPending} className="underline disabled:opacity-40">Remover</button></div> : <form onSubmit={(event) => void handleCoupon(event)} className="flex gap-2"><input id="cart-coupon" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Código do cupom" className="min-w-0 flex-1 rounded-lg border border-[#6c4935] bg-[#160e0b] px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-[#d38d50]"/><button type="submit" disabled={!code.trim() || coupon.isPending} className="rounded-lg bg-[#d38d50] px-3 text-xs font-bold text-[#160e0b] disabled:opacity-40">Aplicar</button></form>}
        {error && <p role="alert" className="mt-2 text-xs text-red-300">{error}</p>}
        
      </div>
      {quote?.valid ? <Link to="/checkout" className="mt-6 block w-full rounded-sm bg-[#d38d50] px-5 py-3 text-center text-sm font-bold text-[#160e0b] hover:bg-[#eda667]">Conectar e finalizar</Link> : <button type="button" disabled className="mt-6 w-full rounded-sm bg-[#d38d50] px-5 py-3 text-sm font-bold text-[#160e0b] opacity-50">Carrinho indisponível para pagamento</button>}
      <Link to="/" hash="catalog" className="mt-3 block text-center text-xs font-bold text-[#d38d50]">Continuar explorando</Link>
    </aside>
  )
}

export function CartPage() {
  const { data, isPending, isError, refetch } = useCart()
  return (
    <main className={`${pageShellClass} pb-32 pt-8 text-[#f4ede5] lg:pb-16`}>
      <nav aria-label="Caminho do carrinho" className="mb-5 font-mono text-xs font-bold text-[#f4ede5]"><Link to="/" className="hover:text-[#d38d50]">Início</Link> / <Link to="/" hash="catalog" className="hover:text-[#d38d50]">Mercado</Link> / Carrinho</nav>
      <h1 className="mb-7 font-mono text-3xl font-bold lg:sr-only">Carrinho de NFTs</h1>
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
