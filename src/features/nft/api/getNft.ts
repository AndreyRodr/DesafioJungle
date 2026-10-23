import { api } from '@/lib/api'
import type { NFTDetail } from '../types/detail'

export async function getNft(id: string, signal?: AbortSignal): Promise<NFTDetail> {
  const { data } = await api.get<NFTDetail>(`/nfts/${encodeURIComponent(id)}`, { signal })
  return data
}
