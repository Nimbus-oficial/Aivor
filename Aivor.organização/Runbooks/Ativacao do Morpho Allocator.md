# Ativacao do Morpho Allocator

Status: preparacao operacional

Este runbook define a sequencia para uma futura ativacao controlada do MorphoAllocator. Ele nao autoriza supply, nao autoriza movimentacao de USDC e nao substitui aprovacao por governanca.

## Pre-condicoes

- `protocolEnabled=false`.
- `marketEnabled=false`.
- `totalAssets=0`.
- `liquidAssets=0`.
- `noCapital=true`.
- `noSupply=true`.
- `GET /health/database` retorna `ok`.
- `GET /health/rpc` retorna `ok` em Base Mainnet.
- `GET /health/morpho` retorna `ok` com `source=real`.
- `GET /health/allocator` retorna `ok`.
- `GET /allocator/readiness` nao retorna `BLOCKED`.
- Safe e Timelock estao revisados para a etapa correspondente.
- Auditoria persistente esta funcionando.

## Sequencia de preparacao

1. Revisar status on-chain do allocator.
2. Revisar marketId configurado.
3. Revisar freshness dos dados do Morpho.
4. Revisar limites de exposicao.
5. Revisar limite inicial de capital, que permanece `0` nesta fase.
6. Revisar politica de liquidez: 2% minimo, 5% alvo, 7% maximo.
7. Revisar proposta de governanca.
8. Simular queue e execucao administrativa.
9. Confirmar rollback pronto.
10. Registrar revisao em auditoria.

## Acoes futuras que exigem aprovacao

- Habilitar protocolo.
- Habilitar market.
- Alterar limite de exposicao.
- Enviar qualquer USDC ao Morpho.
- Executar qualquer supply real.

## Criterio para seguir para capital minimo

- Readiness sem `BLOCKED`.
- Freshness `READY`.
- Safe operacional revisada.
- Timelock revisado.
- Market aprovado por governanca.
- Circuit breakers revisados.
- Rollback validado.
- Aprovacao explicita para a proxima fase.
