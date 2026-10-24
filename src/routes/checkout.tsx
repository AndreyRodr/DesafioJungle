import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/features/auth/lib/requireAuth'
import { CheckoutPage } from '@/features/checkout/pages/CheckoutPage'
export const Route = createFileRoute('/checkout')({
  beforeLoad: ({ location }) => requireAuth(location.href),
  component: CheckoutPage,
})
