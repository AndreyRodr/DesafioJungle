# KURIO — NFT Marketplace

O **KURIO** é o marketplace de NFTs que desenvolvi para o [desafio frontend da Jungle Gaming](https://github.com/junglegaming/frontend-challenge). A ideia foi seguir o [Figma do desafio](https://www.figma.com/design/Ff0SksUi7UFtPWUO8kyNtw/Frontend-Challenge?node-id=0-1) nas versões desktop e mobile, mas também fazer os fluxos funcionarem: descobrir NFTs, montar um carrinho, entrar na conta, cadastrar carteiras e concluir uma compra.

Tudo relacionado a contas, carteiras, pedidos e blockchain é **simulado**. Não há movimentação de criptomoedas nem conexão com uma carteira real.

**[Abrir aplicação](https://desafionft-marketplace.vercel.app)** · **[Código no GitHub](https://github.com/AndreyRodr/DesafioJungle)** · **[Decisões técnicas](./ARCHITECTURE.md)**

## O que dá para testar

- **Mercado:** catálogo com busca, categorias, filtros de preço/rede, ordenação e paginação. Os filtros ficam na URL.
- **NFTs:** detalhes, edições, quantidade disponível, favoritos e opção de adicionar ao carrinho ou comprar.
- **Carrinho:** alterar quantidades, remover itens, usar cupom e conferir subtotal, desconto, taxa de rede e total.
- **Conta:** criar usuário, entrar, sair, editar perfil e avatar, mudar a senha e cadastrar duas carteiras.
- **Pagamento:** escolher carteira e rede, revisar a cotação, confirmar o pedido e acompanhar o resultado no recibo.
- **Cenários de erro:** cupom inválido, pagamento recusado, carteira desconectada, timeout e falhas de rede reproduzíveis.

## Tecnologias

React 19, TypeScript, Vite, TanStack Router, TanStack Query, Axios, Tailwind CSS, shadcn/ui (Base UI), MSW, Socket.IO Client, Playwright e Lighthouse.

O frontend chama endpoints REST por meio do Axios. O **MSW** intercepta essas chamadas e mantém o estado da demonstração no navegador. Os eventos `nft.updated` e `order.updated` são recebidos pelo cliente Socket.IO através de um adaptador WebSocket simulado. Os detalhes e limites dessa escolha estão no [ARCHITECTURE.md](./ARCHITECTURE.md).

## Rodando no seu computador

Use **Node.js 24**, npm e um navegador Chromium. Depois de clonar o projeto:

```bash
npm ci
npm run dev
```

Abra **http://localhost:5173**. Não é necessário subir um backend ou configurar serviços externos.

Os arquivos `.env.development` e `.env.production` já habilitam os mocks com `VITE_ENABLE_MSW=true`. Para testar o build de produção localmente:

```bash
npm run build
npm run preview
```

O preview fica, por padrão, em **http://localhost:4173**.

## Acesso de demonstração

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Colecionador | `collector@kurio.test` | `Kurio@123` |
| Artista | `artist@kurio.test` | `Kurio@123` |

Essas contas são fictícias e existem apenas na simulação. Também dá para criar uma nova conta pela tela de cadastro.

### Caminho mais rápido para testar uma compra

1. Escolha um NFT no catálogo, selecione a edição e coloque no carrinho.
2. Entre com uma conta de demonstração. Se você montou o carrinho como visitante, os itens são aproveitados no login.
3. Vá em **Carteiras** e cadastre a carteira principal. Para um exemplo na rede Ethereum, use o endereço fictício `0x1111111111111111111111111111111111111111`.
4. Volte ao carrinho, avance ao pagamento, selecione uma carteira compatível com a rede e **revise a cotação**.
5. Confirme a compra e abra o pedido para ver o status, os itens, a taxa e o total. Tudo é simulado.

### Testando cenários diferentes

No console do navegador, você pode trocar o resultado da compra antes de confirmar:

```js
// A próxima compra será recusada.
localStorage.setItem('kurio:mock-payment-scenario', 'declined')

// A compra será criada, mas a resposta será um timeout.
localStorage.setItem('kurio:mock-payment-scenario', 'timeout')

// Simula uma carteira desconectada.
localStorage.setItem('kurio:mock-wallet-disconnect', 'true')
```

Para voltar ao comportamento normal:

```js
localStorage.removeItem('kurio:mock-payment-scenario')
localStorage.removeItem('kurio:mock-wallet-disconnect')
```

**Cupons:** `KURIO10` aplica desconto; `EXPIRED10` simula um cupom expirado; qualquer outro código não cadastrado é recusado.

Também dá para provocar erros e lentidão nas chamadas REST. Por exemplo, para simular um erro 503 no catálogo:

```js
localStorage.setItem(
  'kurio:mock-network-scenario:v1',
  JSON.stringify({ match: '/api/nfts', mode: 'http-error', status: 503 })
)
location.reload()
```

Para desfazer:

```js
localStorage.removeItem('kurio:mock-network-scenario:v1')
location.reload()
```

Os modos disponíveis são `slow`, `variable-latency`, `out-of-order`, `http-error`, `offline` e `timeout`. Eles atuam em endpoints selecionados do MSW; não afetam automaticamente todas as requisições.

**Reset completo:** execute `localStorage.clear(); sessionStorage.clear(); location.reload()` no console. Isso apaga contas criadas, carrinhos, carteiras e pedidos guardados **neste navegador** e restaura as contas fictícias na próxima inicialização. Não execute se quiser preservar seus dados de teste.

## Testes automatizados

O Playwright já faz parte das dependências do projeto. Para rodar os testes:

```bash
npm ci
npx playwright install chromium
npm run build
npx playwright test
npx playwright show-report
```

Os testes usam o preview do Vite com MSW nos tamanhos **1440 × 900** (desktop) e **390 × 844** (mobile). O relatório HTML fica em `playwright-report/`; capturas e traces são guardados quando um teste falha.

Na execução da `main` de **24/10/2026**, foram **46 testes aprovados e 6 ignorados** por serem específicos do outro tamanho de tela, sem falhas. Os jobs de build e lint também passaram.

**[Ver a execução e os relatórios no GitHub Actions](https://github.com/AndreyRodr/DesafioJungle/actions/runs/40126337121)**

## Lighthouse

A auditoria roda com o build de produção, três medições por página e dispositivo (12 medições no total). Para repetir localmente, rode primeiro:

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Em outro terminal:

```bash
npm run lighthouse
```

Os relatórios HTML/JSON e o resumo com as medianas ficam em `artifacts/lighthouse/`. A mesma verificação roda no GitHub Actions.

Resultados da `main` em **24/10/2026**:

| Página | Performance | Acessibilidade | Boas práticas | SEO |
| --- | ---: | ---: | ---: | ---: |
| Início — mobile | **86** | 100 | 96 | 92 |
| Início — desktop | 99 | 100 | 96 | 92 |
| Detalhe — mobile | **87** | 100 | 96 | 92 |
| Detalhe — desktop | 98 | 100 | 96 | 92 |

As metas do desafio são **90 / 95 / 95 / 90** nessa ordem. A performance mobile ficou abaixo do objetivo; as outras categorias atingiram as metas. O LCP mobile ficou próximo de **3,6 s** na Home e **3,5 s** no Detalhe, com imagens grandes entre os pontos a otimizar. Os números acima são da versão entregue na `main`, não de experimentos de performance descartados.

## Publicação e organização

O projeto está publicado na **[Vercel](https://desafionft-marketplace.vercel.app)**. O arquivo `vercel.json` permite recarregar rotas internas diretamente, e `.env.production` mantém o MSW ativo no build de demonstração.

O código fica separado por funcionalidade em `src/features/`; os mocks REST e WebSocket estão em `src/mocks/`, as rotas em `src/routes/`, e os testes em `tests/e2e/`.

No [ARCHITECTURE.md](./ARCHITECTURE.md) deixei os contratos REST, a estratégia de cache e sessão, o funcionamento do tempo real, as escolhas de interface e o que ainda é uma limitação da demonstração.
