# KURIO — como o projeto funciona

Este documento complementa o [README](./README.md). A proposta do KURIO foi entregar os fluxos do marketplace sem depender de um backend privado, mantendo o código organizado o suficiente para trocar os mocks por uma API real no futuro.

## Organização do código

| Onde | Responsabilidade |
| --- | --- |
| `src/routes/` | Páginas, parâmetros de URL e proteção das rotas com TanStack Router |
| `src/features/` | Catálogo, detalhes, autenticação, favoritos, carrinho, checkout, pedidos, perfil e carteiras |
| `src/features/**/api/` | Funções de acesso à API pelo Axios e tipos compartilhados |
| `src/features/**/hooks/` | Consultas, mutations e atualização de cache com TanStack Query |
| `src/mocks/handlers/` | Respostas REST e gateway WebSocket do MSW |
| `src/mocks/state/` | Regras de negócio e persistência dos dados simulados |
| `tests/e2e/` | Testes de ponta a ponta com Playwright |
| `.github/workflows/delivery.yml` | Build, lint, E2E e auditoria Lighthouse |

O `src/lib/api.ts` centraliza o Axios (base `/api`, timeout de 10 segundos e token Bearer quando existe). A aplicação usa uma `QueryClient` com `staleTime` de 60 segundos e uma tentativa de retry por padrão; a sessão tem suas próprias regras.

## REST: os endpoints usados

Todos os caminhos da tabela recebem o prefixo **`/api`**.

| Método | Caminho | Para que serve |
| --- | --- | --- |
| POST | `/auth/register`, `/auth/login`, `/auth/logout` | Cadastro, login e logout |
| GET | `/auth/session` | Recuperar e validar a sessão |
| GET | `/nfts`, `/nfts/:nftId` | Listar NFTs com filtros/paginação e abrir detalhes |
| GET | `/cart`, `/cart/quote` | Ler o carrinho e calcular a cotação |
| POST | `/cart/items` | Adicionar item |
| PATCH, DELETE | `/cart/items/:key` | Alterar quantidade ou remover item |
| POST, DELETE | `/cart/coupon` | Aplicar ou retirar cupom |
| GET | `/favorites` | Listar favoritos |
| PUT, DELETE | `/favorites/:nftId` | Adicionar ou remover favorito |
| GET, PATCH | `/profile` | Ler ou atualizar os dados do perfil |
| PATCH | `/profile/avatar`, `/profile/password` | Atualizar avatar ou senha |
| GET | `/wallets` | Consultar as carteiras cadastradas |
| PUT | `/wallets/:slot` | Salvar carteira principal ou secundária |
| POST | `/orders` | Criar um pedido com chave de idempotência |
| GET | `/orders/:id`, `/orders/by-key/:key` | Consultar pedido ou recuperar tentativa anterior |
| PATCH | `/mock/nfts/:id` | Alterar preço no cenário simulado e disparar `nft.updated` |

As respostas usam códigos como 400, 401, 404, 409, 422, 503 e 504 conforme o caso. Os contratos do pedido estão em `src/features/checkout/types/orders.ts`. Valores em ETH são strings decimais; as contas do carrinho e da cotação passam por **BigInt em wei** para evitar erros comuns de ponto flutuante.

## Conta, sessão e dados privados

As contas são fictícias e os dados são guardados no **localStorage**, separados por usuário. Ao cadastrar ou fazer login, o mock gera um token opaco com validade de **45 minutos**. A senha não é armazenada em texto puro: o cenário usa **PBKDF2 com salt**.

A consulta `GET /auth/session` valida o token. Se essa consulta retornar 401, a sessão local é invalidada. Login e logout limpam o cache da identidade anterior; favoritos, perfil, carteiras e pedidos são consultados no contexto do usuário autenticado. O carrinho de visitante tem uma chave separada e é combinado com o carrinho da conta após o login, sem ultrapassar a disponibilidade dos itens.

Essas medidas mantêm os dados organizados dentro da demonstração, **mas não substituem segurança de backend**. Como o estado vive no navegador, não há sincronização entre dispositivos nem controle de acesso garantido por um servidor real.

## Catálogo, favoritos e carrinho

Busca, categoria, rede, ordenação, preço e página fazem parte dos parâmetros da URL. Por isso, atualizar a página ou usar o histórico não faz perder os filtros. O catálogo devolve até **9 NFTs por página**, e a chave `['nfts', filters]` evita misturar resultados de pesquisas diferentes. O Axios recebe o `AbortSignal` das consultas para descartar chamadas obsoletas.

O botão de favoritos usa atualização otimista: a interface responde imediatamente e, se a mutation falhar, o cache volta ao estado anterior. Mudanças no carrinho e nos cupons invalidam o carrinho e a cotação para consultar de novo os valores do MSW.

Os mocks incluem cupons válidos/expirados, erros de validação, edições sem disponibilidade e alterações de preço. O fluxo de catálogo e carrinho funciona tanto para visitantes quanto para contas autenticadas.

## Checkout e pedidos

A compra não é aprovada só porque o usuário clicou no botão. O fluxo funciona assim:

1. O comprador escolhe uma carteira cadastrada e uma rede compatível.
2. A API simulada calcula a cotação, que precisa ser revisada.
3. Antes de enviar o pedido, o checkout faz uma **nova consulta REST**. Se o valor ou a disponibilidade mudou, exige outra revisão.
4. O pedido recebe uma `idempotencyKey`. Se a resposta se perder depois da criação, a interface tenta encontrar a mesma compra por `/orders/by-key/:key`.
5. Um pedido começa como `pending` e termina como `confirmed` ou `declined`. Enquanto estiver pendente, a tela também consulta seu estado periodicamente.
6. O recibo utiliza o **snapshot** guardado no pedido: alterações posteriores de preço não mudam um recibo já emitido. Em caso de sucesso, apenas os itens comprados são retirados do carrinho.

É possível reproduzir recusa, timeout e desconexão de carteira pelas chaves de cenário documentadas no README.

**Limite da simulação:** não há reserva transacional de estoque entre abas. Compras concorrentes em cenários artificiais podem disputar a mesma disponibilidade.

## Eventos em tempo real

O frontend usa de fato **`socket.io-client`**, conectado a `/socket.io/` com transporte WebSocket. O MSW fornece um adaptador simplificado de handshake Engine.IO/Socket.IO — não um servidor Socket.IO completo.

| Evento | Efeito no frontend |
| --- | --- |
| `nft.updated` | Invalida catálogo, detalhes, carrinho e cotação para buscar os dados atuais |
| `order.updated` | Invalida o pedido afetado e os dados relacionados à compra |

Cada evento traz `eventId`, `resourceId` e `version`. O cliente evita reaplicar identificadores recebidos e ignora versões antigas do mesmo recurso. Eventos de pedidos são filtrados pelo usuário; visitantes podem acompanhar apenas as atualizações públicas de NFTs.

Ao conectar ou reconectar, o cliente invalida as consultas ativas para reconciliar o estado com REST. Ao trocar de sessão ou desmontar o listener, a conexão anterior é encerrada. O polling de pedidos pendentes dá outra forma de recuperar o resultado após refresh.

A integração funciona no ambiente simulado, com uma limitação importante: ainda não há cobertura E2E completa de frames WebSocket, duplicatas, reconexão e interrupção durante pedido pendente.

## Cenários MSW e reset

A simulação principal funciona com `VITE_ENABLE_MSW=true`, já definido nos ambientes de desenvolvimento e produção deste repositório.

Além dos cenários de pagamento e cupom, `src/mocks/networkScenario.ts` lê a chave `kurio:mock-network-scenario:v1` do localStorage. O valor é um JSON com `match` (prefixo da URL), `mode` e, quando necessário, `status` ou `delayMs`.

Modos disponíveis: `slow`, `variable-latency`, `out-of-order`, `http-error`, `offline` e `timeout`. A falha é aplicada na **camada de rede simulada**, e não com respostas inventadas pelos componentes. Os handlers instrumentados incluem catálogo, carrinho, cotação, validação de sessão e consulta de pedidos.

A busca `nomad` é usada como consulta lenta no cenário `out-of-order`, para tornar o teste reproduzível. Para voltar ao cenário inicial, apague a chave de rede ou faça o reset completo mostrado no README. Não há um painel gráfico para controlar todos os cenários.

## Interface e escolhas de UX

As telas foram construídas com base nos frames desktop/mobile do Figma. Foram ajustados o checkout, a navegação, o perfil, as carteiras e os formulários de login e cadastro. O objetivo foi preservar cores, tipografia, hierarquia e espaçamentos enquanto os formulários continuavam funcionais.

Algumas adaptações merecem registro:

- **Imagens:** somente duas artes foram exportadas como assets originais; outras entradas do catálogo reutilizam essas imagens com dados fictícios.
- **Carteiras e ENS:** há cadastro de endereços EVM simulados. Não existe ligação com MetaMask, WalletConnect, Coinbase Wallet ou resolução real de ENS.
- **Autenticação social:** login com terceiros e recuperação real de senha não foram implementados. Preferi não exibir um botão prometendo um fluxo inexistente.
- **Campos demonstrativos:** dados que não existem no contrato de perfil (como ENS e um nome de usuário separado) aparecem como campos informativos, sem fingir persistência.
- **Responsividade:** a navegação, o carrinho e os botões fixos mudam entre desktop e mobile; a interface também considera estados de foco, erro e carregamento.

Há skeletons com shimmer para catálogo, detalhe e resumo do carrinho, com respeito à preferência de movimento reduzido. A aplicação passou por revisão visual manual, mas **não há baselines versionadas de regressão visual**. Uma auditoria completa de navegação por teclado e zoom também não foi feita.

## Qualidade, Lighthouse e publicação

O workflow `.github/workflows/delivery.yml` roda `npm ci`, lint, build, Playwright e Lighthouse. Os testes utilizam Chromium em 1440 × 900 e 390 × 844. O Lighthouse audita Home e Detalhe três vezes em desktop e mobile, gerando relatórios HTML/JSON e medianas.

**Resultado da `main` em 24/10/2026:** 46 testes Playwright passaram, 6 foram ignorados por não se aplicarem ao viewport, e build/lint concluíram sem falhas. [Logs e artefatos desta execução](https://github.com/AndreyRodr/DesafioJungle/actions/runs/40126337121).

| Tela | Performance | Acessibilidade | Boas práticas | SEO | LCP aproximado |
| --- | ---: | ---: | ---: | ---: | ---: |
| Home mobile | **86** | 100 | 96 | 92 | 3,58 s |
| Home desktop | 99 | 100 | 96 | 92 | 0,89 s |
| Detalhe mobile | **87** | 100 | 96 | 92 | 3,48 s |
| Detalhe desktop | 98 | 100 | 96 | 92 | 0,90 s |

As metas do desafio eram 90/95/95/90. **A performance mobile ficou abaixo da meta**, especialmente pelo LCP; as outras categorias atingiram os valores pedidos. Um experimento posterior de preload de imagens não melhorou as medições e foi deixado fora da `main`.

O deploy é feito pela **Vercel**, com fallback de SPA em `vercel.json` e mocks habilitados no build. Endereço: https://desafionft-marketplace.vercel.app.

### O que ainda não está coberto por completo

O KURIO tem fluxos de compra e conta executáveis e uma suíte E2E funcional, mas ainda faltam testes específicos de alguns cenários avançados do enunciado — principalmente reconexão e eventos duplicados via Socket.IO, expiração de sessão no meio do checkout e regressão visual com screenshots de referência. São limitações documentadas, não funcionalidades que devem ser consideradas aprovadas sem testes.
