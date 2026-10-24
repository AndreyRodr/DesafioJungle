# KURIO — NFT Marketplace

Marketplace responsivo de NFTs desenvolvido para o desafio frontend da Jungle Gaming, com API, sessão, carteiras, pagamentos e eventos em tempo real **simulados**.

## Stack

React, TypeScript, Vite, TanStack Router, TanStack Query, Axios, Socket.IO Client, MSW, Tailwind CSS e componentes shadcn/ui (Base UI).

## Instalação

Requisitos: Node.js compatível com Vite 8, npm e navegador Chromium.

```bash
npm ci
npm run dev
```

Abra `http://localhost:5173`. Ative o MSW com `.env.development` contendo `VITE_ENABLE_MSW=true`. A aplicação não exige backend privado. Os dados simulados persistem no navegador.

```bash
npm run lint
npm run build
npm run preview
```

O build de demonstração usa `.env.production` com `VITE_ENABLE_MSW=true`.

## Conta fictícia

- **Colecionador**: `collector@kurio.test`
- **Artista**: `artist@kurio.test`
- **Senha de ambas**: `Kurio@123`

Cadastre uma carteira fictícia em `/wallets` informando um endereço no formato `0x` + 40 caracteres hexadecimais. Nenhuma carteira real é conectada.

## Fluxo principal

1. Navegue no catálogo, aplique busca/filtros, abra detalhes do NFT.
2. Selecione uma edição, ajuste quantidade e adicione ao carrinho.
3. Faça login para preservar/mesclar o carrinho de visitante.
4. Cadastre uma carteira no perfil, volte ao carrinho e siga ao checkout.
5. Preencha nome e e-mail, selecione a carteira e revise a cotação.
6. Confirme a compra e consulte o status do pedido e o recibo. O pedido confirmado remove do carrinho somente os itens comprados.

## Cenários e reset

Use DevTools > Application > Local Storage do domínio, depois recarregue:

| Cenário | Configuração |
| --- | --- |
| Sucesso | Remover `kurio:mock-payment-scenario` |
| Recusado | `localStorage.setItem('kurio:mock-payment-scenario', 'declined')` |
| Timeout após criação | `localStorage.setItem('kurio:mock-payment-scenario', 'timeout')` |
| Carteira desconectada | `localStorage.setItem('kurio:mock-wallet-disconnect', 'true')` |
| Cupom válido | `KURIO10` |
| Cupom expirado | `EXPIRED10` |
| Preço atualizado | `PATCH /api/mock/nfts/:id` com Bearer e `{ "priceEth": "2.50" }` |

Depois do cenário, remova as chaves de teste. **Reset completo:** `localStorage.clear(); sessionStorage.clear(); location.reload()` no Console. Isso apaga o estado simulado, inclusive usuários cadastrados no navegador.

## REST e eventos

As requisições passam pelo Axios em `/api`. Contratos principais:

| Método | Endpoint | Uso |
| --- | --- | --- |
| POST | `/auth/register`, `/auth/login`, `/auth/logout` | Conta/sessão |
| GET | `/auth/session` | Recuperação de sessão |
| GET | `/nfts`, `/nfts/:id` | Catálogo/detalhes |
| GET/POST/PATCH/DELETE | `/cart`, `/cart/items`, `/cart/items/:key` | Carrinho |
| GET/POST/DELETE | `/cart/quote`, `/cart/coupon` | Cotação e cupom |
| GET/PUT/DELETE | `/favorites`, `/favorites/:id` | Favoritos |
| GET/PATCH | `/profile`, `/profile/avatar`, `/profile/password` | Dados do colecionador |
| GET/PUT | `/wallets`, `/wallets/:slot` | Carteiras |
| POST | `/orders` | Compra com `idempotencyKey` |
| GET | `/orders/:id`, `/orders/by-key/:key` | Status e recuperação |

O MSW retorna status HTTP como 400/401/404/409/422/500. O cliente Socket.IO escuta `nft.updated` e `order.updated` via `/socket.io/`. Eventos carregam `eventId`, `resourceId`, `version` e detalhes específicos. Os limites do adaptador estão descritos em [ARCHITECTURE.md](./ARCHITECTURE.md).

## Testes E2E

Instale a ferramenta de testes **e atualize o lockfile antes de fazer commit**:

```bash
npm install -D @playwright/test
npx playwright install chromium
npm run build
npx playwright test
npx playwright show-report
```

Os testes em `tests/e2e` utilizam o build de preview, MSW e Chromium nos viewports 1440 e 390. O Playwright cria relatórios HTML em `playwright-report` e traces em caso de falha. Alguns cenários adicionais exigidos pelo enunciado continuam pendentes; ver a auditoria em [ARCHITECTURE.md](./ARCHITECTURE.md). Não declarar suíte aprovada sem executá-la.

## Publicação

`vercel.json` configura fallback de SPA para rotas diretas. Configure Vercel como projeto Vite com comando `npm run build`, diretório `dist` e `VITE_ENABLE_MSW=true`. Teste em produção: recarregar `/login`, `/nft/:id`, `/checkout` e `/orders/:id`; confirmar registro do service worker `/mockServiceWorker.js` e conexão com `/socket.io/`.

**URL pública:** https://desafionft-marketplace.vercel.app (domínio cadastrado na Vercel; confira acessibilidade pública, service worker e WebSocket na versão publicada).

## Auditoria reproduzível e CI

Ações do GitHub em `.github/workflows/delivery.yml` executam lint, build, E2E e auditoria Lighthouse. A auditoria sobe a aplicação de preview na porta 4173, executa três medições mobile e desktop para início e NFT e produz `artifacts/lighthouse/summary.json`, além dos relatórios HTML/JSON. **Não considere metas atingidas antes de consultar os relatórios publicados no job.**

Localmente, use:
```bash
npm ci
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
# Em outro terminal:
npm run lighthouse
```

## Cenários controlados de rede

No Console do navegador, configure antes de recarregar:
```js
localStorage.setItem('kurio:mock-network-scenario:v1', JSON.stringify({ match: '/api/nfts', mode: 'http-error', status: 503 }))
location.reload()
```
Modos: `slow`, `variable-latency`, `out-of-order`, `http-error`, `offline`, `timeout`. Para remover:
```js
localStorage.removeItem('kurio:mock-network-scenario:v1')
location.reload()
```
A simulação é injetada por handlers MSW selecionados (catálogo, carrinho, cotação, sessão e consulta de pedidos). `out-of-order` usa a busca `nomad` como requisição lenta. O navegador pode manter dados em cache; limpe localStorage e atualize para restaurar o cenário.

## Desempenho

As auditorias Lighthouse são executadas pelo workflow e pelo comando `npm run lighthouse`. Consulte os artefatos de CI: relatórios de execução e medianas não devem ser declarados aprovados até a execução. Recomenda-se auditar build de produção, páginas início e detalhe em desktop/mobile, três execuções cada, e registrar medianas de Performance, Accessibility, Best Practices, SEO, LCP, CLS e TBT.

## Decisões e limitações

Veja [ARCHITECTURE.md](./ARCHITECTURE.md), incluindo persistência, sessões, cache, idempotência, reconexão, desvios visuais do Figma e lacunas de mocks. 
