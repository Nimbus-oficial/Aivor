# Gestao de Risco

## Objetivo

Definir a estrutura de gestao de risco da Aivor.

A politica oficial detalhada esta em:

- [[Politica de Risco]]

Relaciona-se com:

- [[Liquidez]]
- [[Politica de Liquidez]]
- [[Parametros Operacionais]]
- [[Estrategia de Alocacao]]
- [[Emergency Pause]]
- [[Aivor V1 Modular Completa]]

---

## Principios

A protecao patrimonial possui prioridade sobre a busca por rendimento.

Aivor V1 e modular, mas a ativacao operacional e progressiva por risco.

Nenhum modulo deve receber capital real apenas por estar documentado ou implementado.

---

## Riscos Monitorados

### Ativos

- USDC;
- EURC.

### Protocolos

- Morpho;
- Aave;
- Uniswap;
- Aerodrome.

### Estrategias

- lending;
- liquidez;
- looping;
- leverage;
- estrategias automaticas.

### Infraestrutura

- RPC;
- banco de dados;
- indexacao;
- Safe;
- Timelock;
- painel admin;
- observabilidade.

---

## Mitigacoes

- limites por ativo;
- limites por protocolo;
- limites por mercado;
- limites por estrategia;
- liquidez minima;
- circuit breakers;
- auditoria;
- governanca;
- Safe 2-of-4;
- Timelock;
- emergency pause;
- monitoramento continuo;
- runbooks.

---

## Circuit Breakers

Os circuit breakers oficiais estao definidos em:

- [[Politica de Risco]]

Eles cobrem:

- queda brusca de liquidez;
- APY anormal;
- falha de protocolo;
- erro de oracle;
- risco de liquidacao;
- divergencia banco vs on-chain;
- falha de RPC;
- falha de Safe ou Timelock.

---

## Objetivo Final

Preservar o patrimonio dos usuarios, proteger a continuidade operacional e impedir que estrategias avancadas sejam ativadas sem maturidade, auditoria e governanca.
