import { nftHandlers } from './handlers/nfts'
import { commerceHandlers } from './handlers/commerce'
import { authHandlers } from './handlers/auth'
export const handlers = [...nftHandlers, ...commerceHandlers, ...authHandlers]
