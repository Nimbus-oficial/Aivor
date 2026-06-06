# Readiness Fixes Sem Capital

Status: preparacao operacional

Este documento registra a analise da Fase 10.9A.1. Nenhuma transacao e autorizada por este documento.

## Timelock

Estado atual:

- Nao existe `TimelockController` OpenZeppelin deployado no projeto.
- O contrato `OrvexController` possui uma fila temporal simples com `queue`, `timelockDelay` e `markExecuted`.
- O backend aceita `TIMELOCK_ADDRESS`, mas ele nao esta configurado no ambiente atual.
- A Safe Dev esta em modo read-only e nao representa a politica final de producao.

Conclusao:

- Para dev validation, o timelock interno do `OrvexController` pode ser tratado como mecanismo simulado/operacional de revisao.
- Para producao, ainda sera necessario decidir entre manter o timelock interno, complementar com `TimelockController`, ou migrar a governanca para Safe + Timelock real.

## Freshness

Estado atual:

- `MorphoAllocator.updateRiskData(uint256 nextApyBps, uint256 nextRiskScoreBps)` atualiza `marketDataUpdatedAt`.
- A funcao e protegida por `onlyController`.
- O backend nao pode chamar essa funcao diretamente.
- O `OrvexController` deployado nao possui uma funcao especifica para chamar `updateRiskData` no allocator.

Conclusao:

- A freshness nao deve ser atualizada pelo backend sem governanca.
- Antes de capital minimo, sera necessario preparar uma rota governada para atualizar dados de risco no allocator.
- A fonte dos dados deve ser Morpho real + market selection + auditoria.

## Safe Dev Mode

Estado atual:

- A Safe atual e Dev Safe.
- `threshold=1` e `owners=1`.
- Isso nao atende a politica de producao 2-of-4.

Regra:

- `devSafeAccepted=true` para validacao privada.
- `productionReadySafe=false` ate nova Safe operacional 2-of-4.
- `policyMismatchExpected=true` no ambiente atual.

## Readiness

O backend separa:

- `productionStatus`: status para producao.
- `devValidationStatus`: status para validacao privada.

Capital continua bloqueado:

- `readyForCapitalMovement=false`.
- `capitalMovementPrepared=false`.
- `realExecutionEnabled=false`.
