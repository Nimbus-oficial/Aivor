# Matriz de Risco por Mercado

## Objetivo

Definir como a Aivor avalia mercados, pools e oportunidades antes de qualquer alocacao.

Esta matriz complementa:

- [[Politica de Risco]]
- [[Criterios de Selecao de Mercados]]
- [[Politica de Limites por Protocolo]]

---

## Escopo

Aplica-se a:

- mercados Morpho;
- pools Aave;
- pools Uniswap;
- pools Aerodrome;
- mercados futuros;
- estrategias automaticas;
- looping;
- leverage.

---

## Classificacao de Risco

Todo mercado deve receber uma classificacao:

| Classificacao | Significado | Uso permitido |
| --- | --- | --- |
| Baixo | Mercado maduro, liquido, monitoravel e com baixa complexidade. | Pode evoluir para `limited_capital` apos testes e governanca. |
| Medio | Mercado utilizavel, mas com riscos relevantes de liquidez, oracle, concentracao ou historico. | Somente com limites conservadores. |
| Alto | Mercado complexo, pouco liquido, novo, alavancado ou dependente de incentivos. | Apenas `simulated`, `read_only` ou `testnet`. |
| Critico | Mercado com falha, exploit, oracle comprometido, liquidez insuficiente ou risco nao mensuravel. | `disabled`. |

---

## Criterios de Avaliacao

### Liquidez

Avaliar:

- TVL;
- profundidade;
- capacidade de entrada;
- capacidade de saida;
- slippage;
- historico de saques;
- utilizacao do mercado.

### Historico

Avaliar:

- tempo de operacao;
- incidentes;
- mudancas de parametros;
- estabilidade de APY;
- comportamento em estresse.

### Risco de Protocolo

Avaliar:

- auditorias;
- governanca do protocolo;
- mecanismos de pausa;
- upgrades;
- dependencia de terceiros;
- maturidade operacional.

### Risco de Oracle

Avaliar:

- fonte de preco;
- frequencia de atualizacao;
- stale price;
- resistencia a manipulacao;
- dependencia de liquidez externa.

### Risco Economico

Avaliar:

- APY esperado;
- APY historico;
- APY anormal;
- custo de unwind;
- perdas potenciais;
- dependencia de incentivos.

### Risco Operacional

Avaliar:

- facilidade de monitorar;
- facilidade de retirar;
- complexidade do adapter;
- necessidade de automacao;
- necessidade de governanca urgente.

---

## Score Operacional

Cada criterio deve receber score interno:

- `1`: baixo risco;
- `2`: risco moderado;
- `3`: risco relevante;
- `4`: risco alto;
- `5`: risco critico.

Classificacao sugerida:

- 1.0 a 1.9: baixo;
- 2.0 a 2.9: medio;
- 3.0 a 3.9: alto;
- 4.0 a 5.0: critico.

Este score e ferramenta operacional. A governanca pode exigir criterio mais conservador.

---

## Requisitos por Status

### `documented`

Exige:

- descricao do mercado;
- protocolo;
- ativo;
- riscos conhecidos.

### `simulated`

Exige:

- simulacao de entrada;
- simulacao de saida;
- cenario ruim;
- cenario extremo.

### `read_only`

Exige:

- fonte de dados;
- monitoramento;
- leitura de APY;
- leitura de liquidez;
- leitura de exposicao.

### `testnet`

Exige:

- adapter em ambiente de teste;
- runbook;
- logs;
- auditoria interna;
- circuit breakers simulados.

### `limited_capital`

Exige:

- score baixo ou medio;
- auditoria especifica quando houver adapter;
- limite aprovado;
- Safe 2-of-4;
- Timelock quando aplicavel;
- monitoramento ativo.

### `active`

Exige:

- historico satisfatorio em capital limitado;
- incidentes resolvidos;
- limites finais aprovados;
- auditoria completa;
- governanca aprovada.

---

## Criterios de Bloqueio

Um mercado deve ser impedido de ativacao quando houver:

- liquidez insuficiente;
- oracle instavel;
- APY anormal sem explicacao;
- exploit recente sem mitigacao;
- retirada falhando;
- contrato nao auditado em fluxo critico;
- dependencia excessiva de incentivo;
- risco de liquidacao nao modelado;
- divergencia persistente entre fontes de dados.

---

## Registro no Painel Admin

O Painel Admin deve exibir:

- nome do mercado;
- protocolo;
- ativo;
- status;
- score;
- classificacao;
- limite aprovado;
- exposicao atual;
- APY;
- liquidez;
- utilizacao;
- alertas;
- ultima revisao;
- aprovacao pendente.

---

## Revisao

Cada mercado deve ser revisado:

- antes de migrar status;
- antes de receber capital real;
- apos evento de risco;
- apos mudanca de parametro do protocolo;
- por decisao de governanca.
