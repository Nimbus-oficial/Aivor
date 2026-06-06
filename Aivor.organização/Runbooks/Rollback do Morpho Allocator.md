# Rollback do Morpho Allocator

Status: preparacao operacional

Este runbook define a sequencia de retorno seguro para o MorphoAllocator. Na fase atual nao existe capital alocado, entao o rollback e uma preparacao operacional.

## Gatilhos de rollback

- Falha de RPC persistente.
- Morpho indisponivel.
- Dados stale acima do limite aceito.
- Market desabilitado, rejeitado ou fora de allowlist.
- APY anormal.
- Liquidez insuficiente.
- Divergencia de accounting.
- Falha de Safe ou Timelock.
- Qualquer sinal de execucao fora do fluxo aprovado.

## Sequencia sem capital

1. Confirmar `protocolEnabled=false`.
2. Confirmar `marketEnabled=false`.
3. Confirmar `totalAssets=0`.
4. Confirmar `liquidAssets=0`.
5. Confirmar `noSupply=true`.
6. Registrar `allocator.rollback.reviewed`.
7. Manter allocator em observacao.

## Sequencia futura com capital

1. Pausar novas alocacoes.
2. Desabilitar market.
3. Desabilitar protocolo.
4. Executar emergency withdraw apenas via fluxo aprovado.
5. Confirmar retorno de liquidez.
6. Conferir `totalAssets`, `liquidAssets` e share accounting.
7. Registrar incidente, tx hashes e decisao de governanca.

## Responsabilidades

- Operator: monitorar alertas e preparar proposta.
- Admin: revisar e aprovar acao administrativa.
- Safe: aprovar mudancas criticas.
- Timelock: impor atraso quando aplicavel.

## Criterio de conclusao

- Protocolo e market desabilitados.
- Nenhum supply pendente.
- Auditoria persistida.
- Painel Admin refletindo estado correto.
- Relatorio operacional registrado.
