import { createFileRoute } from '@tanstack/react-router'
import { WalletsPage } from '@/features/wallets/pages/WalletsPage'
import { requireAuth } from '@/features/auth/lib/requireAuth'
export const Route = createFileRoute('/wallets')({
  beforeLoad: ({ location }) => requireAuth(location.href),
  component: WalletsPage,
})
