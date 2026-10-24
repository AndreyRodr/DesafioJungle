# KURIO — arquitetura e limitações

## Visão geral

SPA React 19 + TypeScript, Vite, TanStack Router, TanStack Query, Axios e Tailwind. Os recursos são simulados por handlers MSW e a persistência do cenário usa localStorage, por navegador. O deploy deve ativar `VITE_ENABLE_MSW=true` no build. Nenhuma transação blockchain real é efetuada.

## Fluxo de dados

- `src/lib/api.ts`: Axios, base `/api`, timeout e cabeçalho Bearer.
- `src/features/**/api`: contratos HTTP tipados.
- `src/features/**/hooks`: leitura/mutações pelo TanStack Query.
- `src/mocks/handlers`: handlers REST, erros HTTP e adaptador Socket.IO.
- `src/mocks/state`: armazenamento e regras de negócio simuladas.
- `src/routes`: navegação e proteção de rotas.

## Sessão e privacidade

Login/cadastro geram token opaco persistido no localStorage; sessões simuladas expiram em 45 minutos. Senhas simuladas são derivadas com PBKDF2 + salt, nunca em claro. `/api/auth/session` valida o token, e um 401 dessa rota invalida a sessão. O cache da conta anterior é limpo no login/logout. Favoritos, carteiras, perfil e pedidos são consultados no escopo autenticado. Carrinhos usam chaves distintas por usuário e visitante; após login há merge limitado ao estoque.

**Limitação:** MSW + localStorage modelam a aplicação somente neste navegador. Isso não fornece segurança de servidor nem sincronização real entre dispositivos.

## Cache, consistência, compra

Filtros/paginação entram na chave da consulta `['nfts', filters]`. Carrinho e cotação são separados por sessão. Mutations invalidam as consultas pertinentes; favoritos usam update otimista com rollback. A cotação retorna preços em strings decimais; cálculos monetários usam BigInt em wei.

O checkout compara o fingerprint da cotação revisada com uma nova cotação REST imediatamente antes de criar o pedido. A chave de idempotência identifica a tentativa; em timeout, a interface recupera pelo endpoint de busca pela chave. O recibo guarda o snapshot original da operação. O pedido só é exibido como confirmado após o status de sucesso retornado pela simulação.

**Limitação conhecida:** não há reserva transacional de estoque ao criar pedidos pendentes; compras concorrentes em diferentes abas podem competir. A simulação não é blockchain.

## Socket.IO

O cliente usa `socket.io-client` com WebSocket em `/socket.io/`. O MSW simula handshake básico Engine.IO/Socket.IO e envia `nft.updated` e `order.updated`. O listener descarta eventos repetidos/antigos por recurso e versão, filtra pedidos por usuário, invalida cache e reconcilia ao conectar novamente. O pedido também tem polling enquanto pendente para recuperação após refresh.

**Limitação:** adaptador simples compatível com o transporte WebSocket, sem um servidor Socket.IO completo; validar handshake e reconexão em navegador e no deploy antes da entrega.

## Figma e acessibilidade

Interface escura com acentos terracota, layouts mobile/desktop responsivos. Algumas telas divergem do Figma: perfil e carteiras não usam o menu lateral exato; galeria do NFT possui uma imagem original reutilizada; nem todos os campos de checkout do frame foram reproduzidos. Controles possuem labels, foco visível, mensagens de erro e estado de carregamento em fluxos principais; auditoria de teclado/zoom e baselines visuais permanecem pendentes.

## Rotas e publicação

Rotas privadas: `/profile`, `/wallets`, `/favorites`, `/checkout`, `/orders/:orderId`. É necessário fallback de SPA no provedor (ver `vercel.json`). `src/routeTree.gen.ts` é gerado pelo plugin do TanStack Router e deve ser revisado depois de alterações nas rotas.

## Cenários de demonstração existentes

- Credenciais fictícias: `collector@kurio.test` e `artist@kurio.test`, senha `Kurio@123`.
- Cupom válido `KURIO10`; inválido arbitrário; expirado `EXPIRED10`.
- Antes de gerar pedido: `localStorage.setItem('kurio:mock-payment-scenario', 'declined')` para recusa; `'timeout'` para resposta tardia após criação. Remova a chave para sucesso.
- `localStorage.setItem('kurio:mock-wallet-disconnect', 'true')` para falha de carteira.
- `PATCH /api/mock/nfts/:id` autenticado altera preço e publica `nft.updated`.
- Reset manual do cenário: DevTools > Application > Clear site data ou `localStorage.clear()` + `sessionStorage.clear()` + reload (apaga também conta e carrinho deste navegador).

Cenários gerais determinísticos de falha de rede, latência variável, resposta fora de ordem, duplicidade de eventos e temporização controlada ainda precisam de um painel/fixture único antes de declarar cobertura completa.


## Auditoria final e lacunas reconhecidas

A pipeline `.github/workflows/delivery.yml` roda build/lint/Playwright e produz 12 auditorias Lighthouse (3x cada: Home/Detalhe x mobile/desktop). As métricas concretas ficam em artefatos de execução, não são presumidas. Os testes adicionais cobrem redes offline/HTTP 503, recuperação, conflito de cadastro, histórico de busca e acesso por teclado.

### Falhas configuráveis

`src/mocks/networkScenario.ts` lê `kurio:mock-network-scenario:v1` do localStorage e injeta `slow`, `variable-latency`, `out-of-order`, `http-error`, `offline`, `timeout` nos handlers REST selecionados. O comportamento não depende do React. A simulação Socket.IO continua limitada ao WebSocket, sem servidor Socket.IO integral. Testes automatizados de frames WebSocket, duplicatas, reconexão, expiração durante pedido e baselines visuais continuam necessários para cobertura total do enunciado.

### Acessibilidade e Figma

Perfil, carteiras, cadastro e login foram refinados nos PRs #9 e #12. Algumas ações ilustrativas foram omitidas por estarem fora do escopo (login social/recuperação real de senha, ENS real). A galeria reutiliza assets provisórios. Uma revisão visual humana foi realizada; ainda não há snapshots Playwright aprovados e versionados.
