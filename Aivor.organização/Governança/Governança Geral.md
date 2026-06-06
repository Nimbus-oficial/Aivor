# Governanca Geral

## Objetivo

Definir o modelo de governanca da Aivor.

Relaciona-se com:

- [[Multisig]]
- [[Timelock]]
- [[Gestao de Permissoes]]
- [[Processo de Atualizacao]]

---

## Principio Fundamental

Nenhuma pessoa deve possuir controle absoluto sobre a plataforma.

---

## Estrutura

A governanca e composta por:

- Safe multisig 2-of-4;
- Timelock;
- permissoes operacionais;
- processos de atualizacao;
- auditoria.

---

## Fase Atual

A Fase 7 implementa a governanca operacional em modo:

- `simulated`;
- `safe_readonly`.

O banco registra propostas, status, atores, timestamps e auditoria.

O backend nao executa transacoes reais.

---

## Fluxo de Propostas

Estados suportados:

- `draft`;
- `approved`;
- `rejected`;
- `cancelled`;
- `ready`;
- `queued`;
- `executed_simulated`.

Tipos suportados:

- alteracao de parametro operacional;
- atualizacao de endereco;
- pausa operacional;
- registro de decisao;
- preparacao futura de transacao on-chain.

---

## Permissoes

- `user`: nao cria nem altera propostas;
- `operator`: pode criar proposta operacional;
- `admin`: pode aprovar, rejeitar, cancelar, colocar em fila e executar simulacao.

---

## Escopo

A governanca controla:

- contratos;
- parametros operacionais;
- integracoes;
- tesouraria;
- upgrades.

---

## Prioridade

A protecao patrimonial dos usuarios possui prioridade maxima.
