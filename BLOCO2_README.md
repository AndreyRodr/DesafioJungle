# Bloco 2 — Detalhes do NFT + Carrinho (Kurio)

Este patch foi preparado sobre a `main` após o merge do PR #1 (`c3498bba`). **Os arquivos são parciais em relação ao repositório**: extraia na raiz, preservando os outros arquivos.

## Aplicação

1. No VS Code, confirme que o projeto está limpo (`git status`).
2. `git switch main` e `git pull origin main`.
3. `git switch -c feature/nft-detail-cart`.
4. Extraia o ZIP na raiz do projeto (`nft-marketplace`) com `-Force`, preservando a hierarquia `src/`.
5. `npm run lint` e `npm run build`; corrija qualquer erro antes de registrar commit.
6. `npm run dev` e valide os fluxos abaixo.

O plugin de rotas do Vite gera `src/routeTree.gen.ts` automaticamente ao executar `npm run dev`/build. **Não é necessário editar o arquivo gerado.**

## Fluxos para validar

1. Na Home, clique no card `Emerald Ape #042`; URL: `/nft/emerald-ape-042`.
2. Acesso direto a `/nft/nao-existe` deve apresentar estado 404, sem quebrar a aplicação.
3. No detalhe, mude a edição, ajuste a quantidade e clique em **Adicionar ao carrinho**.
4. Abra o carrinho pelo Header desktop ou nav inferior mobile; teste aumentar, diminuir e remover.
5. Recarregue a página: o carrinho visitante deve persistir.
6. Cupom `KURIO10` oferece desconto de 10%; `ERRADO` retorna erro 422; `EXPIRED10` retorna expirado.
7. Adicione 1 unidade de `Emerald Ape #042` edição padrão e 1 de `Sage Nomad #009` edição padrão. O esperado é subtotal `2.88`, desconto `0.288`, taxa (uma rede Ethereum) `0.003`, total `2.595` ETH.
8. Teste o limite de estoque (padrão 10, colecionador 3 por NFT) e o estado vazio.
9. Execute viewport 390px, 768px e 1440px; verifique navegação e ausência de overflow.
10. Confira Network: REST simulado em `/api/nfts/:id`, `/api/cart`, `/api/cart/items`, `/api/cart/coupon` e `/api/cart/quote`.

### Estado persistente / reset

O MSW mantém dados simulados do carrinho visitante em `localStorage['kurio:cart:guest:v1']`. Para reset:

```js
localStorage.removeItem('kurio:cart:guest:v1'); location.reload();
```

A camada de preços usa `bigint` para ETH (18 casas, wei). Taxa de rede simulada de `0.003 ETH` por rede distinta presente no carrinho. Estoques e versões são fixtures determinísticas da simulação; não são serviços reais.

### Limites intencionais deste bloco

- Favoritos requerem sessão autenticada; ficam indisponíveis até o Bloco 3 de conta/login. Não há falso sucesso.
- Checkout fica desabilitado até o Bloco 4 (pedido, autenticação, reconciliação REST + Socket.IO).
- As 16 NFTs do catálogo ainda reutilizam 2 assets provisórios; só os primeiros dois têm exportações específicas do Figma.
- MSW mantém um carrinho visitante único no navegador. Bloco de login deverá migrar/mesclar itens para o usuário autenticado e separar os caches por identidade.
- Não foram executados Playwright nem Lighthouse neste patch; serão incluídos no bloco de qualidade.

## Entrega no Git

```powershell
git status
npm run lint
npm run build
git add .
git commit -m "feat: implement NFT detail and persistent guest cart"
git push -u origin feature/nft-detail-cart
```

Crie PR para `main` e faça o merge somente após validar os fluxos.
