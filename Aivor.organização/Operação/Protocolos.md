# Protocolos

## Objetivo

Centralizar os protocolos utilizados pela Aivor.

Relaciona-se com:

- [[Estrategia de Alocacao]]
- [[Gestao de Risco]]
- [[Liquidez]]
- [[Aivor V1 Modular Completa]]

---

## Protocolos da V1

Morpho, Aave, Uniswap e Aerodrome fazem parte da arquitetura da Aivor V1.

Isso nao significa ativacao operacional simultanea.

Cada protocolo deve evoluir por status:

1. `documented`;
2. `simulated`;
3. `read_only`;
4. `testnet`;
5. `limited_capital`;
6. `active`;
7. `disabled`, se necessario.

---

## Lending

### Morpho

Funcao:

- emprestimos;
- geracao de rendimento;
- estrategia prioritaria da V1.

Ver:

- [[Morpho]]

### Aave

Funcao:

- emprestimos;
- geracao de rendimento;
- diversificacao futura dentro da V1 modular.

Ver:

- [[Aave]]

---

## Liquidity Pools

### Aerodrome

Funcao:

- provisao de liquidez;
- geracao de taxas;
- estrategia de maior complexidade operacional.

Ver:

- [[Aerodrome]]

### Uniswap

Funcao:

- provisao de liquidez;
- geracao de taxas;
- estrategia de maior complexidade operacional.

Ver:

- [[Uniswap]]

---

## Criterios de Utilizacao

Todo protocolo deve possuir:

- liquidez adequada;
- historico operacional solido;
- documentacao publica;
- auditorias relevantes;
- integracao compativel com a arquitetura da Aivor;
- monitoramento;
- limites de exposicao;
- runbook operacional.

Ver:

- [[Criterios de Selecao de Mercados]]

---

## Auditoria Especifica

Antes de capital real, cada adaptador operacional de protocolo exige auditoria especifica.

Exigem revisao dedicada:

- adaptador Morpho real;
- adaptador Aave real;
- adaptador Uniswap real;
- adaptador Aerodrome real;
- automacao de estrategias;
- rebalanceamento automatico;
- Looping;
- Leverage.

---

## Governanca

Ativar, pausar, limitar ou desativar um protocolo exige:

- proposta registrada;
- analise de risco;
- aprovacao por Safe 2-of-4;
- Timelock quando aplicavel;
- auditoria quando houver capital real;
- registro em audit logs;
- runbook atualizado.

---

## Revisao

A lista de protocolos pode ser alterada conforme evolucao da operacao e aprovacao da governanca.
