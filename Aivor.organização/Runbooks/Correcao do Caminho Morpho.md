# Correcao do Caminho Morpho

Status: diagnostico operacional

Este documento registra o resultado da Fase 10.9D. Nenhum deploy, transacao, enable ou movimentacao de USDC e autorizado por este documento.

## Arquitetura atual

Vault atual:

- `idleOnlyMode=true`.
- `morphoAllocator=0x0000000000000000000000000000000000000000`.
- `validationDepositCap=1 USDC`.
- Pode ser reaproveitado para validacoes idle-only.
- Nao pode ser reaproveitado para o fluxo `Vault -> MorphoAllocator -> Morpho`, pois os campos sao imutaveis.

Controller atual:

- Multisig aponta para a Dev Safe.
- Possui timelock interno simples.
- Nao possui funcoes para operar `MorphoAllocator.setProtocolEnabled`, `setMarketEnabled` ou `updateRiskData`.
- Pode ser reaproveitado como referencia de validacao, mas nao como controller completo do caminho Morpho atual.

Allocator atual:

- Deployado e configurado com USDC, Morpho Blue, Vault e Controller esperados.
- `protocolEnabled=false`.
- `marketEnabled=false`.
- `totalAssets=0`.
- `liquidAssets=0`.
- Pode ser reaproveitado apenas se um novo Vault/Controller compativel for conectado ao mesmo desenho operacional. Como o `vault` e `controller` sao imutaveis, o reaproveitamento pratico e limitado.

## Opcoes de correcao

| Opcao | Descricao | Risco | Complexidade | Reaproveitamento | Conclusao |
| --- | --- | --- | --- | --- | --- |
| A | Novo Vault conectado ao Allocator atual | Alto | Media | Baixo | Nao resolve, pois o Allocator atual aponta para o Vault antigo |
| B | Novo Controller conectado ao Vault atual | Alto | Media | Baixo | Nao resolve, pois o Vault atual e idle-only |
| C | Novo conjunto Vault + Controller + Allocator | Medio | Media | Alto em codigo, baixo em contratos atuais | Recomendado |
| D | Upgrade/proxy | Alto | Alta | Incerto | Nao aplicavel ao deploy atual sem suporte proxy |

## Recomendacao

Seguir com a Opcao C:

- Novo Vault nao idle-only.
- Novo Controller com funcoes governadas para o Allocator.
- Novo MorphoAllocator apontando para o novo Vault e novo Controller.
- Limite inicial de 1 USDC.
- Protocolo e market nascem desabilitados.

## Fase 10.9E - Conjunto V2 Morpho-Controlled

Decisao aprovada: criar um novo conjunto privado para validacao controlada:

- `AivorVaultV2`;
- `AivorControllerV2`;
- `MorphoAllocatorV2`.

Objetivo do conjunto V2:

`USDC -> Vault V2 -> MorphoAllocator V2 -> Morpho -> MorphoAllocator V2 -> Vault V2 -> USDC`

Estado esperado antes de qualquer capital:

- Vault V2 nasce conectado ao Allocator V2.
- Vault V2 nao depende de `idleOnlyMode`.
- Controller V2 possui funcoes governadas para operar o Allocator V2.
- Allocator V2 nasce com `protocolEnabled=false`.
- Allocator V2 nasce com `marketEnabled=false`.
- Limite inicial de exposicao: `1 USDC`.
- Nenhum supply e executado no deploy.
- Nenhum approve e executado no deploy.
- Nenhum capital e movimentado.

O conjunto V2 nao substitui a validacao V1 idle-only como registro historico. Ele cria um novo caminho operacional para a etapa Morpho controlada.

## Caminho minimo de governanca

O novo Controller deve possuir funcoes governadas para:

- `setProtocolEnabled(bool)`.
- `setMarketEnabled(bool)`.
- `updateRiskData(uint256 apyBps, uint256 riskScoreBps)`.
- `setExposureLimits(uint256 marketLimit, uint256 totalLimit)`.
- `emergencyWithdraw(uint256 assets)`.

Essas funcoes devem preservar:

- Safe.
- Timelock.
- Auditoria.
- Rollback.
- Nenhuma custodia pelo backend.

## Criterio de readiness

`Morpho Path Readiness` so pode ser `READY` quando:

- Vault aponta para o Allocator correto.
- Allocator aponta para o Vault correto.
- Allocator aponta para o Controller correto.
- Controller possui caminho operacional governado para o Allocator.
- Protocol e market continuam desabilitados ate aprovacao.

Para a proxima etapa, o deploy privado do conjunto V2 so pode ser autorizado quando:

- `forge build` passar;
- `forge test` passar;
- script `DeployMorphoControlledPrivate.s.sol` estiver revisado;
- script `ValidateMorphoControlledReadOnly.s.sol` estiver revisado;
- enderecos esperados forem confirmados antes do broadcast;
- deployer nonce estiver controlado, pois o script usa enderecos previstos por nonce;
- nenhum mock for importado no script de mainnet;
- nenhum comando de enable, approve, supply ou withdraw for executado.
