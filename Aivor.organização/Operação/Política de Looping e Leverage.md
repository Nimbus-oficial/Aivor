# Politica de Looping e Leverage

## Objetivo

Definir regras especificas para looping e leverage dentro da Aivor V1 Modular Completa.

Looping e leverage sao estrategias avancadas e devem ser tratadas como alto risco ate prova operacional em contrario.

---

## Status Inicial

Looping:

- status inicial: `documented` ou `simulated`;
- capital real inicial: 0;
- ativacao operacional: somente apos auditoria especifica.

Leverage:

- status inicial: `documented` ou `simulated`;
- capital real inicial: 0;
- ativacao operacional: somente apos auditoria especifica.

---

## Principios

- nenhuma alavancagem sem controle de liquidacao;
- nenhuma automacao sem limites;
- nenhuma estrategia avancada sem unwind plan;
- nenhuma ativacao sem auditoria;
- nenhuma execucao direta pelo backend;
- Safe e Timelock continuam obrigatorios para ativacao com capital real.

---

## Riscos Especificos

### Liquidacao

Risco principal.

Deve haver:

- health factor minimo;
- margem de seguranca;
- alerta preventivo;
- trigger de reducao;
- plano de unwind.

### Oracle

Looping e leverage dependem fortemente de preco.

Devem ser bloqueados quando:

- oracle estiver stale;
- houver divergencia de preco;
- fonte de preco estiver indisponivel;
- mercado estiver sob volatilidade extrema.

### Liquidez

Deve haver liquidez suficiente para:

- reduzir exposicao;
- fechar posicao;
- pagar custos;
- lidar com slippage.

### Automacao

Automacao pode errar.

Deve haver:

- limites de execucao;
- cooldown;
- protecao contra repeticao indevida;
- logs;
- circuit breaker.

---

## Criterios Antes de `testnet`

Exige:

- estrategia documentada;
- simulacao de cenario normal;
- simulacao de cenario ruim;
- simulacao de cenario extremo;
- calculo de liquidacao;
- dependencia de oracle mapeada;
- plano de unwind.

---

## Criterios Antes de `limited_capital`

Exige:

- testnet validada;
- auditoria especifica;
- limite nominal baixo;
- health factor minimo aprovado;
- circuit breaker dedicado;
- monitoramento em tempo real;
- Safe 2-of-4;
- Timelock quando aplicavel;
- runbook de emergencia.

---

## Criterios Antes de `active`

Exige:

- periodo satisfatorio em `limited_capital`;
- nenhum incidente critico aberto;
- historico de unwind testado;
- auditoria completa;
- revisao juridica e operacional;
- aprovacao formal de governanca.

---

## Circuit Breakers Dedicados

Acionar bloqueio ou reducao quando:

- health factor abaixo do limite aprovado;
- oracle instavel;
- liquidez de unwind insuficiente;
- APY ou borrow rate anormal;
- volatilidade extrema;
- RPC falhando;
- divergencia on-chain vs painel;
- protocolo de lending pausado.

---

## Painel Admin

O painel deve exibir:

- exposicao total;
- exposicao liquida;
- leverage ratio;
- health factor;
- risco de liquidacao;
- APY estimado;
- borrow rate;
- cenario ruim;
- cenario extremo;
- utilizacao da liquidez;
- status do circuit breaker.

---

## Regra Final

Looping e leverage fazem parte da V1 modular, mas nao devem ser ativados cedo.

Devem nascer como simulacao, evoluir para testnet, passar por auditoria especifica e somente depois receber capital limitado por governanca.
