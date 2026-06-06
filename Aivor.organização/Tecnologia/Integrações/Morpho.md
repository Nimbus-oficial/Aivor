# MORPHO

## Objetivo

Fornecer a camada principal de geração de rendimento da Aivor.

---

## O que é

Morpho é um protocolo DeFi utilizado para criação e administração de estratégias financeiras.

---

## Utilização na Aivor

- estratégias de rendimento
    
- gestão de liquidez
    
- alocação de capital
    

---

## Estratégia Inicial

Ativo:

[[USDC]]

Objetivo:

APY sustentável entre 6% e 9%.

---

## Relacionamentos

- [[Integrações]]
    
- [[Base]]
    
- [[Estratégia Morpho]]
    
- [[Gestão de Risco]]
    
- [[Limites Operacionais]]
    

---

## Filosofia

Priorizar consistência e segurança antes de maximizar rendimento.
---

## Fase 10.1 - Read-Only + Market Selection

Status: `read_only`.

Antes de qualquer allocator real ou capital em Morpho, a Aivor deve mapear mercados de forma somente leitura.

Dados minimos por mercado:

- `marketId`;
- `loanToken`;
- `collateralToken`;
- `oracle`;
- `irm`;
- `lltv`;
- `totalSupplyAssets`;
- `totalBorrowAssets`;
- `utilization`;
- `supplyApy`;
- `liquidity`;
- indicadores de risco.

Classificacoes operacionais:

- `eligible`;
- `watchlist`;
- `disabled`;
- `rejected`.

Nesta fase o backend pode expor mercados monitorados ao Painel Admin, mas nao executa supply, nao assina transacoes e nao move fundos.

---

## Fase 10.2 - Real Data Source

Fonte escolhida: Morpho GraphQL API oficial.

Endpoint padrao:

- `https://api.morpho.org/graphql`

Motivo:

- fonte oficial da Morpho;
- adequada para leitura read-only;
- retorna markets, assets, oracle, IRM, LLTV, supply, borrow, utilization, APY e warnings;
- nao exige assinatura nem movimentacao de fundos.

Variaveis:

- `MORPHO_DATA_MODE=real|fallback`;
- `MORPHO_API_URL=https://api.morpho.org/graphql`;
- `MORPHO_CHAIN_ID=8453`;
- `MORPHO_NETWORK=base`;
- `MORPHO_MARKETS_FIRST=25`.

Endpoints Aivor:

- `GET /morpho/markets`;
- `GET /health/morpho`.

Regras:

- backend permanece sem custodia;
- endpoint e somente leitura;
- fallback permanece ativo quando a fonte real nao estiver configurada ou falhar;
- nenhum supply, withdraw, allocator real ou transacao on-chain e executado nesta fase.
