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
- `POST /auth/sessions`
- `POST /auth/sessions/revoke`

Observacao:

Esses endpoints preparam persistencia de sessoes.

Privy ainda nao foi implementado.

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
