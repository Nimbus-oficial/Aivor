# Politica de Limites por Protocolo

## Objetivo

Definir como a Aivor estabelece limites por protocolo, ativo, mercado e estrategia.

Esta politica complementa:

- [[Politica de Risco]]
- [[Parametros Operacionais]]
- [[Matriz de Risco por Mercado]]

---

## Principio

Limite e mecanismo de protecao, nao meta de alocacao.

Nenhum protocolo deve se tornar dependencia absoluta da Aivor.

---

## Tipos de Limite

### Limite por Protocolo

Controla a exposicao total em:

- Morpho;
- Aave;
- Uniswap;
- Aerodrome.

### Limite por Ativo

Controla exposicao em:

- USDC;
- EURC;
- ovUSDC.

### Limite por Mercado ou Pool

Controla exposicao por:

- market Morpho;
- pool Aave;
- pool Uniswap;
- pool Aerodrome.

### Limite por Estrategia

Controla exposicao por:

- lending;
- liquidez;
- looping;
- leverage;
- estrategias automaticas.

### Limite por Status

Define o quanto um modulo pode operar conforme status:

- `documented`: 0 capital;
- `simulated`: 0 capital;
- `read_only`: 0 capital;
- `testnet`: 0 capital real;
- `limited_capital`: capital real limitado por governanca;
- `active`: capital dentro dos limites aprovados;
- `disabled`: 0 capital.

---

## Limites Iniciais Recomendados

Enquanto nao houver proposta especifica aprovada:

- modulos `documented`, `simulated` e `read_only`: 0 capital real;
- modulos `testnet`: 0 capital real;
- modulos `limited_capital`: limite nominal definido por proposta;
- modulos `active`: limite percentual e nominal definidos por proposta;
- looping e leverage: 0 capital real ate auditoria especifica.

Nao ha limite numerico definitivo sem governanca.

---

## Regras por Protocolo

### Morpho

Pode ser primeiro protocolo a evoluir para `testnet`.

Capital real exige:

- adapter auditado;
- mercados aprovados;
- limites por market;
- monitoramento de liquidez;
- monitoramento de oracle;
- plano de retirada.

### Aave

Inicia em `read_only`.

Capital real exige:

- adapter auditado;
- limite por pool;
- revisao de utilizacao;
- avaliacao de liquidez;
- restricao de leverage ate politica propria.

### Uniswap

Inicia em `documented`, `simulated` ou `read_only`.

Capital real exige:

- simulacao de impermanent loss;
- analise de slippage;
- analise de MEV;
- pool aprovado;
- adapter auditado.

### Aerodrome

Inicia em `documented`, `simulated` ou `read_only`.

Capital real exige:

- avaliacao de pool;
- avaliacao de incentives;
- avaliacao de gauge;
- limite conservador;
- adapter auditado.

---

## Regras de Aumento de Limite

Aumentar limite exige:

- proposta formal;
- justificativa;
- historico operacional;
- analise de risco atualizada;
- ausencia de incidentes relevantes;
- monitoramento funcionando;
- Safe 2-of-4;
- Timelock quando houver impacto financeiro.

---

## Regras de Reducao de Limite

Reduzir limite pode ocorrer por:

- decisao de governanca;
- alerta de risco;
- falha de protocolo;
- APY anormal;
- queda de liquidez;
- oracle instavel;
- incidente operacional.

Reducao emergencial pode ocorrer antes de Timelock quando a prioridade for protecao patrimonial, respeitando os mecanismos aprovados.

---

## Limite e Liquidez

Qualquer limite deve preservar:

- liquidez minima: 2%;
- liquidez alvo: 5%;
- liquidez maxima: 7%.

Novas alocacoes devem parar se a liquidez cair abaixo de 2%.

---

## Painel Admin

O Painel Admin deve exibir:

- limite aprovado;
- exposicao atual;
- uso percentual do limite;
- status do modulo;
- protocolo;
- mercado;
- ativo;
- alerta de aproximacao do limite;
- propostas pendentes de aumento ou reducao.

---

## Revisao

Limites devem ser revisados:

- antes de capital real;
- antes de ativar novo protocolo;
- antes de aumentar exposicao;
- apos incidentes;
- por decisao de governanca.
