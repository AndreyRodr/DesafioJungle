import { ArrowRight } from 'lucide-react'
import nft1 from '@/assets/nft1.png'
import nft2 from '@/assets/nft2.png'

const articles = [
  {
    title: 'Como funciona a propriedade de NFTs',
    excerpt: 'Aprenda a colecionar, negociar e verificar ativos digitais.',
    content: 'Um NFT registra a identidade de um ativo digital em uma rede. Antes de comprar, confira o criador, a coleção, o contrato e as condições da edição. Nesta demonstração, todas as compras e carteiras são simuladas.',
    image: nft2,
    date: '12 de setembro',
    reading: '6 min',
  },
  {
    title: '10 artistas digitais para acompanhar',
    excerpt: 'Conheça criadores que moldam a cultura digital.',
    content: 'Explore técnicas, propostas visuais e a trajetória de cada artista. Na Kurio, o catálogo é demonstrativo, mas a navegação ajuda a descobrir diferentes estilos de arte digital.',
    image: nft1,
    date: '13 de setembro',
    reading: '2 min',
  },
  {
    title: 'Raridade, atributos e procedência',
    excerpt: 'Entenda raridade, procedência, direitos autorais e utilidade.',
    content: 'Uma edição pode ter quantidade limitada e características próprias. Avalie a disponibilidade e os atributos, mas não confunda raridade com garantia de valorização.',
    image: nft2,
    date: '15 de setembro',
    reading: '3 min',
  },
  {
    title: 'Como proteger sua carteira',
    excerpt: 'Proteja seus ativos, suas chaves e sua identidade.',
    content: 'Use autenticação forte, confira endereços e nunca compartilhe sua frase de recuperação. A Kurio deste desafio não se conecta a carteiras reais nem movimenta criptoativos.',
    image: nft1,
    date: '15 de setembro',
    reading: '2 min',
  },
]

export function HomePromoBanners() {
  return (
    <section aria-label="Destaques da Kurio" className="mt-16 grid gap-5 md:grid-cols-2 lg:mt-20">
      <article className="grid min-h-44 grid-cols-[42%_1fr] overflow-hidden rounded-lg bg-[#2a1914]">
        <img src={nft1} alt="" loading="lazy" className="h-full min-h-44 w-full object-cover" />
        <div className="flex flex-col items-end justify-center gap-3 px-4 py-6 text-right font-mono sm:px-6">
          <h2 className="text-sm font-bold leading-snug text-[#f4ede5] lg:text-base">Lançamentos genesis de edição limitada</h2>
          <p className="text-xs leading-5 text-[#b99872]">Colecione edições especiais diretamente dos criadores antes da revelação pública.</p>
          <a href="#catalog" className="inline-flex items-center gap-1 rounded bg-[#d38d50] px-4 py-2 text-xs font-bold text-[#160e0b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4ede5]">Explorar <ArrowRight size={13} aria-hidden="true" /></a>
        </div>
      </article>
      <article className="grid min-h-44 grid-cols-[42%_1fr] overflow-hidden rounded-lg bg-[#2a1914]">
        <img src={nft2} alt="" loading="lazy" className="h-full min-h-44 w-full object-cover" />
        <div className="flex flex-col items-end justify-center gap-3 px-4 py-6 text-right font-mono sm:px-6">
          <h2 className="text-sm font-bold leading-snug text-[#f4ede5] lg:text-base">Arte digital selecionada e muito mais</h2>
          <p className="text-xs leading-5 text-[#b99872]">Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.</p>
          <a href="#catalog" className="inline-flex items-center gap-1 rounded bg-[#d38d50] px-4 py-2 text-xs font-bold text-[#160e0b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4ede5]">Explorar <ArrowRight size={13} aria-hidden="true" /></a>
        </div>
      </article>
    </section>
  )
}

export function HomeJournal() {
  return (
    <section aria-labelledby="journal-title" className="py-16 font-mono lg:py-20">
      <div className="mb-7 text-center">
        <h2 id="journal-title" className="text-2xl font-bold text-[#f4ede5] lg:text-3xl">Diário da Cunhagem</h2>
        <p className="mx-auto mt-3 max-w-2xl text-xs leading-6 text-[#b99872]">Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {articles.map((article) => (
          <article key={article.title} className="min-w-0 overflow-hidden rounded-md bg-[#2a1914]">
            <img src={article.image} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
            <div className="p-3 sm:p-4">
              <p className="text-[10px] leading-4 text-[#b99872]">{article.date} <span aria-hidden="true">|</span> Leitura de {article.reading}</p>
              <h3 className="mt-2 text-xs font-bold leading-5 text-[#f4ede5] sm:text-sm">{article.title}</h3>
              <p className="mt-2 text-xs leading-5 text-[#b99872]">{article.excerpt}</p>
              <details className="group mt-2 text-xs">
                <summary className="cursor-pointer list-none font-bold text-[#d38d50] focus-visible:outline-2 focus-visible:outline-[#d38d50]">Ler mais <span aria-hidden="true">→</span></summary>
                <p className="mt-3 leading-5 text-[#d2bdab]">{article.content}</p>
              </details>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
