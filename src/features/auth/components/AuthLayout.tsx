import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { Hero } from '@/components/Hero'

export function AuthLayout({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const isLogin = title.toLocaleLowerCase('pt-BR').includes('entrar')
  return <main className="relative min-h-[100dvh] px-6 pb-20 pt-16 font-mono text-[#f4ede5] lg:min-h-[800px] lg:py-12">
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden overflow-hidden opacity-60 lg:block">
      <div className="mx-auto max-w-6xl"><Hero /></div>
    </div>
    <div className="pointer-events-none absolute inset-0 hidden bg-[#160e0b]/50 lg:block" aria-hidden="true" />
    <div className="relative mx-auto flex w-full max-w-md flex-col items-center lg:max-w-[400px]">
      <Link to="/" className="mb-14 font-mono text-4xl font-bold tracking-[0.15em] lg:hidden">KURIO</Link>
      <div className="w-full lg:border lg:border-[#503328] lg:bg-[#251711] lg:p-9 lg:shadow-2xl">
        <div className="hidden justify-end lg:flex"><Link to="/" aria-label="Fechar" className="text-lg text-[#d38d50]">×</Link></div>
        <div className="hidden justify-center gap-2 text-base lg:flex"><span className={isLogin ? 'text-[#d38d50]' : ''}>Entrar</span><span>|</span><span className={!isLogin ? 'text-[#d38d50]' : ''}>Criar conta</span></div>
        <h1 className="mt-3 text-center text-2xl font-bold lg:sr-only">{isLogin ? 'Entrar' : 'Criar perfil de colecionador'}</h1>
        <p className="mt-4 hidden text-center text-xs text-[#b99872] lg:block">{description}</p>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  </main>
}
export const fieldClass = 'mt-2 w-full rounded-md border border-[#6c4935] bg-[#160e0b] px-4 py-3 text-sm text-[#f4ede5] placeholder:text-[#b99872] focus-visible:outline-2 focus-visible:outline-[#d38d50]'
export const actionClass = 'w-full rounded-md bg-[#d38d50] px-5 py-3 font-mono font-bold text-[#160e0b] hover:bg-[#e9a465] disabled:cursor-wait disabled:opacity-60'
