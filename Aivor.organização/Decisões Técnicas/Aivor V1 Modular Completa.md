# Aivor V1 Modular Completa

## Decisao oficial

A Aivor V1 sera uma V1 Modular Completa, com ativacao progressiva por risco.

A existencia arquitetural de um modulo nao significa ativacao operacional imediata.

A V1 inclui:

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

## Existencia arquitetural vs ativacao operacional

### Existencia arquitetural

Um modulo existe arquiteturalmente quando:

- esta previsto na documentacao oficial;
- possui papel definido na arquitetura;
- possui dependencias conhecidas;
- possui status operacional definido;
- pode ser integrado ao roadmap tecnico.

Existencia arquitetural permite planejar contratos, backend, banco, painel admin, governanca e observabilidade sem improviso.

### Ativacao operacional

Um modulo esta operacionalmente ativo apenas quando:

- foi implementado;
- foi testado;
- foi validado em ambiente apropriado;
- possui monitoramento;
- possui runbook;
- possui limites operacionais;
- foi aprovado pela governanca;
- recebeu auditoria especifica quando houver risco financeiro relevante.

Nenhum modulo deve movimentar capital real apenas por estar documentado.

## Status dos modulos

Todo modulo da V1 deve usar um dos seguintes status:

| Status | Significado |
| --- | --- |
| `documented` | Modulo previsto e documentado, sem implementacao operacional ativa. |
| `simulated` | Modulo implementado em simulacao, sem execucao real e sem movimentacao de fundos. |
| `read_only` | Modulo conectado apenas para leitura e observabilidade. |
| `testnet` | Modulo ativo em testnet, sem capital real. |
| `limited_capital` | Modulo ativo com limites estritos de capital real e monitoramento reforcado. |
| `active` | Modulo aprovado para operacao plena dentro dos limites definidos. |
| `disabled` | Modulo desativado por decisao tecnica, operacional ou de governanca. |

## Camada 1 - Core

Camada fundacional da Aivor V1.

Modulos:

- USDC;
- EURC;
- ovUSDC;
- ERC4626;
- OrvexVault como nome tecnico legado;
- OrvexController como nome tecnico legado;
- OrvexTreasury como nome tecnico legado;
- Safe;
- Timelock;
- Governanca;
- Liquidez;
- Auditoria;
- Painel Admin;
- Backend sem custodia;
- Banco de dados operacional;
- Autenticacao;
- Observabilidade;
- Tesouraria;
- Base/RPC;
- runbooks operacionais.

Objetivo:

Criar uma infraestrutura segura, auditavel, governavel e preparada para estrategias.

## Camada 2 - Estrategias

Camada responsavel por alocacao e rendimento.

Modulos:

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

Objetivo:

Permitir geracao de rendimento diversificada com limites, auditoria e governanca.

## Camada 3 - Estrategias Avancadas

Camada de maior complexidade e maior risco.

Modulos:

- Looping;
- Leverage;
- estrategias compostas;
- alavancagem sobre Morpho ou Aave;
- simulacoes de stress;
- controle de liquidacao;
- limites dinamicos de exposicao;
- circuit breakers avancados;
- automacao condicional.

Objetivo:

Expandir capacidade operacional somente apos maturidade tecnica, operacional e governanca especifica.

## Ordem ideal de implementacao

1. Documentacao oficial da V1 modular.
2. Smart contracts modulares e interfaces de estrategia.
3. Safe real em modo read-only.
4. Timelock real.
5. Painel Admin para governanca, liquidez, auditoria e tesouraria.
6. Deploy testnet da Camada 1.
7. Morpho read-only.
8. Morpho operacional em testnet.
9. Aave read-only.
10. Uniswap e Aerodrome read-only.
11. Motor de estrategias automaticas em modo simulado.
12. Estrategias automaticas em testnet com limites.
13. Looping simulado.
14. Leverage simulado.
15. Looping e leverage operacional somente apos auditoria especifica.

## Ordem ideal de ativacao

1. USDC, ovUSDC e vault.
2. Safe, Timelock e Governanca.
3. Liquidez, Auditoria e Painel Admin.
4. Tesouraria read-only.
5. Morpho read-only.
6. Morpho com alocacao limitada em testnet.
7. EURC em modo preparado ou read-only.
8. Aave read-only.
9. Uniswap e Aerodrome read-only.
10. Estrategias automaticas em simulacao.
11. Estrategias automaticas com capital limitado.
12. Aave operacional, se aprovado.
13. Uniswap e Aerodrome operacionais, se aprovados.
14. Looping experimental simulado.
15. Leverage experimental simulado.
16. Looping e leverage com capital real apenas apos auditoria dedicada e aprovacao de governanca.

## Modulos experimentais

Podem existir como experimentais no painel interno, sem promessa publica e sem ativacao automatica:

- EURC;
- Aave;
- Uniswap;
- Aerodrome;
- estrategias automaticas;
- rebalanceamento automatico;
- Looping;
- Leverage;
- simulador de stress;
- Tesouraria avancada;
- Risk dashboard avancado.

Modulo experimental pode ser:

- `documented`;
- `simulated`;
- `read_only`;
- `testnet`.

Modulo experimental nao deve operar capital real sem migrar para `limited_capital` ou `active` por governanca.

## Modulos que exigem auditoria especifica

Exigem auditoria especifica antes de capital real:

- adaptador Morpho real;
- adaptador Aave real;
- adaptador Uniswap real;
- adaptador Aerodrome real;
- registry de estrategias;
- automacao de estrategias;
- Looping;
- Leverage;
- Timelock real;
- upgradeability/proxy;
- performance fee;
- fluxo de Tesouraria;
- emergency withdraw;
- rebalanceamento automatico.

## Regras de ativacao por governanca

Toda ativacao operacional relevante deve seguir:

1. proposta registrada;
2. justificativa tecnica;
3. analise de risco;
4. status atual e status proposto;
5. limites de capital, quando aplicavel;
6. janela de revisao;
7. aprovacao por Safe 2-of-4;
8. Timelock quando a acao for critica;
9. registro de auditoria;
10. runbook atualizado antes da ativacao.

Mudancas para `limited_capital` ou `active` exigem aprovacao explicita de governanca.

Mudancas envolvendo capital real, novas estrategias, adapters de protocolo, upgradeability, fee ou emergencia exigem auditoria especifica ou justificativa formal de excecao aprovada.

Referencia obrigatoria:

- [[Politica de Risco]]

## Politica de risco

A ativacao progressiva da V1 deve seguir a Politica de Risco oficial.

A politica define:

- risco por ativo;
- risco por protocolo;
- risco por estrategia;
- limites por protocolo, ativo, mercado, estrategia e modulo experimental;
- regras de liquidez;
- circuit breakers;
- criterios de transicao entre status;
- permissoes de operator, admin, Safe, Timelock e auditoria externa;
- exibicao de risco no Painel Admin.

Nenhum modulo pode avancar para `limited_capital` ou `active` sem cumprir os criterios de risco aplicaveis.

## Regra final

Aivor V1 e modular, mas nao simultaneamente ativa.

A arquitetura deve permitir expansao.

A operacao deve ativar modulos gradualmente, conforme risco, testes, auditoria e governanca.

## Relacionamentos

- [[Arquitetura Geral]]
- [[Roadmap Geral]]
- [[Roadmap Publico]]
- [[Governanca Safe e Timelock]]
- [[Parametros Oficiais]]
- [[Protocolos]]
- [[Painel Administrativo]]
- [[Politica de Risco]]
- [[Matriz de Risco por Mercado]]
- [[Politica de Limites por Protocolo]]
- [[Politica de Looping e Leverage]]
- [[Criterios de Ativacao de Estrategias]]
