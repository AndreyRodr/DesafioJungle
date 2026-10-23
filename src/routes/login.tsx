import { createFileRoute } from '@tanstack/react-router'
import { LoginPage } from '@/features/auth/pages/LoginPage'
interface AuthSearch { redirect?: string }
export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({ redirect: typeof search.redirect === 'string' ? search.redirect : undefined }),
  component: LoginPage,
})
