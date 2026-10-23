import { createFileRoute } from '@tanstack/react-router'
import { NFTDetailPage } from '@/features/nft/pages/NFTDetailPage'

export const Route = createFileRoute('/nft/$nftId')({
  component: NFTDetailPage,
})
