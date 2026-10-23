export const nftCategories = [
  { id: 'digital-art', label: 'Arte digital' },
  { id: 'photography', label: 'Fotografia' },
  { id: 'music', label: 'Música' },
  { id: '3d-art', label: 'Arte 3D' },
  { id: 'collectibles', label: 'Colecionáveis' },
  { id: 'generative', label: 'Generativa' },
  { id: 'games', label: 'Jogos' },
  { id: 'subscriptions', label: 'Assinaturas' },
  { id: 'utility', label: 'Utilidade' },
] as const

export type NFTCategory = (typeof nftCategories)[number]['id']

export function isNFTCategory(
  value: unknown,
): value is NFTCategory {
  return nftCategories.some((category) => category.id === value)
}
