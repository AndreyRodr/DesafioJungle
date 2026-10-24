import type { PublicUser, Wallet, WalletNetwork } from '@/features/auth/types/auth'
import { MockBusinessError } from './commerce'
import { nftFixtures } from '../fixtures/nfts'

const USERS_KEY = 'kurio:mock-users:v1'
const SESSIONS_KEY = 'kurio:mock-sessions:v1'
const ITERATIONS = 100_000
const MAX_AGE_MS = 45 * 60 * 1000

interface StoredUser extends PublicUser {
  passwordSalt: string
  passwordHash: string
  wallets: Wallet[]
  favorites: string[]
}
interface StoredSession { userId: string; token: string; expiresAt: number }

function load<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback } catch { return fallback }
}
function save(key: string, value: unknown) { localStorage.setItem(key, JSON.stringify(value)) }
function publicUser(user: StoredUser): PublicUser {
  return { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl }
}
function randomSalt() { return Array.from(crypto.getRandomValues(new Uint8Array(16)), (x) => x.toString(16).padStart(2, '0')).join('') }
function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const result = new Uint8Array(hex.length / 2)
  for (let i = 0; i < result.length; i++) result[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return result
}
async function derive(password: string, salt: string): Promise<string> {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveBits'])
  const bytes = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: hexToBytes(salt), iterations: ITERATIONS, hash: 'SHA-256' }, base, 256)
  return Array.from(new Uint8Array(bytes), (x) => x.toString(16).padStart(2, '0')).join('')
}
async function buildUser(id: string, name: string, email: string, password: string): Promise<StoredUser> {
  const passwordSalt = randomSalt()
  return { id, name, email, avatarUrl: null, passwordSalt, passwordHash: await derive(password, passwordSalt), wallets: [], favorites: [] }
}
let initialization: Promise<void> | undefined
async function ensureSeed(): Promise<void> {
  if (!initialization) initialization = (async () => {
    if (localStorage.getItem(USERS_KEY) !== null) return
    // Credenciais fictícias, documentadas e usadas exclusivamente na simulação local.
    const users = [
      await buildUser('demo-collector', 'Colecionador Kurio', 'collector@kurio.test', 'Kurio@123'),
      await buildUser('demo-artist', 'Artista Kurio', 'artist@kurio.test', 'Kurio@123'),
    ]
    if (localStorage.getItem(USERS_KEY) === null) save(USERS_KEY, users)
  })().catch((error: unknown) => { initialization = undefined; throw error })
  await initialization
}
async function users(): Promise<StoredUser[]> { await ensureSeed(); return load<StoredUser[]>(USERS_KEY, []) }
function sessions(): StoredSession[] { return load<StoredSession[]>(SESSIONS_KEY, []) }
function extractToken(request: Request): string | null {
  const header = request.headers.get('Authorization')
  return header?.startsWith('Bearer ') ? header.slice(7) : null
}
async function findUser(request: Request): Promise<{ user: StoredUser; session: StoredSession } | null> {
  const token = extractToken(request)
  if (!token) return null
  const current = sessions().find((record) => record.token === token)
  if (!current || current.expiresAt <= Date.now()) {
    if (current) save(SESSIONS_KEY, sessions().filter((s) => s.token !== token))
    throw new MockBusinessError('Sessão expirada. Entre novamente.', 401)
  }
  const user = (await users()).find((item) => item.id === current.userId)
  if (!user) throw new MockBusinessError('Sessão inválida.', 401)
  return { user, session: current }
}
export async function requireUser(request: Request): Promise<{ user: PublicUser; expiresAt: number }> {
  const current = await findUser(request)
  if (!current) throw new MockBusinessError('Autenticação necessária.', 401)
  return { user: publicUser(current.user), expiresAt: current.session.expiresAt }
}
export async function cartScope(request: Request): Promise<string> {
  const current = await findUser(request)
  return current ? `user:${current.user.id}` : 'guest'
}
function normalizeEmail(email: string) { return email.trim().toLowerCase() }
function validEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254 }
function validPassword(password: string) { return password.length >= 8 && password.length <= 128 && /[A-Z]/.test(password) && /\d/.test(password) }
function checkEmail(email: string) { if (!validEmail(email)) throw new MockBusinessError('E-mail inválido.', 422) }
function checkName(name: string) { if (name.trim().length < 2 || name.trim().length > 80) throw new MockBusinessError('Nome deve ter entre 2 e 80 caracteres.', 422) }
function checkPassword(password: string) { if (!validPassword(password)) throw new MockBusinessError('A senha deve ter 8 a 128 caracteres, uma maiúscula e um número.', 422) }
function createSession(user: StoredUser) {
  const token = crypto.randomUUID() + '-' + crypto.randomUUID()
  const expiresAt = Date.now() + MAX_AGE_MS
  save(SESSIONS_KEY, [...sessions().filter((s) => s.expiresAt > Date.now()), { userId: user.id, token, expiresAt }])
  return { token, expiresAt, user: publicUser(user) }
}
export async function loginAccount(email: string, password: string) {
  const user = (await users()).find((item) => item.email === normalizeEmail(email))
  if (!user || (await derive(password, user.passwordSalt)) !== user.passwordHash)
    throw new MockBusinessError('E-mail ou senha incorretos.', 401)
  return createSession(user)
}
export async function registerAccount(name: string, email: string, password: string) {
  checkName(name); checkEmail(email); checkPassword(password)
  const current = await users()
  if (current.some((item) => item.email === normalizeEmail(email))) throw new MockBusinessError('E-mail já cadastrado.', 409)
  const user = await buildUser(crypto.randomUUID(), name.trim(), normalizeEmail(email), password)
  save(USERS_KEY, [...current, user])
  return createSession(user)
}
export function logoutAccount(request: Request) {
  const token = extractToken(request)
  if (token) save(SESSIONS_KEY, sessions().filter((record) => record.token !== token))
}
export async function changeProfile(request: Request, name: string, email: string): Promise<PublicUser> {
  checkName(name); checkEmail(email)
  const { user } = await requireUser(request)
  const current = await users()
  const normalized = normalizeEmail(email)
  if (current.some((item) => item.id !== user.id && item.email === normalized)) throw new MockBusinessError('E-mail já cadastrado.', 409)
  const updated = current.map((item) => item.id === user.id ? { ...item, name: name.trim(), email: normalized } : item)
  save(USERS_KEY, updated)
  return publicUser(updated.find((item) => item.id === user.id)!)
}
export async function changeAvatar(request: Request, avatarUrl: string): Promise<PublicUser> {
  const { user } = await requireUser(request)
  if (!/^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(avatarUrl) || avatarUrl.length > 400_000)
    throw new MockBusinessError('Envie PNG, JPG ou WebP com até 250 KB.', 422)
  const updated = (await users()).map((item) => item.id === user.id ? { ...item, avatarUrl } : item)
  save(USERS_KEY, updated)
  return publicUser(updated.find((item) => item.id === user.id)!)
}
export async function changePassword(request: Request, currentPassword: string, newPassword: string) {
  checkPassword(newPassword)
  const { user } = await requireUser(request)
  const current = await users()
  const record = current.find((item) => item.id === user.id)!
  if ((await derive(currentPassword, record.passwordSalt)) !== record.passwordHash) throw new MockBusinessError('Senha atual incorreta.', 422)
  const passwordSalt = randomSalt()
  const passwordHash = await derive(newPassword, passwordSalt)
  save(USERS_KEY, current.map((item) => item.id === user.id ? { ...item, passwordSalt, passwordHash } : item))
  return { message: 'Senha alterada com sucesso.' }
}
export async function getWallets(request: Request): Promise<Wallet[]> {
  const { user } = await requireUser(request)
  return (await users()).find((item) => item.id === user.id)!.wallets
}
export async function putWallet(request: Request, slot: unknown, input: Record<string, unknown>): Promise<Wallet[]> {
  const { user } = await requireUser(request)
  if (slot !== 'primary' && slot !== 'secondary') throw new MockBusinessError('Tipo de carteira inválido.', 400)
  const address = input.address
  const label = input.label
  const network = input.network
  if (typeof address !== 'string' || !/^0x[a-fA-F0-9]{40}$/.test(address) || typeof label !== 'string' || label.trim().length < 2 || label.length > 40 || !(['ethereum', 'polygon', 'base'] as unknown[]).includes(network))
    throw new MockBusinessError('Informe um nome, uma rede válida e um endereço EVM (0x + 40 hexadecimais).', 422)
  const wallet: Wallet = { slot, address, label: label.trim(), network: network as WalletNetwork }
  const current = await users()
  const record = current.find((item) => item.id === user.id)!
  if (record.wallets.some((item) => item.slot !== slot && item.address.toLowerCase() === address.toLowerCase())) throw new MockBusinessError('Carteira já cadastrada neste perfil.', 409)
  const wallets = [...record.wallets.filter((item) => item.slot !== slot), wallet].sort((a) => a.slot === 'primary' ? -1 : 1)
  save(USERS_KEY, current.map((item) => item.id === user.id ? { ...item, wallets } : item))
  return wallets
}
export async function getFavorites(request: Request): Promise<string[]> {
  const { user } = await requireUser(request)
  return (await users()).find((item) => item.id === user.id)!.favorites
}
export async function changeFavorite(request: Request, nftId: string, active: boolean): Promise<string[]> {
  const { user } = await requireUser(request)
  if (!nftFixtures.some((item) => item.id === nftId)) throw new MockBusinessError('NFT não encontrado.', 404)
  const current = await users()
  const record = current.find((item) => item.id === user.id)!
  const favorites = active ? Array.from(new Set([...record.favorites, nftId])) : record.favorites.filter((id) => id !== nftId)
  save(USERS_KEY, current.map((item) => item.id === user.id ? { ...item, favorites } : item))
  return favorites
}

/** Usado apenas no gateway MSW para isolar notificações por sessão. */
export function socketUserForToken(token: string | null): string | null {
  if (!token) return null
  const session = sessions().find((item) => item.token === token && item.expiresAt > Date.now())
  return session?.userId ?? null
}
