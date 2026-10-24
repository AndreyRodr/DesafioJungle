import { HttpResponse } from 'msw'

/**
 * Reproducible network scenarios, intentionally restricted to the mock layer.
 * Store a JSON config in localStorage under kurio:mock-network-scenario:v1.
 * Example: { "match": "/api/nfts", "mode": "http-error", "status": 503 }
 * Values are read per request so E2E tests can switch scenarios without a reload.
 */
export type NetworkMode = 'slow' | 'variable-latency' | 'out-of-order' | 'http-error' | 'offline' | 'timeout'
export interface NetworkScenario {
  match: string
  mode: NetworkMode
  delayMs?: number
  status?: number
}
export const NETWORK_SCENARIO_KEY = 'kurio:mock-network-scenario:v1'

function scenario(): NetworkScenario | null {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(NETWORK_SCENARIO_KEY) || 'null')
    if (!parsed || typeof parsed !== 'object') return null
    const value = parsed as Partial<NetworkScenario>
    if (!value.match || !value.match.startsWith('/api/') || typeof value.mode !== 'string') return null
    return value as NetworkScenario
  } catch { return null }
}
const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

/** Returns null to continue with the original REST handler; returns a response for an injected failure. */
export async function simulateNetwork(request: Request): Promise<Response | null> {
  const config = scenario()
  const url = new URL(request.url)
  if (!config || !url.pathname.startsWith(config.match)) return null

  const delayMs = Math.min(20_000, Math.max(0, Number(config.delayMs) || 750))
  if (config.mode === 'slow') await sleep(delayMs)
  if (config.mode === 'variable-latency') {
    // Stable per URL; does not depend on randomness or test timing.
    const hash = [...url.pathname, ...url.search].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
    await sleep(150 + hash % delayMs)
  }
  if (config.mode === 'out-of-order') {
    // Search term 'nomad' is intentionally slower than other search terms.
    await sleep(url.searchParams.get('q')?.toLowerCase().includes('nomad') ? Math.max(1200, delayMs) : 80)
  }
  if (config.mode === 'timeout') {
    await sleep(Math.max(delayMs, 11_000)) // Axios default timeout is 10s.
    return HttpResponse.error()
  }
  if (config.mode === 'offline') return HttpResponse.error()
  if (config.mode === 'http-error') {
    const status = config.status && config.status >= 400 && config.status <= 599 ? config.status : 503
    return HttpResponse.json({ message: 'Falha HTTP simulada. Tente novamente.' }, { status })
  }
  return null
}
