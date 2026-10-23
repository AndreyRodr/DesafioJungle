import { createFileRoute } from '@tanstack/react-router'
import { FavoritesPage } from '@/features/favorites/pages/FavoritesPage'
import { requireAuth } from '@/features/auth/lib/requireAuth'
export const Route = createFileRoute('/favorites')({
  beforeLoad: ({ location }) => requireAuth(location.href),
  component: FavoritesPage,
})
