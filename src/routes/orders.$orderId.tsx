import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/features/auth/lib/requireAuth'
import { OrderPage } from '@/features/orders/pages/OrderPage'
export const Route = createFileRoute('/orders/$orderId')({
  beforeLoad: ({ location }) => requireAuth(location.href),
  component: OrderPage,
})
