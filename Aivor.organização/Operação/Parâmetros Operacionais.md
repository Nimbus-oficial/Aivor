# Parametros Operacionais

## Objetivo

Definir os limites, metricas e regras utilizadas pela Aivor para proteger o patrimonio dos usuarios e garantir estabilidade operacional.

Relaciona-se com:

- [[Operacao Geral]]
- [[Liquidez]]
- [[Politica de Liquidez]]
- [[Politica de Risco]]
- [[Gestao de Risco]]
- [[Estrategia de Alocacao]]
- [[Tesouraria]]
- [[Multisig]]
- [[Timelock]]

---

## Liquidez

### Faixas Oficiais

Liquidez minima:

- 2%

Liquidez alvo:

- 5%

Liquidez maxima:

- 7%

### Abaixo de 2%

Situacao critica.

Acoes prioritarias:

- interromper novas alocacoes;
- recompor liquidez;
- avaliar resgate de posicoes;
- acionar alerta no Painel Admin;
- avaliar emergency pause se houver risco de continuidade operacional.

### Entre 2% e 5%

Faixa de atencao.

Permite operacao, mas novas alocacoes devem ser conservadoras.

Rebalanceamento deve priorizar retorno para a faixa alvo.

### Em torno de 5%

Faixa alvo.

Objetivo principal da operacao.

### Entre 5% e 7%

Faixa aceitavel.

Permite operacao normal e planejamento de alocacao.

### Acima de 7%

Capital considerado potencialmente ocioso.

O excedente pode ser realocado apenas se a politica de risco permitir e a governanca aprovar quando necessario.

---

## Rebalanceamentos

Rebalancear quando:

- liquidez estiver abaixo de 5% e houver condicao segura para recompor;
- liquidez ficar acima de 7% por excesso de capital ocioso;
- exposicao por protocolo ou mercado se aproximar do limite aprovado;
- risco de protocolo aumentar;
- APY ou utilizacao indicar anomalia;
- governanca aprovar nova alocacao.

---

## Bloqueio de Novas Alocacoes

Parar novas alocacoes quando:

- liquidez cair abaixo de 2%;
- protocolo integrado apresentar falha;
- RPC ou leitura on-chain estiver inconsistente;
- Safe ou Timelock estiver indisponivel para acoes criticas;
- APY estiver anormal sem explicacao;
- oracle ou fonte de preco apresentar erro;
- divergencia banco vs on-chain for relevante.

---

## Reducao de Exposicao

Reduzir exposicao quando:

- liquidez permanecer abaixo da faixa alvo;
- utilizacao de mercado ficar excessiva;
- risco de retirada aumentar;
- protocolo perder confiabilidade;
- auditoria ou monitoramento apontar vulnerabilidade;
- governanca determinar reducao de risco.

---

## Limites

Cada modulo, ativo, protocolo, mercado e estrategia deve possuir limite operacional antes de avancar para `limited_capital` ou `active`.

Limites devem considerar:

- exposicao maxima;
- liquidez disponivel;
- status do modulo;
- risco do protocolo;
- risco do ativo;
- risco da estrategia;
- auditoria exigida;
- runbook de emergencia.

Limites numericos especificos devem ser aprovados por governanca antes de capital real.

---

## Protocolos Elegiveis

Protocolos contemplados na V1 Modular Completa:

- [[Morpho]]
- [[Aave]]
- [[Aerodrome]]
- [[Uniswap]]

A inclusao na V1 nao significa ativacao simultanea.

Cada protocolo deve evoluir por status conforme:

- [[Politica de Risco]]
- [[Aivor V1 Modular Completa]]

---

## Emergencias

Eventos considerados criticos:

- falha operacional relevante;
- vulnerabilidade identificada;
- risco de perda de patrimonio;
- comportamento anormal de protocolo integrado;
- falha de oracle;
- risco de liquidacao;
- divergencia grave entre banco e on-chain;
- falha critica de Safe, Timelock ou RPC.

---

## Medidas de Emergencia

Podem incluir:

- suspensao temporaria de novas alocacoes;
- reducao de exposicao;
- aumento de liquidez;
- bloqueio de modulo;
- ativacao de circuit breaker;
- ativacao dos mecanismos de emergencia.

Ver:

- [[Politica de Risco]]
- [[Emergency Pause]]
- [[Multisig]]
- [[Timelock]]

---

## Revisao

Os parametros operacionais podem ser revisados conforme evolucao da plataforma.

Qualquer alteracao com impacto financeiro deve seguir os mecanismos definidos pela governanca.
