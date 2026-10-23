import { api } from '@/lib/api'
import type { AuthResponse, PublicUser, SessionResponse, Wallet } from '../types/auth'

export async function login(input: { email: string; password: string }): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', input); return data
}
export async function register(input: { name: string; email: string; password: string }): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', input); return data
}
export async function getSession(): Promise<SessionResponse> {
  const { data } = await api.get<SessionResponse>('/auth/session'); return data
}
export async function logout(): Promise<void> { await api.post('/auth/logout') }
export async function getProfile(): Promise<PublicUser> {
  const { data } = await api.get<PublicUser>('/profile'); return data
}
export async function updateProfile(input: { name: string; email: string }): Promise<PublicUser> {
  const { data } = await api.patch<PublicUser>('/profile', input); return data
}
export async function updateAvatar(avatarUrl: string): Promise<PublicUser> {
  const { data } = await api.patch<PublicUser>('/profile/avatar', { avatarUrl }); return data
}
export async function changePassword(input: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
  const { data } = await api.patch<{ message: string }>('/profile/password', input); return data
}
export async function listWallets(): Promise<Wallet[]> {
  const { data } = await api.get<Wallet[]>('/wallets'); return data
}
export async function saveWallet(wallet: Wallet): Promise<Wallet[]> {
  const { data } = await api.put<Wallet[]>(`/wallets/${wallet.slot}`, wallet); return data
}
export async function listFavorites(): Promise<string[]> {
  const { data } = await api.get<string[]>('/favorites'); return data
}
export async function setFavorite(input: { id: string; favorite: boolean }): Promise<string[]> {
  const { data } = input.favorite
    ? await api.put<string[]>(`/favorites/${encodeURIComponent(input.id)}`)
    : await api.delete<string[]>(`/favorites/${encodeURIComponent(input.id)}`)
  return data
}
