import { Link } from '@tanstack/react-router'
import { pageShellClass } from './pageShell'

const info = [
  { icon: 'W', title: 'Segurança da carteira', body: 'Proteja sua carteira e colecione arte digital verificada com confiança.' },
  { icon: 'C', title: 'Criadores em destaque', body: 'Conheça artistas, estúdios e comunidades que moldam a cultura digital.' },
  { icon: 'D', title: 'Alertas de lançamentos', body: 'Descubra novas coleções e novidades do mercado.' },
]
export function Footer() {
  return <footer className={`${pageShellClass} hidden pb-6 font-mono text-[#f4ede5] lg:block`}>
    <div className="grid grid-cols-4 bg-[#251711] p-6">
      {info.map((item) => <section key={item.title} className="border-r border-[#6a432c] px-4 last:border-r-0">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#d38d50] font-bold text-[#160e0b]">{item.icon}</div>
        <h2 className="text-sm font-bold">{item.title}</h2><p className="mt-3 text-xs leading-5 text-[#b99872]">{item.body}</p>
      </section>)}
      <section className="pl-6"><h2 className="text-sm font-bold">Antecipe-se ao próximo lançamento</h2><div className="mt-4 flex"><input disabled aria-label="Newsletter indisponível no desafio" placeholder="digite seu e-mail..." className="min-w-0 flex-1 bg-[#402711] p-2 text-xs placeholder:text-[#b99872]"/><button disabled className="bg-[#d38d50] px-3 text-xs font-bold text-[#160e0b] opacity-60">Enviar</button></div><p className="mt-3 text-xs leading-5 text-[#b99872]">Receba novidades da arte digital. Assinatura fora do escopo desta demonstração.</p></section>
    </div>
    <div className="grid grid-cols-4 gap-4 bg-[#3b220f] px-6 py-5 text-xs"><strong>KURIO</strong><p>Feito para colecionadores, criadores e cultura</p><span>contato@email.com</span><span>Arte digital para todos</span></div>
    <div className="grid grid-cols-4 gap-5 bg-[#251711] px-6 py-6 text-xs"><section><h3 className="mb-3 font-bold">Meu perfil</h3><Link to="/profile" className="block py-1 hover:text-[#d38d50]">Meu perfil</Link><Link to="/favorites" className="block py-1 hover:text-[#d38d50]">Minha coleção</Link><Link to="/wallets" className="block py-1 hover:text-[#d38d50]">Carteiras</Link></section><section><h3 className="mb-3 font-bold">Central de ajuda</h3><p className="py-1 text-[#b99872]">Ajuda e suporte (fora do escopo)</p><p className="py-1 text-[#b99872]">Como comprar NFTs</p></section><section><h3 className="mb-3 font-bold">Coleções</h3><Link to="/" className="block py-1 hover:text-[#d38d50]">Arte digital</Link><Link to="/" className="block py-1 hover:text-[#d38d50]">Fotografia</Link></section><section><h3 className="mb-3 font-bold">Redes sociais</h3><p className="py-1 text-[#b99872]">Canais externos não integrados</p><h3 className="mt-5 font-bold">Carteiras compatíveis</h3><p className="mt-2 text-[#d38d50]">MetaMask · WalletConnect · Coinbase</p></section></div>
    <p className="py-4 text-center text-[10px]">© 2026 Kurio. Propriedade digital para todos.</p>
  </footer>
}
