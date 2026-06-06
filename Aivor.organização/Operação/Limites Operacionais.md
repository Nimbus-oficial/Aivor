# Limites Operacionais

## Objetivo

Definir os limites de seguranca da operacao da Aivor.

Detalhamento:

- [[Politica de Limites por Protocolo]]
- [[Politica de Risco]]
- [[Parametros Operacionais]]

---

## Finalidade

Os limites existem para reduzir risco operacional e proteger usuarios.

Limite nao e meta de alocacao.

---

## Limites Monitorados

### Liquidez

Faixas oficiais:

- minima: 2%;
- alvo: 5%;
- maxima: 7%.

Ver:

- [[Liquidez]]
- [[Politica de Liquidez]]

### Exposicao

Controle de concentracao em:

- ativos;
- protocolos;
- mercados;
- estrategias;
- modulos experimentais.

Ver:

- [[Politica de Limites por Protocolo]]

### Risco

Monitoramento continuo das condicoes de mercado.

Ver:

- [[Gestao de Risco]]
- [[Politica de Risco]]

### Status de Modulo

Cada modulo deve respeitar:

- `documented`;
- `simulated`;
- `read_only`;
- `testnet`;
- `limited_capital`;
- `active`;
- `disabled`.

---

## Acionadores

Caso algum limite seja ultrapassado:

- revisao operacional;
- rebalanceamento;
- suspensao temporaria de novas alocacoes;
- reducao de exposicao;
- circuit breaker;
- procedimentos de emergencia.

---

## Regras de Alteracao

Alterar limite com impacto financeiro exige:

- proposta;
- analise de risco;
- aprovacao de governanca;
- Safe 2-of-4;
- Timelock quando aplicavel;
- registro de auditoria.

---

## Relacionamentos

- [[Gestao de Risco]]
- [[Liquidez]]
- [[Manual de Emergencia]]
- [[Painel Administrativo]]
- [[Politica de Limites por Protocolo]]
- [[Runbook - Circuit Breakers]]

---

## Filosofia

Os limites devem ser definidos antes dos problemas acontecerem.
