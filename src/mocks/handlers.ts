import { nftHandlers } from './handlers/nfts'
import { commerceHandlers } from './handlers/commerce'

export const handlers = [...nftHandlers, ...commerceHandlers]
