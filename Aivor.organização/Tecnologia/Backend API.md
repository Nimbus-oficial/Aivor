# Backend API

## Objetivo

Definir os principios da camada de API da Aivor.

Relaciona-se com:

- [[Backend]]
- [[Frontend]]
- [[Painel Administrativo]]
- [[PostgreSQL Schema]]
- [[Eventos e Auditoria]]

---

## Funcao

O backend atua como camada operacional entre:

- Frontend;
- Banco de Dados;
- Blockchain;
- Protocolos externos.

O backend nao possui custodia de patrimonio.

Toda movimentacao financeira ocorre atraves dos smart contracts.

Ver:

[[Smart Contracts]]

---

## Principios

O backend deve ser:

- auditavel;
- observavel;
- desacoplado;
- sem custodia;
- seguro por padrao.

O backend nao deve:

- controlar chaves privadas;
- alterar saldos;
- transferir fundos;
- substituir a blockchain como fonte final de patrimonio.

---

## Endpoints Implementados

### Auth Operacional

- `GET /auth/providers`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/session`
- `GET /auth/me`
- `POST /auth/sessions`
- `POST /auth/sessions/revoke`

Observacao:

`POST /auth/login` valida o access token do Privy, cria ou atualiza o usuario operacional, vincula carteiras verificadas quando disponiveis e cria uma sessao propria da Aivor.

`POST /auth/logout` revoga a sessao da Aivor. A sessao e armazenada como hash no banco.

`GET /auth/session` e `GET /auth/me` usam `Authorization: Bearer <sessionToken>`.

Os endpoints legados `POST /auth/sessions` e `POST /auth/sessions/revoke` permanecem para compatibilidade operacional interna e nao substituem o fluxo Privy.

O backend nao armazena chaves privadas, nao assina transacoes e nao usa o banco como fonte final de patrimonio.

---

### Usuarios

- `GET /users/:userId/profile`
- `POST /users`
- `POST /users/wallets`

---

### Vault

- `GET /vault/account-summary`
- `GET /vault/operational-policy`
- `GET /vault/admin-overview`
- `GET /vault/onchain/config`
- `GET /vault/onchain/status`
- `GET /vault/onchain/vault`

Esses endpoints podem ler dados on-chain quando RPC e endereco do vault estiverem configurados.

Sem configuracao on-chain, retornam fallback operacional.

Os endpoints `onchain` sao somente leitura.

Eles nao usam chave privada, nao assinam transacoes e nao movem fundos.

`GET /vault/onchain/config` retorna as variaveis de endereco configuradas.

`GET /vault/onchain/status` valida RPC, chainId e existencia de bytecode nos contratos configurados.

`GET /vault/onchain/vault` retorna dados basicos do vault quando `ORVEX_RPC_URL` e `ORVEX_VAULT_ADDRESS` estao configurados:

- chainId;
- endereco do vault;
- asset do ERC4626;
- totalAssets;
- totalSupply;
- sharePrice;
- liquidez disponivel;
- idleLiquidityBps;
- flags operacionais.

---

### Operacao

- `GET /operations/policy`
- `GET /operations/settings/liquidity-policy`
- `POST /operations/settings`
- `POST /operations/events`
- `POST /operations/audit-logs`
- `POST /operations/admin-records`
- `POST /operations/position-snapshots`

As rotas `POST /operations/*` exigem sessao autenticada e papel `operator` ou `admin`.

Essa autorizacao e operacional. Governanca Safe + Timelock permanece como camada critica futura para execucao administrativa on-chain.

---

### Governanca Operacional

- `GET /governance/config`
- `GET /governance/safe/status`
- `GET /governance/proposals`
- `GET /governance/proposals/:proposalId`
- `POST /governance/proposals`
- `POST /governance/proposals/:proposalId/approve`
- `POST /governance/proposals/:proposalId/reject`
- `POST /governance/proposals/:proposalId/cancel`
- `POST /governance/proposals/:proposalId/ready`
- `POST /governance/proposals/:proposalId/queue`
- `POST /governance/proposals/:proposalId/execute-simulated`

`POST /governance/proposals` exige papel `operator` ou `admin`.

Acoes de aprovacao, rejeicao, cancelamento, fila e execucao simulada exigem `admin`.

Nesta fase, a execucao e apenas simulada.

O backend nao assina transacoes, nao cria transacoes reais no Safe e nao movimenta fundos.

---

### Health Checks

- `GET /health`
- `GET /health/backend`
- `GET /health/database`
- `GET /health/rpc`

Estados possiveis:

- `ok`
- `not_configured`
- `error`

`GET /health/rpc` retorna `ok` quando `ORVEX_RPC_URL` esta configurado e o provider responde `eth_chainId`.

Quando enderecos on-chain tambem estao configurados, o health inclui status de bytecode para:

- OrvexVault;
- OrvexController;
- OrvexTreasury;
- USDC;
- EURC.

RPC sem configuracao retorna `not_configured`.

---

## Operational Settings

Politicas oficiais conectadas:

- liquidez minima: 200 bps;
- liquidez alvo: 500 bps;
- liquidez maxima: 700 bps;
- multisig: Safe 2-of-4;
- ativos suportados: USDC e EURC;
- protocolo inicial: Morpho.

---

## Variaveis de Ambiente de Autenticacao

- `PRIVY_APP_ID`
- `PRIVY_APP_SECRET`
- `PRIVY_VERIFICATION_KEY`
- `PRIVY_JWKS_URL`
- `PRIVY_API_URL` opcional, padrao `https://api.privy.io`

`PRIVY_JWKS_URL` e o modo recomendado para validar access tokens com suporte a rotacao de chaves.

`PRIVY_VERIFICATION_KEY` permanece como fallback opcional para validacao local direta.

`PRIVY_APP_SECRET` deve permanecer apenas no backend.

---

## Variaveis de Ambiente de Governanca

- `GOVERNANCE_MODE`
- `SAFE_ADDRESS`
- `SAFE_CHAIN_ID`
- `SAFE_API_URL`
- `TIMELOCK_ADDRESS`

`GOVERNANCE_MODE` pode ser:

- `simulated`;
- `safe_readonly`.

`safe_readonly` permite consulta basica do Safe quando `SAFE_API_URL` e `SAFE_ADDRESS` estiverem configurados.

Nenhuma variavel habilita execucao real nesta fase.

---

## Respostas

Respostas de sucesso seguem o formato:

```json
{
  "ok": true,
  "data": {},
  "meta": {
    "source": "database"
  }
}
```

Erros seguem formato padronizado:

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "..."
  }
}
```

---

## Integracoes Futuras

Relaciona-se com:

- [[Privy]]
- [[Morpho]]
- [[Safe]]
- [[Redis]]

Aave, Aerodrome e Uniswap permanecem em fases posteriores.
