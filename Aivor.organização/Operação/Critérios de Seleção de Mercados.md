# Criterios de Selecao de Mercados

## Objetivo

Definir os criterios utilizados para selecionar mercados, pools e estrategias para a Aivor.

Complementa:

- [[Matriz de Risco por Mercado]]
- [[Politica de Risco]]
- [[Politica de Limites por Protocolo]]

---

## Principios

A selecao de mercados deve priorizar:

- seguranca;
- liquidez;
- transparencia;
- sustentabilidade;
- capacidade de retirada;
- governanca;
- auditabilidade.

---

## Criterios Obrigatorios

### Liquidez

O mercado deve possuir liquidez suficiente para suportar entradas e saidas sem impacto excessivo.

### Historico

O mercado deve possuir historico operacional consistente.

### Seguranca

O protocolo deve apresentar maturidade operacional, auditorias relevantes e mecanismos adequados de seguranca.

### Oracle

Mercados dependentes de oracle devem possuir fonte de preco confiavel, atualizada e resistente a manipulacao.

### Escalabilidade

A estrategia deve suportar crescimento patrimonial da Aivor dentro dos limites aprovados.

### Simplicidade

Estrategias excessivamente complexas devem permanecer em `simulated` ou `testnet` ate prova operacional.

---

## Exclusoes

A Aivor evita:

- protocolos recem-lancados;
- mercados sem liquidez suficiente;
- estruturas excessivamente alavancadas;
- dependencia de incentivo instavel;
- pools com baixa transparencia;
- mercados com oracle fragil;
- estrategias sem plano de retirada.

---

## Score

Todo mercado deve ser avaliado pela [[Matriz de Risco por Mercado]] antes de receber capital real.

Classificacoes possiveis:

- baixo;
- medio;
- alto;
- critico.

Mercados de risco alto ou critico nao devem avancar para `limited_capital`.

---

## Relacionamentos

- [[Estrategia Morpho]]
- [[Gestao de Risco]]
- [[Limites Operacionais]]
- [[Operacao Geral]]
- [[Matriz de Risco por Mercado]]
- [[Criterios de Ativacao de Estrategias]]

---

## Filosofia

Preservacao de capital antes de maximizacao de retorno.

---

## Criterios Morpho Read-Only

Um mercado Morpho so pode ser classificado como `eligible` se atender, no minimo:

- loan asset permitido;
- liquidez suficiente;
- APY dentro da faixa aprovada;
- utilizacao abaixo do limite;
- oracle confiavel;
- LLTV dentro do limite;
- sem flags criticas;
- aprovado por governanca.

Classificacao:

- `eligible`: passa criterios minimos e pode seguir para simulacao tecnica;
- `watchlist`: possui pendencias ou risco elevado, mas ainda merece monitoramento;
- `disabled`: nao deve receber nova alocacao;
- `rejected`: fora do escopo aprovado.

Dados minimos para avaliacao:

- `marketId`;
- `loanToken`;
- `collateralToken`;
- `oracle`;
- `irm`;
- `lltv`;
- `totalSupplyAssets`;
- `totalBorrowAssets`;
- `utilization`;
- `supplyApy`;
- `liquidity`;
- indicadores de risco.
