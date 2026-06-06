# Readiness de Ativacao

Status: checklist operacional

Este checklist consolida os itens minimos antes de qualquer ativacao futura do MorphoAllocator.

## Checklist

| Area | Criterio | Status esperado |
| --- | --- | --- |
| RPC | Base Mainnet, chainId 8453, contratos com bytecode | READY |
| Database | `GET /health/database` ok | READY |
| Vault | Endereco configurado e validado on-chain | READY |
| Controller | Endereco configurado e validado on-chain | READY |
| Treasury | Endereco configurado para monitoramento | READY |
| Allocator | Bytecode presente e configuracao consistente | READY |
| Morpho | API real ok e Morpho Blue correto | READY |
| Governance | Proposta preparada | READY |
| Safe | Safe operacional revisada | READY |
| Timelock | Timelock revisado quando aplicavel | READY |
| Auditoria | Eventos persistidos em `audit_logs` | READY |
| Painel | Readiness visivel no Painel Admin | READY |
| Runbooks | Ativacao e rollback documentados | READY |
| Freshness | Dados do market atualizados | READY |
| Exposicao | Limites revisados | READY |

## Status permitidos

- `READY`: item preparado para revisao operacional.
- `NOT_READY`: item pendente, mas sem risco imediato porque nao ha capital.
- `BLOCKED`: item impede avanco.

## Regras

- `NOT_READY` nao autoriza ativacao.
- Qualquer `BLOCKED` impede avanco.
- Capital inicial permanece `0` ate nova aprovacao.
- Backend nao assina transacoes.
- Painel Admin nao move fundos.
- Blockchain continua sendo a fonte final do patrimonio.
