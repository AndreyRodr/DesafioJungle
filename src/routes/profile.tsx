import { createFileRoute } from '@tanstack/react-router'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'
import { requireAuth } from '@/features/auth/lib/requireAuth'
export const Route = createFileRoute('/profile')({
  beforeLoad: ({ location }) => requireAuth(location.href),
  component: ProfilePage,
})
