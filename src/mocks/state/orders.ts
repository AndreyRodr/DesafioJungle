import type { CreateOrderInput, Order, OrderStatus } from '@/features/checkout/types/orders'
import { quoteFingerprint } from '@/features/checkout/types/orders'
import { MockBusinessError, quoteCart, decrementInventory, consumePurchasedItems, inventoryState } from './commerce'
import { publishMockEvent } from './events'
import { getWallets } from './auth'
import { nftFixtures } from '../fixtures/nfts'

const KEY = 'kurio:mock-orders:v1'
const load = (): StoredOrder[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') as StoredOrder[] }
  catch { return [] }
}
const save = (orders: StoredOrder[]) => localStorage.setItem(KEY, JSON.stringify(orders))
interface StoredOrder extends Order {
  userId: string
  idempotencyKey: string
  fingerprint: string
  decisionAt: number
  finalStatus: Exclude<OrderStatus, 'pending'>
}
const publicOrder = (order: StoredOrder): Order => {
  const { id, status, transactionId, createdAt, updatedAt, reason, snapshot, version } = order
  return { id, status, transactionId, createdAt, updatedAt, reason, snapshot, version }
}
function finish(order: StoredOrder): StoredOrder {
  if (order.status !== 'pending' || Date.now() < order.decisionAt) return order
  order.status = order.finalStatus
  order.version += 1
  order.updatedAt = new Date().toISOString()
  if (order.status === 'declined') order.reason = 'Pagamento recusado pela carteira simulada.'
  else {
    order.transactionId = `0x${crypto.randomUUID().replaceAll('-', '').padEnd(64, '0')}`
    decrementInventory(order.snapshot.quote.items)
    consumePurchasedItems(`user:${order.userId}`, order.snapshot.quote.items)
    for (const item of order.snapshot.quote.items) {
      const inventory = inventoryState(item.nftId)
      publishMockEvent({ type: 'nft.updated', payload: {
        eventId: crypto.randomUUID(), resourceId: item.nftId, version: inventory.version,
        priceEth: inventory.priceEth ?? nftFixtures.find((nft) => nft.id === item.nftId)?.priceEth ?? item.unitPriceEth, available: inventory.standard + inventory.collector,
      } })
    }
  }
  publishMockEvent({ type: 'order.updated', payload: {
    eventId: crypto.randomUUID(), resourceId: order.id, userId: order.userId,
    status: order.status, version: order.version,
  } })
  return order
}
function findAndAdvance(predicate: (order: StoredOrder) => boolean): StoredOrder | undefined {
  const orders = load()
  const order = orders.find(predicate)
  if (order && order.status === 'pending' && Date.now() >= order.decisionAt) {
    finish(order)
    save(orders)
  }
  return order
}
export function orderById(id: string, userId: string): Order {
  const order = findAndAdvance((item) => item.id === id && item.userId === userId)
  if (!order) throw new MockBusinessError('Pedido não encontrado.', 404)
  return publicOrder(order)
}
export function orderByKey(key: string, userId: string): Order {
  const order = findAndAdvance((item) => item.idempotencyKey === key && item.userId === userId)
  if (!order) throw new MockBusinessError('Pedido não encontrado.', 404)
  return publicOrder(order)
}
export async function createOrder(userId: string, request: Request, input: CreateOrderInput): Promise<{ order: Order; timeout: boolean }> {
  if (!/^[a-zA-Z0-9-]{10,128}$/.test(input.idempotencyKey)) throw new MockBusinessError('Chave de idempotência inválida.', 422)
  const fingerprint = JSON.stringify({ quoteFingerprint: input.quoteFingerprint, buyer: input.buyer, walletSlot: input.walletSlot, walletProvider: input.walletProvider, network: input.network })
  const already = findAndAdvance((item) => item.userId === userId && item.idempotencyKey === input.idempotencyKey)
  if (already) {
    if (already.fingerprint !== fingerprint) throw new MockBusinessError('Chave de idempotência reutilizada com conteúdo diferente.', 409)
    return { order: publicOrder(already), timeout: false }
  }
  const buyer = input.buyer
  if (!buyer || typeof buyer.displayName !== 'string' || buyer.displayName.trim().length < 2 ||
    typeof buyer.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer.email)) throw new MockBusinessError('Preencha nome e e-mail válidos.', 422)
  if (!['metamask','walletconnect','coinbase'].includes(input.walletProvider)) throw new MockBusinessError('Provedor inválido.', 422)
  const wallet = (await getWallets(request)).find((w) => w.slot === input.walletSlot)
  if (!wallet) throw new MockBusinessError('Cadastre uma carteira no perfil antes de continuar.', 422)
  if (wallet.network !== input.network) throw new MockBusinessError('A rede selecionada difere da carteira cadastrada.', 422)
  if (localStorage.getItem('kurio:mock-wallet-disconnect') === 'true') throw new MockBusinessError('Carteira desconectada. Tente novamente.', 409)
  const quote = quoteCart(`user:${userId}`)
  if (!quote.valid) throw new MockBusinessError(quote.issues.join('; ') || 'Carrinho inválido.', 409)
  if (quoteFingerprint(quote) !== input.quoteFingerprint) throw new MockBusinessError('Cotação desatualizada. Revise os valores antes de confirmar.', 409)
  const now = new Date().toISOString()
  const scenario = localStorage.getItem('kurio:mock-payment-scenario')
  const order: StoredOrder = {
    id: crypto.randomUUID(), status: 'pending', transactionId: null, createdAt: now, updatedAt: now,
    snapshot: { quote: structuredClone(quote), buyer: { ...buyer, displayName: buyer.displayName.trim(), email: buyer.email.trim() }, walletAddress: wallet.address, walletLabel: wallet.label, network: wallet.network, walletProvider: input.walletProvider },
    version: 1, userId, idempotencyKey: input.idempotencyKey, fingerprint, decisionAt: Date.now() + 2200,
    finalStatus: scenario === 'declined' ? 'declined' : 'confirmed',
  }
  save([...load(), order])
  publishMockEvent({ type: 'order.updated', payload: { eventId: crypto.randomUUID(), resourceId: order.id, userId, version: 1, status: 'pending' } })
  return { order: publicOrder(order), timeout: scenario === 'timeout' }
}
