# Criterios de Ativacao de Estrategias

## Objetivo

Definir criterios objetivos para ativar estrategias da Aivor.

Referencia:

- [[Politica de Risco]]
- [[Aivor V1 Modular Completa]]
- [[Matriz de Risco por Mercado]]
- [[Politica de Limites por Protocolo]]

---

## Tipos de Estrategia

- lending;
- liquidez;
- looping;
- leverage;
- estrategias automaticas.

---

## Checklist Geral

Antes de ativar qualquer estrategia:

- estrategia documentada;
- protocolo definido;
- ativo definido;
- mercado ou pool definido;
- risco classificado;
- limite proposto;
- status atual definido;
- status pretendido definido;
- fontes de dados definidas;
- monitoramento definido;
- runbook definido;
- auditoria exigida ou justificativa formal registrada;
- governanca aplicavel definida.

---

## `documented` para `simulated`

Exige:

- tese operacional;
- riscos mapeados;
- dependencias listadas;
- modelo de simulacao definido;
- ausencia de capital real.

Aprovacao:

- operator pode propor;
- admin aprova.

---

## `simulated` para `read_only`

Exige:

- simulacao concluida;
- fonte de dados real ou confiavel;
- sem permissao de escrita;
- logs;
- painel capaz de exibir status.

Aprovacao:

- admin aprova.

---

## `read_only` para `testnet`

Exige:

- leitura estavel;
- adapter ou mock tecnico em testnet;
- testes de deposito, retirada e rebalanceamento quando aplicavel;
- circuit breakers simulados;
- runbook de testnet.

Aprovacao:

- admin aprova;
- Safe recomendado para configuracao critica.

---

## `testnet` para `limited_capital`

Exige:

- teste ponta a ponta;
- limites aprovados;
- matriz de risco preenchida;
- monitoramento ativo;
- auditoria especifica quando houver adapter, automacao, looping ou leverage;
- runbook de emergencia;
- plano de rollback;
- aprovacao Safe 2-of-4;
- Timelock quando aplicavel.

---

## `limited_capital` para `active`

Exige:

- operacao limitada sem incidente critico aberto;
- metricas estaveis;
- capacidade de retirada validada;
- limites revisados;
- auditoria completa;
- revisao operacional;
- governanca aprovada.

---

## Impedimentos de Ativacao

Impedir ativacao quando houver:

- liquidez insuficiente;
- APY anormal;
- oracle instavel;
- protocolo sob incidente;
- adapter nao auditado para capital real;
- risco de liquidacao nao modelado;
- Safe ou Timelock indisponivel;
- divergencia banco vs on-chain;
- ausencia de runbook;
- ausencia de limite aprovado.

---

## Estrategias Automaticas

Estrategias automaticas exigem adicionalmente:

- limite por execucao;
- cooldown;
- protecao contra repeticao;
- logs detalhados;
- simulacao de erro;
- permissao minima;
- circuit breaker proprio.

---

## Registro no Painel Admin

Cada estrategia deve exibir:

- status;
- camada;
- protocolo;
- mercado;
- ativo;
- score de risco;
- limite;
- exposicao;
- APY;
- alertas;
- auditoria requerida;
- aprovacao pendente;
- historico de mudancas.
