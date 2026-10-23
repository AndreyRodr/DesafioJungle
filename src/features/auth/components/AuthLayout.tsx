import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
export function AuthLayout({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <main className="mx-auto max-w-lg px-5 pb-32 pt-12 font-mono text-[#f4ede5] lg:pb-16">
    <Link to="/" className="text-sm text-[#d38d50]">← Voltar ao catálogo</Link>
    <div className="mt-8 rounded-2xl border border-[#503328] bg-[#251711] p-6 sm:p-9">
      <h1 className="text-2xl font-bold">{title}</h1><p className="mt-2 text-sm text-[#b99872]">{description}</p>
      <div className="mt-8">{children}</div>
    </div>
  </main>
}
export const fieldClass = 'mt-2 w-full rounded-lg border border-[#6c4935] bg-[#160e0b] px-4 py-3 text-sm text-[#f4ede5] focus-visible:outline-2 focus-visible:outline-[#d38d50]'
export const actionClass = 'w-full rounded-lg bg-[#d38d50] px-5 py-3 font-mono font-bold text-[#160e0b] hover:bg-[#e9a465] disabled:cursor-wait disabled:opacity-60'
