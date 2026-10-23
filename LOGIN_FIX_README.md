# Correção de persistência e sincronização do login

- Restringe a limpeza automática do token ao erro 401 de `/api/auth/session`, evitando logout por 401 de endpoints sem relação com a sessão.
- Preenche o cache do TanStack Query com o usuário retornado pelo login/cadastro ANTES de notificar os componentes.
- Navega sem recarregar a aplicação quando o destino é `/`; preserva o redirecionamento validado para as demais rotas.

## Como aplicar

Extraia na raiz do projeto, na branch atual. Não substitui handlers ou páginas do checkout.

## Verificação

`npm run lint` e `npm run build`.

No navegador, faça login e confira o link `Perfil` no cabeçalho. Depois atualize com F5 e verifique se a sessão persiste.

Se falhar após F5, abra F12 > Network e confira o status de `GET /api/auth/session`.
Verifique apenas a presença do token em Application > Local Storage > `kurio:access-token:v1`; não compartilhe o valor.
