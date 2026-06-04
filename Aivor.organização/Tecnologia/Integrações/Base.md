# BASE

## Objetivo

Atuar como blockchain principal da Aivor.

---

## O que é

Base é uma blockchain compatível com EVM desenvolvida dentro do ecossistema da Coinbase.

---

## Utilização na Aivor

- Deploy dos contratos
    
- Depósitos
    
- Saques
    
- Movimentação dos vaults
    
- Governança operacional
    

---

## Motivos da Escolha

- Baixo custo
    
- Escalabilidade
    
- Ecossistema crescente
    
- Compatibilidade Ethereum
    

---

## Relacionamentos

- [[Integrações]]
    
- [[Morpho]]
    
- [[USDC]]
    
- [[ovUSDC]]
    
- [[Smart Contracts]]
    

---

## Filosofia

Utilizar uma infraestrutura blockchain robusta, acessível e preparada para escala global.
---

## Configuracao RPC

A integracao inicial com Base no backend usa RPC somente leitura.

Variavel principal:

- `ORVEX_RPC_URL`

O health check `GET /health/rpc` deve retornar:

- `not_configured` quando a variavel nao existe;
- `ok` quando o provider responde `eth_chainId`;
- `error` quando o provider falha.

Enderecos de contratos e ativos devem vir de variaveis de ambiente:

- `ORVEX_VAULT_ADDRESS`;
- `ORVEX_CONTROLLER_ADDRESS`;
- `ORVEX_TREASURY_ADDRESS`;
- `USDC_ADDRESS`;
- `EURC_ADDRESS`.

Nenhum endereco deve ser hardcoded no backend.

Nesta fase, o backend nao assina transacoes e nao move fundos.
