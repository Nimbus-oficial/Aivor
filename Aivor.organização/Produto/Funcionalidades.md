# Funcionalidades

## Objetivo

Centralizar as funcionalidades da Aivor.

---

## Funcionalidades Iniciais

### Depositos

USDC e EURC fazem parte da arquitetura da V1.

A ativacao operacional de cada ativo segue status, testes e governanca.

### Resgates

Solicitacao de saque e acompanhamento claro do estado da operacao.

### Dashboard

Visualizacao de patrimonio, rendimento, historico e crescimento patrimonial.

### Rendimentos

Acompanhamento de desempenho sem expor complexidade tecnica ao usuario comum.

### Historico

Consulta de operacoes realizadas, eventos relevantes e status.

---

## V1 Modular Completa

A V1 inclui arquitetura para:

- USDC;
- EURC;
- ovUSDC;
- Morpho;
- Aave;
- Uniswap;
- Aerodrome;
- Safe;
- Timelock;
- Painel Admin;
- Governanca;
- Liquidez;
- Auditoria;
- Looping;
- Leverage;
- Tesouraria;
- estrategias automaticas.

Nem todas as funcionalidades ficam ativas simultaneamente.

Cada modulo deve possuir status operacional:

- `documented`;
- `simulated`;
- `read_only`;
- `testnet`;
- `limited_capital`;
- `active`;
- `disabled`.

Referencia:

- [[Aivor V1 Modular Completa]]

---

## Modulos Experimentais

Podem existir em ambiente interno ou painel administrativo sem ficarem disponiveis ao publico:

- Aave;
- Uniswap;
- Aerodrome;
- estrategias automaticas;
- Looping;
- Leverage;
- simulacoes de stress;
- Tesouraria avancada.

Modulo experimental nao deve movimentar capital real sem aprovacao de governanca e auditoria especifica quando aplicavel.

---

## Funcionalidades Futuras

- novos ativos;
- novos produtos;
- novas estrategias;
- novas automacoes;
- novos mercados.
