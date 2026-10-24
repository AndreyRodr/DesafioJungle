import { ws } from 'msw'
import { subscribeMockEvents } from '../state/events'
import { socketUserForToken } from '../state/auth'

// Adaptador WebSocket + Engine.IO v4 (transporte websocket somente).
// A UI se conecta exclusivamente com socket.io-client; nunca chama setters por evento.
const endpoint = `${window.location.origin.replace(/^http/, 'ws')}/socket.io/`
const gateway = ws.link(endpoint)
export const realtimeHandlers = [
  gateway.addEventListener('connection', ({ client }) => {
    let socketToken: string | null = null
    let joined = false
    const sid = crypto.randomUUID().replaceAll('-', '')
    client.send('0' + JSON.stringify({ sid, upgrades: [], pingInterval: 200000, pingTimeout: 20000, maxPayload: 1000000 }))
    const unsubscribe = subscribeMockEvents(({ type, payload }) => {
      if (!joined) return
      if (type === 'order.updated' && (payload.userId !== socketUserForToken(socketToken))) return
      client.send('42' + JSON.stringify([type, payload]))
    })
    client.addEventListener('message', (event) => {
      if (typeof event.data !== 'string') return
      if (event.data.startsWith('40')) {
        try { const handshake = JSON.parse(event.data.slice(2) || '{}') as { token?: string }; socketToken = typeof handshake.token === 'string' ? handshake.token : null }
        catch { socketToken = null }
        joined = true
        client.send('40' + JSON.stringify({ sid }))
      } else if (event.data === '2') client.send('3')
      else if (event.data === '1') unsubscribe()
    })
    client.addEventListener('close', unsubscribe)
  }),
]
