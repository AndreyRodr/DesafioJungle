import type { NFT } from '@/features/nft/types/nft'
import nft1 from '@/assets/nft1.png'
import nft2 from '@/assets/nft2.png'

// Dados determinísticos para testes. Apenas os dois primeiros NFTs correspondem aos
// exemplos originais exportados; as outras entradas reutilizam imagens provisórias.
export const nftFixtures: NFT[] = [
  { id: 'emerald-ape-042', name: 'Emerald Ape #042', category: 'digital-art', network: 'ethereum', imageUrl: nft1, priceEth: '1.19', isNew: true, createdAt: '2026-10-20T10:00:00Z' },
  { id: 'sage-nomad-009', name: 'Sage Nomad #009', category: 'collectibles', network: 'ethereum', imageUrl: nft2, priceEth: '1.69', isTrending: true, createdAt: '2026-10-19T10:00:00Z' },
  { id: 'amber-dream-012', name: 'Amber Dream #012', category: 'digital-art', network: 'polygon', imageUrl: nft1, priceEth: '0.42', isNew: true, createdAt: '2026-10-18T10:00:00Z' },
  { id: 'cosmic-waves-021', name: 'Cosmic Waves #021', category: 'generative', network: 'base', imageUrl: nft2, priceEth: '0.81', isTrending: true, createdAt: '2026-10-17T10:00:00Z' },
  { id: 'nova-drift-003', name: 'Nova Drift #003', category: 'games', network: 'ethereum', imageUrl: nft1, priceEth: '2.10', isRare: true, createdAt: '2026-10-16T10:00:00Z' },
  { id: 'pixel-voyager-008', name: 'Pixel Voyager #008', category: '3d-art', network: 'polygon', imageUrl: nft2, priceEth: '0.15', isNew: true, createdAt: '2026-10-15T10:00:00Z' },
  { id: 'golden-hour-117', name: 'Golden Hour #117', category: 'photography', network: 'base', imageUrl: nft1, priceEth: '0.57', createdAt: '2026-10-14T10:00:00Z' },
  { id: 'soft-noise-106', name: 'Soft Noise #106', category: 'music', network: 'ethereum', imageUrl: nft2, priceEth: '0.93', isTrending: true, createdAt: '2026-10-13T10:00:00Z' },
  { id: 'starborn-014', name: 'Starborn #014', category: 'collectibles', network: 'polygon', imageUrl: nft1, priceEth: '1.05', createdAt: '2026-10-12T10:00:00Z' },
  { id: 'retro-signal-061', name: 'Retro Signal #061', category: 'utility', network: 'base', imageUrl: nft2, priceEth: '0.35', isNew: true, createdAt: '2026-10-11T10:00:00Z' },
  { id: 'bright-orbit-002', name: 'Bright Orbit #002', category: 'generative', network: 'ethereum', imageUrl: nft1, priceEth: '3.12', isRare: true, createdAt: '2026-10-10T10:00:00Z' },
  { id: 'deep-surface-082', name: 'Deep Surface #082', category: '3d-art', network: 'polygon', imageUrl: nft2, priceEth: '0.75', createdAt: '2026-10-09T10:00:00Z' },
  { id: 'muted-melody-044', name: 'Muted Melody #044', category: 'music', network: 'base', imageUrl: nft1, priceEth: '0.29', isTrending: true, createdAt: '2026-10-08T10:00:00Z' },
  { id: 'urban-relic-033', name: 'Urban Relic #033', category: 'photography', network: 'ethereum', imageUrl: nft2, priceEth: '0.66', createdAt: '2026-10-07T10:00:00Z' },
  { id: 'cloud-mint-014', name: 'Cloud Mint #014', category: 'subscriptions', network: 'polygon', imageUrl: nft1, priceEth: '0.21', createdAt: '2026-10-06T10:00:00Z' },
  { id: 'copper-crown-005', name: 'Copper Crown #005', category: 'digital-art', network: 'ethereum', imageUrl: nft2, priceEth: '1.45', isTrending: true, createdAt: '2026-10-05T10:00:00Z' },
]
