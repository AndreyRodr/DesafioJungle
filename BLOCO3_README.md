# Bloco 3 — Autenticação, perfil, carteiras e favoritos

Base: branch `main` após PR #1 e código do Bloco 2 aplicado e testado.

## Aplicação

Na raiz do projeto, extraia os arquivos da pasta `src/` do ZIP mantendo os caminhos.
O pacote **sobrescreve** os arquivos de `src/lib/api.ts`, `src/mocks/state/commerce.ts`,
`src/mocks/handlers/commerce.ts`, `src/mocks/handlers.ts`, `src/features/cart/hooks/useCart.ts`,
`src/components/layout/Header.tsx`, `src/components/layout/MobileBottomNav.tsx`,
`src/features/nft/components/NFTCard.tsx` e `src/features/nft/pages/NFTDetailPage.tsx`.

Rode `npm run lint && npm run build` no seu projeto. Não é necessário instalar bibliotecas novas.

## Contas fictícias

- `collector@kurio.test` / `Kurio@123`
- `artist@kurio.test` / `Kurio@123`

## Testes manuais obrigatórios

1. Adicione um NFT como visitante em `/cart`; entre com a primeira conta e verifique o merge.
2. Saia e entre com a segunda conta: o carrinho da primeira não pode aparecer.
3. Vá diretamente a `/profile`, `/wallets` e `/favorites` sem sessão: deve ir ao login.
4. Cadastro com e-mail repetido retorna 409; senha inválida retorna 422.
5. Altere nome e e-mail, atualize a página e confira persistência.
6. Altere senha, faça logout e entre com a nova senha.
7. Cadastre duas carteiras EVM simuladas; endereço inválido deve ser rejeitado.
8. Adicione/remova favoritos e simule nova entrada na conta.
9. Refresh com sessão ativa mantém o usuário; o token expira após 45 minutos.
10. Rode lint/build e confira páginas em mobile e desktop.

## API REST adicionada

- POST `/api/auth/login`, POST `/api/auth/register`, GET `/api/auth/session`, POST `/api/auth/logout`
- GET/PATCH `/api/profile`, PATCH `/api/profile/avatar`, PATCH `/api/profile/password`
- GET `/api/wallets`, PUT `/api/wallets/:slot`
- GET `/api/favorites`, PUT/DELETE `/api/favorites/:nftId`

## Limitações e decisões

- A autenticação é **simulada** e o token fica em `localStorage`. **Não usar em produção real**: preferir cookies HttpOnly, servidor e CSRF conforme arquitetura real.
- As senhas simuladas são persistidas em PBKDF2-SHA256 com salt individual. As credenciais demo são públicas e sem significado real.
- O MSW usa `localStorage` como banco de dados simulado. Os dados permanecem no navegador; limpar o armazenamento redefine o estado.
- Logout apaga o cache TanStack Query e troca o namespace do carrinho de `user:<id>` para `guest`.
- No login/cadastro, itens do carrinho visitante são combinados com o carrinho do usuário respeitando estoque.
- O checkout e Socket.IO ainda NÃO foram implementados neste bloco; continuam para o Bloco 4.
