import { Link, useParams } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { CheckCircle2, Clock3, XCircle } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { fetchOrder } from '../api/orders'

export function OrderPage() {
  const { orderId } = useParams({ from: '/orders/$orderId' })
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { data: order, isPending, isError, refetch } = useQuery({
    queryKey: ['order', user?.id, orderId],
    queryFn: ({ signal }) => fetchOrder(orderId, signal),
    refetchInterval: ({ state }) => state.data?.status === 'pending' ? 1400 : false,
    retry: 1,
  })
  useEffect(() => {
    if (order?.status === 'confirmed') {
      void queryClient.invalidateQueries({ queryKey: ['cart'] })
      void queryClient.invalidateQueries({ queryKey: ['cart-quote'] })
    }
  }, [order?.status, queryClient])
  return <main className="mx-auto max-w-4xl px-5 pb-32 pt-10 font-mono text-[#f4ede5] lg:pb-16">
    <Link to="/" className="text-sm text-[#d38d50]">← Voltar ao mercado</Link>
    {isPending ? <p role="status" className="mt-12">Consultando pedido...</p> : isError || !order ? <div role="alert" className="mt-12"><h1 className="text-2xl">Não foi possível recuperar o pedido.</h1><button onClick={() => void refetch()} className="mt-4 text-[#d38d50] underline">Tentar novamente</button></div> :
      <div className="mx-auto mt-12 max-w-2xl border border-[#503328] bg-[#251711] p-6 sm:p-10">
        <div className="text-center">
          {order.status === 'confirmed' ? <CheckCircle2 className="mx-auto text-[#d38d50]" size={48}/> : order.status === 'declined' ? <XCircle className="mx-auto text-red-300" size={48}/> : <Clock3 className="mx-auto text-[#d38d50]" size={48}/>}
          <h1 className="mt-4 text-2xl font-bold">{order.status === 'confirmed' ? 'Pedido confirmado!' : order.status === 'declined' ? 'Pagamento recusado' : 'Pagamento pendente'}</h1>
          <p role="status" className="mt-2 break-all text-xs text-[#b99872]">Pedido: {order.id}</p>
          {order.status === 'pending' && <p className="mt-4 text-sm text-[#b99872]">Estamos aguardando o resultado simulado. Você pode atualizar a página sem duplicar a compra.</p>}
          {order.reason && <p role="alert" className="mt-4 text-sm text-red-300">{order.reason}</p>}
        </div>
        <div className="mt-8 border-t border-[#503328] pt-5">
          <h2 className="font-bold">Resumo da transação</h2>
          {order.snapshot.quote.items.map(item => <div key={item.key} className="mt-4 flex items-center gap-3 text-sm"><img src={item.imageUrl} alt="" className="h-14 w-14 rounded-md object-cover"/><div className="flex-1"><p>{item.name}</p><p className="text-[#b99872]">{item.editionLabel} · x{item.quantity}</p></div><span className="text-[#d38d50]">{item.unitPriceEth} ETH</span></div>)}
          <div className="mt-6 space-y-2 border-t border-[#503328] pt-4 text-sm">
            <p className="flex justify-between"><span>Subtotal</span><span>{order.snapshot.quote.subtotalEth} ETH</span></p>
            <p className="flex justify-between"><span>Desconto</span><span>− {order.snapshot.quote.discountEth} ETH</span></p>
            <p className="flex justify-between"><span>Taxa da rede</span><span>{order.snapshot.quote.networkFeeEth} ETH</span></p>
            <p className="flex justify-between pt-3 text-lg font-bold"><span>Total</span><span className="text-[#d38d50]">{order.snapshot.quote.totalEth} ETH</span></p>
          </div>
          {order.transactionId && <p className="mt-5 break-all text-xs text-[#b99872]">Transação simulada: {order.transactionId}</p>}
          <p className="mt-2 text-xs text-[#b99872]">Carteira: {order.snapshot.walletLabel} · {order.snapshot.network}</p>
        </div>
        <Link to="/" className="mt-7 block rounded bg-[#d38d50] px-5 py-3 text-center font-bold text-[#160e0b]">Voltar ao catálogo</Link>
      </div>}
  </main>
}
