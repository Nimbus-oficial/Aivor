# Integrações

## Objetivo

Centralizar as integrações externas utilizadas pela Aivor.

Relaciona-se com:

- [[Backend]]
    
- [[Smart Contracts]]
    
- [[Infraestrutura]]
    
- [[Protocolos]]
    
- [[Estratégia de Alocação]]
    

---

## Blockchain

### [[Base]]

Rede principal utilizada pela Aivor.

Responsável pela execução dos smart contracts e operações on-chain.

---

## Autenticação

### [[Privy]]

Responsável pela autenticação dos usuários e gerenciamento de carteiras.

---

## Governança

### [[Safe]]

Responsável pela execução de ações administrativas críticas aprovadas pela governança.

---

## Protocolos de Lending

### [[Morpho]]

Protocolo utilizado para geração de rendimento através de mercados de empréstimo.

### [[Aave]]

Protocolo utilizado para diversificação das estratégias de lending.

---

## Protocolos de Liquidez

### [[Aerodrome]]

Protocolo utilizado para estratégias de provisão de liquidez e geração de taxas.

### [[Uniswap]]

Protocolo utilizado para provisão de liquidez e acesso à infraestrutura DeFi.

---

## Stablecoins

### [[USDC]]

Principal stablecoin da plataforma.

### [[EURC]]

Stablecoin baseada em euro utilizada para diversificação monetária.

---

## Princípios

Toda integração deve possuir:

- documentação pública
    
- histórico operacional confiável
    
- liquidez adequada
    
- compatibilidade técnica
    
- possibilidade de auditoria
    

---

## Revisão

A lista de integrações pode evoluir conforme crescimento da plataforma e aprovação da governança.
---

## RPC On-chain

O backend pode ler dados on-chain atraves de `ORVEX_RPC_URL`.

Essa integracao e somente leitura nesta fase.

O backend nao deve:

- custodiar fundos;
- armazenar chaves privadas de usuarios;
- assinar transacoes;
- executar movimentacao financeira.

Variaveis aceitas:

- `ORVEX_RPC_URL`;
- `ORVEX_VAULT_ADDRESS`;
- `ORVEX_CONTROLLER_ADDRESS`;
- `ORVEX_TREASURY_ADDRESS`;
- `USDC_ADDRESS`;
- `EURC_ADDRESS`.

As leituras permitidas nesta fase sao:

- `eth_chainId`;
- `eth_getCode`;
- `eth_call` para dados basicos do vault ERC4626.

Morpho real, Safe real, Privy e transacoes on-chain permanecem fora desta fase.
