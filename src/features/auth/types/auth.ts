export interface PublicUser {
  id: string
  name: string
  email: string
  avatarUrl: string | null
}
export type WalletNetwork = 'ethereum' | 'polygon' | 'base'
export interface Wallet {
  slot: 'primary' | 'secondary'
  label: string
  address: string
  network: WalletNetwork
}
export interface AuthResponse { token: string; user: PublicUser; expiresAt: number }
export interface SessionResponse { user: PublicUser; expiresAt: number }
