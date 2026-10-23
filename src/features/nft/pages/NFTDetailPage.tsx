import { useState } from 'react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, ShoppingCart, Minus, Plus } from 'lucide-react'
import { isAxiosError } from 'axios'
import { useNft } from '../hooks/useNft'
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton'
import { ArrowLeft, Heart, ShoppingCart, Minus, Plus } from 'lucide-react'
import { isAxiosError } from 'axios'
import { useNft } from '../hooks/useNft'
import { useCartActions } from '@/features/cart/hooks/useCart'
import type { NFTDetail } from '../types/detail'

function errorMessage(error: unknown): string {
  if (isAxiosError<{ message?: string }>(error)) return error.response?.data?.message ?? 'Não foi possível completar a operação.'
  return 'Ocorreu um erro. Tente novamente.'
}

function DetailContent({ nft }: { nft: NFTDetail }) {
  const [editionId, setEditionId] = useState(nft.editions[0]?.id ?? '')
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(nft.gallery[0] ?? nft.imageUrl)
  const [message, setMessage] = useState('')
  const { add } = useCartActions()
  const navigate = useNavigate()
  const edition = nft.editions.find((item) => item.id === editionId)
  const max = edition?.available ?? 0

  async function handleAdd(goToCart: boolean) {
    if (!edition || max < quantity || add.isPending) return
    setMessage('')
    try {
      await add.mutateAsync({ nftId: nft.id, editionId, quantity })
      if (goToCart) await navigate({ to: '/cart' })
      else setMessage('NFT adicionado ao carrinho!')
    } catch { /* Erro da mutation exibido abaixo, sem sucesso fictício. */ }
  }

  return (
    <div className="grid gap-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12">
      <div>
        <div className="overflow-hidden rounded-[24px] bg-[#2a1914] p-3">
          <img src={selectedImage} alt={`Arte digital ${nft.name}`} className="aspect-square w-full rounded-[18px] object-cover" fetchPriority="high" />
        </div>
        <div className="mt-4 flex gap-3" aria-label="Galeria do NFT">
          {nft.gallery.map((image, index) => (
            <button key={`${image}-${index}`} type="button" onClick={() => setSelectedImage(image)} aria-label={`Ver imagem ${index + 1}`} aria-pressed={selectedImage === image} className={`h-20 w-20 overflow-hidden rounded-xl border-2 p-1 focus-visible:outline-2 focus-visible:outline-[#d38d50] ${selectedImage === image ? 'border-[#d38d50]' : 'border-[#503328]'}`}>
              <img src={image} alt="" className="h-full w-full rounded-lg object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="font-mono">
        <p className="text-xs uppercase tracking-widest text-[#b99872]">Coleção Kurio / {nft.network}</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-[#f4ede5] lg:text-4xl">{nft.name}</h1>
        <p className="mt-2 text-sm text-[#b99872]">Criado por {nft.creator}</p>
        <p className="mt-6 text-sm leading-7 text-[#d2bdab]">{nft.description}</p>

        <div className="mt-7 rounded-2xl border border-[#503328] bg-[#251711] p-5">
          <label htmlFor="nft-edition" className="mb-2 block text-sm font-bold text-[#f4ede5]">Selecione a edição</label>
          <select id="nft-edition" value={editionId} onChange={(event) => { setEditionId(event.target.value); setQuantity(1); setMessage(''); add.reset() }} className="w-full rounded-lg border border-[#6c4935] bg-[#160e0b] px-3 py-3 text-sm text-[#f4ede5] focus-visible:outline-2 focus-visible:outline-[#d38d50]">
            {nft.editions.map((item) => <option key={item.id} value={item.id} disabled={item.available === 0}>{item.label} — {item.priceEth} ETH ({item.available} disponíveis)</option>)}
          </select>

          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs text-[#b99872]">Preço unitário</p>
              <p className="mt-1 text-2xl font-bold text-[#d38d50]">{edition?.priceEth ?? '—'} ETH</p>
            </div>
            <div>
              <label htmlFor="nft-quantity" className="mb-2 block text-xs text-[#b99872]">Quantidade</label>
              <div className="flex items-center rounded-lg border border-[#6c4935]">
                <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity <= 1} aria-label="Diminuir quantidade" className="p-2 disabled:opacity-40"><Minus size={16} /></button>
                <input id="nft-quantity" type="number" inputMode="numeric" min={1} max={Math.max(1, max)} value={quantity} onChange={(event) => { const value = Number(event.target.value); if (Number.isSafeInteger(value) && value >= 1 && value <= max) setQuantity(value) }} className="w-12 bg-transparent text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
                <button type="button" onClick={() => setQuantity((value) => Math.min(max, value + 1))} disabled={quantity >= max} aria-label="Aumentar quantidade" className="p-2 disabled:opacity-40"><Plus size={16} /></button>
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-[#b99872]">Disponíveis nesta edição: {max}</p>

          {add.isError && <p role="alert" className="mt-4 text-sm text-red-300">{errorMessage(add.error)}</p>}
          {message && <p role="status" className="mt-4 text-sm text-[#d38d50]">{message} <Link to="/cart" className="underline">Ver carrinho</Link></p>}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button type="button" disabled={max === 0 || add.isPending} onClick={() => void handleAdd(false)} className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#d38d50] px-4 text-sm font-bold text-[#d38d50] hover:bg-[#352216] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"><ShoppingCart size={18} /> Adicionar ao carrinho</button>
            <button type="button" disabled={max === 0 || add.isPending} onClick={() => void handleAdd(true)} className="min-h-12 rounded-lg bg-[#d38d50] px-4 text-sm font-bold text-[#160e0b] hover:bg-[#efad70] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50">{add.isPending ? 'Adicionando…' : 'Comprar agora'}</button>
          </div>
          <div className="mt-5 flex items-center gap-3 text-sm text-[#b99872]"><FavoriteButton nftId={nft.id} /> Adicionar aos favoritos</div>
          <button type="button" disabled title="Disponível após implementar login" className="mt-5 inline-flex items-center gap-2 text-xs text-[#b99872] disabled:opacity-70"><Heart size={17} /> Favoritos disponíveis após login</button>
        </div>
      </div>
    </div>
  )
}

export function NFTDetailPage() {
  const { nftId } = useParams({ from: '/nft/$nftId' })
  const { data, isPending, isError, error, refetch } = useNft(nftId)
  const notFound = isAxiosError(error) && error.response?.status === 404

  return (
    <main className="mx-auto max-w-7xl px-5 pb-32 pt-8 text-[#f4ede5] lg:px-8 lg:pb-16">
      <Link to="/" className="mb-8 inline-flex items-center gap-2 rounded-sm font-mono text-sm text-[#d38d50] focus-visible:outline-2"><ArrowLeft size={18} /> Voltar ao catálogo</Link>
      {isPending ? (
        <div role="status" aria-label="Carregando NFT" className="grid gap-7 lg:grid-cols-2"><div className="nft-shimmer aspect-square rounded-3xl"/><div className="space-y-4"><div className="nft-shimmer h-10 w-3/4 rounded"/><div className="nft-shimmer h-5 w-full rounded"/><div className="nft-shimmer h-40 rounded-xl"/></div></div>
      ) : isError ? (
        <div role="alert" className="rounded-xl border border-[#503328] bg-[#2a1914] p-8 font-mono"><h1 className="text-2xl">{notFound ? 'NFT não encontrado' : 'Falha ao carregar NFT'}</h1><p className="mt-3 text-sm text-[#b99872]">{notFound ? 'Este item não existe no catálogo.' : 'Não foi possível consultar o detalhe.'}</p>{!notFound && <button type="button" onClick={() => void refetch()} className="mt-5 text-[#d38d50] underline">Tentar novamente</button>}</div>
      ) : data ? <DetailContent key={data.id} nft={data} /> : null}
    </main>
  )
}
