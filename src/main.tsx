import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { routeTree } from './routeTree.gen'
import './index.css'

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MSW !== 'true') {
    return
  }

  const { worker } = await import('./mocks/browser')

  await worker.start({
    onUnhandledFrame: 'bypass',
  })
}

enableMocking()
  .then(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </StrictMode>,
    )
  })
  .catch((error: unknown) => {
    console.error('Erro ao iniciar a aplicação:', error)
  })
