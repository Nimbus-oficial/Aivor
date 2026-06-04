# Privy

## Objetivo

Simplificar o acesso dos usuarios a Aivor sem criar custodia no backend.

---

## Funcao

Privy e a camada de autenticacao Web3 da Aivor.

Ele pode suportar:

- login por wallet;
- login por email;
- provedores sociais habilitados no painel Privy;
- carteiras incorporadas, quando configuradas no Privy.

---

## Principio de Custodia

O backend da Aivor nao controla chaves privadas.

O backend nao assina transacoes.

O backend nao movimenta fundos.

O backend valida identidade e cria uma sessao operacional propria.

Patrimonio e posicoes financeiras continuam tendo a blockchain como fonte final.

---

## Variaveis

- `PRIVY_APP_ID`
- `PRIVY_APP_SECRET`
- `PRIVY_VERIFICATION_KEY`
- `PRIVY_JWKS_URL`
- `PRIVY_API_URL` opcional

`PRIVY_APP_SECRET` deve existir apenas no backend.

`PRIVY_JWKS_URL` e recomendado para validar access tokens Privy com suporte a rotacao de chaves.

`PRIVY_VERIFICATION_KEY` permanece como fallback opcional.

---

## Fluxo de Login

1. Frontend autentica o usuario no Privy.
2. Frontend envia `accessToken` para `POST /auth/login`.
3. Opcionalmente envia `identityToken` para permitir leitura de email e wallets vinculadas.
4. Backend valida o token Privy.
5. Backend cria ou atualiza o usuario operacional.
6. Backend vincula wallets verificadas quando disponiveis.
7. Backend cria sessao propria e armazena somente o hash.
8. Backend retorna `sessionToken` operacional.

---

## Auditoria

Eventos registrados:

- `auth.login`;
- `auth.login.failed`;
- `auth.logout`;
- `auth.wallet.linked`.

---

## Permissoes

Papeis operacionais:

- `user`;
- `operator`;
- `admin`.

Esses papeis protegem rotas administrativas do backend.

Safe + Timelock continuam obrigatorios para governanca critica on-chain em fase posterior.

---

## Relacionamentos

- [[Integrações]]
- [[Frontend]]
- [[Backend]]
- [[Backend API]]
- [[Segurança Técnica]]
- [[Eventos e Auditoria]]

---

## Filosofia

A experiencia do usuario deve parecer uma fintech moderna, escondendo a complexidade cripto sem reduzir seguranca.
