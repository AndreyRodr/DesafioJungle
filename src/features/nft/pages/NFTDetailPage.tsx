import { useState } from 'react'
import { pageShellBleedMobileClass } from '@/components/layout/pageShell'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, ShoppingCart, Minus, Plus, Search, Star, Mail } from 'lucide-react'
import { isAxiosError } from 'axios'
import { useNft } from '../hooks/useNft'
import { useNFTs } from '../hooks/useNFTs'
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton'
import { useCartActions } from '@/features/cart/hooks/useCart'
import { NFTCard } from '../components/NFTCard'
import type { NFTDetail } from '../types/detail'

function errorMessage(error: unknown): string {
  if (isAxiosError<{ message?: string }>(error)) return error.response?.data?.message ?? 'Não foi possível completar a operação.'
  return 'Ocorreu um erro. Tente novamente.'
}

function DetailContent({ nft }: { nft: NFTDetail }) {
  const [editionId, setEditionId] = useState(nft.editions[0]?.id ?? '')
  const [quantity, setQuantity] = useState(1)
  const [imageIndex, setImageIndex] = useState(0)
  const [tab, setTab] = useState<'details' | 'reviews'>('details')
  const [zoom, setZoom] = useState(false)
  const [message, setMessage] = useState('')
  const { add } = useCartActions()
  const navigate = useNavigate()
  const edition = nft.editions.find(item => item.id === editionId)
  const max = edition?.available ?? 0
  const images = nft.gallery.length > 0 ? nft.gallery : [nft.imageUrl]
  const catalog = useNFTs({ tab: 'all', sort: 'recent', page: 1 })
  const recommendations = catalog.data?.items.filter(item => item.id !== nft.id).slice(0, 5) ?? []

  async function handleAdd(goToCart: boolean) {
    if (!edition || quantity > max || add.isPending) return
    setMessage('')
    try {
      await add.mutateAsync({ nftId: nft.id, editionId, quantity })
      if (goToCart) await navigate({ to: '/cart' })
      else setMessage('NFT adicionado ao carrinho!')
    } catch { /* Feedback exibido abaixo */ }
  }

  const quantityControl = (
    <div className="inline-flex items-center gap-3" aria-label="Quantidade do NFT">
      <button type="button" disabled={quantity <= 1} aria-label="Diminuir quantidade" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d38d50] text-[#160e0b] disabled:opacity-50"><Minus size={18}/></button>
      <input type="number" aria-label="Quantidade" min={1} max={Math.max(1,max)} value={quantity} onChange={e => { const n=Number(e.target.value); if (Number.isSafeInteger(n) && n>=1 && n<=max) setQuantity(n) }} className="w-8 bg-transparent text-center text-base text-[#f4ede5] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"/>
      <button type="button" disabled={quantity >= max} aria-label="Aumentar quantidade" onClick={() => setQuantity(q => Math.min(max,q+1))} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d38d50] text-[#160e0b] disabled:opacity-50"><Plus size={18}/></button>
    </div>
  )

  const editionControl = (
    <fieldset className="mt-5">
      <legend className="mb-2 text-sm font-bold text-[#f4ede5]">Edição:</legend>
      <div className="flex flex-wrap gap-2">
        {nft.editions.map((item, i) => <button key={item.id} type="button" aria-pressed={item.id === editionId} disabled={item.available === 0} onClick={() => { setEditionId(item.id); setQuantity(1); setMessage(''); add.reset() }} className={`rounded-full border px-3 py-1 text-xs focus-visible:outline-2 focus-visible:outline-[#d38d50] disabled:opacity-40 ${item.id === editionId ? 'border-[#d38d50] text-[#d38d50]' : 'border-[#503328] text-[#b99872]'}`}>{i===0 ? '1/50' : '1/10'}</button>)}
        <span className="rounded-full border border-[#503328] px-3 py-1 text-xs text-[#b99872]">{max > 0 ? 'ABERTA' : 'ESGOTADA'}</span>
      </div>
      <p className="mt-2 text-xs text-[#b99872]">{max} unidades disponíveis na edição selecionada</p>
    </fieldset>
  )

  return <>
    <div className="hidden lg:block"><p className="mb-5 text-xs text-[#f4ede5]"><Link to="/" className="hover:text-[#d38d50]">Início</Link> / Mercado</p></div>
    <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8">
      <div className="relative">
        <div className="mb-3 flex items-center justify-between lg:hidden">
          <Link to="/" aria-label="Voltar ao catálogo" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#503328] text-[#d2bdab]"><ArrowLeft size={23}/></Link>
          <FavoriteButton nftId={nft.id} />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[84px_minmax(0,1fr)]">
          <div className="hidden flex-col justify-between gap-3 lg:flex" aria-label="Miniaturas do NFT">
            {Array.from({ length: 4 }, (_,i) => <button type="button" key={i} aria-label={`Ver imagem ${i+1}`} aria-pressed={imageIndex === i} onClick={() => setImageIndex(i)} className={`overflow-hidden rounded-lg border-2 focus-visible:outline-2 focus-visible:outline-[#d38d50] ${imageIndex === i ? 'border-[#d38d50]' : 'border-transparent'}`}><img src={images[i % images.length]} alt="" className="aspect-square w-full object-cover" style={{objectPosition: i===1 ? '45% center' : i===2 ? '55% center' : 'center'}}/></button>)}
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-[#291b15] p-3 lg:rounded-lg">
            <img src={images[imageIndex % images.length]} alt={`Arte digital ${nft.name}`} className="aspect-square w-full rounded-xl object-cover" fetchPriority="high"/>
            <button type="button" aria-label="Ampliar imagem" onClick={() => setZoom(true)} className="absolute right-5 top-5 hidden h-9 w-9 items-center justify-center rounded-full bg-[#251711]/80 text-[#f4ede5] lg:flex"><Search size={19}/></button>
          </div>
        </div>
      </div>
      <section className="-mt-7 rounded-t-[34px] bg-[#251711] px-5 pb-8 pt-7 font-mono lg:mt-0 lg:rounded-none lg:bg-transparent lg:px-0 lg:pt-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold leading-tight text-[#f4ede5] lg:text-3xl">{nft.name}</h1>
          <span className="inline-flex items-center gap-1 rounded-full border border-[#d38d50] px-2 py-1 text-sm text-[#f4ede5] lg:hidden"><Star fill="#d38d50" color="#d38d50" size={16}/>{nft.rating?.toFixed(1)} ({nft.reviewCount})</span>
        </div>
        <div className="mt-2 hidden items-center gap-4 border-b border-[#503328] pb-3 lg:flex">
          <span className="text-lg font-bold text-[#d38d50]">{edition?.priceEth ?? nft.priceEth} ETH</span>
          <span className="text-xs text-[#b99872]"><span className="text-[#d38d50]">★★★★★</span> {nft.reviewCount} avaliações de colecionadores</span>
        </div>
        <h2 className="mt-4 hidden text-sm font-bold text-[#f4ede5] lg:block">Sobre este NFT:</h2>
        <p className="mt-3 text-sm leading-7 text-[#b99872] lg:mt-2">{nft.description}</p>
        {editionControl}
        <div className="mt-7 hidden items-center justify-between gap-3 lg:flex">
          {quantityControl}
          <div className="flex items-center gap-2">
            <button type="button" disabled={max===0||add.isPending} onClick={() => void handleAdd(true)} className="min-w-32 rounded bg-[#d38d50] px-5 py-3 text-sm font-bold text-[#160e0b] disabled:opacity-50">Comprar agora</button>
            <button type="button" disabled={max===0||add.isPending} onClick={() => void handleAdd(false)} className="inline-flex min-h-11 items-center gap-2 rounded border border-[#d38d50] px-3 text-xs font-bold text-[#d38d50] disabled:opacity-50"><ShoppingCart size={17}/>Adicionar ao carrinho</button>
            <FavoriteButton nftId={nft.id}/>
          </div>
        </div>
        <div className="mt-6 space-y-2 text-sm leading-6 text-[#b99872]">
          <p>ID do token: {nft.tokenId}</p>
          <p>Coleção: {nft.collection}</p>
          <p>Atributos: {nft.attributes.join(', ')}</p>
        </div>
        <div className="mt-8 rounded-3xl bg-[#281913] px-4 py-5 lg:hidden">
          <div className="flex items-center justify-between gap-2"><span className="text-sm text-[#b99872]">Qtd.</span>{quantityControl}<strong className="text-lg text-[#d38d50]">{edition?.priceEth ?? nft.priceEth} ETH</strong></div>
          <div className="mt-5 flex gap-3">
            <button type="button" disabled={max===0||add.isPending} onClick={() => void handleAdd(true)} aria-label="Comprar agora" className="min-h-13 flex-1 rounded-full bg-[#d38d50] px-4 py-3 text-sm font-bold text-[#160e0b] disabled:opacity-50">Comprar NFT</button>
            <button type="button" disabled={max===0||add.isPending} onClick={() => void handleAdd(false)} aria-label="Adicionar ao carrinho" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#503328] text-[#b99872] disabled:opacity-50"><ShoppingCart size={23}/></button>
          </div>
        </div>
        {add.isError && <p role="alert" className="mt-3 text-sm text-red-300">{errorMessage(add.error)}</p>}
        {message && <p role="status" className="mt-3 text-sm text-[#d38d50]">{message} <Link to="/cart" className="underline">Ver carrinho</Link></p>}
        <p className="mt-6 hidden items-center gap-2 text-xs text-[#f4ede5] lg:flex">Compartilhar este NFT: <Mail size={15}/></p>
      </section>
    </div>
    <section className="mt-14 hidden font-mono lg:block">
      <div className="flex gap-7 border-b border-[#503328]">
        <button type="button" onClick={() => setTab('details')} className={`pb-3 text-sm ${tab === 'details' ? 'border-b-2 border-[#d38d50] font-bold text-[#d38d50]' : 'text-[#b99872]'}`}>Detalhes do NFT</button>
        <button type="button" onClick={() => setTab('reviews')} className={`pb-3 text-sm ${tab === 'reviews' ? 'border-b-2 border-[#d38d50] font-bold text-[#d38d50]' : 'text-[#b99872]'}`}>Avaliações de colecionadores ({nft.reviewCount})</button>
      </div>
      {tab === 'details' ? <div className="space-y-4 py-5 text-sm leading-7 text-[#b99872]"><p>{nft.description} Cada edição pertence ao catálogo demonstrativo da Kurio.</p><p>A obra explora identidade e cultura digital. A compra, as carteiras e as referências de transação são simuladas.</p><p><strong className="text-[#f4ede5]">Rede:</strong> {nft.network}</p><p><strong className="text-[#f4ede5]">Contrato:</strong> Simulado para demonstração — sem contrato blockchain verificado.</p><p><strong className="text-[#f4ede5]">Direitos autorais:</strong> Direitos da obra permanecem com o criador; nenhuma licença de exploração comercial é concedida nesta demonstração.</p></div> : <p className="py-6 text-sm text-[#b99872]">Nota ilustrativa de {nft.rating?.toFixed(1)} ({nft.reviewCount} avaliações). Não há relatos individuais disponíveis no cenário simulado.</p>}
    </section>
    <section className="mt-14 hidden font-mono lg:block">
      <h2 className="border-b border-[#503328] pb-4 text-sm font-bold text-[#d38d50]">Mais desta coleção</h2>
      {recommendations.length > 0 ? <div className="mt-6 grid grid-cols-5 gap-4">{recommendations.map(item => <NFTCard key={item.id} nft={item}/>)}</div> : <p className="py-6 text-xs text-[#b99872]">Nenhuma outra obra disponível.</p>}
      <div className="mt-5 flex justify-center gap-2" aria-hidden="true"><span className="h-2 w-2 rounded-full border border-[#d38d50]"/><span className="h-2 w-2 rounded-full bg-[#d38d50]"/><span className="h-2 w-2 rounded-full border border-[#d38d50]"/></div>
    </section>
    {zoom && <div role="dialog" aria-modal="true" aria-label="Visualizar imagem do NFT" className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-8" onClick={() => setZoom(false)}><button type="button" autoFocus onClick={() => setZoom(false)} className="absolute right-6 top-6 rounded bg-[#d38d50] px-4 py-2 font-mono font-bold text-[#160e0b]">Fechar</button><img src={images[imageIndex % images.length]} alt={`Arte digital ampliada ${nft.name}`} className="max-h-full max-w-full object-contain"/></div>}
  </>
}

export function NFTDetailPage() {
  const { nftId } = useParams({ from: '/nft/$nftId' })
  const { data, isPending, isError, error, refetch } = useNft(nftId)
  const notFound = isAxiosError(error) && error.response?.status === 404
  return (
    <main className={`${pageShellBleedMobileClass} pb-28 pt-0 text-[#f4ede5] lg:pb-16 lg:pt-7`}>
      {isPending ? <div role="status" aria-label="Carregando NFT" className="grid gap-7 p-5 lg:grid-cols-2"><div className="nft-shimmer aspect-square rounded-3xl"/><div className="space-y-4"><div className="nft-shimmer h-10 w-3/4 rounded"/><div className="nft-shimmer h-5 w-full rounded"/><div className="nft-shimmer h-40 rounded-xl"/></div></div>
        : isError ? <div role="alert" className="m-5 rounded-xl border border-[#503328] bg-[#2a1914] p-8 font-mono"><h1 className="text-2xl">{notFound ? 'NFT não encontrado' : 'Falha ao carregar NFT'}</h1><p className="mt-3 text-sm text-[#b99872]">{notFound ? 'Este item não existe no catálogo.' : 'Não foi possível consultar o detalhe.'}</p>{!notFound && <button type="button" onClick={() => void refetch()} className="mt-5 text-[#d38d50] underline">Tentar novamente</button>}</div>
        : data ? <DetailContent key={data.id} nft={data}/> : null}
    </main>
  )
}
