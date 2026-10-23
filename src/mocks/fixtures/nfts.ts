import type { NFT } from '@/features/nft/types/nft'

import nft1 from '@/assets/nft1.png'
import nft2 from '@/assets/nft2.png'

export const nftFixtures: NFT[] = [
  {
    id: 'emerald-ape-042',
    name: 'Emerald Ape #042',
    imageUrl: nft1,
    priceEth: '1.19',
    isNew: true,
    category: 'digital-art'
  },
  {
    id: 'sage-nomad-009',
    name: 'Sage Nomad #009',
    imageUrl: nft2,
    priceEth: '1.69',
    isTrending: true,
    category: 'collectibles'
  },
]
