
import { Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Header } from './Header'
import { MobileBottomNav } from './MobileBottomNav'

export function RootLayout() {
  return (
    <div className="min-h-screen bg-[#160e0b] pb-28 text-[#f4ede5] lg:pb-0">
      <Header />

      <Outlet />

      <MobileBottomNav />

      {import.meta.env.DEV &&
        import.meta.env.VITE_SHOW_ROUTER_DEVTOOLS === 'true' && (
          <TanStackRouterDevtools />
        )}
    </div>
  )
}
