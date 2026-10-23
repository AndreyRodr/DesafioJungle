import { useState, type FormEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
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
    <article className="rounded-xl border border-[#503328] bg-[#251711] p-4 font-mono">
      <div className="flex gap-4">
        <Link to="/nft/$nftId" params={{ nftId: item.nftId }} className="w-24 shrink-0 overflow-hidden rounded-lg sm:w-32"><img src={item.imageUrl} alt={item.name} className="aspect-square w-full object-cover" loading="lazy" /></Link>
        <div className="min-w-0 flex-1">
          <Link to="/nft/$nftId" params={{ nftId: item.nftId }} className="block text-sm font-bold text-[#f4ede5] hover:text-[#d38d50] sm:text-lg">{item.name}</Link>
          <p className="mt-1 text-xs text-[#b99872]">{item.editionLabel} · {item.network}</p>
          <p className="mt-2 text-sm font-bold text-[#d38d50]">{item.unitPriceEth} ETH / unidade</p>
          <p className="mt-1 text-xs text-[#b99872]">Disponíveis: {item.available}</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center rounded-lg border border-[#6c4935]">
              <button type="button" disabled={busy || item.quantity <= 1} onClick={() => void updateQuantity(item.quantity - 1)} aria-label={`Diminuir quantidade de ${item.name}`} className="p-2 disabled:opacity-40"><Minus size={16}/></button>
              <span className="w-8 text-center text-sm" aria-live="polite">{item.quantity}</span>
              <button type="button" disabled={busy || item.quantity >= item.available} onClick={() => void updateQuantity(item.quantity + 1)} aria-label={`Aumentar quantidade de ${item.name}`} className="p-2 disabled:opacity-40"><Plus size={16}/></button>
            </div>
            <button type="button" disabled={busy} onClick={() => void deleteItem()} aria-label={`Remover ${item.name}`} className="rounded-lg p-2 text-[#d6a17e] hover:text-red-300 disabled:opacity-40"><Trash2 size={19}/></button>
          </div>
          <p className="mt-3 text-sm font-bold text-[#f4ede5]">Total: {weiToEth(multiplyEth(item.unitPriceEth, item.quantity))} ETH</p>
        </div>
      </div>
      {message && <p role="alert" className="mt-3 text-xs text-red-300">{message}</p>}
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
    <aside className="rounded-xl border border-[#503328] bg-[#251711] p-5 font-mono lg:sticky lg:top-6" aria-label="Resumo do carrinho">
      <h2 className="text-lg font-bold text-[#f4ede5]">Resumo do pedido</h2>
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

      <div className="mt-6 border-t border-[#503328] pt-5">
        <label htmlFor="cart-coupon" className="mb-2 block text-sm font-bold">Cupom de desconto</label>
        {quote?.coupon ? <div className="flex items-center justify-between gap-3 rounded-lg border border-[#6c4935] p-3 text-sm"><span className="text-[#d38d50]">{quote.coupon} aplicado</span><button type="button" onClick={() => void handleRemoveCoupon()} disabled={clearCoupon.isPending} className="underline disabled:opacity-40">Remover</button></div> : <form onSubmit={(event) => void handleCoupon(event)} className="flex gap-2"><input id="cart-coupon" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Código do cupom" className="min-w-0 flex-1 rounded-lg border border-[#6c4935] bg-[#160e0b] px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-[#d38d50]"/><button type="submit" disabled={!code.trim() || coupon.isPending} className="rounded-lg bg-[#d38d50] px-3 text-xs font-bold text-[#160e0b] disabled:opacity-40">Aplicar</button></form>}
        {error && <p role="alert" className="mt-2 text-xs text-red-300">{error}</p>}
        <p className="mt-3 text-xs text-[#b99872]">Cupom de demonstração: KURIO10</p>
      </div>
      <button type="button" disabled title="O checkout será habilitado no próximo bloco" className="mt-6 w-full rounded-lg bg-[#d38d50] px-5 py-4 text-sm font-bold text-[#160e0b] disabled:cursor-not-allowed disabled:opacity-60">Continuar para pagamento</button>
      <p className="mt-2 text-center text-xs text-[#b99872]">Checkout disponível após integrar autenticação e pedidos.</p>
    </aside>
  )
}

export function CartPage() {
  const { data, isPending, isError, refetch } = useCart()
  return (
    <main className="mx-auto max-w-7xl px-5 pb-32 pt-8 text-[#f4ede5] lg:px-8 lg:pb-16">
      <Link to="/" className="mb-7 inline-flex items-center gap-2 font-mono text-sm text-[#d38d50]"><ArrowLeft size={18}/> Continuar explorando</Link>
      <h1 className="mb-7 font-mono text-3xl font-bold">Carrinho de NFTs</h1>
      {isPending ? <div role="status" className="nft-shimmer h-48 rounded-2xl"><span className="sr-only">Carregando carrinho</span></div> : isError ? <div role="alert" className="rounded-xl bg-[#251711] p-6">Não foi possível carregar o carrinho. <button type="button" onClick={() => void refetch()} className="text-[#d38d50] underline">Tentar novamente</button></div> : !data?.items.length ? <div className="rounded-2xl border border-[#503328] bg-[#251711] p-10 text-center font-mono"><ShoppingBag size={44} className="mx-auto text-[#d38d50]"/><p className="mt-5">Seu carrinho está vazio.</p><Link to="/" className="mt-5 inline-block rounded-lg bg-[#d38d50] px-5 py-3 font-bold text-[#160e0b]">Explorar NFTs</Link></div> : <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">{data.items.map((item) => <ItemRow key={item.key} item={item} />)}</div>
        <Summary />
      </div>}
    </main>
  )
}
