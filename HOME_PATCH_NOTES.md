# Bloco Home: busca, filtros, ordenação e paginação

Arquivos deste pacote são substituições/adições para o projeto `AndreyRodr/DesafioJungle` no commit `f8d8f4c`.

## O que entra
- Busca desktop e mobile com debounce e URL sincronizada (`q`)
- Filtros combináveis: aba, categoria, rede, faixa de preço em ETH
- Ordenação por data, preço e nome
- Paginação server-side simulada (8 por página), botões Anterior/Próxima
- Cache TanStack Query isolado por parâmetros, cancelamento via Axios/AbortSignal
- 16 fixtures determinísticas para testar paginação; 14 imagens provisórias **reutilizam** nft1/nft2
- Correção de botão aninhado no MobileHeader

## Validar
1. npm run lint; npm run build; npm run dev
2. /?page=2 -> segunda página
3. /?q=Emerald -> somente Emerald Ape
4. /?tab=new&category=digital-art -> filtro combinado
5. /?network=polygon&sort=price_asc -> preço crescente
6. /?minPrice=0.50&maxPrice=1.50 -> faixa de preço
7. Mobile 390px: abrir drawer, ajustar múltiplos critérios, aplicar
8. Desktop 1440px: clicar lupa, digitar, URL atualiza após pausa
9. Atualizar e navegar Voltar/Avançar; filtros persistem

Atenção: ainda não há fluxo de detalhes, login, carrinho, checkout, Socket.IO ou testes Playwright. Este patch entrega apenas a Home.
