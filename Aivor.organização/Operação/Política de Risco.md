# Politica de Risco

## Objetivo

Definir como a Aivor decide:

- onde alocar;
- quanto alocar;
- quando rebalancear;
- quando reduzir exposicao;
- quando pausar;
- quando impedir ativacao de uma estrategia.

Esta politica orienta a V1 Modular Completa, com ativacao progressiva por risco.

Referencia:

- [[Aivor V1 Modular Completa]]
- [[Gestao de Risco]]
- [[Parametros Operacionais]]
- [[Painel Administrativo]]
- [[Matriz de Risco por Mercado]]
- [[Politica de Limites por Protocolo]]
- [[Politica de Looping e Leverage]]
- [[Criterios de Ativacao de Estrategias]]
- [[Circuit Breakers]]

---

## Principio Central

Protecao patrimonial vem antes de rendimento.

Nenhuma estrategia deve ser ativada apenas porque esta documentada ou implementada.

Toda ativacao operacional deve respeitar:

- status do modulo;
- risco do ativo;
- risco do protocolo;
- risco da estrategia;
- liquidez disponivel;
- governanca;
- auditoria;
- monitoramento;
- runbook.

---

## Estados Oficiais dos Modulos

Todo modulo deve possuir um dos status:

- `documented`;
- `simulated`;
- `read_only`;
- `testnet`;
- `limited_capital`;
- `active`;
- `disabled`.

Mudancas para `limited_capital` ou `active` exigem aprovacao de governanca.

Mudancas envolvendo capital real, novos adapters, automacao, looping, leverage, fee, treasury flow ou emergency withdraw exigem auditoria especifica ou justificativa formal de excecao aprovada.

---

## Risco por Ativo

### USDC

Papel:

- ativo principal da V1;
- base inicial do vault;
- principal referencia de liquidez e patrimonio.

Riscos monitorados:

- risco de emissor;
- risco de congelamento;
- risco de liquidez on-chain;
- risco de bridge ou rede, quando aplicavel;
- risco de pool ou mercado utilizado;
- divergencia entre saldo on-chain e leituras operacionais.

Regras:

- USDC pode ser o primeiro ativo em `testnet`, `limited_capital` e `active`;
- exposicao em USDC deve manter liquidez oficial do vault;
- qualquer anomalia relevante no ativo deve bloquear novas alocacoes ate revisao.

### EURC

Papel:

- ativo suportado pela arquitetura da V1;
- diversificacao futura;
- ativacao tecnica posterior a maturidade do fluxo USDC.

Riscos monitorados:

- liquidez menor que USDC;
- disponibilidade de mercados;
- spreads;
- composability com protocolos integrados;
- risco de conversao operacional;
- menor historico operacional em estrategias.

Regras:

- EURC pode permanecer em `documented`, `simulated` ou `read_only` ate haver maturidade operacional;
- EURC nao deve mover para `limited_capital` sem mercados validados, liquidez adequada e auditoria de adapter;
- EURC nao deve ser misturado ao fluxo USDC sem separacao clara de risco, metricas e limites.

---

## Risco por Protocolo

### Morpho

Papel:

- protocolo prioritario da V1 para lending.

Riscos:

- risco de mercado isolado;
- risco de collateral;
- risco de liquidez para retirada;
- risco de oracle no mercado;
- risco de parametro do market;
- risco de adapter.

Regras:

- primeiro protocolo candidato a `testnet`;
- capital real exige adapter auditado;
- cada market Morpho deve ter limite proprio;
- markets novos entram inicialmente em `read_only` ou `testnet`.

### Aave

Papel:

- protocolo de lending para diversificacao dentro da V1 modular.

Riscos:

- risco de pool;
- risco de eMode ou parametros de borrowing, se usados;
- risco de utilizacao alta;
- risco de retirada sob estresse;
- risco de composability com looping/leverage.

Regras:

- deve iniciar em `read_only`;
- ativacao com capital exige auditoria do adapter;
- nao deve ser usado para leverage antes da politica especifica de liquidacao.

### Uniswap

Papel:

- protocolo de liquidez e geracao de taxas.

Riscos:

- impermanent loss;
- volatilidade de preco;
- risco de faixa de liquidez;
- risco de pool com liquidez insuficiente;
- risco de MEV;
- risco de oracle indireto.

Regras:

- deve iniciar como `documented`, `simulated` ou `read_only`;
- capital real exige simulacao, stress test e auditoria especifica;
- nao deve ser ativado em pools sem liquidez, volume e historico adequados.

### Aerodrome

Papel:

- protocolo de liquidez e geracao de taxas na Base.

Riscos:

- risco de pool;
- risco de incentivo;
- risco de gauge;
- risco de liquidez concentrada;
- risco operacional especifico do protocolo;
- risco de dependencia de rewards.

Regras:

- deve iniciar como `documented`, `simulated` ou `read_only`;
- capital real exige avaliacao de pool, rewards, liquidez e adapter;
- estrategias dependentes de incentivos devem ter limite conservador.

---

## Risco por Estrategia

### Lending

Riscos:

- retirada indisponivel;
- utilizacao alta;
- mercado com collateral de baixa qualidade;
- APY anormal;
- oracle inconsistente;
- mudanca de parametros do protocolo.

Regras:

- estrategia inicial preferida;
- cada mercado deve ter limite proprio;
- novas alocacoes param quando liquidez, oracle ou APY apresentarem anomalia.

### Liquidez

Riscos:

- impermanent loss;
- baixa profundidade;
- slippage;
- fees insuficientes;
- volatilidade de pool;
- MEV.

Regras:

- iniciar em simulacao;
- exigir stress test antes de capital real;
- exigir auditoria especifica de adapter e estrategia.

### Looping

Riscos:

- liquidacao;
- dependencia de oracle;
- aumento rapido de exposicao;
- custos de unwinding;
- falha em cascata.

Regras:

- deve permanecer `simulated` ate haver politica quantitativa de liquidacao;
- capital real exige auditoria especifica;
- deve possuir limites de leverage, health factor minimo e circuit breaker dedicado.

### Leverage

Riscos:

- perda amplificada;
- liquidacao;
- slippage;
- falha de automacao;
- risco de oracle;
- risco de liquidez.

Regras:

- nao deve ser `active` sem auditoria especifica;
- exigir limites dinamicos, monitoramento continuo e emergency unwind;
- comecar apenas em `simulated` e `testnet`.

### Estrategias Automaticas

Riscos:

- erro de algoritmo;
- execucao em condicao de mercado inadequada;
- bug de automacao;
- permissao excessiva;
- dependencia de dados externos;
- execucao repetida indevida.

Regras:

- automacao deve comecar em `simulated`;
- execucao real exige governanca, auditoria e limites;
- automacao nunca deve contornar Safe, Timelock ou limites de contrato.

---

## Limites

### Por Protocolo

Cada protocolo deve possuir:

- limite maximo de exposicao;
- status operacional;
- lista de mercados/pools aprovados;
- criterios de pausa;
- responsavel operacional;
- auditoria requerida antes de capital real.

Limites numericos especificos devem ser definidos por proposta de governanca antes de mover para `limited_capital` ou `active`.

### Por Ativo

Cada ativo deve possuir:

- limite de exposicao;
- limite de liquidez minima;
- redes permitidas;
- contratos oficiais;
- mercados aprovados;
- criterios de suspensao.

USDC e o ativo inicial prioritario.

EURC deve evoluir de forma separada e mais conservadora.

### Por Mercado

Cada market ou pool deve possuir:

- protocolo;
- ativo;
- risco;
- limite de alocacao;
- liquidez disponivel;
- APY historico;
- utilizacao;
- oracles ou fontes de preco;
- status operacional.

Mercados novos nao devem receber capital real sem validacao em `read_only` e `testnet`.

### Por Estrategia

Cada estrategia deve possuir:

- tipo;
- protocolo;
- limite de exposicao;
- limite de perda aceitavel;
- criterios de rebalanceamento;
- criterios de pausa;
- dependencia de oracle;
- dependencia de automacao;
- auditoria requerida.

### Por Modulo Experimental

Modulos experimentais podem operar apenas em:

- `documented`;
- `simulated`;
- `read_only`;
- `testnet`.

Qualquer migracao para `limited_capital` exige proposta, analise de risco, auditoria quando aplicavel e aprovacao de governanca.

---

## Liquidez

Politica oficial:

- liquidez minima: 2%;
- liquidez alvo: 5%;
- liquidez maxima: 7%.

### Quando Rebalancear

Rebalancear quando:

- liquidez estiver abaixo de 5% e houver condicao segura para recompor;
- liquidez ficar acima de 7% por excesso de capital ocioso;
- exposicao por protocolo ou mercado se aproximar do limite aprovado;
- risco de protocolo aumentar;
- APY ou utilizacao indicar anomalia;
- governanca aprovar nova alocacao.

### Quando Parar Novas Alocacoes

Parar novas alocacoes quando:

- liquidez cair abaixo de 2%;
- protocolo integrado apresentar falha;
- RPC ou leitura on-chain estiver inconsistente;
- Safe ou Timelock estiver indisponivel para acoes criticas;
- APY estiver anormal sem explicacao;
- oracle ou fonte de preco apresentar erro;
- divergencia banco vs on-chain for relevante.

### Quando Reduzir Exposicao

Reduzir exposicao quando:

- liquidez permanecer abaixo da faixa alvo;
- utilizacao de mercado ficar excessiva;
- risco de retirada aumentar;
- protocolo perder confiabilidade;
- auditoria ou monitoramento apontar vulnerabilidade;
- governanca determinar reducao de risco.

### Quando Acionar Emergency Pause

Acionar emergency pause quando houver:

- risco iminente de perda de patrimonio;
- exploit ou suspeita de exploit;
- falha critica de smart contract;
- falha critica de protocolo integrado;
- oracle comprometido;
- divergencia grave entre on-chain e banco;
- incapacidade de monitorar o sistema;
- falha de governanca critica durante evento de risco.

Emergency pause deve priorizar protecao e continuidade de resgates quando tecnicamente possivel.

---

## Circuit Breakers

Circuit breakers sao gatilhos para bloquear novas alocacoes, reduzir exposicao, pausar modulos ou acionar emergencia.

### Queda Brusca de Liquidez

Gatilhos:

- liquidez abaixo de 2%;
- queda rapida de liquidez em janela curta;
- saques acima do padrao historico;
- impossibilidade de retirar de mercado integrado.

Acoes:

- parar novas alocacoes;
- recompor liquidez;
- alertar painel admin;
- avaliar emergency pause.

### APY Anormal

Gatilhos:

- APY muito acima do historico sem explicacao;
- APY negativo inesperado;
- mudanca brusca de taxa;
- divergencia entre fontes.

Acoes:

- bloquear novas alocacoes;
- marcar estrategia para revisao;
- exigir aprovacao antes de aumentar exposicao.

### Falha de Protocolo

Gatilhos:

- protocolo pausado;
- exploit publico;
- retirada falhando;
- contrato alterado;
- API/subgraph inconsistente.

Acoes:

- parar alocacoes;
- reduzir exposicao se seguro;
- registrar incidente;
- acionar governanca.

### Erro de Oracle

Gatilhos:

- preco indisponivel;
- preco divergente;
- stale price;
- mudanca abrupta sem confirmacao;
- oracle criticado por protocolo integrado.

Acoes:

- bloquear looping/leverage;
- bloquear novas alocacoes dependentes do oracle;
- reduzir exposicao se houver risco de liquidacao.

### Risco de Liquidacao

Gatilhos:

- health factor abaixo do minimo aprovado;
- queda rapida de collateral;
- aumento de borrow rate;
- reducao de liquidez para unwind;
- oracle instavel.

Acoes:

- bloquear aumento de leverage;
- reduzir exposicao;
- executar plano de unwind quando aprovado;
- acionar emergencia se risco for iminente.

### Divergencia Banco vs On-chain

Gatilhos:

- snapshot operacional diferente de on-chain;
- evento on-chain nao indexado;
- saldo operacional inconsistente;
- share price divergente.

Acoes:

- tratar on-chain como fonte final;
- marcar dados operacionais como inconsistentes;
- bloquear decisoes automatizadas dependentes do banco;
- registrar auditoria.

### Falha de RPC

Gatilhos:

- RPC indisponivel;
- chainId divergente;
- respostas inconsistentes;
- alta latencia;
- falha recorrente de `eth_call`.

Acoes:

- degradar para modo read-only limitado;
- impedir execucao operacional dependente de leitura atualizada;
- alertar painel admin;
- alternar provider somente por configuracao aprovada.

### Falha de Safe ou Timelock

Gatilhos:

- Safe API indisponivel;
- threshold inesperado;
- owners divergentes;
- Timelock indisponivel;
- delay divergente;
- acao critica sem governanca verificavel.

Acoes:

- bloquear ativacoes criticas;
- impedir mudanca para `limited_capital` ou `active`;
- alertar painel admin;
- exigir revisao manual.

---

## Processo de Ativacao

### `documented` para `simulated`

Criterios:

- modulo documentado;
- riscos principais mapeados;
- dependencias identificadas;
- simulacao sem fundos definida.

Aprovacao:

- operator pode propor;
- admin aprova.

### `simulated` para `read_only`

Criterios:

- simulacao validada;
- fonte de dados definida;
- sem permissao de escrita;
- logs e auditoria preparados.

Aprovacao:

- admin aprova;
- Safe nao obrigatorio se nao houver risco financeiro.

### `read_only` para `testnet`

Criterios:

- integracao de leitura estavel;
- contratos/adapters em ambiente de teste;
- runbook de teste;
- monitoramento basico.

Aprovacao:

- admin aprova;
- Safe recomendado para configuracoes criticas.

### `testnet` para `limited_capital`

Criterios:

- testes completos;
- auditoria especifica quando houver adapter ou automacao;
- limites de capital definidos;
- circuit breakers definidos;
- runbook de emergencia;
- painel admin exibindo risco e exposicao.

Aprovacao:

- proposta formal;
- Safe 2-of-4;
- Timelock quando aplicavel.

### `limited_capital` para `active`

Criterios:

- operacao limitada validada;
- incidentes resolvidos;
- monitoramento funcionando;
- auditoria completa;
- limites finais aprovados;
- revisao juridica quando aplicavel.

Aprovacao:

- proposta formal;
- Safe 2-of-4;
- Timelock obrigatorio para mudancas criticas.

### Qualquer Status para `disabled`

Criterios:

- risco elevado;
- falha tecnica;
- decisao de governanca;
- estrategia nao economica;
- dependencia externa inadequada.

Aprovacao:

- admin pode desativar modulo operacional interno;
- Safe/Timelock exigidos se a desativacao afetar contratos ou capital real;
- emergency pause pode ser acionado em emergencia.

---

## Governanca e Permissoes

### Operator

Pode:

- visualizar risco;
- criar proposta;
- iniciar simulacao;
- registrar analise;
- sugerir reducao de exposicao.

Nao pode:

- ativar capital real;
- alterar limites criticos;
- executar mudanca on-chain;
- contornar Safe ou Timelock.

### Admin

Pode:

- aprovar simulacoes;
- aprovar read-only;
- rejeitar propostas;
- cancelar propostas;
- solicitar revisao;
- pausar operacoes internas sem custodia.

Nao pode:

- mover fundos diretamente;
- ativar capital real sem governanca;
- alterar contratos sem Safe/Timelock.

### Safe

Exigido para:

- ativar `limited_capital`;
- ativar `active`;
- alterar limites com impacto financeiro;
- alterar adapter;
- alterar estrategia;
- upgradeability;
- treasury flow;
- emergency withdraw;
- mudancas criticas de governanca.

### Timelock

Exigido para:

- mudancas criticas nao emergenciais;
- aumento de exposicao;
- ativacao de estrategias com capital real;
- mudancas de parametros sensiveis;
- upgradeability;
- alteracao de enderecos oficiais.

### Auditoria Externa

Exigida para:

- adapters reais;
- looping;
- leverage;
- automacao de estrategias;
- rebalanceamento automatico;
- performance fee;
- treasury flow;
- upgradeability/proxy;
- emergency withdraw com capital real.

---

## Painel Admin

O Painel Admin deve exibir risco como camada operacional central.

Exibir:

- status de cada modulo;
- exposicao por ativo;
- exposicao por protocolo;
- exposicao por mercado;
- exposicao por estrategia;
- concentracao;
- liquidez minima, alvo, maxima e atual;
- alertas;
- circuit breakers ativos;
- aprovacoes pendentes;
- historico de decisoes;
- origem dos dados;
- divergencias banco vs on-chain;
- status Safe;
- status Timelock;
- status RPC.

O painel deve diferenciar claramente:

- observacao;
- simulacao;
- proposta;
- aprovacao;
- execucao.

O painel nao deve mover fundos diretamente.

---

## Revisao da Politica

Esta politica deve ser revisada:

- antes da testnet;
- antes de capital limitado;
- antes de cada novo protocolo;
- antes de looping ou leverage;
- apos qualquer incidente relevante;
- por decisao de governanca.

---

## Documentos Complementares

- [[Matriz de Risco por Mercado]]
- [[Politica de Limites por Protocolo]]
- [[Politica de Looping e Leverage]]
- [[Criterios de Ativacao de Estrategias]]
- [[Circuit Breakers]]

---

## Morpho Read-Only - Fase 10.1

Status inicial: `read_only`.

Regras:

- Morpho deve operar inicialmente apenas em leitura;
- mercados devem ser classificados como `eligible`, `watchlist`, `disabled` ou `rejected`;
- `eligible` nao autoriza capital automaticamente;
- passagem para allocator real exige testes, limite, circuit breaker, governanca e revisao tecnica.
