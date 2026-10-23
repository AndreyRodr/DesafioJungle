import { Outlet, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Header } from './Header'
import { Footer } from './Footer'
import { MobileBottomNav } from './MobileBottomNav'
import { useRealtime } from '@/features/realtime/useRealtime'

export function RootLayout() {
  useRealtime()
  const path = useRouterState({ select: (state) => state.location.pathname })
  const authScreen = path === '/login' || path === '/register'
  const hideBottomNav = authScreen || path === '/checkout' || path.startsWith('/orders/') || path === '/cart' || path.startsWith('/nft/')
  return (
    <div className="min-h-screen bg-[#160e0b] pb-28 text-[#f4ede5] lg:pb-0">
      <Header />
      <Outlet />
      <Footer />
      {!hideBottomNav && <MobileBottomNav />}
      {import.meta.env.DEV && import.meta.env.VITE_SHOW_ROUTER_DEVTOOLS === 'true' && <TanStackRouterDevtools />}
    </div>
  )
}
