import { nftHandlers } from './handlers/nfts'
import { commerceHandlers } from './handlers/commerce'
import { authHandlers } from './handlers/auth'
import { orderHandlers } from './handlers/orders'
import { realtimeHandlers } from './handlers/realtime'

export const handlers = [
  ...nftHandlers,
  ...commerceHandlers,
  ...authHandlers,
  ...orderHandlers,
  ...realtimeHandlers,
]
