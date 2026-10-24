
import { ArrowRight } from 'lucide-react'

import nft1 from '@/assets/nft1.png'
import nft2 from '@/assets/nft2.png'

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="
        relative isolate mt-4 overflow-hidden
        rounded-[28px]
        bg-[radial-gradient(circle_at_20%_25%,#805638_0%,#4a3021_50%,#251813_100%)]
        px-4 py-4
        sm:px-8
        lg:mt-0 lg:overflow-hidden lg:rounded-none
        lg:bg-none lg:px-0 lg:pb-6 lg:pt-7
      "
    >
      {/* Elementos decorativos do fundo mobile */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute -left-20 -top-12
          h-72 w-72 rounded-full bg-[#a16d47]/20
          lg:hidden
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute -bottom-32 right-0
          h-80 w-80 rounded-full bg-[#1c100c]/30
          lg:hidden
        "
      />

      <div
        className="
          relative z-10 grid min-h-[190px]
          grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]
          items-center gap-3
          lg:min-h-[400px] lg:grid-cols-2 lg:gap-12
        "
      >
        {/* Conteúdo textual */}
        <div className="flex min-w-0 flex-col items-start gap-4">
          <p className="font-mono text-xs tracking-wide text-[#f4ede5] lg:text-sm">
            Bem-vindo à Kurio
          </p>

          <h1
            id="hero-title"
            className="
              font-mono text-[clamp(1.15rem,4.7vw,2rem)]
              font-bold leading-[1.3] tracking-tight
              text-[#f4ede5] lg:text-[clamp(2.1rem,3vw,3.1rem)] lg:leading-[1.35]
            "
          >
            <span className="lg:hidden">
                SEJA DONO DA CULTURA DIGITAL
            </span>

            <span className="hidden lg:inline">
                <span className="hidden lg:inline">
                    SEJA DONO DO FUTURO
                </span>
                <span className="block">
                    DA ARTE DIGITAL
                </span>

            </span>
          </h1>

          <p className="font-mono text-xs leading-relaxed text-[#d2ad87] lg:max-w-md lg:text-sm">
            <span className="lg:hidden">
              Descubra NFTs selecionados de criadores do mundo todo.
            </span>

            <span className="hidden lg:inline">
              Descubra NFTs selecionados de criadores emergentes
              e consagrados. Colecione arte digital rara, apoie
              artistas e tenha uma parte da cultura da internet.
            </span>
          </p>

          {/* Navegação para o catálogo */}
          <a
            href="#catalog"
            className="
              inline-flex items-center gap-2 font-mono
              text-sm font-bold text-[#e69b55]
              transition-colors hover:text-[#ffba78]
              focus-visible:outline-2
              focus-visible:outline-offset-4
              focus-visible:outline-[#e69b55]
              lg:rounded-sm lg:bg-[#d38d50]
              lg:px-6 lg:py-3 lg:text-[#160e0b]
              lg:hover:bg-[#e9a465] lg:hover:text-[#160e0b]
            "
          >
            EXPLORAR

            <ArrowRight
              size={20}
              className="lg:hidden"
              aria-hidden="true"
            />
          </a>
        </div>

        {/* NFTs do Hero */}
        <div className="relative min-w-0 self-start lg:w-full lg:max-w-[420px] lg:justify-self-end lg:self-center">
          <img
            src={nft1}
            alt="Emerald Ape, NFT de um macaco com óculos e jaqueta verde"
            fetchPriority="high"
            decoding="async"
            className="
              aspect-square w-full rounded-[20px]
              object-cover
              lg:ml-auto lg:max-w-[420px]
            "
          />

          {/* Imagem sobreposta exclusiva do mobile */}
          <img
            src={nft2}
            alt="Sage Nomad, NFT de um macaco com moletom roxo"
            decoding="async"
            className="
              absolute -bottom-3 -left-5
              aspect-square w-[48%]
              rounded-2xl border-4 border-[#5d3d2b]
              object-cover lg:hidden
            "
          />
        </div>
      </div>
      <div aria-hidden="true" className="relative z-10 mt-5 flex items-center justify-center gap-2 lg:mt-0"><span className="h-2 w-2 rounded-full bg-[#d38d50]" /><span className="h-2 w-2 rounded-full bg-[#85634b]" /><span className="h-2 w-2 rounded-full bg-[#85634b]" /></div>
    </section>
  )
}
