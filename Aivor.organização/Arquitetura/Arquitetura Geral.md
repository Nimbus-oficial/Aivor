# Arquitetura Geral

## Objetivo

Descrever a arquitetura da Aivor e a relacao entre seus principais componentes.

Relaciona-se com:

- [[Fluxo Completo]]
- [[ERC4626]]
- [[ovUSDC]]
- [[USDC]]
- [[EURC]]
- [[Backend]]
- [[Smart Contracts]]
- [[Frontend]]
- [[Aivor V1 Modular Completa]]

---

## Visao Geral

A Aivor e uma plataforma Web3 modular, sem custodia no backend, composta por frontend, backend operacional e smart contracts.

A decisao oficial da V1 e:

- [[Aivor V1 Modular Completa]]

Aivor V1 sera uma V1 Modular Completa, com ativacao progressiva por risco.

Existencia arquitetural nao significa ativacao operacional imediata.

---

## Componentes Tecnicos

### Frontend

Responsavel pela experiencia do usuario.

Funcoes:

- autenticacao;
- depositos;
- saques;
- acompanhamento de rendimento;
- experiencia simples sem jargao tecnico.

Ver:

- [[Frontend]]

### Backend

Responsavel pela camada operacional.

Funcoes:

- integracao de sistemas;
- autenticacao;
- monitoramento;
- auditoria;
- observabilidade;
- leitura on-chain;
- sincronizacao de UX.

O backend nao possui custodia de patrimonio.

Ver:

- [[Backend]]
- [[Backend Sem Custodia]]

### Smart Contracts

Responsaveis pela custodia e movimentacao financeira.

Funcoes:

- depositos;
- saques;
- emissao de shares;
- integracao com protocolos;
- protecoes de liquidez;
- execucao sob governanca.

Ver:

- [[Smart Contracts]]

---

## Camadas da V1

### Camada 1 - Core

Camada fundacional.

Inclui:

- USDC;
- EURC;
- ovUSDC;
- ERC4626;
- Vault;
- Controller;
- Treasury;
- Safe;
- Timelock;
- Governanca;
- Liquidez;
- Auditoria;
- Painel Admin;
- Backend sem custodia;
- Banco de Dados;
- Autenticacao;
- Observabilidade;
- Tesouraria;
- Base/RPC;
- runbooks operacionais.

### Camada 2 - Estrategias

Camada responsavel por alocacao e rendimento.

Inclui:

- Morpho;
- Aave;
- Uniswap;
- Aerodrome;
- estrategias automaticas simples;
- rebalanceamento;
- selecao de mercados;
- monitoramento de APY;
- gestao de exposicao;
- gestao de risco por protocolo;
- simulacoes de estrategia.

### Camada 3 - Estrategias Avancadas

Camada de maior complexidade e maior risco.

Inclui:

- Looping;
- Leverage;
- estrategias compostas;
- simulacoes de stress;
- controle de liquidacao;
- limites dinamicos de exposicao;
- circuit breakers avancados;
- automacao condicional.

---

## Status dos Modulos

Cada modulo deve evoluir por status:

- `documented`;
- `simulated`;
- `read_only`;
- `testnet`;
- `limited_capital`;
- `active`;
- `disabled`.

Mudancas para `limited_capital` ou `active` exigem aprovacao explicita de governanca.

---

## Ativos

Ativos suportados na arquitetura da V1:

- [[USDC]]
- [[EURC]]

---

## Shares

Os depositos dos usuarios sao representados por shares.

Ver:

- [[ERC4626]]
- [[ovUSDC]]

---

## Protocolos

A Aivor V1 contempla:

- [[Morpho]]
- [[Aave]]
- [[Aerodrome]]
- [[Uniswap]]

A inclusao arquitetural desses protocolos nao significa ativacao operacional simultanea.

---

## Governanca

Alteracoes criticas seguem os mecanismos definidos em:

- [[Multisig]]
- [[Timelock]]
- [[Emergency Pause]]

Regras de ativacao:

- proposta registrada;
- justificativa tecnica;
- analise de risco;
- aprovacao por Safe 2-of-4;
- Timelock quando aplicavel;
- registro de auditoria;
- runbook atualizado.

---

## Principios

A arquitetura prioriza:

- simplicidade;
- auditabilidade;
- seguranca;
- modularidade;
- escalabilidade;
- transparencia.
