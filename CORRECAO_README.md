# Correção de build — Bloco 3

Causa: faltam oito arquivos que já existem na branch main (Bloco 2), e o helper genérico de auth.ts precisa de tipagem compatível com HttpResponse.json.

Este ZIP inclui só 9 arquivos de código (oito recuperados do Bloco 2 e um handler de auth corrigido). Não substitui seus arquivos de páginas, perfis e carteiras.

## Aplicar

Na raiz do projeto (mesma pasta de package.json), com a branch do Bloco 3 selecionada:

```powershell
Expand-Archive -Path "$env:USERPROFILE\Downloads\kurio-bloco3-correcao-build.zip" -DestinationPath . -Force
```

O caminho do ZIP pode ser ajustado caso esteja em outra pasta.

## Regenerar rotas antes do build

```powershell
npm run dev
```

Espere a inicialização do Vite, confira `src/routeTree.gen.ts` com `/cart` e `/nft/$nftId`, depois encerre o servidor com Ctrl+C.

```powershell
npm run lint
npm run build
```

Se aparecer outro erro, envie o novo log. Não faça commit até lint e build passarem.
