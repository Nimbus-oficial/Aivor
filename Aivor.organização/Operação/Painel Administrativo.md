# Painel Administrativo

## Objetivo

Centralizar a supervisao operacional da Aivor.

O Painel Admin sera o centro operacional interno da Aivor antes do app publico completo.

Fluxo logico:

Observabilidade
↓
Operacao
↓
Governanca
↓
Execucao

O painel nao possui custodia, nao assina transacoes e nao move fundos diretamente.

Toda acao relevante deve respeitar:

- Safe;
- Timelock;
- governanca;
- auditoria.

---

## Funcoes

### Monitoramento

Acompanhar:

- patrimonio total;
- liquidez;
- rendimento;
- operacoes;
- status de contratos;
- status de governanca;
- alertas.

### Gestao

Permitir:

- acompanhamento de estrategias;
- visualizacao de metricas;
- gestao operacional;
- acompanhamento de propostas administrativas;
- simulacoes;
- operacoes planejadas.

### Seguranca

Monitorar:

- alertas;
- eventos criticos;
- limites operacionais;
- status Safe;
- status Timelock.

### Governanca

Visualizar:

- propostas;
- aprovacoes;
- rejeicoes;
- queue;
- execucao simulada;
- status;
- detalhes;
- historico;
- acoes permitidas por papel.

Execucao real via Safe ou Timelock permanece fora do escopo ate nova aprovacao.

### Tesouraria

Planejar a visao financeira interna da Aivor.

Exibir futuramente:

- receitas do protocolo;
- despesas;
- taxas;
- reservas;
- orcamento operacional;
- runway;
- separacao entre patrimonio dos usuarios e recursos da Aivor.

O modulo Tesouraria nao deve misturar patrimonio dos usuarios com recursos corporativos da Aivor.

Movimentacoes relevantes permanecem sujeitas a Safe, Timelock, governanca e auditoria.

---

## Modulos Obrigatorios

1. Dashboard Geral
2. Vault
3. Liquidez
4. Estrategias
5. Looping
6. Morpho
7. Protocolos Futuros
8. Governanca
9. Safe
10. Timelock
11. Risco
12. Auditoria
13. Tesouraria

---

## Indicadores Principais

### Operacao

- TVL;
- depositos;
- saques;
- rendimento.

### Vault

- totalAssets;
- totalSupply;
- share price;
- metricas ERC4626;
- historico.

### Liquidez

- liquidez minima;
- liquidez alvo;
- liquidez maxima;
- liquidez atual;
- alertas de rebalanceamento.

Politica oficial:

- 2% minimo;
- 5% alvo;
- 7% maximo.

### Estrategias

- nome;
- descricao;
- protocolo;
- risco;
- status;
- alocacao;
- historico.

### Looping

- risco de liquidacao;
- exposicao total;
- APY estimado;
- cenario ruim;
- cenario extremo;
- utilizacao da liquidez.

Nenhuma execucao automatica nesta fase.

### Morpho

- posicoes;
- mercados;
- APY;
- utilizacao;
- risco;
- historico.

### Risco

- exposicao;
- concentracao;
- liquidez;
- risco por protocolo;
- risco por estrategia.
- status de modulo;
- circuit breakers ativos;
- divergencias banco vs on-chain;
- aprovacoes pendentes por risco.

O modulo de risco deve seguir:

- [[Politica de Risco]]
- [[Matriz de Risco por Mercado]]
- [[Politica de Limites por Protocolo]]
- [[Circuit Breakers]]

### Auditoria

- logs;
- eventos;
- acoes administrativas;
- historico de governanca.

### Tesouraria

- receitas;
- despesas;
- taxas;
- reservas;
- runway;
- orcamento operacional;
- separacao patrimonial.

---

## Estrutura De Menus

1. Dashboard
2. Vault
3. Liquidez
4. Estrategias
5. Looping
6. Morpho
7. Protocolos Futuros
8. Governanca
9. Safe
10. Timelock
11. Risco
12. Auditoria
13. Tesouraria
14. Configuracoes

---

## Permissoes

- `user`: sem acesso ao painel admin.
- `operator`: pode visualizar, criar propostas e simulacoes.
- `admin`: pode aprovar, rejeitar, cancelar, colocar em fila e executar simulacoes.

Safe e Timelock permanecem obrigatorios para acoes criticas futuras.

Nenhum papel pode mover fundos diretamente pelo backend.

---

## Recomendacoes De UX

O painel deve parecer uma ferramenta institucional de fintech.

Prioridades:

- dados densos, organizados e escaneaveis;
- status claro;
- alertas visuais discretos;
- acoes criticas com confirmacao;
- historico sempre visivel;
- separar "simular", "propor" e "executar";
- deixar explicito quando algo e read-only ou simulado.
- exibir status de cada modulo: `documented`, `simulated`, `read_only`, `testnet`, `limited_capital`, `active` ou `disabled`;
- diferenciar alerta informativo, alerta de atencao, circuit breaker e emergencia;
- mostrar a origem dos dados: banco, on-chain, RPC, Safe ou fonte externa.

Evitar:

- excesso de cards decorativos;
- linguagem cripto desnecessaria;
- botoes de execucao direta;
- esconder riscos.

---

## Ordem Recomendada De Implementacao

1. Safe read-only no backend.
2. Safe status no painel.
3. Governanca visual no painel.
4. Auditoria visual.
5. Vault metrics.
6. Liquidez.
7. Morpho read-only.
8. Estrategias simuladas.
9. Risco.
10. Looping apenas como simulacao.
11. Tesouraria read-only.
12. Testnet readiness.
13. Execucao real somente apos nova aprovacao.

---

## Relacionamentos

- [[Fluxos Operacionais]]
- [[Gestao de Risco]]
- [[Politica de Risco]]
- [[Matriz de Risco por Mercado]]
- [[Politica de Limites por Protocolo]]
- [[Criterios de Ativacao de Estrategias]]
- [[Observabilidade]]
- [[Manual de Emergencia]]
- [[Governança Geral]]
- [[Tesouraria]]

---

## Filosofia

Toda informacao critica deve estar disponivel em um unico local, sem comprometer a regra de nao custodia.

---

## Morpho Read-Only - Fase 10.1

O modulo Morpho do Painel Admin deve exibir:

- modo `read_only`;
- mercados monitorados;
- status do mercado;
- APY;
- liquidez;
- utilizacao;
- LLTV;
- oracle;
- motivo de rejeicao ou watchlist;
- indicadores de risco.

O painel nao deve executar supply, withdraw ou rebalanceamento real nesta fase.
