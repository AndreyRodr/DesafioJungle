# Decisões de UX — checkout KURIO

Este documento registra adaptações intencionais em relação ao Figma; não substitui a validação funcional nem a comparação visual.

## Rede e carteira cadastrada

O seletor **Rede** é interativo. Uma rede escolhida procura uma carteira cadastrada do usuário nessa rede e seleciona automaticamente essa carteira. Se nenhuma estiver cadastrada, a interface alerta o usuário e oferece um caminho para adicionar uma, e a compra permanece bloqueada. Isso evita apresentar ao usuário uma rede divergente da carteira cujo endereço é realmente usado pelo mock de pagamento.

## ENS

O campo opcional **Nome ENS** separa o texto digitado de um seletor de sufixos (.eth, .xyz, .com), dando uma interação similar à referência do Figma. A escolha é registrada como metadado textual do comprador. Não equivale a resolver, registrar ou verificar o domínio em blockchain. O sufixo .eth é apresentado como padrão; .xyz e .com são sufixos de domínio para demonstração, não namespaces ENS nativos.

## Demais adaptações

- O endereço da carteira é preenchido de modo somente leitura a partir de uma carteira cadastrada, evitando que um endereço visual diferente seja apresentado como o destinatário da compra.
- Tipo de carteira, código de indicação, nome do perfil e metadados adicionais são armazenados no snapshot do pedido simulado, mas não alteram o total cobrado.
- A revisão explícita da cotação é mantida mesmo quando o Figma mostra só a ação de confirmação, para impedir compras com valores desatualizados.
- No mobile, carteiras e provedores têm seletores separados e a confirmação permanece acessível pela barra inferior fixa. Campos adicionais podem ser encontrados na rolagem.

Tudo é **simulado** com MSW; não há operação financeira ou conexão com carteira real.
