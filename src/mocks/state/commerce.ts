import { nftFixtures } from '../fixtures/nfts'
import type { NFT } from '@/features/nft/types/nft'
import type { NFTEdition, NFTDetail } from '@/features/nft/types/detail'
import type { CartItem, CartResponse, CartQuote } from '@/features/cart/types/cart'
import { ethToWei } from '@/features/nft/lib/price'
import { multiplyEth, weiToEth } from '@/features/cart/lib/money'

// Estado simulado pertence ao MSW, nunca aos componentes React.
// Será substituído por estado por sessão quando o bloco de autenticação entrar.
export const GUEST_CART_STORAGE_KEY = 'kurio:cart:guest:v1'

interface StoredLine {
  nftId: string
  editionId: string
  quantity: number
}
interface StoredCart {
  items: StoredLine[]
  coupon: string | null
}

export class MockBusinessError extends Error {
  public status: number
  constructor(message: string, status: number) { super(message); this.status = status }
}

function getNft(id: string): NFT | undefined {
  return nftFixtures.find((nft) => nft.id === id)
}

export function getEditions(nft: NFT): NFTEdition[] {
  return [
    { id: 'standard', label: 'Edição padrão', priceEth: nft.priceEth, available: 10 },
    { id: 'collector', label: 'Edição de colecionador', priceEth: weiToEth(ethToWei(nft.priceEth) * 125n / 100n), available: 3 },
  ]
}

export function getNftDetail(id: string): NFTDetail | undefined {
  const nft = getNft(id)
  if (!nft) return undefined
  return {
    ...nft,
    creator: 'Kurio Studio',
    description: `Conheça ${nft.name}, uma peça digital da coleção Kurio. Edições e disponibilidade são simuladas para o desafio.`,
    gallery: [nft.imageUrl],
    editions: getEditions(nft),
    version: 1,
  }
}

function cartKey(scope: string) {
  return scope === 'guest' ? GUEST_CART_STORAGE_KEY : `kurio:cart:${scope}:v1`
}
function safeRead(scope = 'guest'): StoredCart {
  const fallback: StoredCart = { items: [], coupon: null }
  try {
    const raw = localStorage.getItem(cartKey(scope))
    if (!raw) return fallback
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || !('items' in parsed) || !Array.isArray(parsed.items)) return fallback
    const items = parsed.items.filter((item: unknown): item is StoredLine => {
      if (typeof item !== 'object' || item === null) return false
      const entry = item as Partial<StoredLine>
      return typeof entry.nftId === 'string' && typeof entry.editionId === 'string' && typeof entry.quantity === 'number' && Number.isSafeInteger(entry.quantity) && entry.quantity > 0
    }).slice(0, 100)
    const coupon = 'coupon' in parsed && typeof parsed.coupon === 'string' ? parsed.coupon : null
    return { items, coupon }
  } catch { return fallback }
}

function save(store: StoredCart, scope = 'guest'): void {
  try { localStorage.setItem(cartKey(scope), JSON.stringify(store)) }
  catch { throw new MockBusinessError('Armazenamento indisponível. Tente liberar espaço e novamente.', 503) }
}

function hydrate(store: StoredCart): CartResponse {
  const items: CartItem[] = store.items.flatMap((line) => {
    const nft = getNft(line.nftId)
    const edition = nft && getEditions(nft).find((candidate) => candidate.id === line.editionId)
    if (!nft || !edition) return []
    return [{
      key: `${nft.id}__${edition.id}`,
      nftId: nft.id,
      editionId: edition.id,
      name: nft.name,
      editionLabel: edition.label,
      imageUrl: nft.imageUrl,
      network: nft.network,
      unitPriceEth: edition.priceEth,
      available: edition.available,
      quantity: line.quantity,
      version: 1,
    }]
  })
  return { items, coupon: store.coupon }
}

export function readCart(scope = 'guest'): CartResponse { return hydrate(safeRead(scope)) }

export function addLine(nftId: string, editionId: string, quantity: number, scope = 'guest'): CartResponse {
  const detail = getNftDetail(nftId)
  if (!detail) throw new MockBusinessError('NFT não encontrado', 404)
  const edition = detail.editions.find((option) => option.id === editionId)
  if (!edition) throw new MockBusinessError('Edição indisponível', 404)
  if (!Number.isSafeInteger(quantity) || quantity <= 0) throw new MockBusinessError('Quantidade inválida', 400)
  const store = safeRead(scope)
  const existing = store.items.find((item) => item.nftId === nftId && item.editionId === editionId)
  if ((existing?.quantity ?? 0) + quantity > edition.available) throw new MockBusinessError('Estoque insuficiente para essa edição', 409)
  if (existing) existing.quantity += quantity
  else store.items.push({ nftId, editionId, quantity })
  save(store, scope)
  return hydrate(store)
}

export function updateLine(key: string, quantity: number, scope = 'guest'): CartResponse {
  if (!Number.isSafeInteger(quantity) || quantity < 1) throw new MockBusinessError('Quantidade inválida', 400)
  const store = safeRead(scope)
  const line = store.items.find((item) => `${item.nftId}__${item.editionId}` === key)
  if (!line) throw new MockBusinessError('Item não encontrado', 404)
  const nft = getNftDetail(line.nftId)
  const edition = nft?.editions.find((option) => option.id === line.editionId)
  if (!edition || quantity > edition.available) throw new MockBusinessError('Quantidade maior que a disponibilidade atual', 409)
  line.quantity = quantity
  save(store, scope)
  return hydrate(store)
}

export function deleteLine(key: string, scope = 'guest'): CartResponse {
  const store = safeRead(scope)
  if (!store.items.some((item) => `${item.nftId}__${item.editionId}` === key)) throw new MockBusinessError('Item não encontrado', 404)
  store.items = store.items.filter((item) => `${item.nftId}__${item.editionId}` !== key)
  save(store, scope)
  return hydrate(store)
}

export function setCoupon(code: string, scope = 'guest'): CartResponse {
  const normalized = code.trim().toUpperCase()
  if (normalized === 'EXPIRED10') throw new MockBusinessError('Cupom expirado', 422)
  if (normalized !== 'KURIO10') throw new MockBusinessError('Cupom inválido', 422)
  const store = safeRead(scope)
  store.coupon = normalized
  save(store, scope)
  return hydrate(store)
}

export function clearCoupon(scope = 'guest'): CartResponse {
  const store = safeRead(scope)
  store.coupon = null
  save(store, scope)
  return hydrate(store)
}

export function quoteCart(scope = 'guest'): CartQuote {
  const cart = readCart(scope)
  const subtotalWei = cart.items.reduce((sum, item) => sum + multiplyEth(item.unitPriceEth, item.quantity), 0n)
  const discountWei = cart.coupon === 'KURIO10' ? subtotalWei / 10n : 0n
  // Taxas apenas demonstrativas, cobradas por rede presente no carrinho.
  const networkCount = new Set(cart.items.map((item) => item.network)).size
  const feeWei = cart.items.length ? ethToWei('0.003') * BigInt(networkCount) : 0n
  const issues = cart.items.filter((item) => item.quantity > item.available)
    .map((item) => `${item.name}: quantidade indisponível`)
  return {
    ...cart,
    subtotalEth: weiToEth(subtotalWei),
    discountEth: weiToEth(discountWei),
    networkFeeEth: weiToEth(feeWei),
    totalEth: weiToEth(subtotalWei - discountWei + feeWei),
    valid: cart.items.length > 0 && issues.length === 0,
    issues,
  }
}

// Combina os itens do visitante à conta autenticada, limitando as quantidades ao estoque.
export function mergeGuestCart(userId: string): void {
  const guest = safeRead('guest')
  if (guest.items.length === 0 && !guest.coupon) return
  const scope = `user:${userId}`
  const own = safeRead(scope)
  for (const line of guest.items) {
    const detail = getNftDetail(line.nftId)
    const edition = detail?.editions.find((item) => item.id === line.editionId)
    if (!edition) continue
    const current = own.items.find((item) => item.nftId === line.nftId && item.editionId === line.editionId)
    const sum = (current?.quantity ?? 0) + line.quantity
    const quantity = Math.min(edition.available, sum)
    if (current) current.quantity = quantity
    else if (quantity > 0) own.items.push({ ...line, quantity })
  }
  if (!own.coupon && guest.coupon === 'KURIO10') own.coupon = guest.coupon
  save(own, scope)
  localStorage.removeItem(GUEST_CART_STORAGE_KEY)
}
