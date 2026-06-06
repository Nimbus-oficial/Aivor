# Validacao de Capital Minimo Morpho

Status: preparacao operacional

Este runbook prepara a primeira validacao com capital minimo. Ele nao autoriza envio de USDC, supply, habilitacao de protocolo ou habilitacao de market.

## Fluxo alvo

USDC -> Vault -> Allocator -> Morpho -> Allocator -> Vault -> USDC

## Limites preparados

| Etapa | Valor |
| --- | --- |
| Primeiro teste recomendado | 1 USDC |
| Segundo limite de validacao | 5 USDC |
| Limite maximo desta validacao | 10 USDC |

Os valores acima sao limites de preparacao. Nenhum limite on-chain foi alterado nesta fase.

## Pre-checks

1. `GET /health/database` retorna `ok`.
2. `GET /health/rpc` retorna `ok`.
3. `GET /health/morpho` retorna `ok` com `source=real`.
4. `GET /health/allocator` retorna `ok`.
5. `GET /allocator/readiness` retorna `devValidationStatus=READY`.
6. `readyForCapitalMovement=false` ate nova aprovacao explicita.
7. `protocolEnabled=false`.
8. `marketEnabled=false`.
9. `totalAssets=0`.
10. `liquidAssets=0`.

## Proposta de ativacao

A proposta futura deve conter:

- Atualizacao governada de freshness via `updateRiskData`.
- Habilitacao de protocolo.
- Habilitacao de market.
- Confirmacao de exposure limit.
- Valor maximo permitido para a validacao.
- Plano de rollback.

## Rollback

Sequencia esperada:

1. Desabilitar market.
2. Desabilitar protocolo.
3. Executar emergency withdraw, se houver capital.
4. Confirmar retorno para idle-only.
5. Confirmar `totalAssets=0` no allocator apos encerramento.
6. Registrar auditoria e relatorio.

## Criterios de sucesso

- Deposit aprovado.
- Allocation chega ao Morpho.
- Accounting do Vault permanece coerente.
- Withdraw retorna USDC para a validation wallet.
- Auditoria e health checks permanecem funcionais.

## Criterios de falha

- Health check falha.
- Dados ficam stale antes da execucao.
- Withdraw nao restaura liquidez.
- Accounting diverge.
- Capital fica alocado inesperadamente.

## Regras

- Nao executar transacoes sem aprovacao.
- Nao usar carteira de producao.
- Nao aceitar usuarios externos.
- Nao aumentar capital sem nova fase.
- Nao considerar esta validacao como producao.
